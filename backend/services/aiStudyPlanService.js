const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');

class AIStudyPlanService {
  
  // Calculate student's learning rate
  async calculateLearningRate(userId) {
    const attempts = await Quiz.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50);
    
    if (attempts.length < 5) return 0.5; // neutral
    
    let improvements = 0;
    for (let i = 5; i < attempts.length; i++) {
      const recent = attempts.slice(i - 5, i);
      const older = attempts.slice(Math.max(0, i - 10), i - 5);
      
      const recentAvg = recent.reduce((sum, a) => sum + (a.accuracy || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + (a.accuracy || 0), 0) / (older.length || 1);
      
      if (recentAvg > olderAvg) improvements++;
    }
    
    return Math.min(1, improvements / (attempts.length - 5));
  }
  
  // Calculate retention score based on time gaps
  async calculateRetentionScore(userId) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const recentQuizzes = await Quiz.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const olderQuizzes = await Quiz.find({
      userId,
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });
    
    if (recentQuizzes.length === 0) return 0.5;
    
    const recentAvg = recentQuizzes.reduce((sum, q) => sum + (q.accuracy || 0), 0) / recentQuizzes.length;
    const olderAvg = olderQuizzes.length > 0 
      ? olderQuizzes.reduce((sum, q) => sum + (q.accuracy || 0), 0) / olderQuizzes.length 
      : recentAvg;
    
