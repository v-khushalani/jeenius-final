// src/services/pointsService.ts
import { supabase } from '@/integrations/supabase/client';

export class PointsService {
  
  /**
   * Calculate points for a question attempt
   */
  static async calculatePoints(
    userId: string,
    difficulty: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<{
    points: number;
    breakdown: Array<{ type: string; points: number; label: string }>;
  }> {
    let points = 0;
    const breakdown: Array<{ type: string; points: number; label: string }> = [];

    // A. Base Points
    if (isCorrect) {
      const basePoints = this.getBasePoints(difficulty);
      points += basePoints;
      breakdown.push({
        type: 'base',
        points: basePoints,
        label: `${difficulty.toUpperCase()} question`
      });

      // B. Answer Streak Bonus
      const streakBonus = await this.calculateStreakBonus(userId);
      if (streakBonus.points > 0) {
        points += streakBonus.points;
        breakdown.push({
          type: 'streak',
          points: streakBonus.points,
          label: `${streakBonus.streak} answer streak! 🔥`
        });

        // Award badge if milestone reached
        if (streakBonus.badgeEarned) {
          breakdown.push({
            type: 'badge',
            points: 0,
            label: `🏆 ${streakBonus.badgeName} Badge Earned!`
          });
        }
      }
    } else {
      // Wrong answer penalty
      points = -2;
      breakdown.push({
        type: 'penalty',
        points: -2,
        label: 'Wrong answer'
      });

      // Reset answer streak
      await this.resetAnswerStreak(userId);
    }

    // Update user points
    await this.updateUserPoints(userId, points);

    return { points, breakdown };
  }

  /**
   * Get base points for difficulty
   */
  private static getBasePoints(difficulty: string): number {
    const difficultyMap: Record<string, number> = {
      easy: 5,
      medium: 10,
      hard: 20
    };
    return difficultyMap[difficulty.toLowerCase()] || 5;
  }

  /**
   * Calculate answer streak bonus
   */
  private static async calculateStreakBonus(userId: string): Promise<{
    points: number;
    streak: number;
    badgeEarned: boolean;
    badgeName?: string;
  }> {
    // Get current answer streak
    const { data: pointsData } = await supabase
      .from('jeenius_points')
      .select('answer_streak, badges, longest_answer_streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (!pointsData) {
      return { points: 0, streak: 0, badgeEarned: false };
    }

    const newStreak = ((pointsData?.answer_streak as number) || 0) + 1;

    // Update answer streak
    await supabase
      .from('jeenius_points')
      .update({
        answer_streak: newStreak,
        longest_answer_streak: Math.max(newStreak, (pointsData?.longest_answer_streak as number) || 0)
      })
      .eq('user_id', userId);

    // Check for streak milestones
    const milestones = [
      { streak: 5, points: 20, badge: 'Hot Streak' },
      { streak: 10, points: 50, badge: 'On Fire' },
      { streak: 20, points: 150, badge: 'Unstoppable' },
      { streak: 50, points: 500, badge: 'BEAST MODE' }
    ];

    for (const milestone of milestones) {
      if (newStreak === milestone.streak) {
        // Award badge if not already earned
        const badges = (pointsData?.badges as string[]) || [];
        const badgeEarned = !badges.includes(milestone.badge);
        
        if (badgeEarned) {
          badges.push(milestone.badge);
          await supabase
            .from('jeenius_points')
            .update({ badges: badges as any })
            .eq('user_id', userId);
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

  /**
   * Reset answer streak on wrong answer
   */
  private static async resetAnswerStreak(userId: string) {
    await supabase
      .from('jeenius_points')
      .update({ answer_streak: 0 })
      .eq('user_id', userId);
  }

  /**
   * Update user total points
   */
  private static async updateUserPoints(userId: string, pointsToAdd: number) {
    const { data: pointsData } = await supabase
      .from('jeenius_points')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    if (!pointsData) {
      // Create points record
      await supabase.from('jeenius_points').insert({
        user_id: userId,
        total_points: Math.max(0, pointsToAdd),
        level: 'BEGINNER'
      });
      return;
    }

    const newTotal = Math.max(0, ((pointsData?.total_points as number) || 0) + pointsToAdd);

    // Calculate level
    const level = this.calculateLevel(newTotal);

    await supabase
      .from('jeenius_points')
      .update({
        total_points: newTotal,
        level: level.name,
        level_progress: level.progress
      })
      .eq('user_id', userId);
  }

  /**
   * Calculate user level based on points
   */
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

  /**
   * Get user points and stats
   */
  static async getUserPoints(userId: string) {
    const { data: pointsData } = await supabase
      .from('jeenius_points')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!pointsData) {
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
      totalPoints: (pointsData?.total_points as number) || 0,
      level: (pointsData?.level as string) || 'BEGINNER',
      levelProgress: (pointsData?.level_progress as number) || 0,
      answerStreak: (pointsData?.answer_streak as number) || 0,
      longestAnswerStreak: (pointsData?.longest_answer_streak as number) || 0,
      badges: (pointsData?.badges as string[]) || [],
      levelInfo: this.calculateLevel((pointsData?.total_points as number) || 0)
    };
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(limit: number = 100, timeframe: 'weekly' | 'monthly' | 'all-time' = 'all-time') {
    let query = supabase
      .from('jeenius_points')
      .select('*, profiles(email)')
      .order('total_points', { ascending: false })
      .limit(limit);

    // For weekly/monthly, we'd need to track points earned in that period
    // For now, showing all-time leaderboard

    const { data } = await query;

    return (data || []).map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id,
      email: entry.profiles?.email || 'Anonymous',
      points: entry.total_points,
      level: entry.level,
      badges: entry.badges || []
    }));
  }

  /**
   * Get user rank
   */
  static async getUserRank(userId: string): Promise<number> {
    const { data: allUsers } = await supabase
      .from('jeenius_points')
      .select('user_id, total_points')
      .order('total_points', { ascending: false });

    if (!allUsers) return 0;

    const rank = allUsers.findIndex(u => u.user_id === userId) + 1;
    return rank;
  }

  /**
   * Award custom points (for special events, bonuses, etc.)
   */
  static async awardCustomPoints(
    userId: string,
    points: number,
    reason: string
  ) {
    await this.updateUserPoints(userId, points);

    // Log the award
    console.log(`Awarded ${points} points to user ${userId} for: ${reason}`);
  }

  /**
   * Award badge manually
   */
  static async awardBadge(userId: string, badgeName: string) {
    const { data: pointsData } = await supabase
      .from('jeenius_points')
      .select('badges')
      .eq('user_id', userId)
      .maybeSingle();

    if (pointsData) {
      const badges = (pointsData.badges as string[]) || [];
      if (!badges.includes(badgeName)) {
        badges.push(badgeName);
        await supabase
          .from('jeenius_points')
          .update({ badges: badges as any })
          .eq('user_id', userId);
      }
    }
  }

  /**
   * Get all available badges with descriptions
   */
  static getAllBadges() {
    return [
      // Answer Streak Badges
      { name: 'Hot Streak', description: '5 correct answers in a row', emoji: '🔥', category: 'streak' },
      { name: 'On Fire', description: '10 correct answers in a row', emoji: '🔥🔥', category: 'streak' },
      { name: 'Unstoppable', description: '20 correct answers in a row', emoji: '🔥🔥🔥', category: 'streak' },
      { name: 'BEAST MODE', description: '50 correct answers in a row', emoji: '👹', category: 'streak' },
      
      // Daily Streak Badges
      { name: '7-Day Warrior', description: '7 consecutive days', emoji: '⚔️', category: 'daily' },
      { name: '15-Day Champion', description: '15 consecutive days', emoji: '🏆', category: 'daily' },
      { name: 'Monthly Master', description: '30 consecutive days', emoji: '📅', category: 'daily' },
      { name: 'Consistent Learner', description: '60 consecutive days', emoji: '💪', category: 'daily' },
      { name: 'Quarter Master', description: '90 consecutive days', emoji: '⭐', category: 'daily' },
      { name: 'Half Year Legend', description: '180 consecutive days', emoji: '💎', category: 'daily' },
      { name: 'YEARLY CHAMPION', description: '365 consecutive days', emoji: '👑', category: 'daily' },
      
      // Achievement Badges
      { name: 'Fast Learner', description: 'High accuracy from start', emoji: '⚡', category: 'achievement' },
      { name: 'Comeback King', description: 'Returned after long break', emoji: '💪', category: 'achievement' },
      { name: 'Topic Master', description: 'Mastered first topic', emoji: '🎯', category: 'achievement' }
    ];
  }
}

export default PointsService;
