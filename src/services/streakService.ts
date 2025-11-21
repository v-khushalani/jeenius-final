// src/services/streakService.ts
import { supabase } from '@/integrations/supabase/client';

export class StreakService {
  
  static async calculateDailyTarget(userId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('is_correct, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalAttempts = attempts?.length || 0;
      if (totalAttempts === 0) return 15;

      const correctAttempts = attempts?.filter(a => a.is_correct).length || 0;
      const accuracy = (correctAttempts / totalAttempts) * 100;

      const { data: userData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      const weeksActive = Math.floor(
        (Date.now() - new Date(userData?.created_at || Date.now()).getTime()) / 
        (1000 * 60 * 60 * 24 * 7)
      );

      let weeklyIncrease = 0;
      if (accuracy < 50) weeklyIncrease = 0;
      else if (accuracy < 60) weeklyIncrease = 1;
      else if (accuracy < 70) weeklyIncrease = 2;
      else if (accuracy < 80) weeklyIncrease = 3;
      else if (accuracy < 90) weeklyIncrease = 4;
      else weeklyIncrease = 5;

      const newTarget = Math.min(15 + (weeksActive * weeklyIncrease), 75);

      await this.store7DayAccuracy(userId, accuracy);

      return Math.max(newTarget, 15);
    } catch (error) {
      console.error('Error calculating daily target:', error);
      return 15;
    }
  }

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

  static async getTodayProgress(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    let { data: progress, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error || !progress) {
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

  static async updateProgress(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { count } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    const questionsCompleted = count || 0;
    const progress = await this.getTodayProgress(userId);
    const targetMet = questionsCompleted >= (progress?.daily_target || 15);

    await supabase
      .from('daily_progress')
      .update({
        questions_completed: questionsCompleted,
        target_met: targetMet
      })
      .eq('user_id', userId)
      .eq('date', today);

    if (targetMet) {
      await this.updateStreak(userId);
    }

    return { questionsCompleted, targetMet, target: progress?.daily_target || 15 };
  }

  static async updateStreak(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_activity_date, streak_freeze_available, total_streak_days')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const lastActivityDate = profile.last_activity_date;

    if (lastActivityDate === todayString) return;

    let newStreak = profile.current_streak || 0;
    let usedFreeze = false;

    if (lastActivityDate === yesterdayString) {
      newStreak += 1;
    } else {
      const daysSinceLastActivity = Math.floor(
        (today.getTime() - new Date(lastActivityDate || today).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity === 2 && profile.streak_freeze_available) {
        newStreak += 1;
        usedFreeze = true;
      } else {
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(newStreak, profile.longest_streak || 0);

    await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: todayString,
        total_streak_days: (profile.total_streak_days || 0) + 1,
        streak_freeze_available: usedFreeze ? false : profile.streak_freeze_available
      })
      .eq('id', userId);

    await this.awardStreakMilestones(userId, newStreak);

    return { newStreak, longestStreak, usedFreeze };
  }

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points, badges')
          .eq('id', userId)
          .single();

        if (profile) {
          const badges = (profile.badges as string[]) || [];
          if (!badges.includes(milestone.badge)) {
            badges.push(milestone.badge);

            await supabase
              .from('profiles')
              .update({
                total_points: (profile.total_points || 0) + milestone.points,
                badges
              })
              .eq('id', userId);
          }
        }
      }
    }
  }

  static async getStreakStatus(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, streak_freeze_available')
      .eq('id', userId)
      .single();

    const todayProgress = await this.getTodayProgress(userId);
    
    // Get actual count of questions attempted today from question_attempts
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    const questionsCompletedToday = count || 0;

    return {
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      todayTarget: todayProgress?.daily_target || 15,
      todayCompleted: questionsCompletedToday,
      targetMet: questionsCompletedToday >= (todayProgress?.daily_target || 15),
      streakFreezeAvailable: profile?.streak_freeze_available || false,
      accuracy7Day: todayProgress?.accuracy_7day || 0
    };
  }

  static async checkStreakRisk(userId: string) {
    const status = await this.getStreakStatus(userId);
    const remaining = status.todayTarget - status.todayCompleted;

    if (remaining > 0 && !status.targetMet) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_question_limit')
        .eq('id', userId)
        .single();

      const canComplete = (profile?.daily_question_limit || 15) >= status.todayTarget;

      return {
        atRisk: true,
        remaining,
        canComplete,
        needsUpgrade: !canComplete
      };
    }

    return { atRisk: false, remaining: 0, canComplete: true, needsUpgrade: false };
  }

  static async resetWeeklyStreakFreeze() {
    await supabase
      .from('profiles')
      .update({ streak_freeze_available: true })
      .eq('streak_freeze_available', false);
  }
}

export default StreakService;
