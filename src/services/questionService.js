// services/questionService.js - Smart Question Management & Generation

import progressService from './progressService';
import { generateId } from '../utils/helpers';
import { QUESTION_TYPES } from '../utils/constants';

class QuestionService {
  constructor() {
    this.progressService = progressService;
    this.questionBank = new Map(); // Topic ID -> Questions
    this.userAnswers = new Map(); // Question ID -> User's answer history
  }

  // Initialize question bank with default questions
  initializeQuestionBank() {
    // This will be populated from external sources or databases
    // For now, using the inline question database from StudyNowPage
  }

  // Add questions to a topic
  addQuestionsToTopic(topicId, questions) {
    if (!this.questionBank.has(topicId)) {
      this.questionBank.set(topicId, []);
    }
    
    const topicQuestions = this.questionBank.get(topicId);
    questions.forEach(question => {
      // Ensure each question has a unique ID
      if (!question.id) {
        question.id = generateId();
      }
      topicQuestions.push(question);
    });
  }

  // Get questions for a topic with adaptive selection
  getAdaptiveQuestions(topicId, count = 10, options = {}) {
    const {
      level = null,
      difficulty = null,
      excludeAnswered = false,
      prioritizeWeak = false
    } = options;

    const topicStats = this.progressService.getTopicStats(topicId);
    const currentLevel = topicStats?.level || 1;
    const accuracy = topicStats?.accuracy || 0;
    
    // Get all available questions for topic
    const allQuestions = this.getTopicQuestions(topicId);
    if (allQuestions.length === 0) return [];

    let candidateQuestions = [...allQuestions];

    // Apply level filtering
    const targetLevel = level || this.determineTargetLevel(currentLevel, accuracy);
    candidateQuestions = this.filterByLevel(candidateQuestions, targetLevel, accuracy);

    // Apply difficulty filtering if specified
    if (difficulty) {
      candidateQuestions = candidateQuestions.filter(q => q.difficulty === difficulty);
    }

    // Exclude previously answered questions if requested
    if (excludeAnswered) {
      candidateQuestions = this.filterOutAnswered(candidateQuestions, topicId);
    }

    // Prioritize weak areas if requested
    if (prioritizeWeak) {
      candidateQuestions = this.prioritizeWeakQuestions(candidateQuestions, topicId);
    }

    // Smart shuffle and select
    const selectedQuestions = this.smartShuffle(candidateQuestions, count);
    
    return selectedQuestions.slice(0, count);
  }

  // Get all questions for a topic (from external database or local storage)
  getTopicQuestions(topicId) {
    // In a real application, this would fetch from a database
    // For now, return empty array - questions are managed in StudyNowPage component
    return this.questionBank.get(topicId) || [];
  }

  // Determine target level based on current performance
  determineTargetLevel(currentLevel, accuracy) {
    if (currentLevel === 1) {
      return 1; // Stick to level 1 until mastered
    } else if (currentLevel === 2) {
      if (accuracy >= 0.8) {
        return 3; // Ready for level 3 challenges
      } else if (accuracy < 0.6) {
        return 1; // Need to reinforce level 1
      } else {
        return 2; // Continue with level 2
      }
    } else if (currentLevel === 3) {
      if (accuracy < 0.7) {
        return 2; // Step back to level 2
      } else {
        return 3; // Continue with level 3
      }
    }
    return currentLevel;
  }

  // Filter questions by level with smart mixing
  filterByLevel(questions, targetLevel, accuracy) {
    const levelQuestions = {
      1: questions.filter(q => this.getQuestionLevel(q) === 1),
      2: questions.filter(q => this.getQuestionLevel(q) === 2),
      3: questions.filter(q => this.getQuestionLevel(q) === 3)
    };

    let result = [];

    if (targetLevel === 1) {
      result = [...levelQuestions[1]];
    } else if (targetLevel === 2) {
      // Mix level 1 and 2 based on accuracy
      const level1Ratio = accuracy < 0.7 ? 0.3 : 0.1; // 30% level 1 if struggling
      const level1Count = Math.floor(levelQuestions[1].length * level1Ratio);
      
      result = [
        ...levelQuestions[1].slice(0, level1Count),
        ...levelQuestions[2]
      ];
    } else if (targetLevel === 3) {
      // Mix level 2 and 3
      const level2Ratio = accuracy < 0.8 ? 0.4 : 0.2; // More level 2 if not confident
      const level2Count = Math.floor(levelQuestions[2].length * level2Ratio);
      
      result = [
        ...levelQuestions[2].slice(0, level2Count),
        ...levelQuestions[3]
      ];
    }

    return result;
  }

