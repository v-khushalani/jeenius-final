// src/pages/EnhancedDashboard.tsx
// ✅ PERFECT VERSION - No scroll, interactive, minimal

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
      return { greeting: "Good morning", message: "Start your day strong!", icon: "🌅", action: "Quick Warmup" };
    if (currentTime >= 12 && currentTime < 17)
      return { greeting: "Good afternoon", message: "Perfect time for focused practice!", icon: "☀️", action: "Start Practice" };
    if (currentTime >= 17 && currentTime < 21)
      return { greeting: "Good evening", message: "Golden study hours!", icon: "🌆", action: "Deep Focus" };
    return { greeting: "Burning midnight oil", message: "Review & revise concepts.", icon: "🌙", action: "Quick Revision" };
  };

  const timeMessage =
    currentTime !== null
      ? getTimeBasedMessage()
      : { greeting: "Hello", message: "Loading...", icon: "👋", action: "Start" };

  const getSmartNotification = () => {
    if (!stats) return null;

    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10)
      return { message: "Focus needed! Review mistakes before continuing.", color: "orange", icon: AlertCircle };

    if (stats.streak >= 7 && stats.questionsToday < 10)
      return { message: `🔥 Don't break your ${stats.streak}-day streak!`, color: "orange", icon: Flame };

    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80)
      return { message: "🎉 Daily goal smashed! You're on fire!", color: "green", icon: Trophy };

    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85)
      return { message: "⭐ Outstanding performance today!", color: "green", icon: Sparkles };

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

  // ✅ INTERACTIVE: Get color based on accuracy (Red → Yellow → Green)
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return { bg: "from-green-500 to-emerald-600", text: "text-green-700", ring: "ring-green-200" };
    if (accuracy >= 65) return { bg: "from-yellow-500 to-amber-600", text: "text-yellow-700", ring: "ring-yellow-200" };
    return { bg: "from-red-500 to-orange-600", text: "text-red-700", ring: "ring-red-200" };
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

  const todayAccuracyColors = getAccuracyColor(stats?.todayAccuracy ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Header />

      {/* ✅ FIXED: Perfect spacing + No scroll + Fixed height */}
      <div className="pt-[88px] sm:pt-[96px] lg:pt-[104px] h-screen">
        <div className="h-[calc(100vh-88px)] sm:h-[calc(100vh-96px)] lg:h-[calc(100vh-104px)] overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
            <div className="flex flex-col gap-4">
              
              {/* --- SMART BANNER --- */}
              {showBanner && notification && (
                <div
                  className={`rounded-xl p-3 shadow-md ${
                    notification.color === "green"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : notification.color === "orange"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <notification.icon className="h-5 w-5 shrink-0" />
                      <p className="truncate font-medium text-sm">{notification.message}</p>
                    </div>

                    <button
                      onClick={() => {
                        const bannerKey = `notification_seen_${user.id}_${new Date().toDateString()}`;
                        localStorage.setItem(bannerKey, "true");
                        setShowBanner(false);
                      }}
                      className="p-1 hover:bg-white/20 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* --- WELCOME CARD --- */}
              {showWelcome && (
                <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-lg relative">
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-3 right-3 text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Brain className="text-white h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">
                          {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                        </h2>
                        <p className="text-slate-300 text-sm">{timeMessage.message}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate("/study-now")} className="bg-blue-600 hover:bg-blue-700">
                        📚 {timeMessage.action}
                      </Button>
                      <Button size="sm" onClick={() => navigate("/tests")} className="bg-indigo-600 hover:bg-indigo-700">
                        🧪 Test
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TOP METRICS (Compact) --- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Questions Card */}
                <Card className="rounded-xl shadow-sm border border-slate-200"> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-500">Questions</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.totalQuestions ?? 0}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="text-green-600 font-semibold">+{stats?.questionsToday}</span> today
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        <Brain className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ INTERACTIVE: Accuracy Card (Red → Yellow → Green) */}
                <Card className={`rounded-xl shadow-sm border-2 ${todayAccuracyColors.ring}`}> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-500">Today's Accuracy</p>
                        <h3 className={`text-2xl font-bold mt-1 ${todayAccuracyColors.text}`}>
                          {stats?.todayAccuracy ?? 0}%
                        </h3>
                      </div>

                      <div className={`p-2 rounded-lg bg-gradient-to-br ${todayAccuracyColors.bg} text-white`}>
                        <Target className="h-4 w-4" />
                      </div>
                    </div>
                    <Progress 
                      className="h-1.5 mt-2 rounded-full"
                      value={stats?.todayAccuracy ?? 0}
                    />
                  </CardContent>
                </Card>

                {/* Goal Progress */}
                <Card className="rounded-xl shadow-sm border border-slate-200"> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">Daily Goal</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {stats?.todayProgress}/{stats?.todayGoal ?? 30}
                        </h3>
                        <Progress 
                          className="h-1.5 mt-2 rounded-full"
                          value={(stats?.todayProgress / (stats?.todayGoal ?? 30)) * 100}
                        />
                      </div>

                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak */}
                <Card className="rounded-xl shadow-sm border border-slate-200"> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-500">Streak</p>
                        <h3 className="text-2xl font-bold text-amber-700 mt-1">{stats?.streak}</h3>
                        <p className="text-xs text-amber-600 mt-1">days</p>
                      </div>

                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        <Flame className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* --- MAIN AREA (Compact) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* LEFT: Progress */}
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

                    <CardContent className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-auto">

                      {/* ✅ INTERACTIVE: Subject Grid (Red → Green) */}
                      {stats?.subjectStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                            const accuracy = Math.round((data.correct / data.total) * 100);
                            const badge = getProgressBadge(accuracy);
                            const colors = getAccuracyColor(accuracy);

                            return (
                              <div key={subject} className={`bg-white border-2 rounded-xl p-3 shadow-sm transition-all hover:shadow-md ${colors.ring}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-sm font-semibold">{subject}</h4>
                                    <Badge className={`${badge.color} text-white text-xs mt-1`}>
                                      {badge.text}
                                    </Badge>
                                  </div>

                                  <div className="text-right">
                                    <h3 className={`text-xl font-bold ${colors.text}`}>{accuracy}%</h3>
                                    <p className="text-xs text-slate-400">{data.correct}/{data.total}</p>
                                  </div>
                                </div>

                                <Progress className="h-2 rounded-full" value={accuracy} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Start practicing to see progress</p>
                        </div>
                      )}

                      {/* ✅ COMPACT: Points Card */}
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

                        <div className="grid grid-cols-3 mt-3 text-center gap-2">
                          <div>
                            <p className="text-xs text-slate-500">Rank</p>
                            <p className="font-bold text-sm">#{stats?.rank}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Percentile</p>
                            <p className="font-bold text-sm">Top {stats?.percentile}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Streak</p>
                            <p className="font-bold text-sm">{stats?.streak} 🔥</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT: Leaderboard */}
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
