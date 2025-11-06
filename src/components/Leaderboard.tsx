import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  Crown,
  Target,
  Medal,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  total_questions: number;
  accuracy: number;
  streak: number;
  rank: number;
  rank_change: number;
  questions_today: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'alltime'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard(true);
    
    // Refresh every 30 seconds without showing loading state
    const interval = setInterval(() => fetchLeaderboard(false), 30000);
    return () => clearInterval(interval);
  }, [timeFilter, user]);

  const fetchLeaderboard = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // ✅ FIX: Get ALL users with profiles (increased limit)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .limit(1000); // Increased to fetch more users

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        setLoading(false);
        return;
      }

      console.log(`Fetched ${profiles.length} profiles`);

      // Calculate stats for each user
      const userStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get attempts for this user - filter out test and battle mode
          const { data: attempts } = await supabase
            .from('question_attempts')
            .select('is_correct, created_at, mode')
            .eq('user_id', profile.id);

          // ✅ IMPORTANT: Filter out test/battle AFTER fetching
          const filteredAttempts = (attempts || []).filter(
            a => a.mode !== 'test' && a.mode !== 'battle'
          );

          if (!filteredAttempts || filteredAttempts.length === 0) {
            return null; // Skip users with no attempts
          }

          // Filter based on time
          let timeFilteredAttempts = filteredAttempts;
          if (timeFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            timeFilteredAttempts = filteredAttempts.filter(a => new Date(a.created_at) >= today);
          } else if (timeFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            timeFilteredAttempts = filteredAttempts.filter(a => new Date(a.created_at) >= weekAgo);
          }

          // Skip if no attempts in time filter
          if (timeFilteredAttempts.length === 0) {
            return null;
          }

          const totalQuestions = timeFilteredAttempts.length;
          const correctAnswers = timeFilteredAttempts.filter(a => a.is_correct).length;
          const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

          // Calculate today's questions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayAttempts = filteredAttempts.filter(a => new Date(a.created_at) >= today);

          // ✅ FIXED STREAK - Only counts days with 30+ questions (goal met)
          let streak = 0;
          const DAILY_TARGET = 30;
          const sortedAttempts = [...filteredAttempts].sort((a, b) => 
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
            
            // ✅ Only count if daily target met
            if (questionsOnThisDay >= DAILY_TARGET) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else if (i === 0 && questionsOnThisDay > 0) {
              // Today hasn't hit goal yet but has attempts - check yesterday
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }

          return {
            id: profile.id,
            full_name: profile.full_name || 'Anonymous',
            avatar_url: profile.avatar_url,
            total_questions: totalQuestions,
            accuracy,
            streak,
            rank: 0,
            rank_change: 0,
            questions_today: todayAttempts.length
          };
        })
      );

      // ✅ Filter out null values (users with no attempts)
      const validUsers = userStats.filter((u): u is LeaderboardUser => 
        u !== null && u.total_questions > 0
      );

      console.log(`Valid users with attempts: ${validUsers.length}`);

      // ✅ Sort by total questions (primary) and accuracy (secondary)
      validUsers.sort((a, b) => {
        if (b.total_questions !== a.total_questions) {
          return b.total_questions - a.total_questions;
        }
        return b.accuracy - a.accuracy;
      });

      // Assign ranks
      validUsers.forEach((user, index) => {
        user.rank = index + 1;
        user.rank_change = Math.floor(Math.random() * 5) - 2; // Mock rank change for now
      });

      // Get current user
      const current = validUsers.find(u => u.id === user?.id);
      if (current) {
        setCurrentUser(current);
        console.log('Current user rank:', current.rank);
      } else {
        console.log('Current user not found in leaderboard');
      }

      // Top 10 users
      setTopUsers(validUsers.slice(0, 10));
      console.log('Top users:', validUsers.slice(0, 10).map(u => ({ name: u.full_name, questions: u.total_questions })));

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-orange-600 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl">
        <CardContent className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-3" />
            <p className="text-slate-600">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl">
      <CardHeader className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Leaderboard</CardTitle>
              <p className="text-xs text-slate-500">Compete with top performers</p>
            </div>
          </div>
          <Badge className={`text-white text-xs transition-all ${
            isRefreshing ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
          }`}>
            <Activity className="h-3 w-3 mr-1" />
            {isRefreshing ? 'Updating...' : 'LIVE'}
          </Badge>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTimeFilter('today')}
            disabled={isRefreshing}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeFilter === 'alltime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            All Time
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        
        {/* Current User Card - Show if rank > 10 */}
        {currentUser && currentUser.rank > 10 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.rank}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">You</p>
                  <p className="text-xs text-slate-600">
                    {currentUser.total_questions} questions • {currentUser.accuracy}% accuracy
                  </p>
                </div>
              </div>
              {currentUser.rank_change !== 0 && (
                <Badge className={currentUser.rank_change > 0 ? 'bg-green-500' : 'bg-red-500'}>
                  {currentUser.rank_change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(currentUser.rank_change)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Top Users */}
        {topUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No users found for this time period.</p>
            <p className="text-xs mt-1">Be the first to practice!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers.map((leaderUser, index) => {
              const isCurrentUser = leaderUser.id === currentUser?.id;
              
              return (
                <div
                  key={leaderUser.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg'
                      : index < 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadge(leaderUser.rank)}`}>
                        {getRankIcon(leaderUser.rank) || leaderUser.rank}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {isCurrentUser ? 'You' : leaderUser.full_name}
                          </p>
                          {leaderUser.streak >= 7 && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              <Flame className="h-3 w-3 mr-1" />
                              {leaderUser.streak}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {leaderUser.total_questions}
                          </span>
                          <span className={`font-semibold ${
                            leaderUser.accuracy >= 80 ? 'text-green-600' :
                            leaderUser.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {leaderUser.accuracy}%
                          </span>
                          {leaderUser.questions_today > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              +{leaderUser.questions_today} today
                            </Badge>
                          )}
                        </div>

                        {/* Progress bar */}
                        <Progress 
                          value={leaderUser.accuracy} 
                          className="h-1.5 mt-2"
                        />
                      </div>
                    </div>

                    {/* Rank Change */}
                    {leaderUser.rank_change !== 0 && (
                      <div className={`flex items-center gap-1 text-xs font-bold ${
                        leaderUser.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {leaderUser.rank_change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(leaderUser.rank_change)}
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
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-bold text-purple-900">Climb the Ranks!</p>
            </div>
            <p className="text-xs text-purple-700">
              {currentUser.rank > 1
                ? `You're ${currentUser.rank - 1} ${currentUser.rank === 2 ? 'position' : 'positions'} away from the top! Keep pushing! 🚀`
                : "You're at the top! Maintain your position! 👑"}
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default Leaderboard;
