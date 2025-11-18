// services/analyticsService.js - Advanced Analytics Engine

import progressService from './progressService';
import { formatDate, getDateRange, calculateAverage, groupBy } from '../utils/helpers';
import { CHART_COLORS, TIME_RANGES, CHART_TYPES } from '../utils/constants';

class AnalyticsService {
  constructor() {
    this.progressService = progressService;
  }

  // Get comprehensive performance analytics
  getPerformanceAnalytics(timeRange = TIME_RANGES.WEEK) {
    const progressData = this.progressService.getProgressData();
    if (!progressData) return null;

    const overallStats = this.progressService.getOverallStats();
    const topicsData = this.progressService.getAllTopicsStats();
    
    return {
      overview: {
        totalQuestions: overallStats.totalQuestions,
        averageAccuracy: overallStats.averageAccuracy,
        studyStreak: overallStats.studyStreak,
        totalTimeSpent: overallStats.totalTimeSpent,
        topicsStarted: overallStats.topicsStarted
      },
      trends: this.getPerformanceTrends(progressData, timeRange),
      topicBreakdown: this.getTopicBreakdown(topicsData),
      difficultyAnalysis: this.getDifficultyAnalysis(topicsData),
      timeAnalysis: this.getTimeAnalysis(progressData),
      streakAnalysis: this.getStreakAnalysis(progressData)
    };
  }

  // Get performance trends over time
  getPerformanceTrends(progressData, timeRange) {
    const days = timeRange === TIME_RANGES.WEEK ? 7 : 
                timeRange === TIME_RANGES.MONTH ? 30 : 90;
    
    const dates = getDateRange(days);
    const trendsData = dates.map(date => {
      const dateStr = date.toDateString();
      const dayData = this.getDayData(progressData, dateStr);
      
      return {
        date: formatDate(date, 'short'),
        fullDate: dateStr,
        questionsAttempted: dayData.questionsAttempted,
        questionsCorrect: dayData.questionsCorrect,
        accuracy: dayData.questionsAttempted > 0 ? dayData.questionsCorrect / dayData.questionsAttempted : 0,
        timeSpent: dayData.timeSpent,
        averageTimePerQuestion: dayData.questionsAttempted > 0 ? dayData.timeSpent / dayData.questionsAttempted : 0,
        topicsStudied: dayData.topicsStudied,
        levelsUnlocked: dayData.levelsUnlocked
      };
    });

    return {
      daily: trendsData,
      summary: this.getTrendsSummary(trendsData),
      insights: this.generateTrendsInsights(trendsData)
    };
  }

  // Get data for a specific day
  getDayData(progressData, dateStr) {
    const data = {
      questionsAttempted: 0,
      questionsCorrect: 0,
      timeSpent: 0,
      topicsStudied: new Set(),
      levelsUnlocked: 0
    };

    Object.values(progressData.topicProgress).forEach(topic => {
      if (topic.recentAttempts) {
        topic.recentAttempts.forEach(attempt => {
          const attemptDate = new Date(attempt.timestamp).toDateString();
          if (attemptDate === dateStr) {
            data.questionsAttempted++;
            if (attempt.isCorrect) data.questionsCorrect++;
            data.timeSpent += attempt.timeSpent;
            data.topicsStudied.add(topic.topicName);
          }
        });
      }
    });

    // Check for level unlocks on this day
    if (progressData.achievements) {
      progressData.achievements.forEach(achievement => {
        const achievementDate = new Date(achievement.timestamp).toDateString();
        if (achievementDate === dateStr && achievement.type === 'LEVEL_UP') {
          data.levelsUnlocked++;
        }
      });
    }

    data.topicsStudied = data.topicsStudied.size;
    return data;
  }

  // Get trends summary
  getTrendsSummary(trendsData) {
    const totalQuestions = trendsData.reduce((sum, day) => sum + day.questionsAttempted, 0);
    const totalCorrect = trendsData.reduce((sum, day) => sum + day.questionsCorrect, 0);
    const totalTime = trendsData.reduce((sum, day) => sum + day.timeSpent, 0);
    
    const activeDays = trendsData.filter(day => day.questionsAttempted > 0).length;
    const avgQuestionsPerActiveDay = activeDays > 0 ? totalQuestions / activeDays : 0;
    const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

    return {
      totalQuestions,
      totalCorrect,
      totalTime,
      activeDays,
      avgQuestionsPerActiveDay: Math.round(avgQuestionsPerActiveDay),
      overallAccuracy,
      avgTimePerQuestion: totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0,
      mostProductiveDay: this.getMostProductiveDay(trendsData),
      bestAccuracyDay: this.getBestAccuracyDay(trendsData)
    };
  }

