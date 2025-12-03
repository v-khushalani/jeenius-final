import React, { useState } from 'react';
import Header from '@/components/Header';
import { Check, X, Crown, Zap, Bot, Calendar, TrendingUp, Gift, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { REFERRAL_CONFIG } from '@/components/SubscriptionPlans';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();

  const freeFeatures = [
    { text: '20 questions per day', included: true },
    { text: '300 questions per month', included: true },
    { text: '2 mock tests per month', included: true },
    { text: 'Basic dashboard', included: true },
    { text: 'Leaderboard access', included: true },
    { text: 'JEEnie AI assistant', included: false },
    { text: 'AI study planner', included: false },
    { text: 'Performance analytics', included: false },
    { text: 'Priority support', included: false }
  ];

  const proFeatures = [
    { text: 'Unlimited questions', icon: Zap, highlight: true },
    { text: 'Unlimited mock tests', icon: TrendingUp, highlight: true },
    { text: 'JEEnie AI assistant 24/7', icon: Bot, highlight: true },
    { text: 'AI-powered study planner', icon: Calendar, highlight: true },
    { text: 'Advanced performance analytics', icon: TrendingUp, highlight: false },
    { text: 'Premium leaderboard badges', icon: Crown, highlight: false },
    { text: 'Priority support 24/7', icon: Zap, highlight: false }
  ];

  const pricing = {
    monthly: { price: 99, original: 149, perDay: '₹3.3' },
    yearly: { price: 499, original: 1188, perDay: '₹1.37', savings: 689 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <Header />
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-16">
        {/* Hero Section */}
        <section className="py-6 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              {REFERRAL_CONFIG.message}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              The <span className="text-green-600">BEST DEAL</span> in JEE Prep
              <span className="block mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl">🎯 Seriously, Check the Math!</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              ₹499/year = <span className="font-bold text-green-600">₹1.37/day</span> — That's cheaper than a samosa!
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                  58% OFF
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-4 sm:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              
              {/* FREE PLAN */}
              <Card className="relative shadow-lg hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                    Starter
                  </CardTitle>
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">₹0</span>
                      <span className="text-sm sm:text-base text-gray-600 ml-2">/forever</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">🎯 Perfect to get started</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50" 
                    size="lg"
                  >
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* PRO PLAN */}
              <Card className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-green-500 sm:scale-105">
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center space-x-1 sm:space-x-2 shadow-lg animate-pulse">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>🔥 STEAL DEAL</span>
                  </div>
                </div>

                <CardHeader className="text-center pb-3 sm:pb-4 bg-gradient-to-br from-green-50 to-emerald-50 pt-6 sm:pt-8">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                    Pro {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                  </CardTitle>
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ₹{pricing[billingCycle].original}
                      </span>
                      <span className="text-4xl sm:text-5xl font-bold text-green-600">
                        ₹{pricing[billingCycle].price}
                      </span>
                      <span className="text-gray-600 ml-2">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="mt-2 space-y-1">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                          🎁 Save ₹{pricing.yearly.savings}!
                        </div>
                        <p className="text-green-600 font-bold text-lg">
                          = {pricing.yearly.perDay}/day
                        </p>
                        <p className="text-xs text-gray-500">Cheaper than a samosa! 🥟</p>
                      </div>
                    )}
                    {billingCycle === 'monthly' && (
                      <p className="text-green-600 font-semibold mt-2">
                        ☕ Less than a Pizza!
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="bg-white">
                  <ul className="space-y-3 mb-6">
                    {proFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <li key={index} className="flex items-start space-x-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            feature.highlight ? 'text-green-600' : 'text-green-500'
                          }`} />
                          <span className={`text-sm ${
                            feature.highlight ? 'text-gray-900 font-semibold' : 'text-gray-700'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button 
                    onClick={() => navigate('/subscription-plans')}
                    className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                    size="lg"
                  >
                    Get Pro Now 👑
                  </Button>
                  
                  <p className="text-center text-xs text-gray-500 mt-3">
                    ✅ Cancel anytime • 7-day money-back guarantee
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Referral Banner */}
        <section className="py-8 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="w-8 h-8 text-white" />
              <h3 className="text-2xl font-bold text-white">Refer & Earn FREE Pro!</h3>
            </div>
            <p className="text-white/90 text-lg mb-4">
              🎁 Get <span className="font-bold">1 WEEK FREE Pro</span> for every friend who signs up!
            </p>
            <p className="text-white/70 text-sm">
              Refer 4 friends = 1 month FREE • Refer 12 friends = 3 months FREE!
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Why Pro is a NO-BRAINER 🧠</h2>
            <p className="text-center text-gray-600 mb-12">Compare and see the difference</p>
            
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Starter (Free)</th>
                    <th className="text-center py-4 px-6 font-semibold text-green-600">Pro ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">Questions per day</td>
                    <td className="text-center py-4 px-6 text-gray-600">20</td>
                    <td className="text-center py-4 px-6 text-green-600 font-bold">UNLIMITED ♾️</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">Monthly question cap</td>
                    <td className="text-center py-4 px-6 text-gray-600">300</td>
                    <td className="text-center py-4 px-6 text-green-600 font-bold">UNLIMITED ♾️</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">Mock tests</td>
                    <td className="text-center py-4 px-6 text-gray-600">2/month</td>
                    <td className="text-center py-4 px-6 text-green-600 font-bold">UNLIMITED ♾️</td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-yellow-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">JEEnie AI Assistant 🤖</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-yellow-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">AI Study Planner 📅</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-yellow-50">
                    <td className="py-4 px-6 text-gray-700 font-medium">Performance Analytics 📊</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">Leaderboard</td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">Priority Support</td>
                    <td className="text-center py-4 px-6"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center py-4 px-6"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-8">Why This is THE BEST Deal 💰</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🥟</div>
                <h4 className="font-bold mb-2">₹1.37/day</h4>
                <p className="text-sm text-gray-600">Cheaper than a samosa — but can change your rank forever!</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🤖</div>
                <h4 className="font-bold mb-2">24/7 AI Tutor</h4>
                <p className="text-sm text-gray-600">JEEnie solves your doubts instantly — like having a tutor always available</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🎁</div>
                <h4 className="font-bold mb-2">Free from Referrals</h4>
                <p className="text-sm text-gray-600">Refer 4 friends = 1 month FREE Pro. It's that simple!</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PricingPage;
