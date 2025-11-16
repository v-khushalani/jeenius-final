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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Leaderboard from "@/components/Leaderboard";
import { useUserStats } from "@/hooks/useUserStats";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, profile, loading: isLoading } = useUserStats();
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
    if (stats) {
      setLeaderboardKey((prev) => prev + 1);
    }
  }, [stats]);

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
  
    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10) {
      return {
        message: "Focus needed! Review mistakes before continuing.",
        color: "orange",
        icon: AlertCircle
      };
    }
  
    if (stats.streak >= 7 && stats.questionsToday < 10) {
      return {
        message: `🔥 Don't break your ${stats.streak}-day streak! Complete today's goal.`,
        color: "orange",
        icon: Flame
      };
    }
  
    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80) {
      return {
        message: "🎉 Daily goal smashed with great accuracy! You're on fire!",
        color: "green",
        icon: Trophy
      };
    }
  
    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85) {
      return {
        message: "⭐ Outstanding performance today! Keep dominating!",
        color: "green",
        icon: Sparkles
      };
    }
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-20 pb-8">
        <div className="flex flex-col gap-4">
          {/* Banner */}
          {showBanner && notification && (
            <div
              role="status"
              className={`rounded-xl p-3 shadow-md relative overflow-hidden ${
                notification.color === "green"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : notification.color === "orange"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {notification.icon && <notification.icon className="h-5 w-5 shrink-0" />}
                  <p className="truncate font-medium">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
                      localStorage.setItem(bannerKey, "true");
                      setShowBanner(false);
                    }}
                    aria-label="Dismiss notification"
                    className="text-white/80 hover:text-white p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Welcome card */}
          {showWelcome && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl relative overflow-hidden">
              <button
                onClick={() => {
                  localStorage.setItem("welcomeLastShown", new Date().toDateString());
                  setShowWelcome(false);
                }}
                aria-label="Close welcome"
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold leading-tight truncate">
                      {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                    </h2>
                    <p className="text-sm text-slate-200">{timeMessage.message}</p>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-end gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 px-2 py-0.5">
                      <Trophy className="h-4 w-4 mr-1" />
                      #{stats?.rank || "-"}
                    </Badge>
                    <span className="text-slate-200">Top {stats?.percentile ?? "-"}%</span>
                    {typeof stats?.rankChange === "number" && stats.rankChange > 0 && (
                      <span className="text-green-300">↑ {stats.rankChange}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/study-now")}
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md text-sm font-semibold shadow"
                    >
                      📚 {timeMessage.action}
                    </button>
                    <button
                      onClick={() => navigate("/battle")}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md text-sm font-semibold shadow"
                    >
                      ⚔️ Battle
                    </button>
                    <button
                      onClick={() => navigate("/test")}
                      className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-md text-sm font-semibold shadow"
                    >
                      🧪 Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top metrics: 4 equal cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Questions */}
            <Card className="h-full shadow-lg border border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 mb-1">Questions</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalQuestions || 0}</h3>
                      <span className="text-sm text-slate-500">total</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="text-green-600 font-semibold">+{stats?.questionsToday || 0} today</span>
                      <span className="mx-2">•</span>
                      <span>{stats?.questionsWeek || 0}/week</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-lg text-white shadow">
                    <Brain className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's accuracy */}
            <Card className="h-full shadow-lg border border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 mb-1">Today's Accuracy</p>
                    <h3 className={`text-2xl sm:text-3xl font-extrabold ${stats?.todayAccuracy >= 85 ? "text-green-700" : stats?.todayAccuracy >= 70 ? "text-amber-700" : "text-red-700"}`}>
                      {stats?.todayAccuracy ?? 0}%
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className={`${(stats?.accuracyChange || 0) >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>
                        {(stats?.accuracyChange || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.accuracyChange || 0)}% (week)
                      </span>
                      {stats?.todayAccuracy < 70 && <Badge className="text-xs bg-orange-500 text-white px-2 py-0">Focus!</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Overall: <span className="font-semibold text-slate-700">{stats?.accuracy ?? 0}%</span></p>
                  </div>

                  <div className={`p-3 rounded-lg text-white shadow ${stats ? (stats.todayAccuracy >= 85 ? "bg-gradient-to-br from-green-500 to-emerald-600" : stats.todayAccuracy >= 70 ? "bg-gradient-to-br from-amber-500 to-amber-600" : "bg-gradient-to-br from-red-500 to-orange-600") : "bg-slate-200"}`}>
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's goal */}
            <Card className="h-full shadow-lg border border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 mb-1">Today's Goal</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.todayProgress || 0}</h3>
                      <span className="text-sm text-slate-500">/{stats?.todayGoal || 30}</span>
                    </div>

                    <div className="mt-3">
                      <Progress value={Math.min(100, Math.round(((stats?.todayProgress || 0) / Math.max(1, stats?.todayGoal || 30)) * 100))} className="h-2" />
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <Badge className={`px-2 py-0 text-xs ${stats?.todayProgress >= stats?.todayGoal ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                          {stats?.todayProgress >= stats?.todayGoal ? "On Track" : "Keep Going"}
                        </Badge>
                        <div>{Math.round(((stats?.todayProgress || 0) / Math.max(1, stats?.todayGoal || 30)) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streak */}
            <Card className="h-full shadow-lg border border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 mb-1">Day Streak</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats?.streak || 0}</h3>
                    <div className="text-xs text-amber-600 mt-2">{stats?.streak >= 7 ? "On fire!" : "Keep going!"}</div>
                    {stats?.streak >= 30 && <Badge className="mt-2 bg-amber-500 text-white text-xs px-2 py-0">🏆 Legend!</Badge>}
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow">
                    <Flame className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content: left: progress; right: leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: progress area (spans 2 columns on large) */}
            <div className="lg:col-span-2">
              <Card className="h-full shadow-2xl border border-slate-100 overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 text-white p-2 rounded-md">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Your Progress</div>
                        <div className="text-xs text-slate-400">Overview — recent activity & strengths</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <Badge className="bg-blue-50 text-blue-700 text-xs">This Week</Badge>
                      <div>Avg/day: <span className="font-semibold text-slate-700">{stats?.avgQuestionsPerDay ?? "-"}</span></div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-4 max-h-[60vh] sm:max-h-[55vh] lg:max-h-[60vh] overflow-auto">
                  {/* Subject cards grid */}
                  {stats?.subjectStats && Object.keys(stats.subjectStats).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(stats.subjectStats).map(([subject, data]: [string, any]) => {
                        const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                        const badge = getProgressBadge(accuracy);
                        return (
                          <div key={subject} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-slate-800 truncate">{subject}</h4>
                                  <Badge className={`${badge.color} text-white text-xs px-2 py-0`}>{badge.text}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{data.correct}/{data.total} correct</p>
                              </div>
                              <div className="text-right ml-3">
                                <div className={`text-lg font-bold ${accuracy >= 85 ? "text-green-700" : accuracy >= 70 ? "text-amber-700" : "text-red-700"}`}>{accuracy}%</div>
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
                    <div className="text-center py-12 text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-60" />
                      <p className="text-sm">Practice to populate progress. Start with a short session — 10 questions.</p>
                    </div>
                  )}

                  {/* Enhanced Points Card */}
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-5 rounded-xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">JEEnius Points</div>
                          <div className="text-xs text-slate-500">Your achievement progress</div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1">
                        Level {stats?.currentLevel}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                          {stats?.totalPoints ?? 0}
                        </div>
                        <div className="text-sm text-slate-500">total points</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Progress to Level {stats ? stats.currentLevel + 1 : "-"}</span>
                          <span className="font-semibold text-indigo-600">
                            {stats?.pointsToNext} points needed
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, Math.round((((stats?.totalPoints ?? 0) % (stats?.currentLevel * 100 || 100)) / (stats?.currentLevel * 100 || 100)) * 100))} 
                          className="h-3 bg-indigo-100"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Rank</div>
                          <div className="text-sm font-bold text-slate-800">#{stats?.rank ?? "-"}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Percentile</div>
                          <div className="text-sm font-bold text-slate-800">Top {stats?.percentile ?? "-"}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Streak</div>
                          <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                            <Flame className="h-3 w-3" />
                            {stats?.streak ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: leaderboard */}
            <div className="h-full">
              <div className="h-full sticky top-6">
                <div className="bg-white rounded-xl border border-slate-100 shadow-lg p-3 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Leaderboard</h3>
                      <div className="text-xs text-slate-400">Compete with top performers</div>
                    </div>
                    <div className="text-xs text-green-600 font-semibold">LIVE</div>
                  </div>

                  <div className="flex-1 overflow-auto py-2">
                    <Leaderboard key={leaderboardKey} />
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>You're at rank</span>
                      <span className="font-semibold text-slate-700">#{stats?.rank ?? "-"}</span>
                    </div>
                    <div className="mt-2">
                      <Button onClick={() => navigate("/tests")} variant="ghost" className="w-full">
                        View contests & tests
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
