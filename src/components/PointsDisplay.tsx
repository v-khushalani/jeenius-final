// src/components/PointsDisplay.tsx
// ✅ ENHANCED VERSION - JEEnius Points with Level Display

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStreakData } from '@/hooks/useStreakData';
import PointsService from '@/services/pointsService';

const PointsDisplay = () => {
  const { user } = useAuth();
  const { streak } = useStreakData();
  const [stats, setStats] = useState({
    totalPoints: 0,
    todayProgress: 0,
    todayGoal: 15,
    level: 'BEGINNER',
    pointsToNext: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    loadStats();

    // Real-time subscription to points and questions
    const subscription = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => loadStats()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'question_attempts',
          filter: `user_id=eq.${user.id}`
        },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      // Get total points and level info
      const levelInfo = await PointsService.getUserPoints(user.id);
      
      // Get today's progress
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      setStats({
        totalPoints: levelInfo.totalPoints,
        todayProgress: count || 0,
        todayGoal: 15,
        level: levelInfo.level,
        pointsToNext: levelInfo.levelInfo.pointsToNext
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
      {/* JEEnius Points with Level */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 rounded-lg border-2 border-purple-300 hover:shadow-lg transition-all">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-purple-700" />
          <Sparkles className="h-3 w-3 text-pink-600 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            JEEnius Points
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-purple-900">
              {stats.totalPoints}
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded">
              {stats.level}
            </span>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
        <Flame className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-900">
          {streak}
        </span>
        <span className="text-xs text-slate-500">day{streak !== 1 ? 's' : ''}</span>
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
