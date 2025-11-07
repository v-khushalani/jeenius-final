import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { initializePayment } from '@/utils/razorpay';
import { Check, X, Star, Zap, Crown, Bot, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    if (planId === 'free') {
      navigate('/dashboard');
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

  const freeFeatures = [
    { text: '25 questions per day', included: true },
    { text: '150 questions per month', included: true },
    { text: '2 mock tests per month', included: true },
    { text: 'Basic dashboard', included: true },
    { text: 'Leaderboard access', included: true },
    { text: 'Jeenie AI assistant', included: false },
    { text: 'AI study planner', included: false },
    { text: 'Performance analytics', included: false },
    { text: 'Priority support', included: false }
  ];

  const proFeatures = [
    { text: 'Unlimited questions', icon: Zap, highlight: true },
    { text: 'Unlimited mock tests', icon: TrendingUp, highlight: true },
    { text: 'Jeenie AI assistant', icon: Bot, highlight: true },
    { text: 'AI-powered study planner', icon: Calendar, highlight: true },
    { text: 'Advanced analytics', icon: TrendingUp, highlight: false },
    { text: 'Leaderboard access', icon: Star, highlight: false },
    { text: 'Bookmark & notes', icon: Star, highlight: false },
    { text: 'Priority support 24/7', icon: Star, highlight: false }
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-green-50 flex flex-col">
      <Header />
      
      <div className="flex-grow flex flex-col justify-center items-center pt-20 pb-8 px-4">
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Save 15%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* FREE PLAN */}
            <Card className="relative shadow-lg hover:shadow-xl transition-all duration-300 border-2 flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">₹0</span>
                    <span className="text-gray-600 ml-2">/forever</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Perfect to get started</p>
                </div>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-2 mb-6 flex-grow">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSelectPlan('free')}
                  className="w-full text-lg py-5 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50" 
                  size="lg"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* PRO PLAN */}
            <Card className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-green-500 scale-105 flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
                  <Crown className="w-4 h-4" />
                  <span>MOST POPULAR</span>
                </div>
              </div>

              <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    {billingCycle === 'monthly' ? (
                      <>
                        <span className="text-5xl font-bold text-green-600">₹49</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </>
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-green-600">₹499</span>
                        <span className="text-gray-600 ml-2">/year</span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500 line-through">₹588/year</p>
                      <p className="text-green-600 font-semibold">Save ₹89 annually!</p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="bg-white flex-grow flex flex-col">
                <ul className="space-y-2 mb-6 flex-grow">
                  {proFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <li key={index} className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          feature.highlight ? 'text-green-600' : 'text-green-500'
                        }`} />
                        <span className={`${
                          feature.highlight ? 'text-gray-900 font-semibold' : 'text-gray-700'
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Button 
                  onClick={() => handleSelectPlan(billingCycle)}
                  disabled={loading === billingCycle}
                  className="w-full text-lg py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                  size="lg"
                >
                  {loading === billingCycle ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Upgrade to Pro 👑'
                  )}
                </Button>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  Cancel anytime • Money-back guarantee
                </p>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-8 text-center max-w-5xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold mb-1">3x Faster Progress</h4>
              <p className="text-sm text-gray-600">Unlimited practice accelerates learning</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-bold mb-1">AI-Powered Jeenie</h4>
              <p className="text-sm text-gray-600">24/7 doubt solving assistant</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold mb-1">Less than ₹2/day</h4>
              <p className="text-sm text-gray-600">Best investment for JEE prep</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPlans;
