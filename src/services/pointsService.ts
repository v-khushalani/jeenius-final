// src/services/pointsService.ts
import { supabase } from '@/integrations/supabase/client';

export class PointsService {
  
  static async calculatePoints(
    userId: string,
    difficulty: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<{
    points: number;
    breakdown: Array<{ type: string; points: number; label: string }>;
  }> {
    console.log('🎯 calculatePoints:', { userId, difficulty, isCorrect });
    
    let points = 0;
    const breakdown: Array<{ type: string; points: number; label: string }> = [];

    if (isCorrect) {
      // Base points
      const basePoints = this.getBasePoints(difficulty);
      points += basePoints;
      breakdown.push({
        type: 'base',
        points: basePoints,
        label: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} question`
      });

      // Streak bonus
      const streakBonus = await this.calculateStreakBonus(userId);
      if (streakBonus.points > 0) {
        points += streakBonus.points;
        breakdown.push({
          type: 'streak',
          points: streakBonus.points,
          label: `${streakBonus.streak} answer streak! 🔥`
        });
      }

      if (streakBonus.badgeEarned) {
        breakdown.push({
          type: 'badge',
          points: 0,
          label: `🏆 ${streakBonus.badgeName} Badge Unlocked!`
        });
      }

    } else {
      // Wrong answer penalty
      points = -2;
      breakdown.push({
        type: 'penalty',
        points: -2,
        label: 'Wrong answer'
      });

      await this.resetAnswerStreak(userId);
    }

    console.log('💰 Total points to add:', points);
    await this.updateUserPoints(userId, points);

    return { points, breakdown };
  }

  private static getBasePoints(difficulty: string): number {
    const map: Record<string, number> = {
      easy: 5, Easy: 5,
      medium: 10, Medium: 10,
      hard: 20, Hard: 20
    };
    return map[difficulty] || 5;
  }

  private static async calculateStreakBonus(userId: string): Promise<{
    points: number;
    streak: number;
    badgeEarned: boolean;
    badgeName?: string;
  }> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('answer_streak, badges, longest_answer_streak')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { points: 0, streak: 0, badgeEarned: false };
    }

    const currentStreak = profile.answer_streak || 0;
    const newStreak = currentStreak + 1;

    await supabase
      .from('profiles')
      .update({
        answer_streak: newStreak,
        longest_answer_streak: Math.max(newStreak, profile.longest_answer_streak || 0)
      })
      .eq('id', userId);

    const milestones = [
      { streak: 5, points: 20, badge: 'Hot Streak' },
      { streak: 10, points: 50, badge: 'On Fire' },
      { streak: 20, points: 150, badge: 'Unstoppable' },
      { streak: 50, points: 500, badge: 'BEAST MODE' }
    ];

    for (const milestone of milestones) {
      if (newStreak === milestone.streak) {
        const badges = (profile.badges as any[]) || [];
        const badgeEarned = !badges.includes(milestone.badge);
        
        if (badgeEarned) {
          badges.push(milestone.badge);
          await supabase
            .from('profiles')
            .update({ badges })
            .eq('id', userId);
        }

        return {
          points: milestone.points,
          streak: newStreak,
          badgeEarned,
          badgeName: milestone.badge
        };
      }
    }

    return { points: 0, streak: newStreak, badgeEarned: false };
  }

  private static async resetAnswerStreak(userId: string) {
    await supabase
      .from('profiles')
      .update({ answer_streak: 0 })
      .eq('id', userId);
  }

  private static async updateUserPoints(userId: string, pointsToAdd: number): Promise<boolean> {
    console.log('💾 Updating points in database...');

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      if (!profile) return false;

      const currentPoints = profile.total_points || 0;
      const newTotal = Math.max(0, currentPoints + pointsToAdd);
      const level = this.calculateLevel(newTotal);

      await supabase
        .from('profiles')
        .update({
          total_points: newTotal,
          level: level.name,
          level_progress: level.progress
        })
        .eq('id', userId);

      console.log('✅ Points updated successfully:', newTotal);
      return true;
    } catch (error) {
      console.error('❌ Error updating points:', error);
      return false;
    }
  }

  private static calculateLevel(points: number): {
    name: string;
    progress: number;
    emoji: string;
    nextLevel: string;
    pointsToNext: number;
  } {
    const levels = [
      { name: 'BEGINNER', min: 0, max: 1000, emoji: '🌱', next: 'LEARNER' },
      { name: 'LEARNER', min: 1001, max: 3000, emoji: '📘', next: 'ACHIEVER' },
      { name: 'ACHIEVER', min: 3001, max: 7000, emoji: '📗', next: 'EXPERT' },
      { name: 'EXPERT', min: 7001, max: 20000, emoji: '🎓', next: 'MASTER' },
      { name: 'MASTER', min: 20001, max: 50000, emoji: '👑', next: 'LEGEND' },
      { name: 'LEGEND', min: 50001, max: Infinity, emoji: '⚡', next: 'MAX' }
    ];

    for (const level of levels) {
      if (points >= level.min && points <= level.max) {
        const progress = level.max === Infinity 
          ? 100 
          : ((points - level.min) / (level.max - level.min)) * 100;
        
        const pointsToNext = level.max === Infinity 
          ? 0 
          : level.max - points;

        return {
          name: level.name,
          progress: Math.min(progress, 100),
          emoji: level.emoji,
          nextLevel: level.next,
          pointsToNext
        };
      }
    }

    return {
      name: 'BEGINNER',
      progress: 0,
      emoji: '🌱',
      nextLevel: 'LEARNER',
      pointsToNext: 1000
    };
  }

  static async getUserPoints(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return {
        totalPoints: 0,
        level: 'BEGINNER',
        levelProgress: 0,
        answerStreak: 0,
        longestAnswerStreak: 0,
        badges: [],
        levelInfo: this.calculateLevel(0)
      };
    }

    return {
      totalPoints: profile.total_points || 0,
      level: profile.level || 'BEGINNER',
      levelProgress: profile.level_progress || 0,
      answerStreak: profile.answer_streak || 0,
      longestAnswerStreak: profile.longest_answer_streak || 0,
      badges: profile.badges || [],
      levelInfo: this.calculateLevel(profile.total_points || 0)
    };
  }

  static async getLeaderboard(limit: number = 100) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, total_points, level, badges')
      .order('total_points', { ascending: false })
      .limit(limit);

    return (data || []).map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.id,
      email: entry.email || 'Anonymous',
      points: entry.total_points || 0,
      level: entry.level || 'BEGINNER',
      badges: entry.badges || []
    }));
  }

  static async getUserRank(userId: string): Promise<number> {
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, total_points')
      .order('total_points', { ascending: false });

    if (!allUsers) return 0;

    const rank = allUsers.findIndex(u => u.id === userId) + 1;
    return rank;
  }
}

export default PointsService;
