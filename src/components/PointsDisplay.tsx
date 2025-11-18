// src/components/PointsDisplay.tsx
// ✅ FIXED VERSION - Real-time points from profiles.total_points

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PointsDisplay = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    streak: 0,
    todayProgress: 0,
    todayGoal: 15
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    loadStats();

    // ✅ Real-time subscription to points changes
    const pointsSubscription = supabase
      .channel('points-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('✅ Points updated:', payload);
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pointsSubscription);
    };
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      // Get total points from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();

      // Get today's progress
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      // Get streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      setStats({
        totalPoints: profile?.total_points || 0,
        streak: streakData?.current_streak || 0,
        todayProgress: count || 0,
        todayGoal: 15
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 animate-pulse">
        <div className="h-4 w-4 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Points */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
        <Trophy className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-bold text-indigo-900">
          {stats.totalPoints}
        </span>
        <span className="text-xs text-slate-500">pts</span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
        <Flame className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-900">
          {stats.streak}
        </span>
        <span className="text-xs text-slate-500">day{stats.streak !== 1 ? 's' : ''}</span>
      </div>

      {/* Today's Goal */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
        <Target className="h-4 w-4 text-green-600" />
        <span className="text-sm font-bold text-green-900">
          {stats.todayProgress}/{stats.todayGoal}
        </span>
        <span className="text-xs text-slate-500">goal</span>
      </div>
    </div>
  );
};

export default PointsDisplay;
