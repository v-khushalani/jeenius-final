// src/pages/EnhancedDashboard.tsx
// ✅ FINAL: Interactive colors + No scroll + Symmetric

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
    if (stats) setLeaderboardKey((prev) => prev + 1);
  }, [stats]);

  const displayName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  const getTimeBasedMessage = () => {
    if (currentTime >= 6 && currentTime < 12)
      return { greeting: "Good morning", message: "Start strong!", icon: "🌅", action: "Quick Warmup" };
    if (currentTime >= 12 && currentTime < 17)
      return { greeting: "Good afternoon", message: "Perfect time for focused practice!", icon: "☀️", action: "Start Practice" };
    if (currentTime >= 17 && currentTime < 21)
      return { greeting: "Good evening", message: "Golden study hours!", icon: "🌆", action: "Deep Focus" };
    return { greeting: "Burning midnight oil", message: "Review & revise.", icon: "🌙", action: "Quick Revision" };
  };

  const timeMessage = currentTime !== null ? getTimeBasedMessage() : { greeting: "Hello", message: "Loading...", icon: "👋", action: "Start" };

  const getSmartNotification = () => {
    if (!stats) return null;
    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10)
      return { message: "Focus needed! Review mistakes.", color: "orange", icon: AlertCircle };
    if (stats.streak >= 7 && stats.questionsToday < 10)
      return { message: `🔥 Don't break your ${stats.streak}-day streak!`, color: "orange", icon: Flame };
    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80)
      return { message: "🎉 Daily goal smashed!", color: "green", icon: Trophy };
    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85)
      return { message: "⭐ Outstanding performance!", color: "green", icon: Sparkles };
    if (stats.rankChange && stats.rankChange >= 3)
      return { message: `📈 Climbed ${stats.rankChange} ranks!`, color: "blue", icon: TrendingUp };
    return null;
  };

  const notification = stats ? getSmartNotification() : null;

  useEffect(() => {
    if (!isClient || !user || !notification) return;
    const bannerKey = `notification_seen_${user.id}_${new Date().toDateString()}`;
    const seen = localStorage.getItem(bannerKey);
    if (!seen) setShowBanner(true);
  }, [user, notification, isClient]);

  // ✅ INTERACTIVE: Color system (Red → Yellow → Green)
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return { bg: "from-green-500 to-emerald-600", text: "text-green-50", border: "border-green-400" };
    if (accuracy >= 65) return { bg: "from-yellow-500 to-amber-600", text: "text-yellow-50", border: "border-yellow-400" };
    return { bg: "from-red-500 to-orange-600", text: "text-red-50", border: "border-red-400" };
  };

  const getGoalColor = (progress: number, goal: number) => {
    const percentage = (progress / goal) * 100;
    if (percentage >= 80) return { bg: "from-green-500 to-emerald-600", text: "text-green-50", border: "border-green-400" };
    if (percentage >= 50) return { bg: "from-yellow-500 to-amber-600", text: "text-yellow-50", border: "border-yellow-400" };
    return { bg: "from-red-500 to-orange-600", text: "text-red-50", border: "border-red-400" };
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return { bg: "from-purple-500 to-pink-600", text: "text-purple-50", border: "border-purple-400" };
    if (streak >= 7) return { bg: "from-amber-500 to-orange-600", text: "text-amber-50", border: "border-amber-400" };
    return { bg: "from-slate-400 to-slate-500", text: "text-slate-50", border: "border-slate-400" };
  };

  const getProgressBadge = (accuracy: number) => {
    if (accuracy >= 95) return { text: "Perfect! 💎", color: "bg-gradient-to-r from-purple-600 to-pink-600" };
    if (accuracy >= 90) return { text: "Mastered! 🌟", color: "bg-gradient-to-r from-purple-500 to-pink-500" };
    if (accuracy >= 85) return { text: "Excellent! ⭐", color: "bg-gradient-to-r from-blue-500 to-indigo-600" };
    if (accuracy >= 80) return { text: "Very Good! 👍", color: "bg-gradient-to-r from-green-500 to-emerald-600" };
    if (accuracy >= 75) return { text: "Good Job! 📈", color: "bg-gradient-to-r from-lime-500 to-green-600" };
    if (accuracy >= 65) return { text: "Making Progress 💪", color: "bg-yellow-500" };
    if (accuracy >= 55) return { text: "Need Practice 📚", color: "bg-orange-400" };
    return { text: "Focus Needed ⚠️", color: "bg-orange-500" };
  };

  if (isLoading) return <LoadingScreen message="Preparing your genius dashboard..." />;

  const accuracyColors = getAccuracyColor(stats?.todayAccuracy ?? 0);
  const goalColors = getGoalColor(stats?.todayProgress ?? 0, stats?.todayGoal ?? 30);
  const streakColors = getStreakColor(stats?.streak ?? 0);

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* ✅ FIXED: No scroll container with exact height */}
      <div className="pt-[88px] sm:pt-[96px] lg:pt-[104px] h-screen">
        <div className="h-[calc(100vh-88px)] sm:h-[calc(100vh-96px)] lg:h-[calc(100vh-104px)] overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3">
            <div className="flex flex-col gap-3">
              
              {/* Banner */}
              {showBanner && notification && (
                <div className={`rounded-xl p-2.5 shadow-md ${
                  notification.color === "green" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                  notification.color === "orange" ? "bg-gradient-to-r from-orange-500 to-red-600 text-white" :
                  "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <notification.icon className="h-4 w-4 shrink-0" />
                      <p className="truncate font-medium text-sm">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem(`notification_seen_${user.id}_${new Date().toDateString()}`, "true");
                        setShowBanner(false);
                      }}
                      className="p-1 hover:bg-white/20 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Welcome */}
              {showWelcome && (
                <div className="rounded-xl p-3 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-lg relative">
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-2 right-2 text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold">
                          {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                        </h2>
                        <p className="text-xs text-slate-300">{timeMessage.message}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate("/study-now")} className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-3">
                        📚 {timeMessage.action}
                      </Button>
                      <Button size="sm" onClick={() => navigate("/tests")} className="bg-indigo-600 hover:bg-indigo-700 text-xs h-8 px-3">
                        🧪 Test
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ INTERACTIVE: Top 4 Cards (Red → Green) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Questions Card */}
                <Card className="rounded-xl shadow-sm border-2 border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600"> 
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-blue-100">Questions</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalQuestions ?? 0}</h3>
                        <p className="text-xs text-blue-100 mt-1">
                          <span className="font-semibold">+{stats?.questionsToday}</span> today
                        </p>
                      </div>
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Accuracy Card (Dynamic Red → Green) */}
                <Card className={`rounded-xl shadow-sm border-2 ${accuracyColors.border} bg-gradient-to-br ${accuracyColors.bg}`}> 
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs ${accuracyColors.text}`}>Today's Accuracy</p>
                        <h3 className={`text-2xl font-bold ${accuracyColors.text} mt-1`}>
                          {stats?.todayAccuracy ?? 0}%
                        </h3>
                      </div>
                      <Target className={`h-5 w-5 ${accuracyColors.text}`} />
                    </div>
                    <Progress 
                      className="h-1.5 mt-2 bg-white/30"
                      value={stats?.todayAccuracy ?? 0}
                    />
                  </CardContent>
                </Card>

                {/* ✅ Goal Card (Dynamic Red → Green) */}
                <Card className={`rounded-xl shadow-sm border-2 ${goalColors.border} bg-gradient-to-br ${goalColors.bg}`}> 
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`text-xs ${goalColors.text}`}>Daily Goal</p>
                        <h3 className={`text-2xl font-bold ${goalColors.text} mt-1`}>
                          {stats?.todayProgress}/{stats?.todayGoal ?? 30}
                        </h3>
                        <Progress 
                          className="h-1.5 mt-2 bg-white/30"
                          value={(stats?.todayProgress / (stats?.todayGoal ?? 30)) * 100}
                        />
                      </div>
                      <Calendar className={`h-5 w-5 ${goalColors.text}`} />
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Streak Card (Dynamic) */}
                <Card className={`rounded-xl shadow-sm border-2 ${streakColors.border} bg-gradient-to-br ${streakColors.bg}`}> 
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs ${streakColors.text}`}>Streak</p>
                        <h3 className={`text-2xl font-bold ${streakColors.text} mt-1`}>{stats?.streak}</h3>
                        <p className={`text-xs ${streakColors.text} mt-1`}>days</p>
                      </div>
                      <Flame className={`h-5 w-5 ${streakColors.text}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* ✅ SYMMETRIC: Left Progress */}
                <div className="lg:col-span-2">
                  <Card className="rounded-xl shadow-sm border border-slate-200 h-full">
                    <CardHeader className="p-3 border-b border-slate-100">
                      <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-600 text-white rounded-md">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold">Your Progress</span>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 text-xs">This Week</Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-3 space-y-3 max-h-[calc(100vh-480px)] overflow-auto">

                      {/* ✅ SYMMETRIC: Subject Grid */}
                      {stats?.subjectStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                            const accuracy = Math.round((data.correct / data.total) * 100);
                            const badge = getProgressBadge(accuracy);
                            const colors = getAccuracyColor(accuracy);

                            return (
                              <div key={subject} className="bg-white border rounded-xl p-3 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-sm font-semibold">{subject}</h4>
                                    <Badge className={`${badge.color} text-white text-xs mt-1`}>
                                      {badge.text}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <h3 className="text-xl font-bold">{accuracy}%</h3>
                                    <p className="text-xs text-slate-400">{data.correct}/{data.total}</p>
                                  </div>
                                </div>
                                <Progress className="h-2 rounded-full" value={accuracy} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Start practicing to see progress</p>
                        </div>
                      )}

                      {/* ✅ REMOVED: Rank, Percentile, Streak from Points Card */}
                      <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-4 border shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-600 text-white rounded-md">
                              <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">JEEnius Points</p>
                              <Badge className="bg-indigo-600 text-white text-xs mt-0.5">
                                Level {stats?.currentLevel}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="text-2xl font-bold text-indigo-700">
                            {stats?.totalPoints}
                          </h3>
                        </div>

                        <Progress
                          className="h-2 rounded-full"
                          value={
                            ((stats?.totalPoints % (stats?.currentLevel * 100)) /
                              (stats?.currentLevel * 100)) *
                            100
                          }
                        />

                        <p className="text-xs text-slate-500 mt-2 text-center">
                          {stats?.pointsToNext} points to Level {stats?.currentLevel + 1}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Leaderboard */}
                <div className="h-full">
                  <Leaderboard key={leaderboardKey} />
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
