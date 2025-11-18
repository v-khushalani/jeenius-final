// services/progressService.js - Updated Progress Service with Daily Reset

import { LEVEL_REQUIREMENTS, STORAGE_KEYS, ACCURACY_THRESHOLDS } from '../utils/constants';
import { storage, generateId, getContextualMessage, formatDate } from '../utils/helpers';

class ProgressService {
  constructor() {
    this.STORAGE_KEY = STORAGE_KEYS.USER_PROGRESS;
    this.LEVEL_REQUIREMENTS = LEVEL_REQUIREMENTS;
  }

  // ✨ NEW: Get today's date in YYYY-MM-DD format
  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // ✨ NEW: Check if it's a new day and reset daily stats
  checkAndResetDailyStats(progressData) {
    const today = this.getTodayDateString();
    const lastStudyDate = progressData.overallStats.lastStudyDate;
    
    // If it's a new day, reset daily counters
    if (lastStudyDate !== today) {
      // Reset daily stats
      progressData.dailyStats = {
        date: today,
        questionsAttempted: 0,
        questionsCorrect: 0,
        timeSpent: 0,
        topicsStudied: new Set(),
        sessionsCompleted: 0
      };
      
      // Update study streak
      this.updateStudyStreak(progressData, today, lastStudyDate);
      
      // Update last study date
      progressData.overallStats.lastStudyDate = today;
      
      return true; // New day detected
    }
    
    return false; // Same day
  }

  // Initialize user progress with daily stats
  initializeProgress() {
    const existingData = this.getProgressData();
    if (!existingData) {
      const today = this.getTodayDateString();
      const initialData = {
        userId: generateId(),
        createdAt: new Date().toISOString(),
        topicProgress: {},
        
        // ✨ UPDATED: Enhanced overall stats
        overallStats: {
          totalQuestions: 0,
          totalCorrect: 0,
          averageAccuracy: 0,
          studyStreak: 0,
          lastStudyDate: null,
          totalTimeSpent: 0,
          accountCreated: today,
          maxDailyQuestions: 0,
          totalStudyDays: 0
        },
        
        // ✨ NEW: Daily stats tracking
        dailyStats: {
          date: today,
          questionsAttempted: 0,
          questionsCorrect: 0,
          timeSpent: 0,
          topicsStudied: new Set(),
          sessionsCompleted: 0
        },
        
        // ✨ NEW: Daily history for analytics
        dailyHistory: {},
        
        preferences: {
          dailyGoal: 20,
          reminderEnabled: true,
          soundEnabled: true
        }
      };
      this.saveProgressData(initialData);
      return initialData;
    }
    
    // Check existing data for daily reset
    this.checkAndResetDailyStats(existingData);
    return existingData;
  }

  // Get progress data using storage helper
  getProgressData() {
    return storage.get(this.STORAGE_KEY, null);
  }

  // Save progress data using storage helper
  saveProgressData(data) {
    // Convert Sets to Arrays for storage
    if (data.dailyStats && data.dailyStats.topicsStudied) {
      data.dailyStats.topicsStudied = Array.from(data.dailyStats.topicsStudied);
    }
    
    const saved = storage.set(this.STORAGE_KEY, data);
    
    // Convert Arrays back to Sets after storage
    if (data.dailyStats && Array.isArray(data.dailyStats.topicsStudied)) {
      data.dailyStats.topicsStudied = new Set(data.dailyStats.topicsStudied);
    }
    
    return saved;
  }

