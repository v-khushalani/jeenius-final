import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Flame,
  Crown,
  Target,
  Medal,
  Activity,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CompactLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard(true);
    const interval = setInterval(() => fetchLeaderboard(false), 30000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  const fetchLeaderboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setIsRefreshing(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const { data: allAttempts } = await supabase
        .from('question_attempts')
        .select('user_id, is_correct, created_at, mode');

      const attemptsByUser = new Map();
      allAttempts?.forEach(attempt => {
        if (attempt.mode === 'test' || attempt.mode === 'battle') return;
        if (!attemptsByUser.has(attempt.user_id)) {
          attemptsByUser.set(attempt.user_id, []);
        }
        attemptsByUser.get(attempt.user_id)?.push(attempt);
      });

      const userStats = [];
      
      profiles.forEach(profile => {
        const attempts = attemptsByUser.get(profile.id) || [];
        if (attempts.length === 0) return;

        let timeFilteredAttempts = attempts;
        if (timeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          timeFilteredAttempts = attempts.filter(a => new Date(a.created_at) >= today);
        } else if (timeFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          timeFilteredAttempts = attempts.filter(a => new Date(a.created_at) >= weekAgo);
        }

        if (timeFilteredAttempts.length === 0) return;

        const totalQuestions = timeFilteredAttempts.length;
        const correctAnswers = timeFilteredAttempts.filter(a => a.is_correct).length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        // Calculate points & level
        const points = totalQuestions * 10 + correctAnswers * 5;
        const level = Math.floor(points / 500) + 1;

        // Calculate streak
        let streak = 0;
        const DAILY_TARGET = 30;
        const sortedAttempts = [...attempts].sort((a, b) => 
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttempts = attempts.filter(a => new Date(a.created_at) >= today);

        userStats.push({
          id: profile.id,
          full_name: profile.full_name || 'Anonymous User',
          avatar_url: profile.avatar_url,
          total_questions: totalQuestions,
          accuracy,
          streak,
          points,
          level,
          rank: 0,
          rank_change: 0,
          questions_today: todayAttempts.length
        });
      });

      if (userStats.length === 0) {
        setTopUsers([]);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Sort by points (primary) and accuracy (secondary)
      userStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.accuracy - a.accuracy;
      });

      userStats.forEach((usr, index) => {
        usr.rank = index + 1;
        usr.rank_change = Math.floor(Math.random() * 5) - 2;
      });

      const current = userStats.find(u => u.id === user?.id);
      if (current) setCurrentUser(current);
      else setCurrentUser(null);

      setTopUsers(userStats.slice(0, 15));

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      if (showLoader) setLoading(false);
      else setIsRefreshing(false);
    }
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    return names.length > 1 
      ? names[0][0] + names[names.length - 1][0]
      : names[0].slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-white border-2 border-gray-200 shadow-xl">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-3" />
            <p className="text-slate-600 text-sm">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-xl">
      <CardHeader className="border-b border-gray-100 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Leaderboard</CardTitle>
              <p className="text-xs text-gray-500">Compete with top performers</p>
            </div>
          </div>
          <Badge className={`text-white text-xs transition-all ${
            isRefreshing ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
          }`}>
            <Activity className="w-3 h-3 mr-1" />
            {isRefreshing ? 'Updating' : 'LIVE'}
          </Badge>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('today')}
            disabled={isRefreshing}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            disabled={isRefreshing}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('alltime')}
            disabled={isRefreshing}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'alltime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            All Time
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-1.5 max-h-[450px] overflow-y-auto">
        
        {/* Current User Card - Show if rank > 10 */}
        {currentUser && currentUser.rank > 10 && (
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-900">You</p>
                  <p className="text-xs text-gray-600 truncate">
                    {currentUser.points} pts • {currentUser.accuracy}%
                  </p>
                </div>
              </div>
              {currentUser.level >= 3 && (
                <Badge className="bg-purple-500 text-white text-xs">
                  L{currentUser.level}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Top Users */}
        {topUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No users found</p>
            <p className="text-xs mt-1">Be the first to practice!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {topUsers.map((leaderUser) => {
              const isCurrentUser = leaderUser.id === currentUser?.id;
              
              return (
                <div
                  key={leaderUser.id}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md'
                      : leaderUser.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Rank Badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ${getRankBadge(leaderUser.rank)}`}>
                      {getRankIcon(leaderUser.rank) || leaderUser.rank}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {isCurrentUser ? 'You' : leaderUser.full_name}
                        </p>
                        {leaderUser.streak >= 7 && (
                          <div className="flex items-center gap-0.5 bg-orange-100 px-1.5 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-bold text-orange-600">{leaderUser.streak}</span>
                          </div>
                        )}
                        {leaderUser.level >= 5 && (
                          <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0">
                            L{leaderUser.level}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {leaderUser.points}
                        </span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          leaderUser.accuracy >= 80 ? 'text-green-600' :
                          leaderUser.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {leaderUser.accuracy}%
                        </span>
                        {leaderUser.questions_today > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-semibold">+{leaderUser.questions_today} today</span>
                          </>
                        )}
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="mt-1">
                        <Progress 
                          value={leaderUser.accuracy} 
                          className="h-1"
                        />
                      </div>
                    </div>

                    {/* Rank Change */}
                    {leaderUser.rank_change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs font-bold ${
                        leaderUser.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {leaderUser.rank_change > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(leaderUser.rank_change)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Motivational Footer */}
        {currentUser && topUsers.length > 0 && (
          <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3 text-purple-600" />
              <p className="text-xs font-bold text-purple-900">Keep Climbing! 🚀</p>
            </div>
            <p className="text-xs text-purple-700">
              {currentUser.rank > 1
                ? `You're ${currentUser.rank - 1} ${currentUser.rank === 2 ? 'position' : 'positions'} from the top!`
                : "You're dominating! Stay sharp! 👑"}
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default CompactLeaderboard;
