// src/pages/EnhancedDashboard.tsx
// Minimal + Premium redesign (no backend changes)

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Trophy, Target, Calendar, TrendingUp, BookOpen, Flame, AlertCircle, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Leaderboard from "@/components/Leaderboard";
import { useUserStats } from "@/hooks/useUserStats";
import { motion, AnimatePresence } from "framer-motion";

const subtleCard = "bg-white/70 backdrop-blur-sm border border-slate-100 shadow-sm";

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, profile, loading: isLoading } = useUserStats();

  const [isClient, setIsClient] = useState(false);
  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      const lastShown = localStorage.getItem("welcomeLastShown");
      const today = new Date().toDateString();
      return lastShown !== today;
    } catch {
      return true;
    }
  });
  const [showBanner, setShowBanner] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setCurrentHour(new Date().getHours());
  }, []);

  useEffect(() => {
    if (stats) setLeaderboardKey((k) => k + 1);
  }, [stats]);

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  const timeMessage = ((): { greeting: string; message: string; emoji: string; action: string } => {
    if (currentHour === null) return { greeting: "Hello", message: "Ready when you are", emoji: "👋", action: "Start" };
    if (currentHour >= 6 && currentHour < 12) return { greeting: "Good morning", message: "Start strong.", emoji: "🌅", action: "Warmup" };
    if (currentHour >= 12 && currentHour < 17) return { greeting: "Good afternoon", message: "Focus time.", emoji: "☀️", action: "Practice" };
    if (currentHour >= 17 && currentHour < 21) return { greeting: "Good evening", message: "Golden hours.", emoji: "🌆", action: "Deep Focus" };
    return { greeting: "Late night", message: "Review & revise.", emoji: "🌙", action: "Quick Revision" };
  })();

  const getSmartNotification = () => {
    if (!stats) return null;
    if (stats.todayAccuracy < 60 && stats.questionsToday >= 10) return { message: "Focus needed — review mistakes.", tone: "warn", Icon: AlertCircle };
    if (stats.streak >= 7 && stats.questionsToday < 10) return { message: `🔥 Don't break your ${stats.streak}-day streak!`, tone: "warn", Icon: Flame };
    if (stats.todayProgress >= stats.todayGoal && stats.todayAccuracy >= 80) return { message: "Daily goal smashed!", tone: "success", Icon: Trophy };
    if (stats.questionsToday >= 50 && stats.todayAccuracy >= 85) return { message: "Outstanding performance!", tone: "success", Icon: Sparkles };
    if (stats.rankChange && stats.rankChange >= 3) return { message: `Climbed ${stats.rankChange} ranks!`, tone: "info", Icon: TrendingUp };
    return null;
  };

  const notification = stats ? getSmartNotification() : null;

  useEffect(() => {
    if (!isClient || !user || !notification) return;
    try {
      const key = `notification_seen_${user.id}_${new Date().toDateString()}`;
      const seen = localStorage.getItem(key);
      if (!seen) setShowBanner(true);
    } catch {
      // ignore localStorage errors
    }
  }, [isClient, user, notification]);

  // subtle color helpers for minimal look
  const getMutedGradient = (value: number) => {
    if (value >= 80) return "from-emerald-50 to-emerald-100 text-emerald-800";
    if (value >= 65) return "from-amber-50 to-amber-100 text-amber-800";
    return "from-rose-50 to-rose-100 text-rose-800";
  };

  const getBadge = (accuracy: number) => {
    if (accuracy >= 95) return { label: "Perfect", tone: "purple" };
    if (accuracy >= 90) return { label: "Mastered", tone: "indigo" };
    if (accuracy >= 80) return { label: "Very Good", tone: "green" };
    if (accuracy >= 65) return { label: "Progress", tone: "yellow" };
    return { label: "Needs Work", tone: "rose" };
  };

  if (isLoading) return <LoadingScreen message="Preparing your JEEnius dashboard..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <Header />

      <main className="pt-[84px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Notification Banner */}
          <AnimatePresence>
            {showBanner && notification && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl p-3 shadow-sm ${notification.tone === "success" ? "bg-emerald-50 border border-emerald-100" : notification.tone === "warn" ? "bg-amber-50 border border-amber-100" : "bg-sky-50 border border-sky-100"}`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 p-2 rounded-md bg-white/60">
                      <notification.Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-800">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => { localStorage.setItem(`notification_seen_${user.id}_${new Date().toDateString()}`, "true"); setShowBanner(false); }} className="h-8 px-3">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl p-4 flex items-center justify-between gap-4 shadow-md bg-gradient-to-r from-white to-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{timeMessage.greeting}, {displayName} <span className="text-slate-400">{timeMessage.emoji}</span></h3>
                    <p className="text-xs text-slate-500 mt-0.5">{timeMessage.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => navigate('/study-now')} className="h-9 px-3">📚 {timeMessage.action}</Button>
                  <Button size="sm" onClick={() => navigate('/tests')} variant="ghost" className="h-9 px-3">🧪 Test</Button>
                  <button aria-label="close welcome" onClick={() => { try { localStorage.setItem('welcomeLastShown', new Date().toDateString()); } catch {} setShowWelcome(false); }} className="text-slate-400 hover:text-slate-600 p-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`${subtleCard} p-3`}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">Questions</p>
                    <h4 className="text-2xl font-semibold mt-1">{stats?.totalQuestions ?? 0}</h4>
                    <p className="text-xs text-slate-400 mt-1"><span className="font-medium">+{stats?.questionsToday ?? 0}</span> today</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/60">
                    <Brain className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${subtleCard} p-3`}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">Today's Accuracy</p>
                    <h4 className="text-2xl font-semibold mt-1">{stats?.todayAccuracy ?? 0}%</h4>
                    <div className="mt-2">
                      <Progress className="h-1.5 bg-slate-100" value={stats?.todayAccuracy ?? 0} />
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-white/60">
                    <Target className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${subtleCard} p-3`}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">Daily Goal</p>
                    <h4 className="text-2xl font-semibold mt-1">{stats?.todayProgress ?? 0}/{stats?.todayGoal ?? 30}</h4>
                    <div className="mt-2">
                      <Progress className="h-1.5 bg-slate-100" value={((stats?.todayProgress ?? 0) / (stats?.todayGoal ?? 30)) * 100} />
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-white/60">
                    <Calendar className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${subtleCard} p-3`}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">Streak</p>
                    <h4 className="text-2xl font-semibold mt-1">{stats?.streak ?? 0}</h4>
                    <p className="text-xs text-slate-400 mt-1">days</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/60">
                    <Flame className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className={`${subtleCard} h-full flex flex-col`}>
                <CardHeader className="px-4 py-3 border-b border-slate-100">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-white/60"><TrendingUp className="h-4 w-4 text-slate-700" /></div>
                      <span className="text-sm font-semibold">Your Progress</span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 text-xs">This Week</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-4 overflow-auto max-h-[calc(100vh-420px)]">
                  {/* Subjects grid */}
                  {stats?.subjectStats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(stats.subjectStats).map(([subject, data]: any) => {
                        const accuracy = Math.round((data.correct / Math.max(1, data.total)) * 100);
                        const badge = getBadge(accuracy);

                        return (
                          <div key={subject} className="rounded-lg p-3 border bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-sm font-medium">{subject}</h4>
                                <Badge className="mt-1 bg-slate-100 text-slate-700 text-xs">{badge.label}</Badge>
                              </div>

                              <div className="text-right">
                                <h3 className="text-xl font-semibold">{accuracy}%</h3>
                                <p className="text-xs text-slate-400">{data.correct}/{data.total}</p>
                              </div>
                            </div>
                            <Progress className="h-2 rounded-full bg-slate-100" value={accuracy} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Start practicing to see subject progress</p>
                    </div>
                  )}

                  {/* JEEnius Points card */}
                  <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-white/60"><Trophy className="h-4 w-4 text-slate-700" /></div>
                        <div>
                          <p className="text-xs text-slate-500">JEEnius Points</p>
                          <Badge className="mt-1 bg-slate-100 text-slate-700 text-xs">Level {stats?.currentLevel ?? 0}</Badge>
                        </div>
                      </div>

                      <h3 className="text-2xl font-semibold text-slate-800">{stats?.totalPoints ?? 0}</h3>
                    </div>

                    <Progress className="h-2 rounded-full bg-slate-100" value={(((stats?.totalPoints ?? 0) % (Math.max(1, stats?.currentLevel ?? 1) * 100)) / (Math.max(1, stats?.currentLevel ?? 1) * 100)) * 100} />

                    <p className="text-xs text-slate-400 mt-2 text-center">{stats?.pointsToNext ?? 0} points to Level {((stats?.currentLevel ?? 0) + 1)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-full">
              <Leaderboard key={leaderboardKey} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;
