// src/services/streakService.ts
import { supabase } from '@/integrations/supabase/client';

export class StreakService {
  
  /**
   * Calculate dynamic daily target based on 7-day accuracy
   */
  static async calculateDailyTarget(userId: string): Promise<number> {
    try {
      // Get last 7 days of attempts
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('is_correct, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate 7-day accuracy
      const totalAttempts = attempts?.length || 0;
      if (totalAttempts === 0) return 15; // Start with 15 for new users

      const correctAttempts = attempts?.filter(a => a.is_correct).length || 0;
      const accuracy = (correctAttempts / totalAttempts) * 100;

      // Get weeks active
      const { data: userData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      const weeksActive = Math.floor(
        (Date.now() - new Date(userData?.created_at || Date.now()).getTime()) / 
        (1000 * 60 * 60 * 24 * 7)
      );

      // Calculate weekly increase based on accuracy
      let weeklyIncrease = 0;
      if (accuracy < 50) {
        weeklyIncrease = 0; // Struggling - keep target same
      } else if (accuracy < 70) {
        weeklyIncrease = 2; // Average - slow growth
      } else if (accuracy < 85) {
        weeklyIncrease = 3; // Good - normal growth
      } else {
        weeklyIncrease = 5; // Excellent - fast growth
      }

      // Calculate new target with cap at 75
      const newTarget = Math.min(
        15 + (weeksActive * weeklyIncrease),
        75
      );

      // Store 7-day accuracy for display
      await this.store7DayAccuracy(userId, accuracy);

      return Math.max(newTarget, 15); // Minimum 15 questions
    } catch (error) {
      console.error('Error calculating daily target:', error);
      return 15; // Default fallback
    }
  }

  /**
   * Store 7-day accuracy in daily_progress
   */
  private static async store7DayAccuracy(userId: string, accuracy: number) {
    const today = new Date().toISOString().split('T')[0];
    
    await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date: today,
        accuracy_7day: accuracy
      }, {
        onConflict: 'user_id,date'
      });
  }

  /**
   * Get today's progress for user
   */
  static async getTodayProgress(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's progress
    let { data: progress, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error || !progress) {
      // Create today's entry
      const dailyTarget = await this.calculateDailyTarget(userId);
      
      const { data: newProgress } = await supabase
        .from('daily_progress')
        .insert({
          user_id: userId,
          date: today,
          daily_target: dailyTarget,
          questions_completed: 0,
          target_met: false
        })
        .select()
        .single();

      progress = newProgress;
    }

    return progress;
  }

  /**
   * Update progress after question attempt
   */
  static async updateProgress(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get today's question count
    const { count } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    const questionsCompleted = count || 0;

    // Get today's progress
    const progress = await this.getTodayProgress(userId);
    const targetMet = questionsCompleted >= (progress?.daily_target || 15);

    // Update progress
    await supabase
      .from('daily_progress')
      .update({
        questions_completed: questionsCompleted,
        target_met: targetMet
      })
      .eq('user_id', userId)
      .eq('date', today);

    // Check if streak should be updated
    if (targetMet) {
      await this.updateStreak(userId);
    }

    return { questionsCompleted, targetMet, target: progress?.daily_target || 15 };
  }

  /**
   * Update user streak
   */
  static async updateStreak(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Get user streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streakData) {
      // Create streak record
      await supabase.from('user_streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: todayString,
        total_streak_days: 1
      });
      return;
    }

    const lastActivityDate = streakData.last_activity_date;

    // Already updated today
    if (lastActivityDate === todayString) return;

    let newStreak = streakData.current_streak;
    let usedFreeze = false;

    // Check if yesterday's target was met
    if (lastActivityDate === yesterdayString) {
      // Consecutive day - increment streak
      newStreak += 1;
    } else {
      // Gap detected - check streak freeze
      const daysSinceLastActivity = Math.floor(
        (today.getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity === 2 && streakData.streak_freeze_available) {
        // Use streak freeze (1-day gap allowed once per week)
        newStreak += 1;
        usedFreeze = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Update streak
    const longestStreak = Math.max(newStreak, streakData.longest_streak);

    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: todayString,
        total_streak_days: streakData.total_streak_days + 1,
        streak_freeze_available: usedFreeze ? false : streakData.streak_freeze_available
      })
      .eq('user_id', userId);

    // Award streak milestone badges/points
    await this.awardStreakMilestones(userId, newStreak);

    return { newStreak, longestStreak, usedFreeze };
  }

  /**
   * Award points for streak milestones
   */
  private static async awardStreakMilestones(userId: string, streak: number) {
    const milestones = [
      { days: 7, points: 100, badge: '7-Day Warrior' },
      { days: 15, points: 250, badge: '15-Day Champion' },
      { days: 30, points: 500, badge: 'Monthly Master' },
      { days: 60, points: 1000, badge: 'Consistent Learner' },
      { days: 90, points: 2000, badge: 'Quarter Master' },
      { days: 120, points: 3000, badge: '4-Month Hero' },
      { days: 180, points: 6000, badge: 'Half Year Legend' },
      { days: 365, points: 25000, badge: 'YEARLY CHAMPION' }
    ];

    for (const milestone of milestones) {
      if (streak === milestone.days) {
        // Award points
        const { data: pointsData } = await supabase
          .from('jeenius_points')
          .select('total_points, badges')
          .eq('user_id', userId)
          .single();

        if (pointsData) {
          const badges = (pointsData.badges as string[]) || [];
          if (!badges.includes(milestone.badge)) {
            badges.push(milestone.badge);

            await supabase
              .from('jeenius_points')
              .update({
                total_points: pointsData.total_points + milestone.points,
                badges
              })
              .eq('user_id', userId);
          }
        }
      }
    }
  }

  /**
   * Get user streak status
   */
  static async getStreakStatus(userId: string) {
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const todayProgress = await this.getTodayProgress(userId);

    return {
      currentStreak: streakData?.current_streak || 0,
      longestStreak: streakData?.longest_streak || 0,
      todayTarget: todayProgress?.daily_target || 15,
      todayCompleted: todayProgress?.questions_completed || 0,
      targetMet: todayProgress?.target_met || false,
      streakFreezeAvailable: streakData?.streak_freeze_available || false,
      accuracy7Day: todayProgress?.accuracy_7day || 0
    };
  }

  /**
   * Check if user is at risk of breaking streak
   */
  static async checkStreakRisk(userId: string) {
    const status = await this.getStreakStatus(userId);
    const remaining = status.todayTarget - status.todayCompleted;

    if (remaining > 0 && !status.targetMet) {
      const { data: limits } = await supabase
        .from('user_limits')
        .select('daily_question_limit')
        .eq('user_id', userId)
        .single();

      const canComplete = (limits?.daily_question_limit || 20) >= status.todayTarget;

      return {
        atRisk: true,
        remaining,
        canComplete,
        needsUpgrade: !canComplete
      };
    }

    return { atRisk: false, remaining: 0, canComplete: true, needsUpgrade: false };
  }

  /**
   * Reset weekly streak freeze (run every Monday)
   */
  static async resetWeeklyStreakFreeze() {
    await supabase
      .from('user_streaks')
      .update({ streak_freeze_available: true })
      .eq('streak_freeze_available', false);
  }
}

export default StreakService;
