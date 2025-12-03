// src/config/subscriptionPlans.ts
// Synced pricing structure for JEEnius

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
    price: 99,
    displayDuration: 'per month',
    duration: 30,
    popular: false,
    bestValue: false,
    savings: 0,
    originalPrice: null,
    features: [
      '✨ Unlimited Practice Questions',
      '📊 Unlimited Mock Tests',
      '🤖 JEEnie AI Assistant (24/7)',
      '🎯 AI-Powered Study Planner',
      '📈 Advanced Performance Analytics',
      '🏆 Full Leaderboard Access',
      '⚡ Priority Support'
    ],
    tagline: '☕ Less than a Pizza — but can change your rank!',
    razorpayPlanId: 'plan_monthly_99'
  },

  yearly: {
    name: 'Pro Yearly',
    price: 499,
    displayDuration: 'per year',
    duration: 365,
    popular: true,
    bestValue: true,
    savings: 689,
    originalPrice: 1188,
    features: [
      '✨ Everything in Pro Monthly',
      '🎁 Save ₹689 (58% OFF!)',
      '🤖 Unlimited JEEnie AI Assistant',
      '🎯 Advanced AI Study Planner',
      '📊 Deep Performance Analytics',
      '🏆 Premium Leaderboard Badges',
      '⚡ Priority Support 24/7',
      '🚀 Early Access to New Features'
    ],
    tagline: '🔥 ₹1.37/day — Cheaper than a samosa! Most students choose this.',
    razorpayPlanId: 'plan_yearly_499'
  }
};

// Free Plan Limits - Synced across app
export const FREE_LIMITS = {
  questionsPerDay: 20,
  questionsPerMonth: 300,
  mockTestsPerMonth: 2,
  jeenieAccess: false,
  studyPlanner: false,
  analytics: false
};

// Pro Plan Features
export const PRO_FEATURES = {
  questionsPerDay: Infinity,
  questionsPerMonth: Infinity,
  mockTestsPerMonth: Infinity,
  jeenieAccess: true,
  studyPlanner: true,
  analytics: true,
  prioritySupport: true
};

// Referral System Config
export const REFERRAL_CONFIG = {
  enabled: true,
  rewardDays: 7, // 1 week free Pro per referral
  maxRewards: 4, // Max 4 referrals = 1 month free
  message: 'Refer 4 friends & get 1 month FREE Pro!'
};

// Conversion Messages - Make it feel like a steal
export const CONVERSION_MESSAGES = {
  dailyLimit: {
    title: '🚀 Daily Limit Reached!',
    message: "You've crushed 20 questions today! Come back tomorrow or unlock UNLIMITED practice.",
    cta: 'Go Unlimited — ₹499/year',
    subtitle: '🔥 Just ₹1.37/day — Less than a samosa!'
  },
  monthlyLimit: {
    title: '📊 Monthly Cap Reached!',
    message: "You've completed 300 questions this month. Serious learner! Upgrade for unlimited.",
    cta: 'Get Unlimited Access',
    subtitle: '💪 Join thousands crushing their JEE prep'
  },
  testLimit: {
    title: '📝 Test Limit Reached',
    message: "You've taken 2 free tests this month. Get unlimited mock tests with Pro!",
    cta: 'Unlock Unlimited Tests',
    subtitle: '🎯 Practice makes perfect!'
  },
  jeenieBlocked: {
    title: '🤖 JEEnie AI — Pro Feature',
    message: 'Get instant doubt solving 24/7 with your personal AI tutor!',
    cta: 'Unlock JEEnie AI',
    subtitle: '⚡ Your doubts, solved in seconds'
  },
  studyPlannerBlocked: {
    title: '📅 AI Study Planner — Pro Feature',
    message: 'Get a smart study plan that adapts to YOUR progress and exam date!',
    cta: 'Get Smart Study Plan',
    subtitle: '🧠 Plan smarter, not harder'
  },
  analyticsBlocked: {
    title: '📈 Advanced Analytics — Pro Feature',
    message: 'Unlock detailed insights, weak area analysis, and rank predictions!',
    cta: 'View Full Analytics',
    subtitle: '📊 Know exactly where you stand'
  }
};

// Payment Config
export const PAYMENT_CONFIG = {
  currency: 'INR',
  acceptedMethods: ['card', 'upi', 'netbanking', 'wallet'],
  refundPolicy: '7-day money-back guarantee',
  support: 'support@jeenius.com'
};