  // Generate insights from trends
  generateTrendsInsights(trendsData) {
    const insights = [];
    
    // Consistency analysis
    const activeDays = trendsData.filter(day => day.questionsAttempted > 0).length;
    const totalDays = trendsData.length;
    const consistencyRate = activeDays / totalDays;
    
    if (consistencyRate >= 0.8) {
      insights.push({
        type: 'positive',
        title: 'Excellent Consistency!',
        message: `You've been active ${activeDays} out of ${totalDays} days. Keep it up!`,
        icon: '🔥'
      });
    } else if (consistencyRate >= 0.5) {
      insights.push({
        type: 'neutral',
        title: 'Good Progress',
        message: `Active ${activeDays} days. Try to study more regularly for better results.`,
        icon: '📈'
      });
    } else {
      insights.push({
        type: 'improvement',
        title: 'Build Consistency',
        message: `Only ${activeDays} active days. Regular practice will boost your performance!`,
        icon: '💪'
      });
    }

    // Performance trend analysis
    const recentDays = trendsData.slice(-3);
    const earlierDays = trendsData.slice(0, 3);
    
    const recentAccuracy = calculateAverage(recentDays.map(d => d.accuracy));
    const earlierAccuracy = calculateAverage(earlierDays.map(d => d.accuracy));
    
    if (recentAccuracy > earlierAccuracy + 0.1) {
      insights.push({
        type: 'positive',
        title: 'Improving Performance!',
        message: 'Your accuracy has improved significantly in recent days.',
        icon: '📊'
      });
    } else if (recentAccuracy < earlierAccuracy - 0.1) {
      insights.push({
        type: 'warning',
        title: 'Performance Dip',
        message: 'Your recent accuracy has declined. Review your weak areas.',
        icon: '⚠️'
      });
    }

    return insights;
  }

  // Get most productive day
  getMostProductiveDay(trendsData) {
    return trendsData.reduce((best, current) => 
      current.questionsAttempted > best.questionsAttempted ? current : best
    );
  }

  // Get best accuracy day
  getBestAccuracyDay(trendsData) {
    const activeDays = trendsData.filter(day => day.questionsAttempted > 0);
    if (activeDays.length === 0) return null;
    
    return activeDays.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }

  // Get topic breakdown analysis
  getTopicBreakdown(topicsData) {
    const topics = Object.entries(topicsData).map(([id, data]) => ({
      id,
      name: data.topicName,
      level: data.level,
      questionsAttempted: data.questionsAttempted,
      accuracy: data.accuracy,
      averageTime: data.averageTime,
      lastAttempted: data.lastAttempted,
      status: this.getTopicStatus(data),
      progress: this.calculateTopicProgress(data),
      recommendation: this.getTopicRecommendation(data)
    }));

    return {
      topics: topics.sort((a, b) => b.questionsAttempted - a.questionsAttempted),
      summary: {
        totalTopics: topics.length,
        mastered: topics.filter(t => t.status === 'mastered').length,
        learning: topics.filter(t => t.status === 'learning').length,
        struggling: topics.filter(t => t.status === 'struggling').length,
        notStarted: topics.filter(t => t.status === 'not_started').length
      }
    };
  }

  // Get topic status
  getTopicStatus(topicData) {
    if (topicData.questionsAttempted === 0) return 'not_started';
    if (topicData.accuracy >= 0.8 && topicData.level >= 3) return 'mastered';
    if (topicData.accuracy < 0.5) return 'struggling';
    return 'learning';
  }

  // Calculate topic progress percentage
  calculateTopicProgress(topicData) {
    const levelProgress = (topicData.level - 1) * 33.33; // Each level is ~33% of total progress
    const currentLevelProgress = Math.min(topicData.accuracy * 33.33, 33.33);
    return Math.round(levelProgress + currentLevelProgress);
  }

  // Get topic recommendation
  getTopicRecommendation(topicData) {
    const status = this.getTopicStatus(topicData);
    
    switch (status) {
      case 'mastered':
        return 'Excellent! You\'ve mastered this topic. Consider teaching others!';
      case 'learning':
        return `Good progress! Keep practicing to reach ${Math.round((1 - topicData.accuracy) * 100)}% higher accuracy.`;
      case 'struggling':
        return 'Focus here! Review basics and practice more questions.';
      case 'not_started':
        return 'Start here! Begin with basic questions to build foundation.';
      default:
        return 'Keep practicing!';
    }
  }

  // Get difficulty analysis
  getDifficultyAnalysis(topicsData) {
    const analysis = {
      easy: { correct: 0, total: 0, topics: [] },
      medium: { correct: 0, total: 0, topics: [] },
      hard: { correct: 0, total: 0, topics: [] }
    };

    Object.entries(topicsData).forEach(([id, data]) => {
      // Categorize based on level and performance
      let difficulty = 'easy';
      if (data.level >= 2) difficulty = 'medium';
      if (data.level >= 3) difficulty = 'hard';

      analysis[difficulty].correct += data.questionsCorrect;
      analysis[difficulty].total += data.questionsAttempted;
      analysis[difficulty].topics.push({
        id,
        name: data.topicName,
        accuracy: data.accuracy
      });
    });

    // Calculate accuracies
    Object.keys(analysis).forEach(difficulty => {
      const data = analysis[difficulty];
      data.accuracy = data.total > 0 ? data.correct / data.total : 0;
      data.percentage = Math.round(data.accuracy * 100);
    });

    return analysis;
  }