  // ✨ UPDATED: Record question attempt with daily tracking
  recordQuestionAttempt(topicId, topicName, isCorrect, timeSpent, questionType = 'multiple_choice') {
    const progressData = this.getProgressData() || this.initializeProgress();
    
    // ✨ Check for new day and reset if needed
    const isNewDay = this.checkAndResetDailyStats(progressData);
    
    // Initialize daily stats if missing
    if (!progressData.dailyStats) {
      progressData.dailyStats = {
        date: this.getTodayDateString(),
        questionsAttempted: 0,
        questionsCorrect: 0,
        timeSpent: 0,
        topicsStudied: new Set(),
        sessionsCompleted: 0
      };
    }
    
    // Convert topicsStudied array to Set if needed
    if (Array.isArray(progressData.dailyStats.topicsStudied)) {
      progressData.dailyStats.topicsStudied = new Set(progressData.dailyStats.topicsStudied);
    }
    
    // Initialize topic if doesn't exist
    if (!progressData.topicProgress[topicId]) {
      progressData.topicProgress[topicId] = {
        topicName: topicName,
        level: 1,
        questionsAttempted: 0,
        questionsCorrect: 0,
        accuracy: 0,
        averageTime: 0,
        totalTime: 0,
        lastAttempted: null,
        isUnlocked: true,
        levelUnlocked: [1],
        weaknessCount: 0,
        strengthCount: 0,
        recentAttempts: [],
        questionTypes: {},
        questionHistory: []
      };
    }

    const topic = progressData.topicProgress[topicId];
    
    // ✨ UPDATE: Both topic and daily stats
    
    // Update topic stats
    topic.questionsAttempted += 1;
    if (isCorrect) {
      topic.questionsCorrect += 1;
      topic.strengthCount += 1;
    } else {
      topic.weaknessCount += 1;
    }
    
    // Update topic accuracy and timing
    topic.accuracy = topic.questionsCorrect / topic.questionsAttempted;
    topic.totalTime += timeSpent;
    topic.averageTime = topic.totalTime / topic.questionsAttempted;
    topic.lastAttempted = new Date().toISOString();

    // ✨ UPDATE: Daily stats
    progressData.dailyStats.questionsAttempted += 1;
    if (isCorrect) {
      progressData.dailyStats.questionsCorrect += 1;
    }
    progressData.dailyStats.timeSpent += timeSpent;
    progressData.dailyStats.topicsStudied.add(topicId);

    // Track recent attempts (keep last 10)
    topic.recentAttempts = topic.recentAttempts || [];
    topic.recentAttempts.push({
      timestamp: new Date().toISOString(),
      isCorrect,
      timeSpent,
      questionType
    });
    if (topic.recentAttempts.length > 10) {
      topic.recentAttempts.shift();
    }

    // Store detailed question history for analysis
    topic.questionHistory = topic.questionHistory || [];
    topic.questionHistory.push({
      timestamp: new Date().toISOString(),
      isCorrect,
      timeSpent,
      questionType
    });
    
    if (topic.questionHistory.length > 50) {
      topic.questionHistory = topic.questionHistory.slice(-50);
    }

    // Track question type performance
    topic.questionTypes = topic.questionTypes || {};
    if (!topic.questionTypes[questionType]) {
      topic.questionTypes[questionType] = { correct: 0, total: 0 };
    }
    topic.questionTypes[questionType].total += 1;
    if (isCorrect) {
      topic.questionTypes[questionType].correct += 1;
    }

    // Update overall stats
    progressData.overallStats.totalQuestions += 1;
    progressData.overallStats.totalTimeSpent += timeSpent;
    if (isCorrect) {
      progressData.overallStats.totalCorrect += 1;
    }
    progressData.overallStats.averageAccuracy = 
      progressData.overallStats.totalCorrect / progressData.overallStats.totalQuestions;

    // ✨ UPDATE: Track max daily questions
    if (progressData.dailyStats.questionsAttempted > progressData.overallStats.maxDailyQuestions) {
      progressData.overallStats.maxDailyQuestions = progressData.dailyStats.questionsAttempted;
    }

    // Check for level progression
    const leveledUp = this.checkLevelProgression(topic);

    // ✨ SAVE: Daily history at end of day
    this.saveDailyHistory(progressData);

    // Save updated data
    this.saveProgressData(progressData);

    return {
      progressData,
      leveledUp,
      newLevel: topic.level,
      isNewDay // ✨ NEW: Return if it was a new day
    };
  }

  // ✨ NEW: Save daily history for analytics
  saveDailyHistory(progressData) {
    const today = this.getTodayDateString();
    
    if (!progressData.dailyHistory) {
      progressData.dailyHistory = {};
    }
    
    // Save current day's progress
    progressData.dailyHistory[today] = {
      questionsAttempted: progressData.dailyStats.questionsAttempted,
      questionsCorrect: progressData.dailyStats.questionsCorrect,
      accuracy: progressData.dailyStats.questionsAttempted > 0 
        ? progressData.dailyStats.questionsCorrect / progressData.dailyStats.questionsAttempted 
        : 0,
      timeSpent: progressData.dailyStats.timeSpent,
      topicsStudied: Array.from(progressData.dailyStats.topicsStudied || []),
      sessionsCompleted: progressData.dailyStats.sessionsCompleted
    };

    // Keep only last 30 days of history
    const historyKeys = Object.keys(progressData.dailyHistory).sort();
    if (historyKeys.length > 30) {
      const keysToRemove = historyKeys.slice(0, historyKeys.length - 30);
      keysToRemove.forEach(key => {
        delete progressData.dailyHistory[key];
      });
    }
  }

