// src/services/userLimitsService.ts
import { supabase } from '@/integrations/supabase/client';
import StreakService from './streakService';

export class UserLimitsService {
  
  /**
   * Get user's daily question limit
   */
  /**
 * Get user's daily question limit
 * ✅ 15 for free, unlimited for premium
 */
static async getDailyLimit(userId: string): Promise<number> {
  // Check if user is premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, subscription_end_date')
    .eq('id', userId)
    .single();

  const isPremiumActive = profile?.is_premium && 
    profile?.subscription_end_date &&
    new Date(profile.subscription_end_date) > new Date();

  // ✅ 15 questions for free, unlimited for premium
  return isPremiumActive ? Infinity : 15;
}
  /**
   * Check if user is PRO
   */
  static async isPro(userId: string): Promise<boolean> {
    const { data: limits } = await supabase
      .from('user_limits')
      .select('is_pro, subscription_end_date')
      .eq('user_id', userId)
      .single();

    if (!limits) return false;

    // Check if subscription is active
    if (limits.is_pro && limits.subscription_end_date) {
      const isActive = new Date(limits.subscription_end_date) > new Date();
      if (!isActive) {
        // Subscription expired, downgrade to FREE
        await this.downgradeToPRO(userId);
        return false;
      }
    }

    return limits.is_pro || false;
  }

  /**
   * Get today's usage (questions solved today)
   */
  static async getTodayUsage(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const { count } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    return count || 0;
  }

  /**
   * Check if user can solve more questions today
   */
  static async canSolveMore(userId: string): Promise<{
    canSolve: boolean;
    reason?: string;
    limit: number;
    used: number;
    remaining: number;
  }> {
    const isPro = await this.isPro(userId);
    const limit = await this.getDailyLimit(userId);
    const used = await this.getTodayUsage(userId);

    if (isPro) {
      return {
        canSolve: true,
        limit: Infinity,
        used,
        remaining: Infinity
      };
    }

    const remaining = limit - used;
    
    if (remaining <= 0) {
      return {
        canSolve: false,
        reason: 'daily_limit_reached',
        limit,
        used,
        remaining: 0
      };
    }

    return {
      canSolve: true,
      limit,
      used,
      remaining
    };
  }

  /**
   * Check if user should see upgrade prompt
   */
  static async shouldShowUpgradePrompt(userId: string): Promise<{
    show: boolean;
    promptType: string;
    data?: any;
  }> {
    const isPro = await this.isPro(userId);
    if (isPro) return { show: false, promptType: 'none' };

    // Check if daily limit reached
    const { canSolve, remaining } = await this.canSolveMore(userId);
    if (!canSolve) {
      return {
        show: true,
        promptType: 'daily_limit_reached',
        data: { remaining: 0 }
      };
    }

    // Check if approaching limit
    if (remaining <= 5) {
      return {
        show: true,
        promptType: 'approaching_limit',
        data: { remaining }
      };
    }

    // Check if target exceeds limit
    const streakStatus = await StreakService.getStreakStatus(userId);
    const limit = await this.getDailyLimit(userId);

    if (streakStatus.todayTarget > limit) {
      return {
        show: true,
        promptType: 'target_exceeds_limit',
        data: {
          target: streakStatus.todayTarget,
          limit,
          currentStreak: streakStatus.currentStreak
        }
      };
    }

    // Check if next target will exceed limit
    const nextTarget = await this.predictNextTarget(userId);
    if (nextTarget > limit) {
      return {
        show: true,
        promptType: 'next_target_warning',
        data: {
          currentTarget: streakStatus.todayTarget,
          nextTarget,
          limit
        }
      };
    }

    return { show: false, promptType: 'none' };
  }

  /**
   * Predict next week's target based on current accuracy
   */
  private static async predictNextTarget(userId: string): Promise<number> {
    const streakStatus = await StreakService.getStreakStatus(userId);
    const accuracy = streakStatus.accuracy7Day;

    let weeklyIncrease = 0;
    if (accuracy < 50) weeklyIncrease = 0;
    else if (accuracy < 70) weeklyIncrease = 2;
    else if (accuracy < 85) weeklyIncrease = 3;
    else weeklyIncrease = 5;

    return Math.min(streakStatus.todayTarget + weeklyIncrease, 75);
  }

