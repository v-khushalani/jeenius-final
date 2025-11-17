import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Server-side pricing configuration - NEVER accept from client
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

    // Get and validate request body
    const { planId } = await req.json()
    
    // Validate planId
    if (!planId || !(planId in PLAN_CONFIG)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get pricing from SERVER CONFIG ONLY
    const planConfig = PLAN_CONFIG[planId as PlanId]
    const amount = planConfig.amount
    const duration = planConfig.duration

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured')
    }

    const orderData = {
      amount: amount, // Server-controlled amount
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: { 
        userId: user.id, 
        planId: planId,
        expected_amount: amount,
        expected_duration: duration
      }
    }

    const authHeaderRazorpay = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeaderRazorpay}`
      },
      body: JSON.stringify(orderData)
    })

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text()
      throw new Error(`Razorpay API error: ${error}`)
    }

    const razorpayOrder = await razorpayResponse.json()

    // Store payment record with server-controlled values
    await supabase.from('payments').insert({
      user_id: user.id, // Use authenticated user ID
      razorpay_order_id: razorpayOrder.id,
      amount: amount, // Server-controlled amount
      currency: 'INR',
      status: 'created',
      plan_id: planId,
      plan_duration: duration // Server-controlled duration
    })

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
