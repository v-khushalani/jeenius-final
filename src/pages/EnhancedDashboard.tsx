// src/pages/EnhancedDashboard.tsx
// ✅ ELEGANT: Light cards, enhanced welcome, relative banners

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

  // ✅ ELEGANT: Light cards with colored accents (Red → Yellow → Green)
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return { 
      border: "border-l-green-500", 
      iconBg: "bg-green-500", 
      text: "text-green-700",
      lightBg: "bg-green-50"
    };
    if (accuracy >= 65) return { 
      border: "border-l-yellow-500", 
      iconBg: "bg-yellow-500", 
      text: "text-yellow-700",
      lightBg: "bg-yellow-50"
    };
    return { 
      border: "border-l-red-500", 
      iconBg: "bg-red-500", 
      text: "text-red-700",
      lightBg: "bg-red-50"
    };
  };

  const getGoalColor = (progress: number, goal: number) => {
    const percentage = (progress / goal) * 100;
    if (percentage >= 80) return { 
      border: "border-l-green-500", 
      iconBg: "bg-green-500", 
      text: "text-green-700",
      lightBg: "bg-green-50"
    };
    if (percentage >= 50) return { 
      border: "border-l-yellow-500", 
      iconBg: "bg-yellow-500", 
      text: "text-yellow-700",
      lightBg: "bg-yellow-50"
    };
    return { 
      border: "border-l-red-500", 
      iconBg: "bg-red-500", 
      text: "text-red-700",
      lightBg: "bg-red-50"
    };
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return { 
      border: "border-l-purple-500", 
      iconBg: "bg-purple-500", 
      text: "text-purple-700",
      lightBg: "bg-purple-50"
    };
    if (streak >= 7) return { 
      border: "border-l-orange-500", 
      iconBg: "bg-orange-500", 
      text: "text-orange-700",
      lightBg: "bg-orange-50"
    };
    return { 
      border: "border-l-slate-400", 
      iconBg: "bg-slate-400", 
      text: "text-slate-700",
      lightBg: "bg-slate-50"
    };
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4">
            <div className="flex flex-col gap-4">
              
              {/* ✅ RELATIVE Banner */}
              {showBanner && notification && (
                <div className={`rounded-xl p-3 shadow-lg transition-all duration-300 ${
                  notification.color === "green" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                  notification.color === "orange" ? "bg-gradient-to-r from-orange-500 to-red-600 text-white" :
                  "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <notification.icon className="h-5 w-5 shrink-0" />
                      </div>
                      <p className="truncate font-semibold text-sm">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem(`notification_seen_${user.id}_${new Date().toDateString()}`, "true");
                        setShowBanner(false);
                      }}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ ENHANCED Welcome Banner */}
              {showWelcome && (
                <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                          <Brain className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold mb-1">
                            {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                          </h2>
                          <p className="text-sm sm:text-base text-slate-200">{timeMessage.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {stats?.questionsToday > 0 
                              ? `You've answered ${stats.questionsToday} questions today!` 
                              : "Let's make today count!"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button 
                          size="default" 
                          onClick={() => navigate("/study-now")} 
                          className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-none"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          {timeMessage.action}
                        </Button>
                        <Button 
                          size="default" 
                          onClick={() => navigate("/tests")} 
                          variant="outline"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 shadow-lg transition-all flex-1 sm:flex-none"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Take Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ ELEGANT: Light Cards with Colored Accents */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Questions Card - Blue Theme */}
                <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-white"> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-medium text-slate-600">Questions</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.totalQuestions ?? 0}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-blue-600">+{stats?.questionsToday}</span> today
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Accuracy Card (Dynamic Red → Green) */}
                <Card className={`rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${accuracyColors.border} ${accuracyColors.lightBg} bg-white`}> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 ${accuracyColors.iconBg} rounded-lg`}>
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-medium text-slate-600">Accuracy</p>
                        </div>
                        <h3 className={`text-3xl font-bold ${accuracyColors.text}`}>
                          {stats?.todayAccuracy ?? 0}%
                        </h3>
                        <Progress 
                          className={`h-2 mt-2 ${accuracyColors.lightBg}`}
                          value={stats?.todayAccuracy ?? 0}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Goal Card (Dynamic Red → Green) */}
                <Card className={`rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${goalColors.border} ${goalColors.lightBg} bg-white`}> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 ${goalColors.iconBg} rounded-lg`}>
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-medium text-slate-600">Daily Goal</p>
                        </div>
                        <h3 className={`text-3xl font-bold ${goalColors.text}`}>
                          {stats?.todayProgress}/{stats?.todayGoal ?? 30}
                        </h3>
                        <Progress 
                          className={`h-2 mt-2 ${goalColors.lightBg}`}
                          value={(stats?.todayProgress / (stats?.todayGoal ?? 30)) * 100}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Streak Card (Dynamic) */}
                <Card className={`rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${streakColors.border} ${streakColors.lightBg} bg-white`}> 
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 ${streakColors.iconBg} rounded-lg`}>
                            <Flame className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-medium text-slate-600">Streak</p>
                        </div>
                        <h3 className={`text-3xl font-bold ${streakColors.text}`}>{stats?.streak}</h3>
                        <p className="text-xs text-slate-500 mt-1">days strong</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ✅ ELEGANT: Left Progress */}
                <div className="lg:col-span-2">
                  <Card className="rounded-xl shadow-md border border-slate-200 h-full bg-white">
                    <CardHeader className="p-4 border-b border-slate-100">
                      <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <span className="text-base font-bold text-slate-900">Your Progress</span>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 text-xs font-semibold px-3">This Week</Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4 max-h-[calc(100vh-480px)] overflow-auto">

                      {/* ✅ ELEGANT: Subject Grid */}
                      {stats?.subjectStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                            const accuracy = Math.round((data.correct / data.total) * 100);
                            const badge = getProgressBadge(accuracy);
                            const colors = getAccuracyColor(accuracy);

                            return (
                              <div key={subject} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">{subject}</h4>
                                    <Badge className={`${badge.color} text-white text-xs font-medium`}>
                                      {badge.text}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <h3 className="text-2xl font-bold text-slate-900">{accuracy}%</h3>
                                    <p className="text-xs text-slate-500">{data.correct}/{data.total}</p>
                                  </div>
                                </div>
                                <Progress className="h-2.5 rounded-full bg-slate-100" value={accuracy} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                          <p className="text-sm font-medium">Start practicing to see progress</p>
                        </div>
                      )}

                      {/* ✅ ELEGANT: Points Card */}
                      <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 border border-indigo-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md">
                              <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">JEEnius Points</p>
                              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold mt-1">
                                Level {stats?.currentLevel}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {stats?.totalPoints}
                          </h3>
                        </div>

                        <Progress
                          className="h-3 rounded-full bg-white/50"
                          value={
                            ((stats?.totalPoints % (stats?.currentLevel * 100)) /
                              (stats?.currentLevel * 100)) *
                            100
                          }
                        />

                        <p className="text-xs text-slate-600 mt-2 text-center font-medium">
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
