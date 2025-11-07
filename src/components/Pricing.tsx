import React, { useState } from 'react';
import Header from '@/components/Header';
import { Check, X, Star, Crown, Zap, Bot, Calendar, TrendingUp, Coffee, Samosa } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

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
    { text: 'AI-powered dynamic study planner', icon: Calendar, highlight: true },
    { text: 'Advanced performance analytics', icon: TrendingUp, highlight: false },
    { text: 'Leaderboard access', icon: Star, highlight: false },
    { text: 'Bookmark & notes', icon: Star, highlight: false },
    { text: 'Priority support 24/7', icon: Star, highlight: false }
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-green-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col justify-center items-center pt-20 pb-8">

        {/* Hero Section */}
        <section className="text-center mb-8 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Choose Your Path to
            <span className="text-green-600 block mt-2">JEE Success 🎯</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-xl mx-auto">
            Start free, upgrade anytime. No hidden costs — only hidden potential 🚀
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
              <div className="text-xs text-gray-200 mt-1 flex items-center justify-center gap-1">
                <Coffee className="w-3 h-3" /> Less than a cold coffee ☕
              </div>
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
              <div className="text-xs text-gray-200 mt-1 flex items-center justify-center gap-1">
                <Samosa className="w-3 h-3" /> Cheaper than a samosa 🥟
              </div>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="w-full max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-8">

            {/* FREE PLAN */}
            <Card className="relative shadow-lg hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Starter
                </CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">₹0</span>
                    <span className="text-gray-600 ml-2">/forever</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Perfect to get started</p>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6 text-left">
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
                  className="w-full text-lg py-5 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50" 
                  size="lg"
                >
                  Get Started Free 🚀
                </Button>
              </CardContent>
            </Card>

            {/* PRO PLAN */}
            <Card className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-green-500 scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
                  <Crown className="w-4 h-4" />
                  <span>MOST POPULAR</span>
                </div>
              </div>

              <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Pro
                </CardTitle>
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
                      <p className="text-green-600 font-semibold">Save ₹89 annually 🎉</p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="bg-white">
                <ul className="space-y-2 mb-6 text-left">
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
                  className="w-full text-lg py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                  size="lg"
                >
                  Upgrade to Pro 👑
                </Button>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  Cancel anytime • Money-back guarantee • Happiness guaranteed 😄
                </p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Funny Trust Section */}
        <section className="mt-10 text-center px-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Why Students Love Pro 💚</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md w-64">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold mb-1">3x Faster Progress</h4>
              <p className="text-sm text-gray-600">Unlimited practice = instant glow-up 🌟</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md w-64">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-bold mb-1">AI-Powered Jeenie</h4>
              <p className="text-sm text-gray-600">Jeenie knows your weak topics better than you do 😜</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md w-64">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold mb-1">Less than ₹2/day</h4>
              <p className="text-sm text-gray-600">Cheaper than your daily chai ☕ but 10x more useful!</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PricingPage;
