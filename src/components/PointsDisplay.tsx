import React from 'react';
import { Trophy, Flame, Target } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const PointsDisplay = () => {
  const { stats, loading } = useUserStats();

  if (loading || !stats) {
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

      {/* Today's Goal Progress */}
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
