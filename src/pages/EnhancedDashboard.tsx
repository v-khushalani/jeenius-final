// src/pages/EnhancedDashboard.tsx
// ✅ COMPLETE REDESIGN: Perfect spacing, mobile responsive, dynamic colors, no scroll

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
import { useStreakData } from "@/hooks/useStreakData";
import PointsService from "@/services/pointsService";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, profile, loading: isLoading, refresh: refreshStats } = useUserStats();
  const { streak } = useStreakData();
  const [showBanner, setShowBanner] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const lastShown = localStorage.getItem("welcomeLastShown");
    const today = new Date().toDateString();
    return lastShown !== today;
  });
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [pointsLevel, setPointsLevel] = useState({ name: 'BEGINNER', pointsToNext: 0, nextLevel: 'LEARNER' });

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date().getHours());
    // Refresh stats when component mounts to get latest data
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    if (stats) setLeaderboardKey((prev) => prev + 1);
  }, [stats]);

  useEffect(() => {
    if (user?.id) {
      PointsService.getUserPoints(user.id).then((data) => {
        setPointsLevel({
          name: data.level,
          pointsToNext: data.levelInfo.pointsToNext,
          nextLevel: data.levelInfo.nextLevel
        });
      });
    }
  }, [user?.id, stats?.totalPoints]);

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
    if (streak >= 7 && stats.questionsToday < 10)
      return { message: `🔥 Don't break your ${streak}-day streak!`, color: "orange", icon: Flame };
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return { 
      bg: "bg-emerald-100/90", 
      border: "border-emerald-600",
      iconBg: "bg-emerald-600", 
      text: "text-emerald-800",
      progressBg: "bg-emerald-100",
      gradient: "from-emerald-500/30 to-green-600/30"
    };
    if (accuracy >= 80) return { 
      bg: "bg-green-50/80", 
      border: "border-green-500",
      iconBg: "bg-green-500", 
      text: "text-green-700",
      progressBg: "bg-green-100",
      gradient: "from-green-400/20 to-emerald-500/20"
    };
    if (accuracy >= 70) return {
      bg: "bg-lime-50/80",
      border: "border-lime-500",
      iconBg: "bg-lime-500",
      text: "text-lime-700",
      progressBg: "bg-lime-100",
      gradient: "from-lime-400/20 to-green-400/20"
    };
    if (accuracy >= 60) return {
      bg: "bg-yellow-50/80",
      border: "border-yellow-400",
      iconBg: "bg-yellow-500",
      text: "text-yellow-700",
      progressBg: "bg-yellow-100",
      gradient: "from-yellow-400/20 to-orange-400/20"
    };
    if (accuracy >= 50) return {
      bg: "bg-orange-50/80",
      border: "border-orange-400",
      iconBg: "bg-orange-500",
      text: "text-orange-700",
      progressBg: "bg-orange-100",
      gradient: "from-orange-400/20 to-red-400/20"
    };
    return { 
      bg: "bg-red-50/80", 
      border: "border-red-500",
      iconBg: "bg-red-500", 
      text: "text-red-700",
      progressBg: "bg-red-100",
      gradient: "from-red-400/20 to-pink-500/20"
    };
  };

  const getGoalColor = (progress: number, goal: number) => {
    const percentage = (progress / goal) * 100;
    if (percentage >= 100) return { 
      bg: "bg-emerald-100/90", 
      border: "border-emerald-600",
      iconBg: "bg-emerald-600", 
      text: "text-emerald-800",
      progressBg: "bg-emerald-100"
    };
    if (percentage >= 80) return { 
      bg: "bg-green-50/80", 
      border: "border-green-400",
      iconBg: "bg-green-500", 
      text: "text-green-700",
      progressBg: "bg-green-100"
    };
    if (percentage >= 50) return { 
      bg: "bg-yellow-50/80", 
      border: "border-yellow-400",
      iconBg: "bg-yellow-500", 
      text: "text-yellow-700",
      progressBg: "bg-yellow-100"
    };
    return { 
      bg: "bg-red-50/80", 
      border: "border-red-400",
      iconBg: "bg-red-500", 
      text: "text-red-700",
      progressBg: "bg-red-100"
    };
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return { 
      bg: "bg-purple-50/80", 
      border: "border-purple-400",
      iconBg: "bg-purple-500", 
      text: "text-purple-700",
      progressBg: "bg-purple-100"
    };
    if (streak >= 7) return { 
      bg: "bg-orange-50/80", 
      border: "border-orange-400",
      iconBg: "bg-orange-500", 
      text: "text-orange-700",
      progressBg: "bg-orange-100"
    };
    return { 
      bg: "bg-slate-50/80", 
      border: "border-slate-300",
      iconBg: "bg-slate-400", 
      text: "text-slate-700",
      progressBg: "bg-slate-100"
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
    <div className="min-h-screen h-screen overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e6eeff] rounded-full -translate-y-1/2 translate-x-1/3 opacity-40" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#e6eeff] rounded-full translate-y-1/2 -translate-x-1/3 opacity-30" />
      </div>
      <Header />

      {/* ✅ MOBILE OPTIMIZED: Container with proper header offset and banner space */}
      <div className={`fixed left-0 right-0 bottom-0 overflow-hidden transition-all duration-300 ${showBanner && notification ? 'top-[64px]' : 'top-[64px]'}`}>
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 max-w-7xl py-2 sm:py-3">
            
            {/* ✅ PERFECT SPACING: All banners and cards */}
            <div className="space-y-3">
              
              {/* Notification Banner */}
              {showBanner && notification && (
                <div className={`rounded-xl p-3 sm:p-3.5 shadow-lg transition-all duration-300 ${
                  notification.color === "green" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                  notification.color === "orange" ? "bg-gradient-to-r from-orange-500 to-red-600 text-white" :
                  "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                }`}>
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                        <notification.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold truncate">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem(`notification_seen_${user.id}_${new Date().toDateString()}`, "true");
                        setShowBanner(false);
                      }}
                      className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Welcome Banner */}
              {showWelcome && (
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors z-10"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="relative z-10">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                          <Brain className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">
                            {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                          </h2>
                          <p className="text-xs sm:text-base text-slate-200">{timeMessage.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
                            {stats?.questionsToday > 0 
                              ? `You've answered ${stats.questionsToday} questions today!` 
                              : "Let's make today count!"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm"
                          onClick={() => navigate("/study-now")} 
                          className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          {timeMessage.action}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate("/tests")} 
                          variant="outline"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 shadow-lg transition-all flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Take Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ MOBILE OPTIMIZED: 4 Dynamic Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
                
                {/* 1st Card: Day Streak */}
                <Card className={`rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${streakColors.border} ${streakColors.bg} backdrop-blur-sm`}> 
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`p-1.5 sm:p-2 ${streakColors.iconBg} rounded-lg flex-shrink-0 animate-pulse`}>
                        <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <p className="text-xs font-medium text-slate-700">Day Streak</p>
                    </div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${streakColors.text}`}>
                      {streak ?? 0}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {streak > 0 ? 'Keep going!' : 'Start your streak today!'}
                    </p>
                  </CardContent>
                </Card>

                {/* 2nd Card: Today's Accuracy */}
                <Card className={`rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${accuracyColors.border} ${accuracyColors.bg} backdrop-blur-sm`}> 
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 sm:p-2 ${accuracyColors.iconBg} rounded-lg flex-shrink-0`}>
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <p className="text-xs font-medium text-slate-700">Today's Accuracy</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <h3 className={`text-2xl sm:text-3xl font-bold ${accuracyColors.text}`}>
                        {stats?.todayAccuracy ?? 0}%
                      </h3>
                      <div className="flex items-center gap-1">
                        {stats?.accuracyChange && stats.accuracyChange > 0 ? (
                          <span className="text-xs text-green-600 font-semibold">↑ {Math.abs(stats.accuracyChange)}% week</span>
                        ) : stats?.accuracyChange && stats.accuracyChange < 0 ? (
                          <span className="text-xs text-red-600 font-semibold">↓ {Math.abs(stats.accuracyChange)}% week</span>
                        ) : (
                          <span className="text-xs text-gray-600 font-semibold">→ 0% week</span>
                        )}
                        <Badge className={`text-xs font-semibold px-2 py-0.5 ${
                          (stats?.todayAccuracy ?? 0) >= 80 ? 'bg-emerald-500 text-white' :
                          (stats?.todayAccuracy ?? 0) >= 60 ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {(stats?.todayAccuracy ?? 0) >= 80 ? 'Great!' : (stats?.todayAccuracy ?? 0) >= 60 ? 'Focus!' : 'Practice!'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Overall: {stats?.accuracy ?? 0}%
                    </p>
                  </CardContent>
                </Card>

                {/* 3rd Card: Today's Goal */}
                <Card className={`rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${goalColors.border} ${goalColors.bg} backdrop-blur-sm`}> 
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 sm:p-2 ${goalColors.iconBg} rounded-lg flex-shrink-0`}>
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <p className="text-xs font-medium text-slate-700">Today's Goal</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <h3 className={`text-2xl sm:text-3xl font-bold ${goalColors.text}`}>
                        {stats?.todayProgress ?? 0}/{stats?.todayGoal ?? 30}
                      </h3>
                      <Badge className={`text-xs font-semibold px-2 py-0.5 ${
                        (stats?.todayProgress ?? 0) >= (stats?.todayGoal ?? 30) ? 'bg-emerald-500 text-white' :
                        (stats?.todayProgress ?? 0) >= ((stats?.todayGoal ?? 30) * 0.5) ? 'bg-yellow-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {(stats?.todayProgress ?? 0) >= (stats?.todayGoal ?? 30) ? '🔥 Done!' : 
                         (stats?.todayProgress ?? 0) >= ((stats?.todayGoal ?? 30) * 0.5) ? '💪 Let\'s push!' : 
                         '🎯 Let\'s go!'}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (stats?.todayProgress ?? 0) >= (stats?.todayGoal ?? 30) ? 'bg-emerald-500' :
                          (stats?.todayProgress ?? 0) >= ((stats?.todayGoal ?? 30) * 0.5) ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, ((stats?.todayProgress ?? 0) / (stats?.todayGoal ?? 30)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600">
                      {(stats?.todayGoal ?? 30) - (stats?.todayProgress ?? 0) > 0 
                        ? `${(stats?.todayGoal ?? 30) - (stats?.todayProgress ?? 0)} questions left - Let's go! 🚀`
                        : `Goal achieved! 🎉`
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* 4th Card: JEEnius Points */}
                <Card className="rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-indigo-50/80 backdrop-blur-sm"> 
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex-shrink-0">
                        <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <p className="text-xs font-medium text-purple-900">JEEnius Points</p>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stats?.totalPoints ?? 0}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {pointsLevel.name}
                      </Badge>
                      <Sparkles className="h-3 w-3 text-pink-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* Progress Section */}
                <div className="lg:col-span-2">
                  <Card className="rounded-xl shadow-md border border-slate-200 bg-white h-full">
                    <CardHeader className="p-3 sm:p-4 border-b border-slate-100">
                      <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <span className="text-sm sm:text-base font-bold text-slate-900">Your Progress</span>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 sm:px-3">This Week</Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-4 space-y-3 max-h-[calc(100vh-420px)] sm:max-h-[calc(100vh-440px)] overflow-auto">

                      {/* Subject Stats */}
                      {stats?.subjectStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                            const accuracy = Math.round((data.correct / data.total) * 100);
                            const badge = getProgressBadge(accuracy);

                            return (
                              <div key={subject} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                  <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{subject}</h4>
                                    <Badge className={`${badge.color} text-white text-xs font-medium`}>
                                      {badge.text}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <h3 className={`text-xl sm:text-2xl font-bold ${
                                      accuracy >= 90 ? 'text-emerald-600' :
                                      accuracy >= 80 ? 'text-green-600' :
                                      accuracy >= 70 ? 'text-yellow-600' :
                                      accuracy >= 60 ? 'text-orange-500' :
                                      'text-red-500'
                                    }`}>{accuracy}%</h3>
                                    <p className="text-xs text-slate-500">{data.correct}/{data.total}</p>
                                  </div>
                                </div>
                                <Progress 
                                  className={`h-2 sm:h-2.5 rounded-full ${
                                    accuracy >= 90 ? 'bg-emerald-100' :
                                    accuracy >= 80 ? 'bg-green-100' :
                                    accuracy >= 70 ? 'bg-yellow-100' :
                                    accuracy >= 60 ? 'bg-orange-100' :
                                    'bg-red-100'
                                  }`} 
                                  value={accuracy} 
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12 text-slate-400">
                          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-40" />
                          <p className="text-xs sm:text-sm font-medium">Start practicing to see progress</p>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                </div>

                {/* Leaderboard */}
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