  // Get time analysis
  getTimeAnalysis(progressData) {
    const overallStats = progressData.overallStats;
    const topics = Object.values(progressData.topicProgress);
    
    return {
      totalTime: overallStats.totalTimeSpent,
      averageTimePerQuestion: overallStats.averageTimePerQuestion,
      fastestTopic: this.getFastestTopic(topics),
      slowestTopic: this.getSlowestTopic(topics),
      timeDistribution: this.getTimeDistribution(topics),
      efficiency: this.calculateEfficiency(overallStats)
    };
  }

  // Get fastest topic
  getFastestTopic(topics) {
    const validTopics = topics.filter(t => t.questionsAttempted > 0);
    if (validTopics.length === 0) return null;
    
    return validTopics.reduce((fastest, current) => 
      current.averageTime < fastest.averageTime ? current : fastest
    );
  }

  // Get slowest topic
  getSlowestTopic(topics) {
    const validTopics = topics.filter(t => t.questionsAttempted > 0);
    if (validTopics.length === 0) return null;
    
    return validTopics.reduce((slowest, current) => 
      current.averageTime > slowest.averageTime ? current : slowest
    );
  }

  // Get time distribution across topics
  getTimeDistribution(topics) {
    return topics
      .filter(topic => topic.questionsAttempted > 0)
      .map(topic => ({
        name: topic.topicName,
        timeSpent: topic.totalTime,
        percentage: 0 // Will be calculated after getting total
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent);
  }

  // Calculate study efficiency
  calculateEfficiency(overallStats) {
    if (overallStats.totalQuestions === 0) return 0;
    
    // Efficiency = (Accuracy * Questions per hour)
    const questionsPerHour = overallStats.totalTimeSpent > 0 
      ? (overallStats.totalQuestions * 3600) / overallStats.totalTimeSpent 
      : 0;
    
    return overallStats.averageAccuracy * questionsPerHour;
  }

  // Get streak analysis
  getStreakAnalysis(progressData) {
    const currentStreak = progressData.overallStats.studyStreak;
    const achievements = progressData.achievements || [];
    
    const streakMilestones = achievements.filter(a => a.type === 'STREAK_MILESTONE');
    const longestStreak = streakMilestones.length > 0 
      ? Math.max(...streakMilestones.map(m => m.data.streak))
      : currentStreak;

    return {
      currentStreak,
      longestStreak,
      streakMilestones: streakMilestones.length,
      nextMilestone: this.getNextStreakMilestone(currentStreak),
      streakHealth: this.getStreakHealth(currentStreak),
      recommendation: this.getStreakRecommendation(currentStreak)
    };
  }

  // Get next streak milestone
  getNextStreakMilestone(currentStreak) {
    const milestones = [7, 14, 30, 50, 100];
    return milestones.find(milestone => milestone > currentStreak) || currentStreak + 50;
  }

  // Get streak health assessment
  getStreakHealth(streak) {
    if (streak >= 30) return { status: 'excellent', message: 'Amazing dedication!' };
    if (streak >= 14) return { status: 'good', message: 'Great consistency!' };
    if (streak >= 7) return { status: 'fair', message: 'Good start!' };
    return { status: 'poor', message: 'Build consistency' };
  }

  // Get streak recommendation
  getStreakRecommendation(streak) {
    if (streak === 0) return 'Start your learning journey today!';
    if (streak < 7) return 'Try to study daily to build a strong habit.';
    if (streak < 30) return 'You\'re building great momentum! Keep it up!';
    return 'Incredible dedication! You\'re a learning machine!';
  }

  // Generate comprehensive insights
  generateComprehensiveInsights() {
    const analytics = this.getPerformanceAnalytics();
    if (!analytics) return [];

    const insights = [];
    
    // Add trend insights
    insights.push(...analytics.trends.insights);
    
    // Add topic insights
    const topicSummary = analytics.topicBreakdown.summary;
    if (topicSummary.struggling > 0) {
      insights.push({
        type: 'warning',
        title: 'Focus Areas Detected',
        message: `You have ${topicSummary.struggling} topics that need attention.`,
        icon: '🎯'
      });
    }

    // Add efficiency insights
    const efficiency = analytics.timeAnalysis.efficiency;
    if (efficiency > 50) {
      insights.push({
        type: 'positive',
        title: 'High Efficiency!',
        message: 'You\'re learning at an excellent pace with good accuracy.',
        icon: '⚡'
      });
    }

    return insights;
  }

  // Export analytics data
  exportAnalyticsData() {
    const analytics = this.getPerformanceAnalytics();
    return {
      ...analytics,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
