import { UsageLimitModal } from '@/components/paywall/UsageLimitModal';
import { UsageLimitBanner } from '@/components/paywall/UsageLimitBanner';
import { FreemiumBadge } from '@/components/paywall/FreemiumBadge';
import PricingModal from '@/components/PricingModal';
import { Crown } from 'lucide-react';
import { FREE_LIMITS } from '@/config/subscriptionPlans';
import Leaderboard from '../components/Leaderboard';
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
  Clock,
  TrendingUp,
  BookOpen,
  Play,
  Flame,
  BarChart3,
  AlertCircle,
  X,
  Sparkles,
  Lightbulb,
  Star, 
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  // Add these new state variables
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageStats, setUsageStats] = useState({
    questionsToday: 0,
    questionsThisMonth: 0,
    testsThisMonth: 0
  });
  const [stats, setStats] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
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
  }, [user, isClient]);

  // ✅ ADD THIS NEW useEffect
  useEffect(() => {
    // Refresh dashboard whenever user navigates back
    if (user && isClient && location.pathname === '/dashboard') {
      console.log('🔄 Dashboard: Refreshing data on navigation');
      loadUserData();
    }
  }, [location.pathname, user, isClient]);

  // Refresh data when user returns to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isClient) {
        loadUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isClient]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) console.error('Profile fetch error:', error);
      setProfile(profileData);
      // Fetch usage stats for free users
      if (!profileData?.is_premium) {
        const today = new Date().toISOString().split('T')[0];
        const { data: usageData } = await supabase
          .from('usage_limits')
          .select('*')
          .eq('user_id', user?.id)
          .eq('last_reset_date', today)
          .single();
        
        setUsageStats({
          questionsToday: usageData?.questions_today || 0,
          questionsThisMonth: 0,
          testsThisMonth: 0
        });
      }
      
       // Fetch all attempts
      const { data: allAttempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*, questions(subject, chapter, topic)')
        .eq('user_id', user?.id);

      if (attemptsError) console.error('Attempts fetch error:', attemptsError);
      
      // Filter OUT test and battle mode - only show study/practice mode
      const attempts = allAttempts?.filter(a => 
        (a as any).mode !== 'test' && (a as any).mode !== 'battle'
      ) || [];
      
      setAttempts(attempts);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttempts = attempts?.filter(a => 
        new Date(a.created_at) >= today
      ) || [];
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAttempts = attempts?.filter(a => 
        new Date(a.created_at) >= weekAgo
      ) || [];

      const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
      const totalQuestions = attempts?.length || 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      const todayCorrect = todayAttempts?.filter(a => a.is_correct).length || 0;
      const todayTotal = todayAttempts?.length || 0;
      const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

      let streak = 0;
      const DAILY_TARGET = 30;
      
      const sortedAttempts = [...(attempts || [])].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 365; i++) {
        const questionsOnThisDay = sortedAttempts.filter(a => {
          const attemptDate = new Date(a.created_at);
          attemptDate.setHours(0, 0, 0, 0);
          return attemptDate.getTime() === currentDate.getTime();
        }).length;
        
        if (questionsOnThisDay >= DAILY_TARGET) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (i === 0 && questionsOnThisDay > 0) {
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      const topicStats: any = {};
      attempts?.forEach((attempt: any) => {
        const topic = attempt.questions?.topic;
        if (topic) {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total++;
          if (attempt.is_correct) topicStats[topic].correct++;
        }
      });

      let weakestTopic = "Not enough data";
      let strongestTopic = "Not enough data";
      let lowestAccuracy = 100;
      let highestAccuracy = 0;

      Object.entries(topicStats).forEach(([topic, stats]: [string, any]) => {
        if (stats.total >= 5) {
          const acc = (stats.correct / stats.total) * 100;
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

      setStats({
        totalQuestions,
        questionsToday: todayAttempts.length,
        questionsWeek: weekAttempts.length,
        correctAnswers,
        accuracy,
        todayAccuracy,
        accuracyChange: 2,
        streak,
        rank: 15,
        rankChange: -3,
        percentile: 94.5,
        todayGoal: 30,
        todayProgress: todayAttempts.length,
        weakestTopic,
        strongestTopic,
        avgQuestionsPerDay: totalQuestions > 0 ? Math.round(totalQuestions / Math.max(1, streak || 1)) : 0,
        topRankersAvg: 48,
      });
      
      // Trigger leaderboard refresh without flash
      setLeaderboardKey(prev => prev + 1);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isClient || !user) return;
    const welcomeKey = `welcome_seen_${user?.id}_${new Date().toDateString()}`;
    const seen = localStorage.getItem(welcomeKey);
    setHasSeenWelcome(!!seen);
  }, [user, isClient]);
  
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

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
    
    if (stats.accuracy < 70 && stats.weakestTopic !== "Not enough data") {
      return {
        type: "warning",
        icon: AlertCircle,
        color: "orange",
        message: `Your ${stats.weakestTopic} accuracy is ${stats.accuracy}%. Practice 10 questions to improve!`,
      };
    } else if (stats.rankChange < 0 && Math.abs(stats.rankChange) > 0) {
      return {
        type: "success",
        icon: TrendingUp,
        color: "green",
        message: `Amazing! Your rank improved by ${Math.abs(stats.rankChange)} positions this week! 🚀`,
      };
    } else if (stats.streak >= 7) {
      return {
        type: "info",
        icon: Flame,
        color: "orange",
        message: `🔥 ${stats.streak} day streak! You're on fire! Keep the momentum going!`,
      };
    } else if (stats.todayProgress === 0) {
      return {
        type: "info",
        icon: Sparkles,
        color: "blue",
        message: `Start your day strong! Complete ${stats.todayGoal} questions today to stay on track.`,
      };
    } else {
      return null;
    }
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

  const getGoalCardStyle = (progress: number, goal: number) => {
    const percentage = (progress / goal) * 100;
    
    if (percentage >= 150) {
      return {
        cardClass: "from-emerald-100 to-green-100 border-emerald-500",
        gradient: "from-emerald-700 to-green-800",
        progressClass: "bg-gradient-to-r from-emerald-700 to-green-800",
        textColor: "text-emerald-900",
        icon: "👑",
        badge: { text: "I'm a legend!", color: "bg-gradient-to-r from-emerald-700 to-green-800" },
        message: `${progress} questions! Legendary performance! 🔥`
      };
    } else if (percentage >= 120) {
      return {
        cardClass: "from-green-100 to-emerald-100 border-green-500",
        gradient: "from-green-600 to-emerald-700",
        progressClass: "bg-gradient-to-r from-green-600 to-emerald-700",
        textColor: "text-green-800",
        icon: "🏆",
        badge: { text: "I'm a champion!", color: "bg-gradient-to-r from-green-600 to-emerald-700" },
        message: `Outstanding! ${progress}/${goal} - You're a champion!`
      };
    } else if (percentage >= 100) {
      return {
        cardClass: "from-green-50 to-lime-50 border-green-400",
        gradient: "from-green-500 to-lime-600",
        progressClass: "bg-gradient-to-r from-green-500 to-lime-600",
        textColor: "text-green-700",
        icon: "✅",
        badge: { text: "Goal smashed!", color: "bg-gradient-to-r from-green-500 to-lime-600" },
        message: `Perfect! Goal complete! Keep this momentum! 💪`
      };
    } else if (percentage >= 80) {
      return {
        cardClass: "from-blue-50 to-sky-50 border-blue-400",
        gradient: "from-blue-500 to-sky-600",
        progressClass: "bg-gradient-to-r from-blue-500 to-sky-600",
        textColor: "text-blue-700",
        icon: "⚡",
        badge: { text: "Almost there!", color: "bg-blue-500" },
        message: `Just ${goal - progress} more! You're so close!`
      };
    } else if (percentage >= 50) {
      return {
        cardClass: "from-amber-50 to-yellow-50 border-amber-400",
        gradient: "from-amber-500 to-yellow-600",
        progressClass: "bg-gradient-to-r from-amber-500 to-yellow-600",
        textColor: "text-amber-700",
        icon: "📈",
        badge: { text: "Good progress", color: "bg-amber-500" },
        message: `Halfway there! ${goal - progress} more to go!`
      };
    } else {
      return {
        cardClass: "from-orange-50 to-red-50 border-orange-400",
        gradient: "from-orange-500 to-red-600",
        progressClass: "bg-gradient-to-r from-orange-500 to-red-600",
        textColor: "text-orange-700",
        icon: "💪",
        badge: { text: "Let's push!", color: "bg-orange-500" },
        message: `${goal - progress} questions left - Let's go! 🚀`
      };
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return "text-green-700";
    if (accuracy >= 70) return "text-yellow-700";
    return "text-red-700";
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 85) return "from-green-50 to-emerald-50 border-green-200/50";
    if (accuracy >= 70) return "from-yellow-50 to-amber-50 border-yellow-200/50";
    return "from-red-50 to-orange-50 border-red-200/50";
  };

  if (isLoading) {
    return <LoadingScreen message="Preparing your genius dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24">
        {showBanner && notification && (
          <div className={`mb-4 bg-gradient-to-r ${
            notification.color === 'green' ? 'from-green-500 to-emerald-600' :
            notification.color === 'orange' ? 'from-orange-500 to-red-600' :
            'from-blue-500 to-indigo-600'
          } text-white rounded-2xl p-4 shadow-xl relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <notification.icon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => {
                  const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
                  localStorage.setItem(bannerKey, 'true');
                  setShowBanner(false);
                }}
                className="text-white/80 hover:text-white transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        {!hasSeenWelcome && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-blue-800/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <button
                  onClick={() => {
                    const welcomeKey = `welcome_seen_${user?.id}_${new Date().toDateString()}`;
                    localStorage.setItem(welcomeKey, 'true');
                    setHasSeenWelcome(true);
                  }}
                  className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors z-20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                      </h1>
                      <p className="text-slate-300 text-xs sm:text-sm">
                        {timeMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 px-2 py-0.5">
                        <Trophy className="h-3 w-3 mr-1" />
                        #{stats?.rank || 0}
                      </Badge>
                      <span className="text-blue-300">Top {stats?.percentile || 0}%</span>
                      {stats?.rankChange < 0 && (
                        <span className="text-green-400 text-xs">↑ {Math.abs(stats.rankChange)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => navigate('/study-now')} 
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg"
                    >
                      📚 {timeMessage.action}
                    </button>
                    <button 
                      onClick={() => navigate('/battle')} 
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg"
                    >
                      ⚔️ Battle
                    </button>
                    <button 
                      onClick={() => navigate('/test')} 
                      className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg"
                    >
                      🧪 Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Questions</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats?.totalQuestions || 0}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-semibold">+{stats?.questionsToday || 0} today</span>
                    <span className="text-xs text-slate-500">• {stats?.questionsWeek || 0}/week</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-xl shadow-lg shrink-0">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${getAccuracyBgColor(stats?.accuracy || 0)} shadow-xl hover:shadow-2xl transition-all hover:scale-105`}>
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 mb-0.5">Today's Accuracy</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${getAccuracyColor(stats?.todayAccuracy || 0)}`}>
                    {stats?.todayAccuracy || 0}%
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${stats?.accuracyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats?.accuracyChange >= 0 ? '↑' : '↓'} {Math.abs(stats?.accuracyChange || 0)}% week
                    </span>
                    {stats?.todayAccuracy < 70 && (
                        <Badge className="text-xs bg-orange-500 text-white">Focus!</Badge>
                    )}
                    </div>
                    {/* Overall Accuracy - Small */}
                    <div className="mt-2 pt-2 border-t border-slate-300/30">
                    <p className="text-xs text-slate-600">
                        Overall: <span className="font-semibold text-slate-700">{stats?.accuracy || 0}%</span>
                    </p>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${
                    (stats?.todayAccuracy || stats?.accuracy) >= 85 ? 'from-green-500 to-emerald-600' :
                    (stats?.todayAccuracy || stats?.accuracy) >= 70 ? 'from-yellow-500 to-amber-600' :
                    'from-red-500 to-orange-600'
                } p-2 sm:p-3 rounded-xl shadow-lg shrink-0`}>
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                </div>
            </CardContent>
        </Card>

          {(() => {
            const goalStyle = getGoalCardStyle(stats?.todayProgress || 0, stats?.todayGoal || 30);
            const percentage = ((stats?.todayProgress || 0) / (stats?.todayGoal || 30)) * 100;
            
            return (
              <Card className={`bg-gradient-to-br ${goalStyle.cardClass} border shadow-xl hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden`}>
                {percentage >= 100 && (
                  <div className="absolute top-2 right-2 animate-bounce text-2xl">
                    🎉
                  </div>
                )}
                {percentage >= 150 && (
                  <div className="absolute -top-1 -right-1 animate-pulse text-3xl">
                    🔥
                  </div>
                )}
                
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-0.5 ${goalStyle.textColor}`}>
                        Today's Goal
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className={`text-2xl sm:text-3xl font-bold ${goalStyle.textColor}`}>
                          {stats?.todayProgress || 0}
                        </p>
                        <span className={`text-lg font-semibold ${goalStyle.textColor} opacity-70`}>
                          /{stats?.todayGoal || 30}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={percentage} 
                          className="h-1.5 flex-1" 
                        />
                        <span className={`text-xs font-semibold ${goalStyle.textColor}`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge className={`${goalStyle.badge.color} text-white text-xs`}>
                          {goalStyle.icon} {goalStyle.badge.text}
                        </Badge>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${goalStyle.textColor}`}>
                        {goalStyle.message}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${goalStyle.gradient} p-2 sm:p-3 rounded-xl shadow-lg shrink-0`}>
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">Day Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-900">{stats?.streak || 0}</p>
                  <span className="text-xs text-amber-600 font-semibold">🔥 {stats?.streak >= 7 ? 'On fire!' : 'Keep going!'}</span>
                  {stats?.streak >= 30 && (
                    <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs">
                      🏆 Legend!
                    </Badge>
                  )}
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 sm:p-3 rounded-xl shadow-lg shrink-0">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl h-full">
              <CardHeader className="border-b border-slate-100 p-3 sm:p-4">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span>Your Progress</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">This Week</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                  {(() => {
                    const subjectStats: any = {};
                    
                    attempts?.forEach((attempt: any) => {
                      const subject = attempt.questions?.subject;
                      
                      if (subject) {
                        if (!subjectStats[subject]) {
                          subjectStats[subject] = { correct: 0, total: 0 };
                        }
                        
                        subjectStats[subject].total++;
                        
                        if (attempt.is_correct) {
                          subjectStats[subject].correct++;
                        }
                      }
                    });
                
                    if (Object.keys(subjectStats).length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Start practicing to see your progress!</p>
                        </div>
                      );
                    }
                
                    return Object.entries(subjectStats).map(([subject, data]: [string, any]) => {
                      const accuracy = data.total > 0 
                        ? Math.round((data.correct / data.total) * 100) 
                        : 0;
                      
                      let colorClass, progressClass, textColor, badge;
                      
                      if (accuracy >= 85) {
                        colorClass = "from-blue-50 to-indigo-50 border-blue-200";
                        progressClass = "bg-purple-100";
                        textColor = "text-purple-600";
                        badge = { 
                          text: "Excellent! 🌟", 
                          color: "bg-gradient-to-r from-purple-500 to-pink-600" 
                        };
                      } else if (accuracy >= 70) {
                        colorClass = "from-yellow-50 to-amber-50 border-yellow-300";
                        progressClass = "bg-yellow-100";
                        textColor = "text-yellow-700";
                        badge = { 
                          text: "Good Progress", 
                          color: "bg-yellow-500" 
                        };
                      } else {
                        colorClass = "from-orange-50 to-red-50 border-orange-300";
                        progressClass = "bg-orange-100";
                        textColor = "text-orange-700";
                        badge = { 
                          text: "Focus Needed", 
                          color: "bg-orange-500",
                          icon: AlertCircle 
                        };
                      }
                
                      return (
                        <div 
                          key={subject} 
                          className={`p-2.5 sm:p-3 bg-gradient-to-r ${colorClass} rounded-lg border-2`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-slate-800">
                                  {subject}
                                </span>
                                <Badge className={`${badge.color} text-white text-xs flex items-center gap-1`}>
                                  {badge.icon && <badge.icon className="h-3 w-3" />}
                                  {badge.text}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600">
                                {data.total} questions • {data.correct} correct
                              </p>
                            </div>
                            <span className={`text-sm font-bold ${textColor}`}>
                              {accuracy}%
                            </span>
                          </div>
                          
                          <Progress value={accuracy} className={`h-2 ${progressClass}`} />
                          
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              {accuracy >= 85 ? 'Excellent work!' : 
                               accuracy >= 70 ? 'Keep practicing' : 
                               'Need more practice'}
                            </span>
                            <button 
                              onClick={() => navigate('/study-now')} 
                              className={`${textColor} hover:opacity-80 font-semibold`}
                            >
                              {accuracy >= 85 ? 'Challenge →' : 'Practice →'}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                  
                <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Compare with Top Rankers
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">You</p>
                      <p className="text-lg font-bold text-blue-600">{stats?.avgQuestionsPerDay || 0}</p>
                      <p className="text-xs text-slate-600">Q/day</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Top Rankers</p>
                      <p className="text-lg font-bold text-purple-600">{stats?.topRankersAvg || 0}</p>
                      <p className="text-xs text-slate-600">Q/day</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Leaderboard />
        </div>
       {/* Upgrade Modal */}
        <PricingModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="daily_limit"
        />
      </div>
    </div>
  );
};

export default EnhancedDashboard;
