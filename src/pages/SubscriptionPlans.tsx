import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, REFERRAL_CONFIG } from '@/config/subscriptionPlans';
import { initializePayment } from '@/utils/razorpay';
import { Check, X, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const pricing = {
    monthly: { price: 99, perDay: '₹3.3/day' },
    yearly: { price: 499, original: 1188, perDay: '₹1.37/day', savings: 689 }
  };

  const comparison = [
    { feature: 'Questions/Day', free: '20', pro: 'Unlimited' },
    { feature: 'Mock Tests/Month', free: '2', pro: 'Unlimited' },
    { feature: 'AI Doubt Solver', free: false, pro: true },
    { feature: 'AI Study Planner', free: false, pro: true },
    { feature: 'Detailed Analytics', free: false, pro: true },
    { feature: 'Priority Support', free: false, pro: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 pt-20 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge className="bg-primary/10 text-primary border-0 mb-3">
              🔥 STEAL DEAL
            </Badge>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Upgrade to Pro
            </h1>
            <p className="text-sm text-muted-foreground">
              {billingCycle === 'yearly' 
                ? `Just ${pricing.yearly.perDay} — Cheaper than a samosa!` 
                : `Just ${pricing.monthly.perDay} — Less than a Pizza!`}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
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

          {/* Price Display */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2">
              {billingCycle === 'yearly' && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{pricing.yearly.original}
                </span>
              )}
              <span className="text-4xl font-bold text-primary">
                ₹{pricing[billingCycle].price}
              </span>
              <span className="text-muted-foreground">
                /{billingCycle === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-sm text-green-600 font-medium mt-1">
                Save ₹{pricing.yearly.savings}!
              </p>
            )}
          </div>

          {/* Comparison Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-3 text-sm font-medium text-muted-foreground">Feature</div>
              <div className="p-3 text-sm font-medium text-center text-muted-foreground">Free</div>
              <div className="p-3 text-sm font-medium text-center text-primary">
                <Crown className="w-4 h-4 inline mr-1" />
                Pro
              </div>
            </div>
            {comparison.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 border-b border-border last:border-0">
                <div className="p-3 text-sm text-foreground">{item.feature}</div>
                <div className="p-3 text-center">
                  {typeof item.free === 'boolean' ? (
                    item.free ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 mx-auto" />
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

          {/* CTA Button */}
          <Button
            onClick={() => handleSelectPlan(billingCycle)}
            disabled={loading === billingCycle}
            className="w-full h-12 text-base font-bold"
          >
            {loading === billingCycle ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Get Pro Now
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            ✅ Cancel anytime • 7-day money-back guarantee
          </p>

          {/* Referral Info */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
            <p className="text-sm text-foreground font-medium">
              🎁 {REFERRAL_CONFIG.message}
            </p>
          </div>

          {/* Continue Free */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue with Free Plan →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
