// Synced Subscription Plans Config
// All pricing values are centralized here and in src/config/subscriptionPlans.ts

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Starter',
    price: 0,
    duration: 'forever',
    displayDuration: 'forever free',
    popular: false,
    bestValue: false,
    features: [
      '✅ 20 questions per day',
      '✅ 300 questions per month',
      '✅ 2 mock tests per month',
      '✅ Interactive Dashboard',
      '✅ Leaderboard access',
      '❌ No JEEnie AI assistant',
      '❌ No AI study planner',
      '❌ No performance analytics'
    ],
    limits: {
      questionsPerDay: 20,
      questionsPerMonth: 300,
      testsPerMonth: 2,
      jeenieAccess: false,
      studyPlanner: false,
      analytics: false
    },
    tagline: '🎯 Perfect to get started with JEE prep'
  },

  monthly: {
    name: 'Pro Monthly',
    price: 99,
    originalPrice: 149,
    duration: '1 month',
    displayDuration: 'per month',
    savings: 50,
    popular: false,
    bestValue: false,
    features: [
      '✨ Unlimited Questions',
      '📊 Unlimited Mock Tests',
      '🤖 JEEnie AI Assistant',
      '🎯 AI Study Planner',
      '📈 Performance Analytics',
      '🏆 Full Leaderboard Access',
      '⚡ Priority Support'
    ],
    tagline: '☕ Less than a Pizza per month!',
    razorpayPlanId: 'plan_monthly_99'
  },
  
  yearly: {
    name: 'Pro Yearly',
    price: 499,
    originalPrice: 1188,
    duration: '12 months',
    displayDuration: 'per year',
    savings: 689,
    popular: true,
    bestValue: true,
    features: [
      '✨ Everything in Pro Monthly',
      '🎁 Save ₹689 (58% OFF!)',
      '🤖 Unlimited JEEnie AI',
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

// Updated Free Plan Limits
export const FREE_PLAN_LIMITS = {
  questionsPerDay: 20,
  questionsPerMonth: 300,
  mockTestsPerMonth: 2,
  jeenieAccess: false,
  studyPlanner: false,
  analytics: false
};

// Pro Plan Features
export const PRO_PLAN_FEATURES = {
  questionsPerDay: 'unlimited',
  questionsPerMonth: 'unlimited',
  mockTestsPerMonth: 'unlimited',
  jeenieAccess: true,
  studyPlanner: true,
  analytics: true,
  prioritySupport: true
};

// Updated Conversion Messages - Make it feel like a STEAL
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
  },
  chapterLocked: {
    title: '🔒 Premium Chapter',
    message: 'Unlock all chapters + unlimited questions with Pro subscription!',
    cta: 'Unlock All Chapters',
    subtitle: 'Complete access to all topics'
  }
};

// Usage Tracking Helper
export const shouldShowUpgradePrompt = (
  userPlan: 'free' | 'pro',
  limitType: keyof typeof CONVERSION_MESSAGES
): boolean => {
  return userPlan === 'free';
};

// Referral Config - 1 week free Pro per referral
export const REFERRAL_CONFIG = {
  enabled: true,
  rewardDays: 7,
  maxRewards: 4, // Max 4 referrals = 1 month free
  message: 'Refer 4 friends & get 1 month FREE Pro!'
};

// Trial Config
export const TRIAL_CONFIG = {
  enabled: false,
  duration: 7,
  features: 'all_pro_features',
  message: '7-day free trial • No credit card required'
};

// Payment Config
export const PAYMENT_CONFIG = {
  currency: 'INR',
  acceptedMethods: ['card', 'upi', 'netbanking', 'wallet'],
  refundPolicy: '7-day money-back guarantee',
  support: 'support@jeenius.com'
};