  /**
   * Log conversion prompt shown to user
   */
  static async logConversionPrompt(
    userId: string,
    promptType: string,
    actionTaken: string = 'pending'
  ) {
    await supabase.from('conversion_prompts').insert({
      user_id: userId,
      prompt_type: promptType,
      action_taken: actionTaken
    });
  }

  /**
   * Upgrade user to PRO
   */
  static async upgradeToPRO(
    userId: string,
    durationMonths: number = 12
  ): Promise<boolean> {
    try {
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

      await supabase
        .from('user_limits')
        .update({
          is_pro: true,
          subscription_start_date: subscriptionStart.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString()
        })
        .eq('user_id', userId);

      // Log conversion
      await this.logConversionPrompt(userId, 'upgrade_completed', 'upgraded');

      return true;
    } catch (error) {
      console.error('Error upgrading to PRO:', error);
      return false;
    }
  }

  /**
   * Downgrade user to FREE (when subscription expires)
   */
  private static async downgradeToPRO(userId: string) {
    await supabase
      .from('user_limits')
      .update({
        is_pro: false,
        daily_question_limit: 20
      })
      .eq('user_id', userId);
  }

  /**
   * Get conversion statistics for admin
   */
  static async getConversionStats() {
    // Total users
    const { count: totalUsers } = await supabase
      .from('user_limits')
      .select('*', { count: 'exact', head: true });

    // PRO users
    const { count: proUsers } = await supabase
      .from('user_limits')
      .select('*', { count: 'exact', head: true })
      .eq('is_pro', true);

    // Prompts shown this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: promptsShown } = await supabase
      .from('conversion_prompts')
      .select('*', { count: 'exact', head: true })
      .gte('shown_at', weekAgo.toISOString());

    // Conversions this week
    const { count: conversions } = await supabase
      .from('conversion_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('action_taken', 'upgraded')
      .gte('shown_at', weekAgo.toISOString());

    const conversionRate = promptsShown && conversions 
      ? ((conversions / promptsShown) * 100).toFixed(1)
      : '0';

    return {
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      freeUsers: (totalUsers || 0) - (proUsers || 0),
      proPercentage: totalUsers ? ((proUsers || 0) / totalUsers * 100).toFixed(1) : '0',
      weeklyPromptsShown: promptsShown || 0,
      weeklyConversions: conversions || 0,
      weeklyConversionRate: conversionRate
    };
  }

  /**
   * Get upgrade prompt message based on type
   */
  static getUpgradeMessage(promptType: string, data?: any): {
    title: string;
    message: string;
    cta: string;
  } {
    switch (promptType) {
      case 'daily_limit_reached':
        return {
          title: '🎯 Daily Limit Reached!',
          message: `You've solved 20 questions today (FREE limit). Upgrade to PRO for unlimited questions and keep learning!`,
          cta: 'Upgrade to PRO - ₹999/year'
        };

      case 'approaching_limit':
        return {
          title: '⚠️ Approaching Daily Limit',
          message: `Only ${data.remaining} questions left today! Upgrade to PRO for unlimited access.`,
          cta: 'Go Unlimited - ₹999/year'
        };

      case 'target_exceeds_limit':
        return {
          title: '🔥 Your Growth is Amazing!',
          message: `Your daily target is now ${data.target} questions, but FREE limit is only 20. Your ${data.currentStreak}-day streak will break tomorrow! Upgrade to continue.`,
          cta: 'Save My Streak - ₹999/year'
        };

      case 'next_target_warning':
        return {
          title: '📈 Target Increasing Soon',
          message: `Great progress! Next week's target: ${data.nextTarget} questions. FREE limit: ${data.limit}. Upgrade now to stay ahead!`,
          cta: 'Upgrade to PRO - ₹999/year'
        };

      default:
        return {
          title: '🚀 Upgrade to PRO',
          message: 'Unlock unlimited questions, AI features, and be eligible for iPad/Bike prize!',
          cta: 'Upgrade Now - ₹999/year'
        };
    }
  }
}

export default UserLimitsService;
