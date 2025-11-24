import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Home,
  BarChart3,
  Settings,
  User,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Leaderboard from "@/components/Leaderboard";
import { useUserStats } from "@/hooks/useUserStats";
import { useStreakData } from "@/hooks/useStreakData";
import PointsService from "@/services/pointsService";
import { cn } from "@/lib/utils";

const EnhancedDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

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
    if (accuracy >= 90) return { bg: "bg-emerald-50", text: "text-emerald-700", icon: "bg-emerald-500" };
    if (accuracy >= 80) return { bg: "bg-green-50", text: "text-green-700", icon: "bg-green-500" };
    if (accuracy >= 70) return { bg: "bg-lime-50", text: "text-lime-700", icon: "bg-lime-500" };
    if (accuracy >= 60) return { bg: "bg-yellow-50", text: "text-yellow-700", icon: "bg-yellow-500" };
    return { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-500" };
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/study-now', label: 'Study Now', icon: BookOpen },
    { path: '/tests', label: 'Tests', icon: Target },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const accuracyColors = getAccuracyColor(stats?.todayAccuracy ?? 0);

  if (isLoading) return <LoadingScreen message="Preparing your genius dashboard..." />;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Brain className="h-6 w-6 text-primary mr-3" />
          <div>
            <h2 className="font-bold text-foreground text-lg">JEEnius</h2>
            <p className="text-xs text-muted-foreground">Study Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            <Flame className="w-4 h-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-900">{streak ?? 0} Day Streak</p>
              <p className="text-xs text-orange-600">Keep it going!</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {timeMessage.greeting}, {displayName}! {timeMessage.icon}
            </h1>
            <p className="text-sm text-muted-foreground">{timeMessage.message}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              <Trophy className="w-3 h-3 mr-1" />
              {pointsLevel.name}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {stats?.totalPoints ?? 0} pts
            </Badge>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="space-y-6 max-w-7xl">
            
            {/* Smart Notification */}
            {showBanner && notification && (
              <div className={cn(
                "rounded-xl p-4 shadow-sm flex items-center justify-between",
                notification.color === "green" && "bg-green-50 border border-green-200",
                notification.color === "orange" && "bg-orange-50 border border-orange-200",
                notification.color === "blue" && "bg-blue-50 border border-blue-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    notification.color === "green" && "bg-green-100",
                    notification.color === "orange" && "bg-orange-100",
                    notification.color === "blue" && "bg-blue-100"
                  )}>
                    <notification.icon className={cn(
                      "h-5 w-5",
                      notification.color === "green" && "text-green-600",
                      notification.color === "orange" && "text-orange-600",
                      notification.color === "blue" && "text-blue-600"
                    )} />
                  </div>
                  <p className={cn(
                    "text-sm font-semibold",
                    notification.color === "green" && "text-green-900",
                    notification.color === "orange" && "text-orange-900",
                    notification.color === "blue" && "text-blue-900"
                  )}>{notification.message}</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem(`notification_seen_${user.id}_${new Date().toDateString()}`, "true");
                    setShowBanner(false);
                  }}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Welcome Card */}
            {showWelcome && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-primary to-blue-600 text-primary-foreground relative overflow-hidden">
                <CardContent className="p-6 relative z-10">
                  <button
                    onClick={() => {
                      localStorage.setItem("welcomeLastShown", new Date().toDateString());
                      setShowWelcome(false);
                    }}
                    className="absolute top-4 right-4 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <Brain className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm opacity-90 mb-1">
                        {stats?.questionsToday > 0 
                          ? `You've answered ${stats.questionsToday} questions today!` 
                          : "Let's make today count!"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate("/study-now")} 
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {timeMessage.action}
                    </Button>
                    <Button 
                      onClick={() => navigate("/tests")} 
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Take Test
                    </Button>
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Streak Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-50 rounded-xl">
                      <Flame className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Day Streak</p>
                  <p className="text-3xl font-bold text-foreground">{streak ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {streak > 0 ? 'Keep going!' : 'Start today!'}
                  </p>
                </CardContent>
              </Card>

              {/* Accuracy Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", accuracyColors.bg)}>
                      <Target className={cn("h-6 w-6", accuracyColors.text)} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Today's Accuracy</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.todayAccuracy ?? 0}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Overall: {stats?.accuracy ?? 0}%
                  </p>
                </CardContent>
              </Card>

              {/* Daily Goal Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Daily Goal</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.todayProgress ?? 0}/{stats?.todayGoal ?? 30}
                  </p>
                  <Progress 
                    value={(stats?.todayProgress / (stats?.todayGoal || 30)) * 100} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>

              {/* Total Points Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Points</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalPoints ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pointsLevel.pointsToNext} to {pointsLevel.nextLevel}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate("/study-now")}
                    className="p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group"
                  >
                    <BookOpen className="h-8 w-8 text-primary mb-3 transition-transform group-hover:scale-110" />
                    <h4 className="font-semibold text-foreground mb-1">Study Now</h4>
                    <p className="text-sm text-muted-foreground">Practice questions</p>
                  </button>

                  <button
                    onClick={() => navigate("/tests")}
                    className="p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group"
                  >
                    <Target className="h-8 w-8 text-green-600 mb-3 transition-transform group-hover:scale-110" />
                    <h4 className="font-semibold text-foreground mb-1">Take Test</h4>
                    <p className="text-sm text-muted-foreground">Challenge yourself</p>
                  </button>

                  <button
                    onClick={() => navigate("/analytics")}
                    className="p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group"
                  >
                    <BarChart3 className="h-8 w-8 text-blue-600 mb-3 transition-transform group-hover:scale-110" />
                    <h4 className="font-semibold text-foreground mb-1">View Analytics</h4>
                    <p className="text-sm text-muted-foreground">Track progress</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Your Rank: #{stats?.rank ?? 'N/A'}
                  </Badge>
                </div>
                <Leaderboard key={leaderboardKey} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;