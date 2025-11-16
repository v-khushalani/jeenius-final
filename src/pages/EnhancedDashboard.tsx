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
      return {
        greeting: "Good morning",
        message: "Start your day with 5 warm-up questions!",
        icon: "🌅",
        action: "Quick Warmup",
      };
    else if (currentTime >= 12 && currentTime < 17)
      return {
        greeting: "Good afternoon",
        message: "Perfect time for focused practice!",
        icon: "☀️",
        action: "Start Practice",
      };
    else if (currentTime >= 17 && currentTime < 21)
      return {
        greeting: "Good evening",
        message: "Golden study hours - make them count!",
        icon: "🌆",
        action: "Deep Focus",
      };
    else
      return {
        greeting: "Burning midnight oil",
        message: "Review your mistakes and revise key concepts.",
        icon: "🌙",
        action: "Quick Revision",
      };
  };

  const timeMessage =
    currentTime !== null
      ? getTimeBasedMessage()
      : { greeting: "Hello", message: "Loading...", icon: "👋", action: "Start" };

  const getSmartNotification = () => {
    if (!stats) return null;

    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10)
      return {
        message: "Focus needed! Review mistakes before continuing.",
        color: "orange",
        icon: AlertCircle,
      };

    if (stats.streak >= 7 && stats.questionsToday < 10)
      return {
        message: `🔥 Don't break your ${stats.streak}-day streak! Complete today's goal.`,
        color: "orange",
        icon: Flame,
      };

    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80)
      return {
        message: "🎉 Daily goal smashed with great accuracy! You're on fire!",
        color: "green",
        icon: Trophy,
      };

    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85)
      return {
        message: "⭐ Outstanding performance today! Keep dominating!",
        color: "green",
        icon: Sparkles,
      };

    if (stats.rankChange && stats.rankChange >= 3)
      return {
        message: `📈 Climbed ${stats.rankChange} ranks! You're moving up fast!`,
        color: "blue",
        icon: TrendingUp,
      };

    return null;
  };

  const notification = stats ? getSmartNotification() : null;

  useEffect(() => {
    if (!isClient || !user || !notification) return;
    const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
    const seen = localStorage.getItem(bannerKey);
    if (!seen) setShowBanner(true);
  }, [user, notification, isClient]);

  const getProgressBadge = (accuracy: number) => {
    if (accuracy >= 95)
      return {
        text: "Perfect! 💎",
        color: "bg-gradient-to-r from-purple-600 to-pink-600",
      };
    if (accuracy >= 90)
      return {
        text: "Mastered! 🌟",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      };
    if (accuracy >= 85)
      return {
        text: "Excellent! ⭐",
        color: "bg-gradient-to-r from-blue-500 to-indigo-600",
      };
    if (accuracy >= 80)
      return {
        text: "Very Good! 👍",
        color: "bg-gradient-to-r from-green-500 to-emerald-600",
      };
    if (accuracy >= 75)
      return {
        text: "Good Job! 📈",
        color: "bg-gradient-to-r from-lime-500 to-green-600",
      };
    if (accuracy >= 65)
      return {
        text: "Making Progress 💪",
        color: "bg-yellow-500",
      };
    if (accuracy >= 55)
      return {
        text: "Need Practice 📚",
        color: "bg-orange-400",
      };
    return {
      text: "Focus Needed ⚠️",
      color: "bg-orange-500",
    };
  };

  if (isLoading) return <LoadingScreen message="Preparing your genius dashboard..." />;

  // ============================================================
  // RESPONSIVE LAYOUT FIXES APPLIED BELOW
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24 pb-10">
        <div className="flex flex-col gap-6">


          {/* ====================== NOTIFICATION BANNER ====================== */}
          {showBanner && notification && (
            <div
              className={`
                rounded-xl p-3 shadow-md relative overflow-hidden
                ${notification.color === "green" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                  notification.color === "orange" ? "bg-gradient-to-r from-orange-500 to-red-600 text-white" :
                    "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"}
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <notification.icon className="h-5 w-5 shrink-0" />
                  <p className="truncate font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => {
                    const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
                    localStorage.setItem(bannerKey, "true");
                    setShowBanner(false);
                  }}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ====================== WELCOME CARD ====================== */}
          {showWelcome && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-xl relative">
              <button
                onClick={() => {
                  localStorage.setItem("welcomeLastShown", new Date().toDateString());
                  setShowWelcome(false);
                }}
                className="absolute top-3 right-3 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{timeMessage.greeting}, {displayName}! {timeMessage.icon}</h2>
                    <p className="text-sm text-slate-200">{timeMessage.message}</p>
                  </div>
                </div>

                {/* buttons always wrap properly on mobile */}
                <div className="flex-1 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => navigate("/study-now")}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                  >
                    📚 {timeMessage.action}
                  </button>
                  <button
                    onClick={() => navigate("/battle")}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm"
                  >
                    ⚔️ Battle
                  </button>
                  <button
                    onClick={() => navigate("/test")}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
                  >
                    🧪 Test
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* ====================== TOP METRICS ====================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Each card auto-height + no overflow */}
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Questions</p>
                    <h3 className="text-3xl font-extrabold">{stats?.totalQuestions ?? 0}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="text-green-600">+{stats?.questionsToday ?? 0} today</span> • {stats?.questionsWeek ?? 0}/week
                    </p>
                  </div>
                  <div className="bg-blue-600 p-3 rounded-lg text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Today's Accuracy</p>
                    <h3 className={`text-3xl font-extrabold ${stats?.todayAccuracy >= 85 ? "text-green-700" : stats?.todayAccuracy >= 70 ? "text-amber-700" : "text-red-700"}`}>
                      {stats?.todayAccuracy ?? 0}%
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className={(stats?.accuracyChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                        {(stats?.accuracyChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.accuracyChange ?? 0)}%
                      </span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-white ${stats?.todayAccuracy >= 85 ? "bg-green-600" : stats?.todayAccuracy >= 70 ? "bg-amber-500" : "bg-red-500"}`}>
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-full">
                    <p className="text-xs text-slate-500">Today's Goal</p>
                    <h3 className="text-3xl font-extrabold">{stats?.todayProgress ?? 0}<span className="text-sm">/{stats?.todayGoal ?? 30}</span></h3>

                    <Progress
                      className="h-2 mt-3"
                      value={Math.round(((stats?.todayProgress ?? 0) / (stats?.todayGoal ?? 30)) * 100)}
                    />
                  </div>
                  <div className="bg-indigo-600 p-3 rounded-lg text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Day Streak</p>
                    <h3 className="text-3xl font-extrabold text-amber-900">{stats?.streak ?? 0}</h3>
                    <p className="text-xs text-amber-600">{stats?.streak >= 7 ? "On fire!" : "Keep going!"}</p>
                  </div>
                  <div className="bg-amber-500 p-3 rounded-lg text-white">
                    <Flame className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* ====================== MAIN 2-COLUMN AREA ====================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ======= LEFT SIDE (PROGRESS SECTION) ======= */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl overflow-hidden h-full">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-600 p-2 rounded-md text-white">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Your Progress</div>
                        <p className="text-xs text-slate-500">Recent performance</p>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">

                  {/* SUBJECT CARDS */}
                  {stats?.subjectStats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                        const accuracy = data.total ? Math.round((data.correct / data.total) * 100) : 0;
                        const badge = getProgressBadge(accuracy);
                        return (
                          <div key={subject} className="bg-white border rounded-lg p-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-sm font-semibold">{subject}</h4>
                                <Badge className={`${badge.color} text-white text-xs mt-1`}>{badge.text}</Badge>
                              </div>
                              <div className="text-right">
                                <h3 className="text-xl font-bold">{accuracy}%</h3>
                              </div>
                            </div>
                            <Progress className="mt-3 h-2" value={accuracy} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      Start practicing to see progress.
                    </div>
                  )}

                  {/* JEENIUS POINTS */}
                  <div className="bg-indigo-50 p-5 rounded-xl border">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-md text-white">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">JEEnius Points</p>
                          <p className="text-xs text-slate-600">Progress overview</p>
                        </div>
                      </div>
                      <Badge className="bg-indigo-600 text-white">Level {stats?.currentLevel}</Badge>
                    </div>

                    <h3 className="text-3xl font-extrabold text-indigo-700">
                      {stats?.totalPoints ?? 0}
                    </h3>
                    <p className="text-xs text-slate-500">Total points</p>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>To next level</span>
                        <span className="font-semibold">{stats?.pointsToNext} pts</span>
                      </div>
                      <Progress
                        className="h-3"
                        value={
                          Math.min(
                            100,
                            Math.round(((stats?.totalPoints ?? 0) % (stats?.currentLevel * 100 || 100)) /
                              (stats?.currentLevel * 100 || 100) * 100)
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 mt-4 text-center text-xs">
                      <div>
                        <p className="text-slate-500">Rank</p>
                        <p className="font-bold">#{stats?.rank ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Percentile</p>
                        <p className="font-bold">Top {stats?.percentile}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Streak</p>
                        <p className="font-bold">{stats?.streak} 🔥</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* ======= RIGHT SIDE (LEADERBOARD) ======= */}
            <div className="h-full">
              <div className="h-full lg:sticky lg:top-24">
                <div className="bg-white rounded-xl border shadow p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">Leaderboard</h3>
                      <p className="text-xs text-slate-400">Top performers</p>
                    </div>
                    <span className="text-green-600 text-xs font-semibold">LIVE</span>
                  </div>

                  {/* Scrollable Leaderboard – never overlaps */}
                  <div className="flex-1 overflow-y-auto py-2">
                    <Leaderboard key={leaderboardKey} />
                  </div>

                  <Button
                    onClick={() => navigate("/tests")}
                    variant="ghost"
                    className="mt-3 w-full text-sm"
                  >
                    View contests & tests
                  </Button>
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
