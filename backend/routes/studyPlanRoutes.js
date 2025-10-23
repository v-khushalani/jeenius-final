const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const Quiz = require('../models/Quiz');
const { authMiddleware } = require('../middleware/auth');
const aiStudyPlanService = require('../services/aiStudyPlanService');

// Generate AI Study Plan
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const performanceData = await getUserPerformance(userId);
    const studyPlan = await aiStudyPlanService.generateSmartPlan(userId, performanceData);
    
    const newPlan = new StudyPlan(studyPlan);
    await newPlan.save();
    
    res.json({ success: true, studyPlan: newPlan });
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// Get current study plan with auto-refresh
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    let studyPlan = await StudyPlan.findOne({ userId })
      .sort({ lastUpdated: -1 });
    
    // Auto-refresh if plan doesn't exist or is older than 24 hours
    if (!studyPlan || now >= studyPlan.nextRefreshTime) {
      console.log('Generating fresh AI study plan...');
      const performanceData = await getUserPerformance(userId);
      const planData = await aiStudyPlanService.generateSmartPlan(userId, performanceData);
      studyPlan = new StudyPlan(planData);
      await studyPlan.save();
    }
    
    res.json({ 
      success: true, 
      studyPlan,
      refreshesIn: Math.max(0, studyPlan.nextRefreshTime - now) / (1000 * 60), // minutes
      autoRefreshEnabled: true
    });
  } catch (error) {
    console.error('Error fetching study plan:', error);
    res.status(500).json({ error: 'Failed to fetch study plan' });
  }
});

// Force refresh study plan
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const performanceData = await getUserPerformance(userId);
    const planData = await aiStudyPlanService.generateSmartPlan(userId, performanceData);
    
    const studyPlan = new StudyPlan(planData);
    await studyPlan.save();
    
    res.json({ success: true, studyPlan, message: 'Study plan refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing study plan:', error);
    res.status(500).json({ error: 'Failed to refresh study plan' });
  }
});

// Update topic completion
router.put('/complete-topic', authMiddleware, async (req, res) => {
  try {
    const { planId, subjectIndex, topicIndex } = req.body;
    
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }
    
    if (plan.subjects[subjectIndex] && plan.subjects[subjectIndex].topics[topicIndex]) {
      plan.subjects[subjectIndex].topics[topicIndex].completed = true;
      plan.subjects[subjectIndex].topics[topicIndex].completedAt = new Date();
    }
    
    // Calculate overall completion
    let totalTopics = 0;
    let completedTopics = 0;
    
    plan.subjects.forEach(subject => {
      totalTopics += subject.topics.length;
      completedTopics += subject.topics.filter(t => t.completed).length;
    });
    
    plan.completionStatus = Math.round((completedTopics / totalTopics) * 100);
    
    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Get AI metrics
router.get('/ai-metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const learningRate = await aiStudyPlanService.calculateLearningRate(userId);
    const retentionScore = await aiStudyPlanService.calculateRetentionScore(userId);
    const consistencyScore = await aiStudyPlanService.calculateConsistencyScore(userId);
    
    res.json({
      success: true,
      metrics: {
        learningRate: (learningRate * 100).toFixed(1),
        retentionScore: (retentionScore * 100).toFixed(1),
        consistencyScore: (consistencyScore * 100).toFixed(1),
        overallScore: ((learningRate + retentionScore + consistencyScore) / 3 * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    res.status(500).json({ error: 'Failed to fetch AI metrics' });
  }
});

// Helper function - getUserPerformance (same as before but with enhancements)
async function getUserPerformance(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const quizResults = await Quiz.find({
    userId,
    createdAt: { $gte: sevenDaysAgo }
  }).select('score totalQuestions subject topics accuracy timeSpent');
  
  const subjectPerformance = {};
  const topicStrengths = [];
  const topicWeaknesses = [];
  let totalAccuracy = 0;
  let quizCount = 0;
  
  quizResults.forEach(quiz => {
    if (!subjectPerformance[quiz.subject]) {
      subjectPerformance[quiz.subject] = {
        totalScore: 0,
        totalQuestions: 0,
        quizCount: 0,
        topics: {},
        accuracy: 0
      };
    }
    
    subjectPerformance[quiz.subject].totalScore += quiz.score;
    subjectPerformance[quiz.subject].totalQuestions += quiz.totalQuestions;
    subjectPerformance[quiz.subject].quizCount++;
    
    if (quiz.accuracy) {
      totalAccuracy += quiz.accuracy;
      quizCount++;
    }
  });
  
  Object.keys(subjectPerformance).forEach(subject => {
    const perf = subjectPerformance[subject];
    perf.accuracy = perf.totalQuestions > 0 
      ? (perf.totalScore / perf.totalQuestions) * 100 
      : 0;
    
    if (perf.accuracy >= 80) {
      topicStrengths.push(subject);
    } else if (perf.accuracy < 60) {
      topicWeaknesses.push(subject);
    }
  });
  
  return {
    subjectPerformance,
    topicStrengths,
    topicWeaknesses,
    averageAccuracy: quizCount > 0 ? totalAccuracy / quizCount : 0,
    totalQuizzes: quizResults.length
  };
}

module.exports = router;
