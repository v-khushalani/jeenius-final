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
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Leaderboard from "@/components/Leaderboard";

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const lastShown = localStorage.getItem('welcomeLastShown');
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
    if (user && isClient) {
      loadUserData();
    }
  }, [user, isClient]);

  // ✅ DYNAMIC GOAL CALCULATOR
  const calculateDailyGoal = (totalQuestions: number, avgAccuracy: number, currentStreak: number) => {
    let baseGoal = 20;
    
    if (totalQuestions > 1000) baseGoal = 50;
    else if (totalQuestions > 500) baseGoal = 40;
    else if (totalQuestions > 200) baseGoal = 35;
    else if (totalQuestions > 100) baseGoal = 30;
    else if (totalQuestions > 50) baseGoal = 25;
    
    if (avgAccuracy >= 90) baseGoal += 5;
    else if (avgAccuracy >= 80) baseGoal += 3;
    
    if (currentStreak >= 30) baseGoal += 10;
    else if (currentStreak >= 14) baseGoal += 5;
    else if (currentStreak >= 7) baseGoal += 3;
    
    return Math.min(baseGoal, 60);
  };

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
      
      // ✅ Fetch attempts - EXCLUDE test/battle mode
      const { data: allAttempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*, questions(subject, chapter, topic)')
        .eq('user_id', user?.id)
        .neq('mode', 'test')
        .neq('mode', 'battle');

      if (attemptsError) console.error('Attempts fetch error:', attemptsError);
      
      const attempts = allAttempts || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttempts = attempts.filter(a => 
        new Date(a.created_at) >= today
      );
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAttempts = attempts.filter(a => 
        new Date(a.created_at) >= weekAgo
      );

      const correctAnswers = attempts.filter(a => a.is_correct).length;
      const totalQuestions = attempts.length;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      const todayCorrect = todayAttempts.filter(a => a.is_correct).length;
      const todayTotal = todayAttempts.length;
      const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

      // ✅ FIXED STREAK - Goal-based (30+ questions/day)
      const DAILY_TARGET = 30;
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 365; i++) {
        const questionsOnThisDay = attempts.filter(a => {
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
      const subjectStats: any = {};
      attempts.forEach((attempt: any) => {
        const topic = attempt.questions?.topic;
        const subject = attempt.questions?.subject;
        
        if (topic) {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total++;
          if (attempt.is_correct) topicStats[topic].correct++;
        }
        
        if (subject) {
          if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, total: 0 };
          }
          subjectStats[subject].total++;
          if (attempt.is_correct) subjectStats[subject].correct++;
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

      // ✅ DYNAMIC DAILY GOAL
      const dynamicGoal = calculateDailyGoal(totalQuestions, accuracy, streak);

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
      todayGoal: dynamicGoal,
      todayProgress: todayAttempts.length,
      weakestTopic,
      strongestTopic,
      avgQuestionsPerDay: totalQuestions > 0 ? Math.round(totalQuestions / Math.max(1, streak || 1)) : 0,
      topRankersAvg: 48,
      subjectStats,
    });
      
      setLeaderboardKey(prev => prev + 1);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
        badge: { text: "Legend!", color: "bg-gradient-to-r from-emerald-700 to-green-800" },
        message: `${progress} questions! Legendary! 🔥`
      };
    } else if (percentage >= 120) {
      return {
        cardClass: "from-green-100 to-emerald-100 border-green-500",
        gradient: "from-green-600 to-emerald-700",
        progressClass: "bg-gradient-to-r from-green-600 to-emerald-700",
        textColor: "text-green-800",
        icon: "🏆",
        badge: { text: "Champion!", color: "bg-gradient-to-r from-green-600 to-emerald-700" },
        message: `Outstanding! ${progress}/${goal} 🏆`
      };
    } else if (percentage >= 100) {
      return {
        cardClass: "from-green-50 to-lime-50 border-green-400",
        gradient: "from-green-500 to-lime-600",
        progressClass: "bg-gradient-to-r from-green-500 to-lime-600",
        textColor: "text-green-700",
        icon: "✅",
        badge: { text: "Goal Smashed!", color: "bg-gradient-to-r from-green-500 to-lime-600" },
        message: `Perfect! Keep this momentum! 💪`
      };
    } else if (percentage >= 80) {
      return {
        cardClass: "from-blue-50 to-sky-50 border-blue-400",
        gradient: "from-blue-500 to-sky-600",
        progressClass: "bg-gradient-to-r from-blue-500 to-sky-600",
        textColor: "text-blue-700",
        icon: "⚡",
        badge: { text: "Almost There!", color: "bg-blue-500" },
        message: `Just ${goal - progress} more! 🚀`
      };
    } else if (percentage >= 50) {
      return {
        cardClass: "from-amber-50 to-yellow-50 border-amber-400",
        gradient: "from-amber-500 to-yellow-600",
        progressClass: "bg-gradient-to-r from-amber-500 to-yellow-600",
        textColor: "text-amber-700",
        icon: "📈",
        badge: { text: "Good Progress", color: "bg-amber-500" },
        message: `Halfway! ${goal - progress} to go!`
      };
    } else {
      return {
        cardClass: "from-orange-50 to-red-50 border-orange-400",
        gradient: "from-orange-500 to-red-600",
        progressClass: "bg-gradient-to-r from-orange-500 to-red-600",
        textColor: "text-orange-700",
        icon: "💪",
        badge: { text: "Let's Push!", color: "bg-orange-500" },
        message: `${goal - progress} left - Let's go! 🚀`
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

  const getProgressBadge = (accuracy: number) => {
    if (accuracy >= 95) {
      return { 
        text: "Perfect! 💎", 
        color: "bg-gradient-to-r from-purple-600 to-pink-600",
        message: "Absolute mastery!"
      };
    } else if (accuracy >= 90) {
      return { 
        text: "Mastered! 🌟", 
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        message: "Outstanding work!"
      };
    } else if (accuracy >= 85) {
      return { 
        text: "Excellent! ⭐", 
        color: "bg-gradient-to-r from-blue-500 to-indigo-600",
        message: "Keep it up!"
      };
    } else if (accuracy >= 80) {
      return { 
        text: "Very Good! 👍", 
        color: "bg-gradient-to-r from-green-500 to-emerald-600",
        message: "Almost there!"
      };
    } else if (accuracy >= 75) {
      return { 
        text: "Good Job! 📈", 
        color: "bg-gradient-to-r from-lime-500 to-green-600",
        message: "Keep practicing!"
      };
    } else if (accuracy >= 65) {
      return { 
        text: "Making Progress 💪", 
        color: "bg-yellow-500",
        message: "You're improving!"
      };
    } else if (accuracy >= 55) {
      return { 
        text: "Need Practice 📚", 
        color: "bg-orange-400",
        message: "Review basics"
      };
    } else {
      return { 
        text: "Focus Needed ⚠️", 
        color: "bg-orange-500",
        icon: AlertCircle,
        message: "Start with easy"
      };
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Preparing your genius dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Header />
      
      <div className={`container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl ${
        showBanner || showWelcome ? 'pt-20 sm:pt-24' : 'pt-16 sm:pt-18'
      }`}>
        {showBanner && notification && (
          <div className={`mb-3 sm:mb-4 bg-gradient-to-r ${
            notification.color === 'green' ? 'from-green-500 to-emerald-600' :
            notification.color === 'orange' ? 'from-orange-500 to-red-600' :
            'from-blue-500 to-indigo-600'
          } text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <notification.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <p className="text-xs sm:text-sm font-medium leading-tight">{notification.message}</p>
              </div>
              <button
                onClick={() => {
                  const bannerKey = `notification_seen_${user?.id}_${new Date().toDateString()}`;
                  localStorage.setItem(bannerKey, 'true');
                  setShowBanner(false);
                }}
                className="text-white/80 hover:text-white transition-colors shrink-0 p-1"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        )}
        
        {showWelcome && (
          <div className="mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-blue-800/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <button
                  onClick={() => {
                    localStorage.setItem('welcomeLastShown', new Date().toDateString());
                    setShowWelcome(false);
                  }}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/60 hover:text-white transition-colors z-20 p-1"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold truncate">
                        {timeMessage.greeting}, {displayName}! {timeMessage.icon}
                      </h1>
                      <p className="text-slate-300 text-xs sm:text-sm leading-tight">
                        {timeMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 px-1.5 sm:px-2 py-0.5">
                        <Trophy className="h-3 w-3 mr-0.5 sm:mr-1" />
                        #{stats?.rank || 0}
                      </Badge>
                      <span className="text-blue-300 text-xs sm:text-sm">Top {stats?.percentile || 0}%</span>
                      {stats?.rankChange < 0 && (
                        <span className="text-green-400 text-xs">↑ {Math.abs(stats.rankChange)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button 
                      onClick={() => navigate('/study-now')} 
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95"
                    >
                      📚 {timeMessage.action}
                    </button>
                    <button 
                      onClick={() => navigate('/battle')} 
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95"
                    >
                      ⚔️ Battle
                    </button>
                    <button 
                      onClick={() => navigate('/test')} 
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95"
                    >
                      🧪 Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ADDED: JEEnius Points Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl mb-3 sm:mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 sm:p-3 rounded-xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">JEEnius Points</p>
                  <p className="text-2xl sm:text-3xl font-black text-purple-900">
                    {profile?.total_points?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Level {Math.floor((profile?.total_points || 0) / 100) + 1}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardContent className="p-2.5 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Questions</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{stats?.totalQuestions || 0}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-xs text-green-600 font-semibold">+{stats?.questionsToday || 0} today</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-500">{stats?.questionsWeek || 0}/week</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg shrink-0">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${getAccuracyBgColor(stats?.accuracy || 0)} shadow-xl hover:shadow-2xl transition-all hover:scale-105`}>
            <CardContent className="p-2.5 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 mb-0.5">Today's Accuracy</p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getAccuracyColor(stats?.todayAccuracy || 0)}`}>
                    {stats?.todayAccuracy || 0}%
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-0.5">
                    <span className={`text-xs font-semibold ${stats?.accuracyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats?.accuracyChange >= 0 ? '↑' : '↓'} {Math.abs(stats?.accuracyChange || 0)}% week
                    </span>
                    {stats?.todayAccuracy < 70 && (
                      <Badge className="text-xs bg-orange-500 text-white px-1.5 py-0">Focus!</Badge>
                    )}
                  </div>
                  <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-300/30">
                    <p className="text-xs text-slate-600">
                      Overall: <span className="font-semibold text-slate-700">{stats?.accuracy || 0}%</span>
                    </p>
                  </div>
                </div>
                <div className={`bg-gradient-to-br ${
                  (stats?.todayAccuracy || stats?.accuracy) >= 85 ? 'from-green-500 to-emerald-600' :
                  (stats?.todayAccuracy || stats?.accuracy) >= 70 ? 'from-yellow-500 to-amber-600' :
                  'from-red-500 to-orange-600'
                } p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg shrink-0`}>
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
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
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-bounce text-xl sm:text-2xl">
                    🎉
                  </div>
                )}
                {percentage >= 150 && (
                  <div className="absolute -top-1 -right-1 animate-pulse text-2xl sm:text-3xl">
                    🔥
                  </div>
                )}
                
                <CardContent className="p-2.5 sm:p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs font-medium mb-0.5 ${goalStyle.textColor}`}>
                        Today's Goal
                      </p>
                      <div className="flex items-baseline gap-0.5 sm:gap-1">
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${goalStyle.textColor}`}>
                          {stats?.todayProgress || 0}
                        </p>
                        <span className={`text-base sm:text-lg font-semibold ${goalStyle.textColor} opacity-70`}>
                          /{stats?.todayGoal || 30}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                        <Progress 
                          value={percentage} 
                          className="h-1 sm:h-1.5 flex-1" 
                        />
                        <span className={`text-xs font-semibold ${goalStyle.textColor} w-9 text-right shrink-0`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="mt-1 sm:mt-2">
                        <Badge className={`${goalStyle.badge.color} text-white text-xs px-1.5 py-0`}>
                          {goalStyle.icon} {goalStyle.badge.text}
                        </Badge>
                      </div>
                      <p className={`text-xs mt-0.5 sm:mt-1 font-medium ${goalStyle.textColor} line-clamp-2`}>
                        {goalStyle.message}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${goalStyle.gradient} p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg shrink-0`}>
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardContent className="p-2.5 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">Day Streak</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900">{stats?.streak || 0}</p>
                  <span className="text-xs text-amber-600 font-semibold">🔥 {stats?.streak >= 7 ? 'On fire!' : 'Keep going!'}</span>
                  {stats?.streak >= 30 && (
                    <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-1.5 py-0">
                      🏆 Legend!
                    </Badge>
                  )}
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg shrink-0">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl h-full">
              <CardHeader className="border-b border-slate-100 p-3 sm:p-4">
                <CardTitle className="flex items-center justify-between text-sm sm:text-base lg:text-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span>Your Progress</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">This Week</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2.5 sm:space-y-3">
                  {stats?.subjectStats && Object.keys(stats.subjectStats).length > 0 ? (
                    Object.entries(stats.subjectStats).map(([subject, data]: [string, any]) => {
                      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                      const badge = getProgressBadge(accuracy);
                      
                      return (
                        <div key={subject} className="bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm font-semibold text-slate-800 truncate">{subject}</span>
                              <Badge className={`${badge.color} text-white text-xs px-2 py-0 shrink-0`}>
                                {badge.text}
                              </Badge>
                            </div>
                            <span className={`text-lg font-bold ${getAccuracyColor(accuracy)} shrink-0 ml-2`}>
                              {accuracy}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={accuracy} className="flex-1 h-2" />
                            <span className="text-xs text-slate-600 shrink-0">{data.correct}/{data.total}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{badge.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                      <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                      <p className="text-xs sm:text-sm">Start practicing to see subject progress!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Leaderboard key={leaderboardKey} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
