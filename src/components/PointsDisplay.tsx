// src/components/PointsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Zap, Flame, Trophy, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StreakService from '@/services/streakService';
import PointsService from '@/services/pointsService';
import UserLimitsService from '@/services/userLimitsService';

export const PointsDisplay = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    level: 'BEGINNER',
    levelEmoji: '🌱',
    currentStreak: 0,
    todayCompleted: 0,
    todayTarget: 15,
    isPro: false
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load all stats in parallel
      const [pointsData, streakStatus, proStatus] = await Promise.all([
        PointsService.getUserPoints(user?.id || ''),
        StreakService.getStreakStatus(user?.id || ''),
        UserLimitsService.isPro(user?.id || '')
      ]);

      setStats({
        points: pointsData.totalPoints,
        level: pointsData.level,
        levelEmoji: pointsData.levelInfo.emoji,
        currentStreak: streakStatus.currentStreak,
        todayCompleted: streakStatus.todayCompleted,
        todayTarget: streakStatus.todayTarget,
        isPro: proStatus
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-gray-200">
      {/* Points */}
      <div className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
        <Zap className="h-4 w-4 text-yellow-500" fill="currentColor" />
        <span className="font-bold text-sm text-gray-900">
          {stats.points.toLocaleString()}
        </span>
      </div>

      <div className="h-4 w-px bg-gray-300"></div>

      {/* Streak */}
      <div className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
        <Flame className="h-4 w-4 text-orange-500" fill="currentColor" />
        <span className="font-semibold text-sm text-gray-900">
          {stats.currentStreak}
        </span>
      </div>

      <div className="h-4 w-px bg-gray-300"></div>

      {/* Daily Progress */}
      <div className="flex items-center gap-1.5">
        <div className="text-xs font-medium text-gray-600">
          {stats.todayCompleted}/{stats.todayTarget}
        </div>
      </div>

      <div className="h-4 w-px bg-gray-300"></div>

      {/* Level */}
      <div className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
        <span className="text-sm">{stats.levelEmoji}</span>
        <span className="text-xs font-semibold text-gray-700">
          {stats.level}
        </span>
      </div>

      {/* PRO Badge */}
      {stats.isPro && (
        <>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
            <Crown className="h-3 w-3" fill="currentColor" />
            <span className="text-xs font-bold">PRO</span>
          </div>
        </>
      )}
    </div>
  );
};

export default PointsDisplay;
