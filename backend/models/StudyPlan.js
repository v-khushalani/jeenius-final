const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  planType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  subjects: [{
    name: String,
    allocatedTime: Number, // in minutes
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    topics: [{
      name: String,
      duration: Number,
      difficulty: String,
      reason: String, // Why this topic was selected
      focusArea: String // 'weakness', 'revision', 'new', 'strength'
    }]
  }],
  performance: {
    overallAccuracy: Number,
    strengths: [String],
    weaknesses: [String],
    improvementAreas: [String]
  },
  studyGoals: [{
    goal: String,
    targetDate: Date,
    progress: Number
  }],
  recommendations: [{
    type: String,
    message: String,
    priority: String
  }],
  totalStudyTime: Number, // Total recommended study time in minutes
  completionStatus: {
    type: Number,
    default: 0
  },
  feedback: {
    helpful: Boolean,
    rating: Number,
    comments: String
  },
  aiMetrics: {
    learningRate: Number, // How fast the student is improving
    retentionScore: Number, // How well they retain information
    consistencyScore: Number, // How consistent their study pattern is
    adaptiveLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  },
  nextRefreshTime: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
studyPlanSchema.index({ userId: 1, date: -1 });
studyPlanSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
