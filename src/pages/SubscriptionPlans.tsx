import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { REFERRAL_CONFIG } from '@/components/SubscriptionPlans';
import { initializePayment } from '@/utils/razorpay';
import { Check, Crown, Gift, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/login?redirect=/subscription-plans');
      return;
    }

    try {
      setLoading(planId);

      await initializePayment(
        planId,
        user.id,
        user.email || '',
        user.user_metadata?.name || 'Student'
      );

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = billingCycle === 'monthly' ? SUBSCRIPTION_PLANS.monthly : SUBSCRIPTION_PLANS.yearly;
  const pricing = {
    monthly: { price: 99, original: 149, perDay: '₹3.3' },
    yearly: { price: 499, original: 1188, perDay: '₹1.37', savings: 689 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex flex-col">
      <Header />
      <div className="flex-1 pt-16 pb-4 px-4 flex flex-col">
        {/* Referral Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 px-4 rounded-lg mb-4 mx-auto max-w-lg">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Gift className="w-4 h-4" />
            <span>{REFERRAL_CONFIG.message}</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-2 flex-shrink-0">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              🔥 THE BEST DEAL in JEE Prep
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              ₹499/year = <span className="font-bold text-green-600">₹1.37/day</span> — Cheaper than a samosa!
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                  58% OFF
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="flex-1 py-4 flex items-center overflow-hidden">
          <div className="container mx-auto px-4 w-full">
            <div className="max-w-lg mx-auto">
              {/* Pro Plan */}
              <Card className="border-2 border-green-500 relative bg-gradient-to-br from-white to-green-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-xs font-bold shadow-lg animate-pulse">
                    🔥 STEAL DEAL — 58% OFF
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{currentPlan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center">
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ₹{pricing[billingCycle].original}
                      </span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{pricing[billingCycle].price}
                      </span>
                      <span className="text-base text-gray-500 font-normal ml-1">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 text-sm font-bold">
                            🎁 Save ₹{pricing.yearly.savings}!
                          </Badge>
                        </div>
                        <p className="text-green-600 font-bold text-lg">
                          = {pricing.yearly.perDay}/day 🥟
                        </p>
                      </>
                    )}
                    {billingCycle === 'monthly' && (
                      <p className="text-green-600 font-semibold">☕ Less than a Pizza!</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{currentPlan.tagline}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 max-h-[180px] overflow-y-auto">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 p-1.5 rounded-lg">
                        <div className="mt-0.5 text-green-600 flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(billingCycle)}
                    disabled={loading === billingCycle}
                    className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
                  >
                    {loading === billingCycle ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Get Pro Now — Best Decision Ever! 👑
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-gray-500">
                    ✅ Cancel anytime • 7-day money-back guarantee
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Free tier + Referral info */}
        <section className="py-2 flex-shrink-0">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto space-y-3">
              {/* Referral Card */}
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-purple-800">Refer & Earn FREE Pro!</h3>
                </div>
                <p className="text-xs text-purple-700">
                  🎁 Get 1 week FREE for every friend who signs up!
                  <br />
                  <span className="font-medium">4 friends = 1 month FREE • 12 friends = 3 months FREE</span>
                </p>
              </div>

              {/* Free tier */}
              <div className="bg-white rounded-lg p-3 shadow-md text-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Free Tier Available</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Start with 20 questions/day • 2 mock tests/month
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="hover:bg-gray-50 h-8 text-xs"
                >
                  Continue with Free
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
