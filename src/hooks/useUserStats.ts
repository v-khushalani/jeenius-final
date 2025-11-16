import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  totalQuestions: number;
  questionsToday: number;
  questionsWeek: number;
  correctAnswers: number;
  accuracy: number;
  todayAccuracy: number;
  accuracyChange: number;
  streak: number;
  rank: number | null;
  rankChange: number | null;
  percentile: number | null;
  todayGoal: number;
  todayProgress: number;
  weakestTopic: string;
  strongestTopic: string;
  avgQuestionsPerDay: number;
  topRankersAvg: number | null;
  subjectStats: Record<string, { correct: number; total: number }>;
  pointsToNext: number;
  currentLevel: number;
  totalPoints: number;
}

const calculateDailyGoal = (totalQuestions: number, avgAccuracy: number, currentStreak: number): number => {
  let baseGoal = 20;

  if (totalQuestions > 1000) baseGoal = 50;
  else if (totalQuestions > 500) baseGoal = 40;
  else if (totalQuestions > 200) baseGoal = 35;
  else if (totalQuestions > 100) baseGoal = 30;
  else if (totalQuestions > 50) baseGoal = 25;

  if (avgAccuracy >= 90) baseGoal += 5;
  else if (avgAccuracy >= 80) baseGoal += 3;

  if (currentStreak >= 30) baseGoal += 10;
  else if (currentStreak >= 14) baseGoal += 5;
  else if (currentStreak >= 7) baseGoal += 3;

  return Math.min(baseGoal, 60);
};

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }
      setProfile(profileData);

      // 2) Fetch Attempts (exclude test/battle)
      const { data: allAttempts, error: attemptsError } = await supabase
        .from("question_attempts")
        .select("*, questions(subject, chapter, topic)")
        .eq("user_id", user.id)
        .neq("mode", "test")
        .neq("mode", "battle");

      if (attemptsError) {
        console.error("Attempts fetch error:", attemptsError);
        throw attemptsError;
      }

      const attempts = allAttempts || [];

      // Date normalization
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      twoWeeksAgo.setHours(0, 0, 0, 0);

      const parseDate = (d: any) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        return date;
      };

      const attemptsWithDate = attempts
        .map((a: any) => ({ ...a, parsedDate: parseDate(a.created_at) }))
        .filter((a: any) => a.parsedDate !== null);

      // Calculate totals
      const totalQuestions = attemptsWithDate.length;
      const correctAnswers = attemptsWithDate.filter((a: any) => a.is_correct).length;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Today's stats
      const todayAttempts = attemptsWithDate.filter((a: any) => {
        const d = new Date(a.parsedDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      const todayTotal = todayAttempts.length;
      const todayCorrect = todayAttempts.filter((a: any) => a.is_correct).length;
      const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

      // Week stats
      const weekAttempts = attemptsWithDate.filter((a: any) => a.parsedDate >= weekAgo);
      const weekCorrect = weekAttempts.filter((a: any) => a.is_correct).length;
      const weekAccuracy = weekAttempts.length > 0 ? Math.round((weekCorrect / weekAttempts.length) * 100) : 0;

      // Previous week (for accuracy delta)
      const prevWeekAttempts = attemptsWithDate.filter(
        (a: any) => a.parsedDate >= twoWeeksAgo && a.parsedDate < weekAgo
      );
      const prevWeekCorrect = prevWeekAttempts.filter((a: any) => a.is_correct).length;
      const prevWeekAccuracy =
        prevWeekAttempts.length > 0 ? Math.round((prevWeekCorrect / prevWeekAttempts.length) * 100) : null;
      const accuracyChange =
        prevWeekAccuracy === null ? 0 : Math.round((weekAccuracy - prevWeekAccuracy) * 10) / 10;

      // Streak calculation (30 questions/day target)
      const DAILY_TARGET = 30;
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const questionsOnThisDay = attemptsWithDate.filter((a: any) => {
          const attemptDate = new Date(a.parsedDate);
          attemptDate.setHours(0, 0, 0, 0);
          return attemptDate.getTime() === currentDate.getTime();
        }).length;

        if (questionsOnThisDay >= DAILY_TARGET) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (i === 0 && questionsOnThisDay > 0) {
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Topic/Subject breakdown
      const topicStats: any = {};
      const subjectStats: any = {};
      attemptsWithDate.forEach((attempt: any) => {
        const topic = attempt.questions?.topic;
        const subject = attempt.questions?.subject;

        if (topic) {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total++;
          if (attempt.is_correct) topicStats[topic].correct++;
        }

        if (subject) {
          if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, total: 0 };
          }
          subjectStats[subject].total++;
          if (attempt.is_correct) subjectStats[subject].correct++;
        }
      });

      // Find weakest & strongest topics
      let weakestTopic = "Not enough data";
      let strongestTopic = "Not enough data";
      let lowestAccuracy = 100;
      let highestAccuracy = 0;
      Object.entries(topicStats).forEach(([topic, s]: [string, any]) => {
        if (s.total >= 5) {
          const acc = (s.correct / s.total) * 100;
          if (acc < lowestAccuracy) {
            lowestAccuracy = acc;
            weakestTopic = topic;
          }
          if (acc > highestAccuracy) {
            highestAccuracy = acc;
            strongestTopic = topic;
          }
        }
      });

      // Dynamic daily goal
      const dynamicGoal = calculateDailyGoal(totalQuestions, accuracy, streak);

      // Days active calculation
      const earliestAttempt = attemptsWithDate.length > 0 
        ? attemptsWithDate.reduce((prev: any, curr: any) => 
            (new Date(prev.parsedDate) < new Date(curr.parsedDate) ? prev : curr)
          ) 
        : null;
      let daysActive = 1;
      if (earliestAttempt) {
        const diff = Math.ceil(
          (new Date().setHours(0, 0, 0, 0) - new Date(earliestAttempt.parsedDate).setHours(0, 0, 0, 0)) / 
          (1000 * 60 * 60 * 24)
        );
        daysActive = Math.max(1, diff);
      }

      const avgQuestionsPerDay = Math.round(totalQuestions / daysActive);

      // Leaderboard metrics
      let rank = null;
      let percentile = null;
      let rankChange = null;
      let topRankersAvg = null;

      try {
        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, total_points")
          .order("total_points", { ascending: false });

        if (!profilesError && Array.isArray(allProfiles)) {
          const sorted = allProfiles;
          const totalUsers = sorted.length;
          const idx = sorted.findIndex((p: any) => p.id === user.id);
          rank = idx >= 0 ? idx + 1 : null;
          percentile = idx >= 0 ? Math.round(((totalUsers - idx) / totalUsers) * 10000) / 100 : null;

          const topSlice = sorted.slice(0, 10).filter((p: any) => typeof p.total_points === "number");
          if (topSlice.length > 0) {
            const sum = topSlice.reduce((acc: number, p: any) => acc + (p.total_points || 0), 0);
            topRankersAvg = Math.round(sum / topSlice.length);
          }
        }
      } catch (err) {
        console.error("Error computing leaderboard metrics:", err);
      }

      // Points and level
      const totalPoints = profileData?.total_points || 0;
      const currentLevel = Math.floor(totalPoints / 100) + 1;
      const nextLevelThreshold = currentLevel * 100;
      const pointsToNext = Math.max(0, nextLevelThreshold - totalPoints);

      setStats({
        totalQuestions,
        questionsToday: todayTotal,
        questionsWeek: weekAttempts.length,
        correctAnswers,
        accuracy,
        todayAccuracy,
        accuracyChange,
        streak,
        rank,
        rankChange,
        percentile,
        todayGoal: dynamicGoal,
        todayProgress: todayTotal,
        weakestTopic,
        strongestTopic,
        avgQuestionsPerDay,
        topRankersAvg,
        subjectStats,
        pointsToNext,
        currentLevel,
        totalPoints,
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    stats,
    profile,
    loading,
    error,
    refresh: loadUserData,
  };
};
