// src/services/userLimitsService.ts
import { supabase } from '@/integrations/supabase/client';
import StreakService from './streakService';

export class UserLimitsService {
  
  static async getDailyLimit(userId: string): Promise<number> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_end_date')
      .eq('id', userId)
      .single();

    const isPremiumActive = profile?.is_premium || 
      (profile?.subscription_end_date && new Date(profile.subscription_end_date) > new Date());

    return isPremiumActive ? Infinity : 15;
  }

  static async isPro(userId: string): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_end_date')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    const isPremiumActive = profile.is_premium || 
      (profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date());

    return isPremiumActive;
  }

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

  static async shouldShowUpgradePrompt(userId: string): Promise<{
    show: boolean;
    promptType: string;
    data?: any;
  }> {
    const isPro = await this.isPro(userId);
    if (isPro) return { show: false, promptType: 'none' };

    const { canSolve, remaining } = await this.canSolveMore(userId);
    if (!canSolve) {
      return {
        show: true,
        promptType: 'daily_limit_reached',
        data: { remaining: 0 }
      };
    }

    if (remaining <= 5) {
      return {
        show: true,
        promptType: 'approaching_limit',
        data: { remaining }
      };
    }

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

  static async upgradeToPRO(
    userId: string,
    durationMonths: number = 12
  ): Promise<boolean> {
    try {
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          daily_question_limit: Infinity,
          subscription_start_date: subscriptionStart.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString()
        })
        .eq('id', userId);

      await this.logConversionPrompt(userId, 'upgrade_completed', 'upgraded');

      return true;
    } catch (error) {
      console.error('Error upgrading to PRO:', error);
      return false;
    }
  }

  static async getConversionStats() {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: proUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_pro', true);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: promptsShown } = await supabase
      .from('conversion_prompts')
      .select('*', { count: 'exact', head: true })
      .gte('shown_at', weekAgo.toISOString());

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

  static getUpgradeMessage(promptType: string, data?: any): {
    title: string;
    message: string;
    cta: string;
  } {
    switch (promptType) {
      case 'daily_limit_reached':
        return {
          title: '🎯 Daily Limit Reached!',
          message: `You've solved 15 questions today (FREE limit). Upgrade to PRO for unlimited questions!`,
          cta: 'Upgrade to PRO - ₹499/year'
        };

      case 'approaching_limit':
        return {
          title: '⚠️ Approaching Daily Limit',
          message: `Only ${data.remaining} questions left today! Upgrade to PRO for unlimited access.`,
          cta: 'Go Unlimited - ₹499/year'
        };

      case 'target_exceeds_limit':
        return {
          title: '🔥 Your Growth is Amazing!',
          message: `Your daily target is now ${data.target} questions, but FREE limit is only 15. Upgrade to continue.`,
          cta: 'Save My Streak - ₹499/year'
        };

      case 'next_target_warning':
        return {
          title: '📈 Target Increasing Soon',
          message: `Great progress! Next week's target: ${data.nextTarget} questions. FREE limit: ${data.limit}. Upgrade now!`,
          cta: 'Upgrade to PRO - ₹499/year'
        };

      default:
        return {
          title: '🚀 Upgrade to PRO',
          message: 'Unlock unlimited questions, AI features, and more!',
          cta: 'Upgrade Now - ₹499/year'
        };
    }
  }
}

export default UserLimitsService;
