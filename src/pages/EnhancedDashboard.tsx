import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  BookOpen,
  Flame,
  AlertCircle,
  X,
  Sparkles,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Leaderboard from "@/components/Leaderboard";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const lastShown = localStorage.getItem("welcomeLastShown");
    const today = new Date().toDateString();
    return lastShown !== today;
  });
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date().getHours());
  }, []);

  useEffect(() => {
    if (user && isClient) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClient]);

  // Dynamic goal calculator (kept — uses real attempt counts)
  const calculateDailyGoal = (totalQuestions: number, avgAccuracy: number, currentStreak: number) => {
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

  // Load user/profile/attempts and some leaderboard-derived metrics
  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // 1) Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      if (profileError) console.error("Profile fetch error:", profileError);
      setProfile(profileData);

      // 2) Attempts (exclude test/battle as requested in original code)
      const { data: allAttempts, error: attemptsError } = await supabase
        .from("question_attempts")
        .select("*, questions(subject, chapter, topic)")
        .eq("user_id", user?.id)
        .neq("mode", "test")
        .neq("mode", "battle");

      if (attemptsError) console.error("Attempts fetch error:", attemptsError);

      const attempts = allAttempts || [];

      // Normalize dates and compute useful windows
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      twoWeeksAgo.setHours(0, 0, 0, 0);

      const parseDate = (d: any) => {
        // Attempt to robustly parse created_at
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        return date;
      };

      const attemptsWithDate = attempts
        .map((a: any) => ({ ...a, parsedDate: parseDate(a.created_at) }))
        .filter((a: any) => a.parsedDate !== null);

      // Totals and correctness
      const totalQuestions = attemptsWithDate.length;
      const correctAnswers = attemptsWithDate.filter((a: any) => a.is_correct).length;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Today and week attempts
      const todayAttempts = attemptsWithDate.filter((a: any) => {
        const d = new Date(a.parsedDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      const todayTotal = todayAttempts.length;
      const todayCorrect = todayAttempts.filter((a: any) => a.is_correct).length;
      const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

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
        prevWeekAccuracy === null ? 0 : Math.round((weekAccuracy - prevWeekAccuracy) * 10) / 10; // one decimal

      // Streak calculation (Goal-based: >= DAILY_TARGET questions/day)
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
          // If today has >0 but < target, still continue (don't break immediately)
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Topic / subject breakdown
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

      // Find weakest & strongest topics (minimum 5 attempts filter)
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

      // Dynamic daily goal based on real totals
      const dynamicGoal = calculateDailyGoal(totalQuestions, accuracy, streak);

      // Days active (from earliest attempt to today) for avgQuestionsPerDay
      const earliestAttempt = attemptsWithDate.length > 0 ? attemptsWithDate.reduce((prev: any, curr: any) => (new Date(prev.parsedDate) < new Date(curr.parsedDate) ? prev : curr)) : null;
      let daysActive = 1;
      if (earliestAttempt) {
        const diff = Math.ceil((new Date().setHours(0, 0, 0, 0) - new Date(earliestAttempt.parsedDate).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
        daysActive = Math.max(1, diff);
      }

      const avgQuestionsPerDay = Math.round(totalQuestions / daysActive);

      // Additional leaderboard metrics (realistic, derived from profiles table)
      // Compute rank, percentile, topRankersAvg — read-only selects only.
      let rank = null;
      let percentile = null;
      let rankChange = null;
      let topRankersAvg = null;

      try {
        // fetch top profiles with total_points
        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, total_points")
          .order("total_points", { ascending: false });

        if (profilesError) {
          console.error("profiles fetch error:", profilesError);
        } else if (Array.isArray(allProfiles)) {
          const sorted = allProfiles;
          const totalUsers = sorted.length;
          const idx = sorted.findIndex((p: any) => p.id === user?.id);
          rank = idx >= 0 ? idx + 1 : null;
          percentile = idx >= 0 ? Math.round(((totalUsers - idx) / totalUsers) * 10000) / 100 : null; // two decimals

          // topRankersAvg -> average total_points of top 10 or top 5
          const topSlice = sorted.slice(0, 10).filter((p: any) => typeof p.total_points === "number");
          if (topSlice.length > 0) {
            const sum = topSlice.reduce((acc: number, p: any) => acc + (p.total_points || 0), 0);
            topRankersAvg = Math.round(sum / topSlice.length);
          }

          // rankChange best-effort: if profile has previous_rank field, use it (non-invasive)
          if (profileData && typeof profileData.previous_rank === "number" && rank !== null) {
            rankChange = profileData.previous_rank - rank; // positive means improved
          } else {
            rankChange = null;
          }
        }
      } catch (err) {
        console.error("Error computing leaderboard metrics:", err);
      }

      // Points to next level (level size = 100 points)
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

      // bump leaderboard key to refresh leaderboard component (if it uses same data)
      setLeaderboardKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  const getTimeBasedMessage = () => {
    if (currentTime >= 6 && currentTime < 12) {
      return { greeting: "Good morning", message: "Start your day with 5 warm-up questions!", icon: "🌅", action: "Quick Warmup" };
    } else if (currentTime >= 12 && currentTime < 17) {
      return { greeting: "Good afternoon", message: "Perfect time for focused practice!", icon: "☀️", action: "Start Practice" };
    } else if (currentTime >= 17 && currentTime < 21) {
      return { greeting: "Good evening", message: "Golden study hours - make them count!", icon: "🌆", action: "Deep Focus" };
    } else {
      return { greeting: "Burning midnight oil", message: "Review your mistakes and revise key concepts.", icon: "🌙", action: "Quick Revision" };
    }
  };

  const timeMessage = currentTime !== null ? getTimeBasedMessage() : { greeting: "Hello", message: "Loading...", icon: "👋", action: "Start" };
  const getSmartNotification = () => {
    if (!stats) return null;
  
    // Low accuracy alert
    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10) {
      return {
        message: "Focus needed! Review mistakes before continuing.",
        color: "orange",
        icon: AlertCircle
      };
    }
  
    // Streak breaking warning
    if (stats.streak >= 7 && stats.questionsToday < 10) {
      return {
        message: `🔥 Don't break your ${stats.streak}-day streak! Complete today's goal.`,
        color: "orange",
        icon: Flame
      };
    }
  
    // Goal achievement
    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80) {
      return {
        message: "🎉 Daily goal smashed with great accuracy! You're on fire!",
        color: "green",
        icon: Trophy
      };
    }
  
    // High performer
    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85) {
      return {
        message: "⭐ Outstanding performance today! Keep dominating!",
        color: "green",
        icon: Sparkles
      };
    }
  
    // Rank improvement
    if (stats.rankChange && stats.rankChange > 0 && stats.rankChange >= 3) {
      return {
        message: `📈 Climbed ${stats.rankChange} ranks! You're moving up fast!`,
        color: "blue",
        icon: TrendingUp
      };
    }
  
    return null;
  };
    
  const notification = stats ? getSmartNotification() : null;

  useEffect(() => {
    if (!isClient || !user || !notification) return;
    const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
    const seen = localStorage.getItem(bannerKey);

    if (!seen) {
      setShowBanner(true);
    }
  }, [user, notification, isClient]);

  // Enhanced "Your Progress" visuals helper
  const getProgressBadge = (accuracy: number) => {
    if (accuracy >= 95) {
      return {
        text: "Perfect! 💎",
        color: "bg-gradient-to-r from-purple-600 to-pink-600",
        message: "Absolute mastery!",
      };
    } else if (accuracy >= 90) {
      return {
        text: "Mastered! 🌟",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        message: "Outstanding work!",
      };
    } else if (accuracy >= 85) {
      return {
        text: "Excellent! ⭐",
        color: "bg-gradient-to-r from-blue-500 to-indigo-600",
        message: "Keep it up!",
      };
    } else if (accuracy >= 80) {
      return {
        text: "Very Good! 👍",
        color: "bg-gradient-to-r from-green-500 to-emerald-600",
        message: "Almost there!",
      };
    } else if (accuracy >= 75) {
      return {
        text: "Good Job! 📈",
        color: "bg-gradient-to-r from-lime-500 to-green-600",
        message: "Keep practicing!",
      };
    } else if (accuracy >= 65) {
      return {
        text: "Making Progress 💪",
        color: "bg-yellow-500",
        message: "You're improving!",
      };
    } else if (accuracy >= 55) {
      return {
        text: "Need Practice 📚",
        color: "bg-orange-400",
        message: "Review basics",
      };
    } else {
      return {
        text: "Focus Needed ⚠️",
        color: "bg-orange-500",
        icon: AlertCircle,
        message: "Start with easy",
      };
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Preparing your genius dashboard..." />;
  }

  // Desktop non-scrollable: md+ hide vertical scroll; mobile keep scroll for usability.
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Main container: mobile-first single column; desktop uses grid with fixed area to avoid scroll */}
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ${
          showBanner || showWelcome ? "pt-20 sm:pt-24" : "pt-16 sm:pt-18"
        } h-full`}
      >
        {/* Allow inner content to scroll on small screens, but prevent outer page scroll on desktop */}
        <div className="h-full w-full sm:overflow-auto md:overflow-hidden">
          {showBanner && notification && (
            <div
              className={`mb-3 sm:mb-4 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden ${
                notification.color === "green"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : notification.color === "orange"
                  ? "bg-gradient-to-r from-orange-500 to-red-600"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
            >
              <div className="absolute inset-0 bg-white/8"></div>
              <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* render icon component */}
                  {notification.icon && <notification.icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />}
                  <p className="text-sm sm:text-base font-medium leading-tight truncate">{notification.message}</p>
                </div>
                <button
                  onClick={() => {
                    const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
                    localStorage.setItem(bannerKey, "true");
                    setShowBanner(false);
                  }}
                  className="text-white/80 hover:text-white transition-colors shrink-0 p-1"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          )}

          {showWelcome && (
            <div className="mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-blue-800/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/6 to-purple-600/6"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/60 hover:text-white transition-colors z-20 p-1"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate">
                          {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base leading-tight">{timeMessage.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 px-2 py-0.5">
                          <Trophy className="h-4 w-4 mr-1" />
                          #{stats?.rank || "-"}
                        </Badge>
                        <span className="text-blue-300 text-sm">Top {stats?.percentile ?? "-"}%</span>
                        {typeof stats?.rankChange === "number" && stats.rankChange > 0 && (
                          <span className="text-green-400 text-sm">↑ {stats.rankChange}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate("/study-now")}
                        className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95"
                      >
                        📚 {timeMessage.action}
                      </button>
                      <button
                        onClick={() => navigate("/battle")}
                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95"
                      >
                        ⚔️ Battle
                      </button>
                      <button
                        onClick={() => navigate("/test")}
                        className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95"
                      >
                        🧪 Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top metrics grid - mobile-first (2 columns on small screens, 4 on lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-700 mb-0.5">Questions</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">{stats?.totalQuestions || 0}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-green-600 font-semibold">+{stats?.questionsToday || 0} today</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">{stats?.questionsWeek || 0}/week</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg shadow-lg shrink-0">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${stats ? (stats.todayAccuracy >= 85 ? "from-green-50 to-emerald-50 border-green-200/30" : stats.todayAccuracy >= 70 ? "from-yellow-50 to-amber-50 border-yellow-200/30" : "from-red-50 to-orange-50 border-red-200/30") : "from-slate-50 to-slate-100" } shadow-xl`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 mb-0.5">Today's Accuracy</p>
                    <p className={`text-2xl sm:text-3xl font-extrabold ${stats?.todayAccuracy >= 85 ? "text-green-700" : stats?.todayAccuracy >= 70 ? "text-yellow-700" : "text-red-700"}`}>
                      {stats?.todayAccuracy ?? 0}%
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`${(stats?.accuracyChange || 0) >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                        {(stats?.accuracyChange || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.accuracyChange || 0)}% (week)
                      </span>
                      {stats?.todayAccuracy < 70 && <Badge className="text-xs bg-orange-500 text-white px-2 py-0">Focus!</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Overall: <span className="font-semibold text-slate-700">{stats?.accuracy ?? 0}%</span></p>
                  </div>
                  <div className={`p-2.5 rounded-lg shadow-lg shrink-0 ${stats ? (stats.todayAccuracy >= 85 ? "bg-gradient-to-br from-green-500 to-emerald-600" : stats.todayAccuracy >= 70 ? "bg-gradient-to-br from-yellow-500 to-amber-600" : "bg-gradient-to-br from-red-500 to-orange-600") : "bg-slate-200"}`}>
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's goal / progress card */}
            <Card className="relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-medium text-slate-700 mb-0.5">Today's Goal</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.todayProgress || 0}</p>
                      <span className="text-base sm:text-lg font-semibold text-slate-700 opacity-70">/{stats?.todayGoal || 30}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1">
                        <Progress value={Math.min(100, Math.round(((stats?.todayProgress || 0) / Math.max(1, stats?.todayGoal || 30)) * 100))} className="h-2" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-12 text-right">{Math.round(((stats?.todayProgress || 0) / Math.max(1, stats?.todayGoal || 30)) * 100)}%</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-0">{stats?.todayProgress >= stats?.todayGoal ? "On Track" : "Keep Going"}</Badge>
                      <p className="text-xs text-slate-600 line-clamp-2">{stats?.todayProgress >= stats?.todayGoal ? "Great job — maintain momentum!" : `${Math.max(0, (stats?.todayGoal || 30) - (stats?.todayProgress || 0))} more to hit today's target`}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-700 mb-0.5">Day Streak</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats?.streak || 0}</p>
                    <span className="text-xs text-amber-600 font-semibold">🔥 {stats?.streak >= 7 ? "On fire!" : "Keep going!"}</span>
                    {stats?.streak >= 30 && <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-0">🏆 Legend!</Badge>}
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-lg shadow-lg shrink-0">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MAIN content area: on desktop show 2-column layout; on mobile stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)] lg:h-[calc(100vh-220px)]">
            <div className="lg:col-span-2 h-full">
              {/* Enhanced "Your Progress" card — visually stronger, clearer, and mobile-friendly */}
              <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl h-full overflow-auto">
                <CardHeader className="border-b border-slate-100 p-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Your Progress</div>
                        <div className="text-xs text-slate-400">Overview — recent activity & strengths</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">This Week</Badge>
                      <div className="text-xs text-slate-500">Avg/day: <span className="font-semibold text-slate-700">{stats?.avgQuestionsPerDay ?? "-"}</span></div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-3 space-y-3">
                  {stats?.subjectStats && Object.keys(stats.subjectStats).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(stats.subjectStats).map(([subject, data]: [string, any]) => {
                        const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                        const badge = getProgressBadge(accuracy);
                        return (
                          <div key={subject} className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-3 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">{subject}</span>
                                  <Badge className={`${badge.color} text-white text-xs px-2 py-0`}>{badge.text}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{data.correct}/{data.total} correct</p>
                              </div>
                              <div className="text-right ml-3">
                                <div className={`text-lg font-bold ${accuracy >= 85 ? "text-green-700" : accuracy >= 70 ? "text-yellow-700" : "text-red-700"}`}>{accuracy}%</div>
                                <div className="text-xs text-slate-500">Accuracy</div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <Progress value={accuracy} className="flex-1 h-2" />
                              <div className="text-xs text-slate-500 w-12 text-right">{accuracy}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-60" />
                      <p className="text-sm">Practice to populate progress. Start with a short session — 10 questions.</p>
                    </div>
                  )}


                  {/* Compact points-to-level display */}
                  <div className="bg-gradient-to-r from-indigo-50 to-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Progress to next level</div>
                      <div className="text-lg font-bold text-slate-800">{stats?.totalPoints ?? 0} points</div>
                      <div className="text-xs text-slate-500 mt-0.5">Level {stats?.currentLevel} • {stats?.pointsToNext} points to Level {stats ? stats.currentLevel + 1 : "-"}</div>
                      <div className="mt-2">
                        <Progress value={Math.min(100, Math.round((( (stats?.totalPoints ?? 0) % (stats?.currentLevel * 100 || 100)) / (stats?.currentLevel * 100 || 100)) * 100))} className="h-2" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Top rankers avg</div>
                      <div className="text-lg font-extrabold text-slate-900">{stats?.topRankersAvg ?? "-"}</div>
                      <div className="text-xs text-slate-500 mt-1">Avg top-10 points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — compact leaderboard / quick actions */}
            <div className="h-full">
              <Leaderboard key={leaderboardKey} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