  // Get question level from question metadata
  getQuestionLevel(question) {
    // Determine level from difficulty or tags
    if (question.level) return question.level;
    
    switch (question.difficulty?.toLowerCase()) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
    }
  }

  // Filter out previously answered questions
  filterOutAnswered(questions, topicId) {
    const answeredQuestions = this.getAnsweredQuestions(topicId);
    const answeredIds = new Set(answeredQuestions.map(q => q.questionId));
    
    return questions.filter(q => !answeredIds.has(q.id));
  }

  // Get questions user has already answered for a topic
  getAnsweredQuestions(topicId) {
    const topicStats = this.progressService.getTopicStats(topicId);
    if (!topicStats || !topicStats.recentAttempts) return [];
    
    return topicStats.recentAttempts.map(attempt => ({
      questionId: attempt.questionId,
      isCorrect: attempt.isCorrect,
      timestamp: attempt.timestamp
    }));
  }

  // Prioritize questions from weak areas
  prioritizeWeakQuestions(questions, topicId) {
    const weakTags = this.getWeakTags(topicId);
    
    // Sort questions by whether they cover weak areas
    return questions.sort((a, b) => {
      const aHasWeakTag = a.tags?.some(tag => weakTags.includes(tag));
      const bHasWeakTag = b.tags?.some(tag => weakTags.includes(tag));
      
      if (aHasWeakTag && !bHasWeakTag) return -1;
      if (!aHasWeakTag && bHasWeakTag) return 1;
      return 0;
    });
  }

  // Get tags/concepts where user is struggling
  getWeakTags(topicId) {
    // This would analyze user's wrong answers to identify weak concepts
    // For now, return empty array - can be enhanced with ML analysis
    return [];
  }

  // Smart shuffle that ensures good distribution
  smartShuffle(questions, count) {
    if (questions.length <= count) return questions;
    
    // Group questions by difficulty/level
    const groups = {
      easy: questions.filter(q => q.difficulty === 'easy'),
      medium: questions.filter(q => q.difficulty === 'medium'),
      hard: questions.filter(q => q.difficulty === 'hard')
    };
    
    // Ensure balanced distribution
    const selectedQuestions = [];
    const targetDistribution = {
      easy: Math.ceil(count * 0.4),    // 40% easy
      medium: Math.ceil(count * 0.4),  // 40% medium  
      hard: Math.ceil(count * 0.2)     // 20% hard
    };
    
    Object.entries(targetDistribution).forEach(([difficulty, targetCount]) => {
      const availableQuestions = groups[difficulty] || [];
      const shuffled = this.shuffleArray([...availableQuestions]);
      selectedQuestions.push(...shuffled.slice(0, Math.min(targetCount, availableQuestions.length)));
    });
    
    // Fill remaining slots if needed
    const remaining = count - selectedQuestions.length;
    if (remaining > 0) {
      const allRemaining = questions.filter(q => !selectedQuestions.some(s => s.id === q.id));
      const shuffledRemaining = this.shuffleArray(allRemaining);
      selectedQuestions.push(...shuffledRemaining.slice(0, remaining));
    }
    
    // Final shuffle to mix difficulties
    return this.shuffleArray(selectedQuestions);
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Record user's answer to a question
  recordAnswer(questionId, topicId, selectedAnswer, correctAnswer, timeSpent) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Store in user answers map
    if (!this.userAnswers.has(questionId)) {
      this.userAnswers.set(questionId, []);
    }
    
    const answerHistory = this.userAnswers.get(questionId);
    answerHistory.push({
      topicId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString()
    });
    
    // Also record in progress service
    return this.progressService.recordQuestionAttempt(
      topicId,
      this.getTopicName(topicId),
      isCorrect,
      timeSpent,
      QUESTION_TYPES.MULTIPLE_CHOICE
    );
  }

  // Get topic name (would typically come from database)
  getTopicName(topicId) {
    const topicNames = {
      'physics-mechanics': 'Mechanics & Motion',
      'chemistry-atomic': 'Atomic Structure',
      'math-algebra': 'Algebra & Equations'
    };
    return topicNames[topicId] || 'Unknown Topic';
  }

  // Get question statistics
  getQuestionStats(questionId) {
    const answerHistory = this.userAnswers.get(questionId) || [];
    
    if (answerHistory.length === 0) {
      return {
        attempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        averageTime: 0,
        lastAttempted: null
      };
    }
    
    const correctAttempts = answerHistory.filter(a => a.isCorrect).length;
    const totalTime = answerHistory.reduce((sum, a) => sum + a.timeSpent, 0);
    
    return {
      attempts: answerHistory.length,
      correctAttempts,
      accuracy: correctAttempts / answerHistory.length,
      averageTime: Math.round(totalTime / answerHistory.length),
      lastAttempted: answerHistory[answerHistory.length - 1].timestamp,
      improvementTrend: this.calculateImprovementTrend(answerHistory)
    };
  }

  // Calculate if user is improving on a specific question
  calculateImprovementTrend(answerHistory) {
    if (answerHistory.length < 3) return 'insufficient_data';
    
    const recent = answerHistory.slice(-3);
    const earlier = answerHistory.slice(0, 3);
    
    const recentCorrect = recent.filter(a => a.isCorrect).length;
    const earlierCorrect = earlier.filter(a => a.isCorrect).length;
    
    if (recentCorrect > earlierCorrect) return 'improving';
    if (recentCorrect < earlierCorrect) return 'declining';
    return 'stable';
  }

  // Get recommended questions for review
  getReviewQuestions(topicId, count = 5) {
    const answeredQuestions = this.getAnsweredQuestions(topicId);
    
    // Find questions that were answered incorrectly or slowly
    const reviewCandidates = answeredQuestions.filter(answer => {
      const stats = this.getQuestionStats(answer.questionId);
      return !answer.isCorrect || stats.averageTime > 60; // Wrong or took >60 seconds
    });
    
    // Sort by priority (recent wrong answers first)
    reviewCandidates.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return bTime - aTime;
    });
    
    return reviewCandidates.slice(0, count);
  }

  // Generate practice session
  generatePracticeSession(topicId, options = {}) {
    const {
      duration = 600, // 10 minutes default
      questionCount = null,
      focusAreas = [],
      difficulty = null,
      includeReview = true
    } = options;
    
    let totalQuestions = questionCount;
    
    // Calculate question count based on duration if not specified
    if (!totalQuestions) {
      const avgTimePerQuestion = this.getAverageTimePerQuestion(topicId);
      totalQuestions = Math.floor(duration / avgTimePerQuestion);
      totalQuestions = Math.max(5, Math.min(20, totalQuestions)); // Between 5-20 questions
    }
    
    let questions = [];
    
    // Include review questions if requested
    if (includeReview) {
      const reviewCount = Math.min(3, Math.floor(totalQuestions * 0.3));
      const reviewQuestions = this.getReviewQuestions(topicId, reviewCount);
      questions.push(...reviewQuestions);
    }
    
    // Fill remaining with adaptive questions
    const remainingCount = totalQuestions - questions.length;
    const adaptiveQuestions = this.getAdaptiveQuestions(topicId, remainingCount, {
      difficulty,
      prioritizeWeak: focusAreas.length > 0
    });
    
    questions.push(...adaptiveQuestions);
    
    return {
      sessionId: generateId(),
      topicId,
      questions: this.shuffleArray(questions).slice(0, totalQuestions),
      estimatedDuration: duration,
      createdAt: new Date().toISOString(),
      options
    };
  }

  // Get average time per question for a topic
  getAverageTimePerQuestion(topicId) {
    const topicStats = this.progressService.getTopicStats(topicId);
    return topicStats?.averageTime || 45; // Default 45 seconds per question
  }

  // Validate question format
  validateQuestion(question) {
    const required = ['id', 'question', 'options', 'correct', 'explanation'];
    const missing = required.filter(field => !question[field]);
    
    if (missing.length > 0) {
      throw new Error(`Question missing required fields: ${missing.join(', ')}`);
    }
    
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }
    
    if (question.correct >= question.options.length) {
      throw new Error('Correct answer index is out of range');
    }
    
    return true;
  }

  // Import questions from external source
  importQuestions(topicId, questions) {
    try {
      const validatedQuestions = questions.map(q => {
        this.validateQuestion(q);
        return {
          ...q,
          id: q.id || generateId(),
          importedAt: new Date().toISOString()
        };
      });
      
      this.addQuestionsToTopic(topicId, validatedQuestions);
      return {
        success: true,
        imported: validatedQuestions.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export user's question performance data
  exportQuestionData() {
    const data = {
      userAnswers: Object.fromEntries(this.userAnswers),
      questionBank: Object.fromEntries(this.questionBank),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return data;
  }

  // Clear user's answer history (useful for reset)
  clearAnswerHistory(topicId = null) {
    if (topicId) {
      // Clear only for specific topic
      for (const [questionId, history] of this.userAnswers) {
        const filtered = history.filter(answer => answer.topicId !== topicId);
        if (filtered.length === 0) {
          this.userAnswers.delete(questionId);
        } else {
          this.userAnswers.set(questionId, filtered);
        }
      }
    } else {
      // Clear all
      this.userAnswers.clear();
    }
  }
}

// Export singleton instance
const questionService = new QuestionService();
export default questionService;
