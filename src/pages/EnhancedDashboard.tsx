import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Brain,
  Crown,
  Medal,
  Flame,
  Activity,
  CheckCircle2,
  Clock,
  BarChart3,
  Star,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalQuestions: 0,
    accuracy: 0,
    streak: 0,
    level: 1,
    points: 0,
    pointsToNextLevel: 100,
    todayQuestions: 0,
    weeklyQuestions: 0,
    studyHours: 0,
    rank: 0,
    totalUsers: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Fetch all attempts for stats
      const { data: allAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject, difficulty)')
        .eq('user_id', user.id)
        .neq('mode', 'test')
        .neq('mode', 'battle');

      const totalQuestions = allAttempts?.length || 0;
      const correctAnswers = allAttempts?.filter(a => a.is_correct).length || 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Calculate today's questions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttempts = allAttempts?.filter(a => new Date(a.created_at) >= today) || [];

      // Calculate weekly questions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyAttempts = allAttempts?.filter(a => new Date(a.created_at) >= weekAgo) || [];

      // Calculate streak
      let streak = 0;
      const DAILY_TARGET = 30;
      const sortedAttempts = [...(allAttempts || [])].sort((a, b) => 
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

      // Calculate level and points
      const points = totalQuestions * 10 + correctAnswers * 5 + streak * 50;
      const level = Math.floor(points / 500) + 1;
      const pointsToNextLevel = (level * 500) - points;

      // Fetch leaderboard
      await fetchLeaderboard(user.id, allAttempts);

      // Calculate subject stats
      const subjects = ['Physics', 'Chemistry', 'Mathematics'];
      const subjectData = subjects.map(subject => {
        const subjectAttempts = allAttempts?.filter(a => a.questions?.subject === subject) || [];
        const subjectCorrect = subjectAttempts.filter(a => a.is_correct).length;
        const subjectAccuracy = subjectAttempts.length > 0 
          ? Math.round((subjectCorrect / subjectAttempts.length) * 100) 
          : 0;
        
        return {
          name: subject,
          attempted: subjectAttempts.length,
          accuracy: subjectAccuracy,
          icon: subject === 'Physics' ? '⚛️' : subject === 'Chemistry' ? '🧪' : '📐',
          color: subject === 'Physics' ? 'from-blue-500 to-indigo-600' : 
                 subject === 'Chemistry' ? 'from-green-500 to-emerald-600' : 
                 'from-purple-500 to-pink-600'
        };
      });

      setSubjectStats(subjectData);

      // Recent activity
      const recentAttempts = allAttempts?.slice(0, 5).map(a => ({
        subject: a.questions?.subject || 'Unknown',
        isCorrect: a.is_correct,
        time: new Date(a.created_at),
        difficulty: a.questions?.difficulty || 'Medium'
      })) || [];

      setRecentActivity(recentAttempts);

      setUserStats({
        totalQuestions,
        accuracy,
        streak,
        level,
        points,
        pointsToNextLevel,
        todayQuestions: todayAttempts.length,
        weeklyQuestions: weeklyAttempts.length,
        studyHours: Math.round((totalQuestions * 2) / 60),
        rank: 0,
        totalUsers: 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (currentUserId, currentUserAttempts) => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (!profiles) return;

      const { data: allAttempts } = await supabase
        .from('question_attempts')
        .select('user_id, is_correct, created_at')
        .neq('mode', 'test')
        .neq('mode', 'battle');

      const attemptsByUser = new Map();
      allAttempts?.forEach(attempt => {
        if (!attemptsByUser.has(attempt.user_id)) {
          attemptsByUser.set(attempt.user_id, []);
        }
        attemptsByUser.get(attempt.user_id)?.push(attempt);
      });

      const userStats = [];
      profiles.forEach(profile => {
        const attempts = attemptsByUser.get(profile.id) || [];
        if (attempts.length === 0) return;

        const totalQuestions = attempts.length;
        const correctAnswers = attempts.filter(a => a.is_correct).length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const points = totalQuestions * 10 + correctAnswers * 5;
        const level = Math.floor(points / 500) + 1;

        userStats.push({
          id: profile.id,
          name: profile.full_name || 'Anonymous',
          avatar: profile.avatar_url,
          totalQuestions,
          accuracy,
          points,
          level,
          rank: 0
        });
      });

      userStats.sort((a, b) => b.points - a.points);
      userStats.forEach((user, index) => {
        user.rank = index + 1;
      });

      const currentUserRank = userStats.find(u => u.id === currentUserId)?.rank || 0;
      
      setUserStats(prev => ({
        ...prev,
        rank: currentUserRank,
        totalUsers: userStats.length
      }));

      setLeaderboard(userStats.slice(0, 10));

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-orange-600";
    return "bg-gradient-to-r from-blue-500 to-indigo-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <Header />
      
      <div className="pt-16 sm:pt-20 h-screen overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
          
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Ready to crush your JEE prep today?
                </p>
              </div>
              <Button
                onClick={() => navigate('/study-now')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white font-semibold shadow-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Studying
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Column - Stats & Progress */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <Badge className="bg-blue-600 text-white text-xs">Total</Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{userStats.totalQuestions}</div>
                    <p className="text-xs text-gray-600">Questions</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      <Badge className="bg-green-600 text-white text-xs">Accuracy</Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{userStats.accuracy}%</div>
                    <p className="text-xs text-gray-600">Correct</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      <Badge className="bg-orange-600 text-white text-xs">Streak</Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{userStats.streak}</div>
                    <p className="text-xs text-gray-600">Days</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      <Badge className="bg-purple-600 text-white text-xs">Rank</Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">#{userStats.rank}</div>
                    <p className="text-xs text-gray-600">Position</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Progress Section */}
              <Card className="border-2 border-indigo-200 shadow-xl bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Your Progress</CardTitle>
                        <p className="text-xs text-gray-500">Level up by earning points!</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm px-3 py-1">
                      Level {userStats.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Points Progress */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-indigo-600" />
                        <span className="font-bold text-gray-900">{userStats.points} Points</span>
                      </div>
                      <span className="text-sm text-gray-600">{userStats.pointsToNextLevel} to Level {userStats.level + 1}</span>
                    </div>
                    <Progress 
                      value={(userStats.points % 500) / 5} 
                      className="h-3 bg-white"
                    />
                  </div>

                  {/* Activity Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-700">Today</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600">{userStats.todayQuestions}</div>
                      <p className="text-xs text-gray-600">Questions</p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-gray-700">Week</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">{userStats.weeklyQuestions}</div>
                      <p className="text-xs text-gray-600">Questions</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-gray-700">Total</span>
                      </div>
                      <div className="text-xl font-bold text-purple-600">{userStats.studyHours}h</div>
                      <p className="text-xs text-gray-600">Study Time</p>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">🎯 Keep it up!</span> You're {userStats.pointsToNextLevel} points away from Level {userStats.level + 1}!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card className="border-2 border-blue-200 shadow-xl bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Subject Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectStats.map(subject => (
                      <div key={subject.name} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{subject.icon}</span>
                            <div>
                              <p className="font-bold text-gray-900">{subject.name}</p>
                              <p className="text-xs text-gray-600">{subject.attempted} questions</p>
                            </div>
                          </div>
                          <Badge className={`bg-gradient-to-r ${subject.color} text-white`}>
                            {subject.accuracy}%
                          </Badge>
                        </div>
                        <Progress value={subject.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Leaderboard & Activity */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Leaderboard */}
              <Card className="border-2 border-yellow-200 shadow-xl bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Leaderboard</CardTitle>
                        <p className="text-xs text-gray-500">Top performers</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No competitors yet!</p>
                    </div>
                  ) : (
                    leaderboard.map((user, index) => (
                      <div
                        key={user.id}
                        className={`p-2.5 rounded-lg border transition-all ${
                          user.id === profile?.id
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                            : index < 3
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRankBadge(user.rank)}`}>
                            {getRankIcon(user.rank) || user.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-gray-900 truncate">
                                {user.id === profile?.id ? 'You' : user.name}
                              </p>
                              {user.level >= 5 && (
                                <Badge className="bg-purple-500 text-white text-xs">
                                  L{user.level}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{user.points} pts</span>
                              <span>•</span>
                              <span className={user.accuracy >= 80 ? 'text-green-600 font-semibold' : ''}>
                                {user.accuracy}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-2 border-green-200 shadow-xl bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        {activity.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.difficulty}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const XCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default EnhancedDashboard;