    // If maintaining or improving, high retention
    return recentAvg >= olderAvg ? 0.8 : 0.4;
  }
  
  // Calculate consistency score
  async calculateConsistencyScore(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attempts = await Quiz.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    if (attempts.length < 5) return 0.3;
    
    // Check daily activity
    const daysActive = new Set(
      attempts.map(a => new Date(a.createdAt).toDateString())
    ).size;
    
    return Math.min(1, daysActive / 21); // Aim for 21 days/month
  }
  
  // Determine adaptive difficulty level
  determineAdaptiveLevel(accuracy, learningRate) {
    if (accuracy >= 85 && learningRate > 0.6) return 'advanced';
    if (accuracy >= 70 && learningRate > 0.4) return 'intermediate';
    return 'beginner';
  }
  
  // Generate AI-optimized study plan
  async generateSmartPlan(userId, performanceData) {
    const { subjectPerformance, topicStrengths, topicWeaknesses, averageAccuracy } = performanceData;
    
    // Calculate AI metrics
    const learningRate = await this.calculateLearningRate(userId);
    const retentionScore = await this.calculateRetentionScore(userId);
    const consistencyScore = await this.calculateConsistencyScore(userId);
    const adaptiveLevel = this.determineAdaptiveLevel(averageAccuracy, learningRate);
    
    const subjects = [];
    const recommendations = [];
    
    // Smart time allocation based on AI metrics
    const baseTimeMultiplier = consistencyScore > 0.7 ? 1.2 : 0.8;
    
    Object.entries(subjectPerformance).forEach(([subjectName, perf]) => {
      let priority = 'medium';
      let allocatedTime = 45;
      let focusStrategy = 'balanced';
      
      // AI-driven priority calculation
      const performanceGap = 100 - perf.accuracy;
      const urgencyScore = performanceGap * (1 - retentionScore);
      
      if (urgencyScore > 40) {
        priority = 'high';
        allocatedTime = Math.round(60 * baseTimeMultiplier);
        focusStrategy = 'intensive';
        
        recommendations.push({
          type: 'urgent',
          message: `${subjectName} needs immediate attention (${perf.accuracy.toFixed(1)}% accuracy)`,
          priority: 'high',
          action: `Dedicate ${allocatedTime} minutes daily with focused practice`
        });
      } else if (urgencyScore > 20) {
        priority = 'medium';
        allocatedTime = Math.round(45 * baseTimeMultiplier);
        focusStrategy = 'moderate';
      } else {
        priority = 'low';
        allocatedTime = Math.round(30 * baseTimeMultiplier);
        focusStrategy = 'maintenance';
      }
      
      // Generate smart topics based on adaptive level
      const topics = this.generateAdaptiveTopics(
        subjectName, 
        perf, 
        adaptiveLevel, 
        allocatedTime,
        learningRate
      );
      
      subjects.push({
        name: subjectName,
        allocatedTime,
        priority,
        topics,
        focusStrategy,
        aiInsight: this.generateSubjectInsight(perf, learningRate, retentionScore)
      });
    });
    
    // Add AI-powered recommendations
    if (learningRate < 0.3) {
      recommendations.push({
        type: 'learning_pace',
        message: 'Your learning pace can be improved with more regular practice',
        priority: 'medium',
        action: 'Try shorter, more frequent study sessions (20-30 mins)'
      });
    }
    
    if (retentionScore < 0.5) {
      recommendations.push({
        type: 'retention',
        message: 'Focus on revision to improve knowledge retention',
        priority: 'high',
        action: 'Review previously learned topics every 2-3 days'
      });
    }
    
    if (consistencyScore < 0.5) {
      recommendations.push({
        type: 'consistency',
        message: 'Build a consistent study routine for better results',
        priority: 'high',
        action: 'Set a fixed study time daily, even if just 15 minutes'
      });
    }
    
    // Calculate optimal total study time
    const totalStudyTime = subjects.reduce((sum, s) => sum + s.allocatedTime, 0);
    
    return {
      userId,
      date: new Date(),
      lastUpdated: new Date(),
      nextRefreshTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      planType: 'daily',
      subjects: subjects.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      performance: {
        overallAccuracy: averageAccuracy,
        strengths: topicStrengths,
        weaknesses: topicWeaknesses,
        improvementAreas: topicWeaknesses
      },
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      totalStudyTime,
      aiMetrics: {
        learningRate,
        retentionScore,
        consistencyScore,
        adaptiveLevel
      },
      studyGoals: this.generateSmartGoals(subjects, adaptiveLevel)
    };
  }
  
  // Generate adaptive topics based on student level
  generateAdaptiveTopics(subjectName, performance, level, totalTime, learningRate) {
    const topics = [];
    
    if (performance.accuracy < 60) {
      // Struggling - focus on fundamentals
      topics.push({
        name: `${subjectName} - Core Concepts Review`,
        duration: Math.round(totalTime * 0.4),
        difficulty: 'easy',
        reason: 'Build strong foundation',
        focusArea: 'weakness',
        aiRecommendation: 'Start with basics, use visual aids'
      });
      
      topics.push({
        name: `${subjectName} - Guided Practice`,
        duration: Math.round(totalTime * 0.4),
        difficulty: 'easy',
        reason: 'Step-by-step problem solving',
        focusArea: 'weakness',
        aiRecommendation: 'Follow worked examples first'
      });
      
      topics.push({
        name: `${subjectName} - Quick Recap`,
        duration: Math.round(totalTime * 0.2),
        difficulty: 'easy',
        reason: 'Reinforce learning',
        focusArea: 'revision',
        aiRecommendation: 'Review what you learned today'
      });
      
    } else if (performance.accuracy < 75) {
      // Moderate - balanced approach
      topics.push({
        name: `${subjectName} - Concept Strengthening`,
        duration: Math.round(totalTime * 0.3),
        difficulty: 'medium',
        reason: 'Fill knowledge gaps',
        focusArea: 'weakness',
        aiRecommendation: 'Focus on commonly mistaken concepts'
      });
      
      topics.push({
        name: `${subjectName} - Mixed Practice`,
        duration: Math.round(totalTime * 0.5),
        difficulty: 'medium',
        reason: 'Build confidence and speed',
        focusArea: 'revision',
        aiRecommendation: 'Vary problem types for better retention'
      });
      
      topics.push({
        name: `${subjectName} - Challenge Questions`,
        duration: Math.round(totalTime * 0.2),
        difficulty: 'hard',
        reason: 'Push your limits',
        focusArea: 'strength',
        aiRecommendation: 'Attempt without help first'
      });
      
    } else {
      // Strong - advanced focus
      topics.push({
        name: `${subjectName} - Quick Warm-up`,
        duration: Math.round(totalTime * 0.2),
        difficulty: 'medium',
        reason: 'Stay sharp',
        focusArea: 'revision',
        aiRecommendation: 'Speed practice for accuracy'
      });
      
      topics.push({
        name: `${subjectName} - Advanced Concepts`,
        duration: Math.round(totalTime * 0.5),
        difficulty: 'hard',
        reason: 'Master complex topics',
        focusArea: 'strength',
        aiRecommendation: 'Explore edge cases and variations'
      });
      
      topics.push({
        name: `${subjectName} - Competitive Level`,
        duration: Math.round(totalTime * 0.3),
        difficulty: 'hard',
        reason: 'Excel beyond syllabus',
        focusArea: 'strength',
        aiRecommendation: 'Try olympiad-style problems'
      });
    }
    
    return topics;
  }
  
  // Generate subject-specific insights
  generateSubjectInsight(performance, learningRate, retentionScore) {
    if (performance.accuracy >= 85) {
      return `Excellent mastery! ${learningRate > 0.6 ? 'Rapid progress' : 'Maintain momentum'}`;
    } else if (performance.accuracy >= 70) {
      return `Good foundation. ${retentionScore < 0.5 ? 'Focus on retention' : 'Keep practicing'}`;
    } else {
      return `Needs attention. ${learningRate < 0.3 ? 'Consider different learning methods' : 'Consistent practice will help'}`;
    }
  }
  
  // Generate smart daily goals
  generateSmartGoals(subjects, adaptiveLevel) {
    const goals = [];
    
    const highPriorityCount = subjects.filter(s => s.priority === 'high').length;
    
    if (highPriorityCount > 0) {
      goals.push({
        goal: `Complete ${highPriorityCount} high-priority subject${highPriorityCount > 1 ? 's' : ''}`,
        targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        progress: 0,
        aiReason: 'These subjects need immediate improvement'
      });
    }
    
    const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
    const targetTopics = adaptiveLevel === 'advanced' ? totalTopics : Math.ceil(totalTopics * 0.7);
    
    goals.push({
      goal: `Complete ${targetTopics} out of ${totalTopics} topics`,
      targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      aiReason: `Tailored to your ${adaptiveLevel} level`
    });
    
    return goals;
  }
}

module.exports = new AIStudyPlanService();