  // Enhanced level progression check
  checkLevelProgression(topicData) {
    const currentLevel = topicData.level;
    const nextLevel = currentLevel + 1;

    if (nextLevel <= 3 && !topicData.levelUnlocked.includes(nextLevel)) {
      const requirements = this.LEVEL_REQUIREMENTS[currentLevel];
      
      if (topicData.questionsAttempted >= requirements.questionsNeeded &&
          topicData.accuracy >= requirements.accuracyRequired) {
        
        topicData.levelUnlocked.push(nextLevel);
        topicData.level = nextLevel;
        
        this.recordAchievement('LEVEL_UP', {
          topicName: topicData.topicName,
          newLevel: nextLevel,
          timestamp: new Date().toISOString()
        });
        
        return true;
      }
    }
    return false;
  }

  // Record achievements
  recordAchievement(type, data) {
    const progressData = this.getProgressData();
    if (!progressData) return;

    progressData.achievements = progressData.achievements || [];
    progressData.achievements.push({
      id: generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
      seen: false
    });

    this.saveProgressData(progressData);
  }

  // ✨ UPDATED: Enhanced study streak with proper daily logic
  updateStudyStreak(progressData, today, lastStudyDate) {
    if (!lastStudyDate) {
      // First time studying
      progressData.overallStats.studyStreak = 1;
      progressData.overallStats.totalStudyDays = 1;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      if (lastStudyDate === yesterdayString) {
        // Consecutive day - increment streak
        progressData.overallStats.studyStreak += 1;
        progressData.overallStats.totalStudyDays += 1;
        
        // Check for streak milestones
        const streak = progressData.overallStats.studyStreak;
        if (streak % 7 === 0) {
          this.recordAchievement('STREAK_MILESTONE', {
            streak,
            timestamp: new Date().toISOString()
          });
        }
      } else if (lastStudyDate === today) {
        // Same day - don't change streak
        return;
      } else {
        // Streak broken - reset to 1
        progressData.overallStats.studyStreak = 1;
        progressData.overallStats.totalStudyDays += 1;
      }
    }
  }

  // ✨ NEW: Get today's daily stats
  getDailyStats() {
    const progressData = this.getProgressData();
    if (!progressData) return null;
    
    this.checkAndResetDailyStats(progressData);
    
    // Convert array back to Set if needed
    if (progressData.dailyStats && Array.isArray(progressData.dailyStats.topicsStudied)) {
      progressData.dailyStats.topicsStudied = new Set(progressData.dailyStats.topicsStudied);
    }
    
    return {
      ...progressData.dailyStats,
      accuracy: progressData.dailyStats.questionsAttempted > 0 
        ? progressData.dailyStats.questionsCorrect / progressData.dailyStats.questionsAttempted 
        : 0,
      topicsStudiedCount: progressData.dailyStats.topicsStudied?.size || 0
    };
  }

  // Get enhanced topic statistics
  getTopicStats(topicId) {
    const progressData = this.getProgressData();
    if (!progressData || !progressData.topicProgress[topicId]) {
      return null;
    }
    return progressData.topicProgress[topicId];
  }

  // Get all topics with enhanced sorting
  getAllTopicsStats(sortBy = 'lastAttempted', order = 'desc') {
    const progressData = this.getProgressData();
    if (!progressData) return {};
    
    const topics = progressData.topicProgress;
    
    const topicsArray = Object.entries(topics).map(([id, data]) => ({
      id,
      ...data
    }));
    
    topicsArray.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
    
    return topicsArray.reduce((acc, topic) => {
      const { id, ...data } = topic;
      acc[id] = data;
      return acc;
    }, {});
  }

  // ✨ UPDATED: Get overall stats with daily data
  getOverallStats() {
    const progressData = this.getProgressData();
    if (!progressData) return null;
    
    // Check and reset daily stats if needed
    this.checkAndResetDailyStats(progressData);
    
    const stats = progressData.overallStats;
    const dailyStats = this.getDailyStats();
    
    return {
      ...stats,
      // ✨ DAILY STATS
      dailyQuestions: dailyStats?.questionsAttempted || 0,
      dailyCorrect: dailyStats?.questionsCorrect || 0,
      dailyAccuracy: dailyStats?.accuracy || 0,
      dailyTimeSpent: dailyStats?.timeSpent || 0,
      dailyTopicsStudied: dailyStats?.topicsStudiedCount || 0,
      
      // OVERALL STATS
      totalQuestions: stats.totalQuestions || 0,
      averageTimePerQuestion: stats.totalQuestions > 0 
        ? Math.round(stats.totalTimeSpent / stats.totalQuestions) 
        : 0,
      topicsStarted: Object.keys(progressData.topicProgress || {}).length,
      totalLevelsUnlocked: Object.values(progressData.topicProgress || {})
        .reduce((sum, topic) => sum + topic.level, 0),
      motivationalMessage: getContextualMessage(stats),
      
      // ✨ STREAKS & MILESTONES
      maxDailyQuestions: stats.maxDailyQuestions || 0,
      totalStudyDays: stats.totalStudyDays || 0
    };
  }

