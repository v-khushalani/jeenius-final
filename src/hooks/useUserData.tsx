// src/hooks/useUserData.tsx - Corrected to use progressService properly

import { useState, useEffect } from 'react';
import progressService from '@/services/progressService';

export const useUserData = () => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const resetDailyStats = () => {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem('lastDailyReset');
  
  if (lastReset !== today) {
    // Reset daily progress counters
    const currentProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    // Reset daily counts but keep total counts
    if (currentProgress) {
      currentProgress.dailyQuestions = 0;
      currentProgress.dailyCorrect = 0;
      localStorage.setItem('userProgress', JSON.stringify(currentProgress));
    }
    
    localStorage.setItem('lastDailyReset', today);
    console.log('📅 Daily stats reset for new day');
  }
};
  useEffect(() => {
    const loadData = () => {
      try {
        resetDailyStats();
        const detailedStats = progressService.getDetailedStats();
        const overallStats = progressService.getOverallStats();
        const rankData = progressService.calculateUserRank(); 
        
    const mappedStats = {
      totalPoints: overallStats?.totalPoints || 0,
      streak: overallStats?.studyStreak || 0,
      totalQuestions: detailedStats.totalQuestions,
      accuracy: Math.round(detailedStats.accuracy * 100),
      problemsSolved: detailedStats.totalCorrect,
      currentRank: rankData.currentRank, // REAL RANK
      totalUsers: rankData.totalUsers,   // ADD THIS
      rankCategory: rankData.rankCategory, // ADD THIS
      percentile: rankData.percentile,   // ADD THIS
      totalTimeSpent: detailedStats.totalTime
    };

        // Map subject progress from detailed stats
        const subjectProgressData = [];
        
        Object.keys(detailedStats.subjectStats).forEach(subject => {
          const subjectData = detailedStats.subjectStats[subject];
          if (subjectData.attempted > 0) {
            subjectProgressData.push({
              subject: subject,
              accuracy: Math.round((subjectData.correct / subjectData.attempted) * 100)
            });
          }
        });

        setStats(mappedStats);
        setSubjectProgress(subjectProgressData);
        setProfile({ full_name: null }); // Keep existing profile logic
        
        // Debug log to verify data
        console.log('📊 Dashboard updated with exact numbers:', {
          totalQuestions: detailedStats.totalQuestions,
          totalCorrect: detailedStats.totalCorrect,
          accuracy: Math.round(detailedStats.accuracy * 100),
          subjects: subjectProgressData
        });
        
      } catch (error) {
        console.error('Error loading user data:', error);
        
        // Fallback to prevent crashes
        setStats({
          totalPoints: 0,
          streak: 0,
          totalQuestions: 0,
          accuracy: 0,
          problemsSolved: 0,
          currentRank: Math.floor(Math.random() * 1000) + 1,
          totalTimeSpent: 0
        });
        setSubjectProgress([]);
        setProfile({ full_name: null });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh data every 10 seconds to catch updates from StudyNow
    const interval = setInterval(loadData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, profile, subjectProgress, loading };
};
