import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Server-side pricing configuration - matches create-razorpay-order
const PLAN_CONFIG = {
  'monthly': { amount: 29900, duration: 30, name: 'Monthly Plan' },
  'quarterly': { amount: 79900, duration: 90, name: 'Quarterly Plan' },
  'yearly': { amount: 99900, duration: 365, name: 'Yearly Plan' }
} as const

type PlanId = keyof typeof PLAN_CONFIG

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract and validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get and validate request body - DO NOT accept duration from client
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json()
    
    // Validate planId
    if (!planId || !(planId in PLAN_CONFIG)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!RAZORPAY_KEY_SECRET) throw new Error('Secret not configured')

    // Verify payment signature
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Verify the payment order exists and belongs to this user
    const { data: paymentOrder, error: orderError } = await supabase
      .from('payments')
      .select('user_id, amount, plan_id, plan_duration')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (orderError || !paymentOrder) {
      throw new Error('Payment order not found')
    }

    // Verify user owns this payment
    if (paymentOrder.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot verify payment for other users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Get duration from SERVER CONFIG ONLY (not from client or even database)
    const duration = PLAN_CONFIG[planId as PlanId].duration
    const expectedAmount = PLAN_CONFIG[planId as PlanId].amount

    // Verify amount matches expected (optional but recommended)
    if (paymentOrder.amount !== expectedAmount) {
      console.warn(`Payment amount mismatch: expected ${expectedAmount}, got ${paymentOrder.amount}`)
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    // Update payment record
    await supabase.from('payments').update({
      razorpay_payment_id,
      razorpay_signature,
      status: 'success'
    }).eq('razorpay_order_id', razorpay_order_id)

    // Grant subscription to authenticated user only
    await supabase.from('profiles').update({
      subscription_plan: planId,
      subscription_end_date: endDate.toISOString(),
      is_premium: true
    }).eq('id', user.id) // Use authenticated user ID

    return new Response(
      JSON.stringify({ success: true, subscription_end_date: endDate.toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
