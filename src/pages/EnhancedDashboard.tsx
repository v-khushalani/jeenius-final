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
      return { greeting: "Good morning", message: "Start your day with 5 warm-up questions!", icon: "🌅", action: "Quick Warmup" };
    if (currentTime >= 12 && currentTime < 17)
      return { greeting: "Good afternoon", message: "Perfect time for focused practice!", icon: "☀️", action: "Start Practice" };
    if (currentTime >= 17 && currentTime < 21)
      return { greeting: "Good evening", message: "Golden study hours - make them count!", icon: "🌆", action: "Deep Focus" };
    return { greeting: "Burning midnight oil", message: "Review your mistakes and revise key concepts.", icon: "🌙", action: "Quick Revision" };
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
      return { message: `🔥 Don't break your ${stats.streak}-day streak! Complete today's goal.`, color: "orange", icon: Flame };

    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80)
      return { message: "🎉 Daily goal smashed with great accuracy! You're on fire!", color: "green", icon: Trophy };

    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85)
      return { message: "⭐ Outstanding performance today! Keep dominating!", color: "green", icon: Sparkles };

    if (stats.rankChange && stats.rankChange >= 3)
      return { message: `📈 Climbed ${stats.rankChange} ranks! You're moving up fast!`, color: "blue", icon: TrendingUp };

    return null;
  };

  const notification = stats ? getSmartNotification() : null;

  useEffect(() => {
    if (!isClient || !user || !notification) return;

    const bannerKey = `notification_seen_${user.id}_${new Date().toDateString()}`;
    const seen = localStorage.getItem(bannerKey);

    if (!seen) setShowBanner(true);
  }, [user, notification, isClient]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* ⭐ LOVABLE FIXED SPACING BELOW HEADER ⭐ */}
      <div
        className="
          container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl
          pt-[88px] sm:pt-[96px] lg:pt-[104px]
          pb-10
        "
      >
        <div className="flex flex-col gap-6">
          
          {/* --- SMART BANNER --- */}
          {showBanner && notification && (
            <div
              role="status"
              className={`
                rounded-xl p-3 shadow-[0_4px_14px_rgba(0,0,0,0.08)]
                ${notification.color === "green"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : notification.color === "orange"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"}
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <notification.icon className="h-5 w-5 shrink-0" />
                  <p className="truncate font-medium">{notification.message}</p>
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

          {/* --- WELCOME CARD (Lovable style) --- */}
          {showWelcome && (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] relative">
              <button
                onClick={() => {
                  localStorage.setItem("welcomeLastShown", new Date().toDateString());
                  setShowWelcome(false);
                }}
                className="absolute top-3 right-3 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="text-white h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                    </h2>
                    <p className="text-slate-300">{timeMessage.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <Button onClick={() => navigate("/study-now")} className="bg-blue-600 hover:bg-blue-700 text-white">
                    📚 {timeMessage.action}
                  </Button>
                  <Button onClick={() => navigate("/battle")} className="bg-purple-600 hover:bg-purple-700 text-white">
                    ⚔️ Battle
                  </Button>
                  <Button onClick={() => navigate("/test")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    🧪 Test
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* --- TOP METRICS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Each card cleaned for Lovable look */}
            <Card className="rounded-xl shadow-sm border border-slate-200"> 
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Questions</p>
                    <h3 className="text-3xl font-bold">{stats?.totalQuestions ?? 0}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="text-green-600 font-semibold">+{stats?.questionsToday}</span> today • {stats?.questionsWeek}/week
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200"> 
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Today's Accuracy</p>
                    <h3 className="text-3xl font-bold">{stats?.todayAccuracy ?? 0}%</h3>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200"> 
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Today's Goal</p>
                    <h3 className="text-3xl font-bold">
                      {stats?.todayProgress}/{stats?.todayGoal ?? 30}
                    </h3>

                    <Progress 
                      className="h-2 mt-3 rounded-full"
                      value={(stats?.todayProgress / (stats?.todayGoal ?? 30)) * 100}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200"> 
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Day Streak</p>
                    <h3 className="text-3xl font-bold text-amber-700">{stats?.streak}</h3>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <Flame className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- MAIN AREA --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SECTION */}
            <div className="lg:col-span-2">
              <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 text-white rounded-md">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Your Progress</span>
                        <p className="text-xs text-slate-500">Recent activity & strengths</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700">This Week</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-auto">

                  {/* SUBJECT GRID */}
                  {stats?.subjectStats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                        const accuracy = Math.round((data.correct / data.total) * 100);
                        const badge = getProgressBadge(accuracy);

                        return (
                          <div key={subject} className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-semibold">{subject}</h4>
                                <Badge className={`${badge.color} text-white text-xs mt-1`}>
                                  {badge.text}
                                </Badge>
                                <p className="text-xs text-slate-500 mt-1">
                                  {data.correct}/{data.total} correct
                                </p>
                              </div>

                              <div className="text-right">
                                <h3 className="text-xl font-bold">{accuracy}%</h3>
                                <p className="text-xs text-slate-400">Accuracy</p>
                              </div>
                            </div>

                            <Progress className="h-2 mt-3 rounded-full" value={accuracy} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      Start practicing to see progress
                    </div>
                  )}

                  {/* POINTS CARD */}
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-5 border shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-md">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">JEEnius Points</p>
                          <p className="text-xs text-slate-500">Your achievement progress</p>
                        </div>
                      </div>

                      <Badge className="bg-indigo-600 text-white">
                        Level {stats?.currentLevel}
                      </Badge>
                    </div>

                    <h3 className="text-3xl font-bold text-indigo-700">
                      {stats?.totalPoints}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Total points</p>

                    <Progress
                      className="h-3 mt-3 rounded-full"
                      value={
                        ((stats?.totalPoints % (stats?.currentLevel * 100)) /
                          (stats?.currentLevel * 100)) *
                        100
                      }
                    />

                    <div className="grid grid-cols-3 mt-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500">Rank</p>
                        <p className="font-bold">#{stats?.rank}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Percentile</p>
                        <p className="font-bold">Top {stats?.percentile}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Streak</p>
                        <p className="font-bold">{stats?.streak} 🔥</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SECTION */}
            <div className="h-full">
              <div className="lg:sticky lg:top-[120px]">
                <div className="rounded-xl bg-white border p-4 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-semibold">Leaderboard</p>
                      <p className="text-xs text-slate-500">Compete with top performers</p>
                    </div>
                    <span className="text-green-600 text-xs font-semibold">LIVE</span>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <Leaderboard key={leaderboardKey} />
                  </div>

                  <Button
                    onClick={() => navigate("/tests")}
                    variant="ghost"
                    className="w-full mt-4"
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
