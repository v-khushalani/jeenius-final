import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { initializePayment } from '@/utils/razorpay';
import { Check, Crown } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 overflow-hidden">
      <Header />
      <div className="pt-20 pb-12 px-4 max-h-screen overflow-y-auto">
        {/* Hero Section */}
        <section className="py-3">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Unlock Your Full Potential</h1>
            <p className="text-base text-gray-600 mb-6">Choose the plan that works best for you</p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all relative hover:scale-105 duration-300 ${
                  billingCycle === 'yearly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Yearly
                {currentPlan.savings > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Save ₹{currentPlan.savings}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="py-3">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              {/* Pro Plan */}
              <Card className="border-2 border-green-500 relative hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50">
                {(currentPlan.popular || currentPlan.bestValue) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 text-sm font-semibold shadow-lg">
                      {currentPlan.popular && '🚀 Most Popular'}
                      {currentPlan.bestValue && '💎 Best Value'}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg transition-transform hover:scale-110 duration-300">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{currentPlan.name}</CardTitle>
                  <div className="space-y-2">
                    {currentPlan.originalPrice && (
                      <div className="text-lg text-gray-400 line-through">
                        ₹{currentPlan.originalPrice}
                      </div>
                    )}
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ₹{currentPlan.price}
                      <span className="text-lg text-gray-500 font-normal">
                        /{currentPlan.displayDuration.replace('per ', '')}
                      </span>
                    </div>
                    {currentPlan.savings > 0 && (
                      <div className="flex items-center justify-center space-x-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                          Save ₹{currentPlan.savings}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{currentPlan.tagline}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3 hover:bg-green-50 p-2 rounded-lg transition-colors duration-200">
                        <div className="mt-0.5 text-green-600 flex-shrink-0">
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(billingCycle)}
                    disabled={loading === billingCycle}
                    className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {loading === billingCycle ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Upgrade to Pro Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Free tier info */}
        <section className="py-6">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Tier Available</h3>
              <p className="text-gray-600 mb-4">
                Start with 15 questions per day and upgrade anytime
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                Continue with Free
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
