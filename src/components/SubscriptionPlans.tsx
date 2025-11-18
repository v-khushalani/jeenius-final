export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Starter',
    price: 0,
    duration: 'forever',
    displayDuration: 'forever free',
    popular: false,
    bestValue: false,
    features: [
      '✅ 15 questions per day',
      '✅ 150 questions per month cap',
      '✅ 2 mock tests per month',
      '✅ Interactive Dashboard',
      '✅ Leaderboard access',
      '❌ No Jeenie AI assistant',
      '❌ No AI study planner',
      '❌ No performance analytics'
    ],
    limits: {
      questionsPerDay: 15,
      questionsPerMonth: 150,
      testsPerMonth: 2,
      jeenieAccess: false,
      studyPlanner: false,
      analytics: false
    },
    tagline: 'Perfect to get started with JEE prep'
  },

  monthly: {
    name: 'Pro Monthly',
    price: 49,
    originalPrice: 99,
    duration: '1 month',
    displayDuration: 'per month',
    savings: 50,
    popular: false,
    bestValue: false,
    features: [
      '✨ 150 Questions Practice Monthly',
      '📊 2 Monthly Mock Tests',
      '🏆 Full Leaderboard Access',

    ],
    tagline: 'Less than a cold coffee per month',
    razorpayPlanId: 'plan_monthly_49' // Replace with actual Razorpay plan ID
  },
  
  yearly: {
    name: 'Pro Yearly',
    price: 499,
    originalPrice: 1199,
    duration: '12 months',
    displayDuration: 'per year',
    savings: 700,
    popular: true,
    bestValue: true,
    features: [
      '✨ Everything in Pro Monthly',
      '🤖 JEEnie (AI Assistant)',
      '🎯 AI-powered Study Planner',
      '📈 Advanced Performance Analytics',
      '💾 Bookmarks & Notes (Coming Soon)',
      '⚡ Priority Support 24/7',
      '🚀 Early Access to New Features'
    ],
    tagline: 'Most students choose this! Best value for serious learners.',
    razorpayPlanId: 'plan_yearly_499' // Replace with actual Razorpay plan ID
  }
};

// Updated Free Plan Limits
export const FREE_PLAN_LIMITS = {
  questionsPerDay: 15,
  questionsPerMonth: 150,
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
  prioritySupport: true,
  bookmarks: true,
  offlineMode: true
};

// Updated Conversion Messages
export const CONVERSION_MESSAGES = {
  dailyLimit: {
    title: '🚀 Daily Limit Reached!',
    message: 'You\'ve solved 15 questions today. Come back tomorrow or unlock unlimited practice with Pro!',
    cta: 'Upgrade to Pro - ₹499/year',
    subtitle: 'Less than ₹2 per day! 🎯'
  },
  monthlyLimit: {
    title: '📊 Monthly Cap Reached!',
    message: 'You\'ve completed 150 questions this month. Upgrade to Pro for unlimited questions!',
    cta: 'Get Unlimited Access',
    subtitle: 'Join thousands of students using Pro'
  },
  testLimit: {
    title: '📝 Test Limit Reached',
    message: 'You\'ve taken 2 free tests this month. Get unlimited mock tests with Pro subscription!',
    cta: 'Unlock Unlimited Tests',
    subtitle: 'Practice makes perfect! 💪'
  },
  jeenieBlocked: {
    title: '🤖 JEEnie AI - Pro Feature',
    message: 'Jeenie AI assistant is available only for Pro users. Get instant doubt solving 24/7!',
    cta: 'Unlock Jeenie AI',
    subtitle: 'Your personal AI tutor awaits'
  },
  studyPlannerBlocked: {
    title: '📅 AI Study Planner - Pro Feature',
    message: 'Get a dynamic study plan that adapts to your progress and exam date. Available in Pro!',
    cta: 'Get Smart Study Plan',
    subtitle: 'Plan smarter, not harder'
  },
  analyticsBlocked: {
    title: '📈 Advanced Analytics - Pro Feature',
    message: 'Unlock detailed performance insights, weak area analysis, and time management reports!',
    cta: 'View Full Analytics',
    subtitle: 'Know exactly where you stand'
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

// Referral Config
export const REFERRAL_CONFIG = {
  enabled: true,
  reward: {
    type: 'free_month',
    threshold: 3, // Refer 3 friends
    message: 'Refer 3 friends → Get 1 month Pro free!'
  }
};

// Trial Config
export const TRIAL_CONFIG = {
  enabled: false, // Set to true if you want to enable trial
  duration: 7, // days
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
