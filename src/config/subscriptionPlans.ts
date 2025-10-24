// src/config/subscriptionPlans.ts
// ✅ FINAL VERSION — perfectly compatible with your SubscriptionPlans.tsx component

export interface SubscriptionPlan {
  name: string;
  price: number;
  displayDuration: string;
  duration: number; // duration in days
  popular: boolean;
  bestValue: boolean;
  savings: number;
  originalPrice: number | null;
  features: string[];
  tagline: string;
  razorpayPlanId: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  monthly: {
    name: 'Pro Monthly',
    price: 49,
    displayDuration: 'per month',
    duration: 30,
    popular: false,
    bestValue: false,
    savings: 0,
    originalPrice: null,
    features: [
      '✨ Unlimited Practice Questions',
      '🤖 Unlimited AI Doubt Solver (JEEnie)',
      '📊 Unlimited Chapter Tests + AI Analysis',
      '🎯 Smart Revision & Weak Area Tracking',
      '🏆 Full Leaderboard Access',
      '⚡ Priority Support',
      '🚀 Early Access to New Features'
    ],
    tagline: 'Less than a pizza — but can change your rank!',
    razorpayPlanId: 'plan_monthly_49' // ✅ replace with your real Razorpay plan ID
  },

  yearly: {
    name: 'Pro Yearly',
    price: 499,
    displayDuration: 'per year',
    duration: 365,
    popular: true,
    bestValue: true,
    savings: 89,
    originalPrice: 588,
    features: [
      '✨ Everything in Pro Monthly',
      '💚 2 Months FREE (Save ₹89)',
      '🤖 Unlimited AI Doubt Solver',
      '📊 Advanced Performance Analytics',
      '🎯 Personalized Study Plans',
      '🏆 Premium Leaderboard Badges',
      '⚡ Priority Support 24/7',
      '🚀 Lifetime Access to New Features'
    ],
    tagline: 'Most students choose this! Best value for serious learners.',
    razorpayPlanId: 'plan_yearly_499' // ✅ replace with your real Razorpay plan ID
  }
};

// ✅ Freemium Limits
export const FREE_LIMITS = {
  chapters: 2,
  dailyQuestions: 20,
  aiQueries: 3
};

// ✅ Helper function
export const checkIsPremium = (subscriptionEndDate: string | null): boolean => {
  if (!subscriptionEndDate) return false;
  return new Date(subscriptionEndDate) > new Date();
};
