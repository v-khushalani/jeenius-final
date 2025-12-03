import React, { useState } from 'react';
import Header from '@/components/Header';
import { Check, X, Crown, Zap, Bot, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();

  const comparison = [
    { feature: 'Questions/Day', free: '20', pro: 'Unlimited' },
    { feature: 'Mock Tests/Month', free: '2', pro: 'Unlimited' },
    { feature: 'JEEnie AI Assistant', free: false, pro: true },
    { feature: 'AI Study Planner', free: false, pro: true },
    { feature: 'Performance Analytics', free: false, pro: true },
    { feature: 'Priority Support', free: false, pro: true },
  ];

  const proFeatures = [
    { text: 'Unlimited questions', icon: Zap },
    { text: 'Unlimited mock tests', icon: TrendingUp },
    { text: 'JEEnie AI 24/7', icon: Bot },
    { text: 'AI Study Planner', icon: Calendar },
  ];

  const pricing = {
    monthly: { price: 99, perDay: '₹3.3/day' },
    yearly: { price: 499, original: 1188, perDay: '₹1.37/day', savings: 689 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-8">
        {/* Hero */}
        <section className="py-8">
          <div className="container mx-auto px-4 text-center">
            <Badge className="bg-primary/10 text-primary border-0 mb-4">
              🔥 STEAL DEAL
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              The BEST Value in JEE Prep
            </h1>
            <p className="text-muted-foreground mb-6">
              {billingCycle === 'yearly' 
                ? `Just ${pricing.yearly.perDay} — Cheaper than a samosa!` 
                : `Just ${pricing.monthly.perDay} — Less than a Pizza!`}
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  58% OFF
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Free */}
              <Card className="border">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Starter</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">₹0</span>
                    <span className="text-muted-foreground ml-1">/forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>20 questions/day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>2 mock tests/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Basic dashboard</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <X className="w-4 h-4" />
                      <span>No AI features</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">
                    <Crown className="w-3 h-3 mr-1" />
                    RECOMMENDED
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4 pt-6">
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <div className="mt-3">
                    {billingCycle === 'yearly' && (
                      <span className="text-lg text-muted-foreground line-through mr-2">
                        ₹{pricing.yearly.original}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-primary">
                      ₹{pricing[billingCycle].price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Save ₹{pricing.yearly.savings}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    {proFeatures.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <li key={idx} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-medium">{feature.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Button 
                    onClick={() => navigate('/subscription-plans')}
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Get Pro Now
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    7-day money-back guarantee
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-6">Free vs Pro</h2>
            <div className="max-w-2xl mx-auto bg-card rounded-xl border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 border-b">
                <div className="p-3 text-sm font-medium">Feature</div>
                <div className="p-3 text-sm font-medium text-center">Free</div>
                <div className="p-3 text-sm font-medium text-center text-primary">Pro</div>
              </div>
              {comparison.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 border-b last:border-0">
                  <div className="p-3 text-sm">{item.feature}</div>
                  <div className="p-3 text-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.free}</span>
                    )}
                  </div>
                  <div className="p-3 text-center bg-primary/5">
                    {typeof item.pro === 'boolean' ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-sm font-medium text-primary">{item.pro}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Referral */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-primary/5 rounded-xl p-6 text-center border border-primary/20">
              <h3 className="font-bold text-foreground mb-2">
                🎁 Refer 4 friends & get 1 month FREE Pro!
              </h3>
              <p className="text-sm text-muted-foreground">
                1 week free for each friend who signs up
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PricingPage;
