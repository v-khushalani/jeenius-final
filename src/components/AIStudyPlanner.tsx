import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, TrendingDown, Brain, BookOpen, AlertTriangle, Activity, Zap, 
  CheckCircle2, XCircle, Sparkles, Rocket, Clock, Trophy, Flame, TrendingUp,
  Gauge, Layers, Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudyRecommendation {
  subject: string;
  chapter: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedTime: number;
  accuracy: number;
}

export default function EnhancedAIStudyPlanner() {
  // ⚙ existing states and logic unchanged...
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);
  const [userPoints, setUserPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [stats, setStats] = useState({ todayProgress: 0, weeklyStreak: 0, totalStudyTime: 0, targetHours: 6 });
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);
  const [chapterAnalysis, setChapterAnalysis] = useState([]);
  const [topicAnalysis, setTopicAnalysis] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [predictedRank, setPredictedRank] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState(null);
  const [expandedSection, setExpandedSection] = useState('subjects');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  // 🌟 simplified examDates etc. remain same (omitted for brevity)...

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center space-y-3">
          <Brain className="w-16 h-16 text-indigo-600 animate-pulse mx-auto" />
          <p className="text-xl font-semibold text-indigo-800">Analyzing your data...</p>
          <p className="text-sm text-indigo-500">Generating AI insights & study plan</p>
        </div>
      </div>
    );
  }

  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* HEADER */}
      <div className="text-center mt-20 mb-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          AI Study Intelligence
        </h1>
        <p className="text-indigo-600 mt-2 text-sm sm:text-base">
          Personalized analysis & daily plan powered by JEEnius AI
        </p>
      </div>

      {/* POINTS CARD */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md">
        <CardContent className="flex flex-col sm:flex-row justify-between items-center p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <p className="text-xs uppercase opacity-80">JEEnius Points</p>
              <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
            </div>
          </div>
          {recentPoints > 0 && (
            <div className="bg-white/20 px-3 py-1 rounded-lg text-sm mt-3 sm:mt-0">
              +{recentPoints} earned today
            </div>
          )}
        </CardContent>
      </Card>

      {/* EXAM CARD */}
      <Card className="bg-white border border-indigo-100 rounded-2xl shadow-sm">
        <CardContent className="flex flex-col sm:flex-row justify-between items-center p-5 sm:p-8 gap-4">
          <div className="w-full sm:w-auto">
            <p className="text-sm text-gray-500 mb-1">Target Exam</p>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium focus:outline-none w-full sm:w-auto"
            >
              <option>JEE Mains 2026</option>
              <option>JEE Advanced 2026</option>
              <option>NEET 2026</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Exam Date</p>
            <p className="text-2xl font-semibold text-indigo-700">Jan 24, 2026</p>
            <p className="text-sm text-indigo-500 mt-1">~70 days left</p>
          </div>
        </CardContent>
      </Card>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: "Today's Progress", value: `${stats.todayProgress}%`, icon: Target },
          { label: "Study Streak", value: `${stats.weeklyStreak}d`, icon: Flame },
          { label: "Today’s Study Time", value: `${stats.totalStudyTime}h`, icon: Clock },
          { label: "Target Hours", value: `${stats.targetHours}h`, icon: Zap },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border border-indigo-100 bg-white/70 shadow-sm">
            <CardContent className="flex flex-col items-center p-3 sm:p-4 text-center">
              <stat.icon className="w-5 h-5 text-indigo-600 mb-1" />
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-indigo-700">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* OVERALL PERFORMANCE */}
      <Card className="rounded-2xl border border-indigo-200 bg-white shadow-sm">
        <CardContent className="p-5 text-center">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Overall Accuracy</h3>
          <p className="text-4xl font-black text-indigo-600">{overallAccuracy}%</p>
          <Progress value={overallAccuracy} className="mt-3 h-3" />
          <p className="text-xs text-gray-500 mt-2">
            {correctAnswers} correct out of {totalAttempts}
          </p>
        </CardContent>
      </Card>

      {/* AI RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <Card className="rounded-2xl border border-purple-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" /> AI Study Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-purple-800">{rec.topic}</h4>
                    <p className="text-xs text-purple-600 mb-1">{rec.subject} • {rec.chapter}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {rec.estimatedTime} mins • {rec.accuracy}% accuracy
                    </p>
                    <p className="text-xs text-purple-700 font-medium">{rec.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/study-now'}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                  >
                    Practice
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* STUDY PLAN */}
      {studyPlan.length > 0 && (
        <Card className="rounded-2xl border border-indigo-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Personalized Daily Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {studyPlan.map((plan, idx) => (
              <div key={idx} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-indigo-800">{plan.subject}</p>
                  <p className="text-xs text-indigo-600">{plan.strategy}</p>
                </div>
                <p className="font-bold text-indigo-700 text-lg">{plan.recommendedTime}h</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* FOOTER */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-2" />
          <p className="font-semibold text-lg">Keep practicing for smarter AI insights!</p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button className="bg-white text-indigo-700 font-semibold hover:bg-indigo-50 w-full sm:w-auto">
              Continue Study
            </Button>
            <Button className="bg-white/20 text-white hover:bg-white/30 w-full sm:w-auto">
              Take Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
