// src/utils/razorpay.ts
// CREATE THIS FILE - Complete Razorpay Integration

import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
export const loadRazorpay = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Razorpay) {
        console.log('✅ Razorpay loaded successfully');
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.body.appendChild(script);
  });
};

// Main payment initialization function
export const initializePayment = async (
  planId: string,
  userId: string,
  email: string,
  name: string
) => {
  console.log('🚀 Starting payment initialization...', { planId, userId });

  try {
    // 1. Validate plan
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    console.log('✅ Plan validated:', plan.name);

    // 2. Load Razorpay SDK
    console.log('📦 Loading Razorpay SDK...');
    const Razorpay = await loadRazorpay();
    
    if (!Razorpay) {
      throw new Error('Razorpay SDK not available');
    }

    // 3. Create order via Supabase Edge Function
    console.log('📝 Creating Razorpay order...');
    const { data: orderData, error: orderError } = await supabase.functions.invoke(
      'create-razorpay-order',
      {
        body: {
          planId // Server controls amount, duration, and user ID
        }
      }
    );

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      throw new Error(`Order creation failed: ${orderError.message}`);
    }

    if (!orderData || !orderData.orderId) {
      console.error('❌ Invalid order response:', orderData);
      throw new Error('Invalid order response from server');
    }

    console.log('✅ Order created:', orderData.orderId);

    // 4. Get Razorpay Key from environment
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      throw new Error('Razorpay Key ID not configured. Add VITE_RAZORPAY_KEY_ID to .env');
    }

    console.log('🔑 Using Razorpay Key:', razorpayKey.substring(0, 10) + '...');

    // 5. Razorpay Checkout Options
    const options = {
      key: razorpayKey,
      amount: plan.price * 100, // in paise
      currency: 'INR',
      name: 'JEEnius - JEE Prep Platform',
      description: `${plan.name} Subscription`,
      image: '/logo.png', // Optional: Add your logo
      order_id: orderData.orderId,
      
      // Prefill user details
      prefill: {
        name: name,
        email: email,
        contact: '' // Optional: Add if you have phone number
      },
      
      // Theme customization
      theme: {
        color: '#3B82F6' // Blue color
      },
      
      // Payment success handler
      handler: async (response: any) => {
        console.log('✅ Payment successful!', response);
        
        try {
          // Verify payment signature
          console.log('🔐 Verifying payment...');
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            'verify-payment',
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId // Server controls duration and user ID
              }
            }
          );

          if (verifyError) {
            console.error('❌ Verification error:', verifyError);
            throw new Error(`Payment verification failed: ${verifyError.message}`);
          }

          console.log('✅ Payment verified:', verifyData);

          // Update local user state (optional - will refresh on page load)
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          await supabase
            .from('profiles')
            .update({
              subscription_plan: planId,
              subscription_end_date: endDate.toISOString(),
              is_premium: true
            })
            .eq('id', userId);

          // Success notification
          alert(`🎉 Payment Successful!\n\n${plan.name} activated!\nValid until: ${endDate.toLocaleDateString()}`);
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
          
        } catch (err: any) {
          console.error('❌ Payment verification failed:', err);
          alert(`Payment verification failed: ${err.message}\nPlease contact support if money was deducted.`);
        }
      },
      
      // Payment modal dismissed
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment cancelled by user');
          // Optional: Show a message or log analytics
        }
      },
      
      // Notes (for internal reference)
      notes: {
        user_id: userId,
        plan_id: planId
      }
    };

    console.log('💳 Opening Razorpay checkout...');
    
    // 6. Open Razorpay Checkout
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
    
    // Handle payment failures
    razorpayInstance.on('payment.failed', (response: any) => {
      console.error('❌ Payment failed:', response.error);
      alert(`Payment Failed!\n\nReason: ${response.error.description}\nCode: ${response.error.code}`);
    });

  } catch (error: any) {
    console.error('❌ Payment initialization error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Failed to initialize payment. ';
    
    if (error.message.includes('Razorpay')) {
      errorMessage += 'Payment gateway not loaded. Please refresh and try again.';
    } else if (error.message.includes('Order creation')) {
      errorMessage += 'Could not create order. Please check your connection.';
    } else if (error.message.includes('Key ID')) {
      errorMessage += 'Payment system not configured. Please contact support.';
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
    throw error;
  }
};

// Helper function to check payment status
export const checkPaymentStatus = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return null;
  }
};