  // Calculate user rank (existing method)
  calculateUserRank() {
    const detailedStats = this.getDetailedStats();
    const overallStats = this.getOverallStats();
    
    if (!detailedStats || detailedStats.totalQuestions === 0) {
      return {
        currentRank: 9999,
        totalUsers: 10000,
        rankCategory: "Beginner",
        percentile: 0
      };
    }

    const accuracy = detailedStats.accuracy;
    const totalQuestions = detailedStats.totalQuestions;
    const streak = overallStats?.studyStreak || 0;
    const topicsStarted = overallStats?.topicsStarted || 0;
    
    let performanceScore = 0;
    performanceScore += accuracy * 400;
    const questionScore = Math.min(totalQuestions / 10, 100);
    performanceScore += questionScore * 3;
    const streakScore = Math.min(streak / 2, 50);
    performanceScore += streakScore * 4;
    const topicScore = Math.min(topicsStarted * 10, 50);
    performanceScore += topicScore * 2;
    
    let rank, totalUsers, rankCategory, percentile;
    
    if (performanceScore >= 800) {
      rank = Math.floor(Math.random() * 100) + 1;
      totalUsers = 50000;
      rankCategory = "Elite JEEnius";
      percentile = 99;
    } else if (performanceScore >= 600) {
      rank = Math.floor(Math.random() * 500) + 100;
      totalUsers = 50000;
      rankCategory = "Advanced";
      percentile = 95;
    } else if (performanceScore >= 400) {
      rank = Math.floor(Math.random() * 2000) + 600;
      totalUsers = 50000;
      rankCategory = "Intermediate";
      percentile = 85;
    } else if (performanceScore >= 200) {
      rank = Math.floor(Math.random() * 5000) + 2600;
      totalUsers = 50000;
      rankCategory = "Developing";
      percentile = 70;
    } else {
      rank = Math.floor(Math.random() * 10000) + 7600;
      totalUsers = 50000;
      rankCategory = "Beginner";
      percentile = Math.max(50 - (totalQuestions * 2), 10);
    }
    
    const rankData = {
      currentRank: rank,
      totalUsers: totalUsers,
      rankCategory: rankCategory,
      percentile: percentile,
      performanceScore: Math.round(performanceScore),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userRankData', JSON.stringify(rankData));
    return rankData;
  }

  // Get detailed stats for dashboard
  getDetailedStats() {
    const progressData = this.getProgressData();
    if (!progressData) return {
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0,
      accuracy: 0,
      subjectStats: {
        Physics: { attempted: 0, correct: 0, time: 0 },
        Chemistry: { attempted: 0, correct: 0, time: 0 },
        Mathematics: { attempted: 0, correct: 0, time: 0 }
      }
    };

    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTime = 0;
    const subjectStats = {
      Physics: { attempted: 0, correct: 0, time: 0 },
      Chemistry: { attempted: 0, correct: 0, time: 0 },
      Mathematics: { attempted: 0, correct: 0, time: 0 }
    };

    Object.keys(progressData.topicProgress).forEach(topicId => {
      const topic = progressData.topicProgress[topicId];
      totalQuestions += topic.questionsAttempted || 0;
      totalCorrect += topic.questionsCorrect || 0;
      totalTime += topic.totalTime || 0;

      let subject = '';
      if (topicId.includes('physics')) subject = 'Physics';
      else if (topicId.includes('chemistry')) subject = 'Chemistry';  
      else if (topicId.includes('math')) subject = 'Mathematics';

      if (subject && subjectStats[subject]) {
        subjectStats[subject].attempted += topic.questionsAttempted || 0;
        subjectStats[subject].correct += topic.questionsCorrect || 0;
        subjectStats[subject].time += topic.totalTime || 0;
      }
    });

    return {
      totalQuestions,
      totalCorrect,
      totalTime,
      accuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
      subjectStats
    };
  }

  // Enhanced strength/weakness analysis
  getStrengthWeaknessAnalysis() {
    const topicsData = this.getAllTopicsStats();
    const analysis = {
      strengths: [],
      moderate: [],
      weaknesses: [],
      insights: []
    };

    Object.entries(topicsData).forEach(([topicId, data]) => {
      const accuracy = data.accuracy || 0;
      const topicInfo = {
        topicId,
        topicName: data.topicName,
        accuracy: Math.round(accuracy * 100),
        level: data.level,
        questionsAttempted: data.questionsAttempted,
        averageTime: Math.round(data.averageTime),
        recentTrend: this.getRecentTrend(data.recentAttempts)
      };

      if (accuracy >= ACCURACY_THRESHOLDS.STRENGTH) {
        analysis.strengths.push(topicInfo);
      } else if (accuracy >= ACCURACY_THRESHOLDS.MODERATE) {
        analysis.moderate.push(topicInfo);
      } else {
        analysis.weaknesses.push(topicInfo);
      }
    });

    analysis.insights = this.generateInsights(analysis);
    return analysis;
  }

  // Get recent performance trend
  getRecentTrend(recentAttempts) {
    if (!recentAttempts || recentAttempts.length < 3) return 'neutral';
    
    const recent5 = recentAttempts.slice(-5);
    const correctCount = recent5.filter(attempt => attempt.isCorrect).length;
    
    if (correctCount >= 4) return 'improving';
    if (correctCount <= 1) return 'declining';
    return 'stable';
  }

  // Generate performance insights
  generateInsights(analysis) {
    const insights = [];
    
    if (analysis.strengths.length > analysis.weaknesses.length) {
      insights.push({
        type: 'positive',
        message: `Great job! You have ${analysis.strengths.length} strong topics.`
      });
    }
    
    if (analysis.weaknesses.length > 0) {
      const focusArea = analysis.weaknesses[0];
      insights.push({
        type: 'action',
        message: `Focus on ${focusArea.topicName} to improve overall performance.`
      });
    }
    
    return insights;
  }

  // Get personalized recommendations
  getRecommendations() {
    const analysis = this.getStrengthWeaknessAnalysis();
    const recommendations = [];

    if (analysis.weaknesses.length > 0) {
      recommendations.push({
        type: 'weakness',
        topic: analysis.weaknesses[0],
        message: 'Focus on improving this weak area',
        priority: 'high'
      });
    }

    if (analysis.moderate.length > 0) {
      recommendations.push({
        type: 'moderate',
        topic: analysis.moderate[0],
        message: 'Build on this moderate strength',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Export progress data
  exportData() {
    const data = this.getProgressData();
    if (!data) return null;

    return {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import progress data
  importData(importedData) {
    try {
      if (!importedData.userId || !importedData.overallStats) {
        throw new Error('Invalid data format');
      }

      const existingData = this.getProgressData();
      const mergedData = {
        ...importedData,
        importedAt: new Date().toISOString(),
        previousUserId: existingData?.userId || null
      };

      this.saveProgressData(mergedData);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Reset progress with backup option
  resetProgress(createBackup = true) {
    const currentData = this.getProgressData();
    
    if (createBackup && currentData) {
      storage.set(`${this.STORAGE_KEY}_backup_${Date.now()}`, currentData);
    }
    
    storage.remove(this.STORAGE_KEY);
    return this.initializeProgress();
  }

  // Get achievements
  getAchievements(unseenOnly = false) {
    const progressData = this.getProgressData();
    if (!progressData || !progressData.achievements) return [];
    
    if (unseenOnly) {
      return progressData.achievements.filter(achievement => !achievement.seen);
    }
    
    return progressData.achievements;
  }

  // Mark achievements as seen
  markAchievementsSeen() {
    const progressData = this.getProgressData();
    if (!progressData || !progressData.achievements) return;

    progressData.achievements.forEach(achievement => {
      achievement.seen = true;
    });

    this.saveProgressData(progressData);
  }

  // ✨ NEW: Get weekly/monthly analytics
  getAnalytics(period = 'week') {
    const progressData = this.getProgressData();
    if (!progressData || !progressData.dailyHistory) return null;

    const today = new Date();
    const days = period === 'week' ? 7 : 30;
    const analytics = {
      labels: [],
      questionsData: [],
      accuracyData: [],
      timeData: []
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = progressData.dailyHistory[dateString];

      analytics.labels.push(formatDate(date, 'short'));
      analytics.questionsData.push(dayData?.questionsAttempted || 0);
      analytics.accuracyData.push(Math.round((dayData?.accuracy || 0) * 100));
      analytics.timeData.push(Math.round((dayData?.timeSpent || 0) / 60)); // Convert to minutes
    }

    return analytics;
  }
}

// Export singleton instance
const progressService = new ProgressService();
export default progressService;
