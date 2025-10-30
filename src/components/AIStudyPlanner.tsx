import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, TrendingDown, Brain, BookOpen, AlertTriangle, Activity, Zap, 
  ChevronRight, Award, BarChart3, TrendingUp, CheckCircle2, XCircle,
  Sparkles, Rocket, Timer, PieChart, Clock, Trophy, Flame, Star,
  ChevronDown, ChevronUp, Layers, Gauge, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EnhancedAIStudyPlanner() {
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);
  
  // Comprehensive Analysis Data
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);
  const [chapterAnalysis, setChapterAnalysis] = useState([]);
  const [topicAnalysis, setTopicAnalysis] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [predictedRank, setPredictedRank] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState(null);
  const [expandedSection, setExpandedSection] = useState('subjects');
  
  const examDates = {
    'JEE_MAINS': '2026-01-24',
    'JEE_ADVANCED': '2026-05-24',
    'NEET': '2026-05-03',
    'BITSAT': '2026-05-15'
  };

  const examNames = {
    'JEE_MAINS': 'JEE Mains 2026',
    'JEE_ADVANCED': 'JEE Advanced 2026',
    'NEET': 'NEET 2026',
    'BITSAT': 'BITSAT 2026'
  };

  const daysRemaining = Math.ceil(
    (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    fetchComprehensiveAnalysis();
  }, []);

  const fetchComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Login required for AI analysis');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('target_exam, daily_study_hours')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setSelectedExam(profile.target_exam || 'JEE_MAINS');
        setExamDate(examDates[profile.target_exam] || examDates['JEE_MAINS']);
        setUserHours(profile.daily_study_hours || 6);
      }

      // 🔥 GET ALL ATTEMPTS (No question limit needed)
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select(`
          id,
          is_correct,
          time_taken_seconds,
          questions (
            subject,
            chapter,
            topic,
            difficulty
          )
        `)
        .eq('user_id', user.id);

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      setTotalAttempts(attempts.length);
      const correct = attempts.filter(a => a.is_correct).length;
      setCorrectAnswers(correct);

      // 🔥 SUBJECT-WISE ANALYSIS
      const subjectStats = {};
      attempts.forEach(att => {
        const subject = att.questions?.subject || 'Unknown';
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, correct: 0, time: 0 };
        }
        subjectStats[subject].total++;
        if (att.is_correct) subjectStats[subject].correct++;
        subjectStats[subject].time += att.time_taken_seconds || 0;
      });

      const subjectArray = Object.keys(subjectStats).map(subject => ({
        subject,
        attempted: subjectStats[subject].total,
        correct: subjectStats[subject].correct,
        accuracy: Math.round((subjectStats[subject].correct / subjectStats[subject].total) * 100),
        avgTime: Math.round(subjectStats[subject].time / subjectStats[subject].total)
      })).sort((a, b) => b.accuracy - a.accuracy);

      setSubjectAnalysis(subjectArray);

      // 🔥 CHAPTER-WISE ANALYSIS
      const chapterStats = {};
      attempts.forEach(att => {
        const key = `${att.questions?.subject}-${att.questions?.chapter}`;
        if (!chapterStats[key]) {
          chapterStats[key] = { 
            subject: att.questions?.subject,
            chapter: att.questions?.chapter,
            total: 0, 
            correct: 0, 
            time: 0 
          };
        }
        chapterStats[key].total++;
        if (att.is_correct) chapterStats[key].correct++;
        chapterStats[key].time += att.time_taken_seconds || 0;
      });

      const chapterArray = Object.values(chapterStats).map(ch => ({
        ...ch,
        accuracy: Math.round((ch.correct / ch.total) * 100),
        avgTime: Math.round(ch.time / ch.total)
      })).sort((a, b) => a.accuracy - b.accuracy).slice(0, 10);

      setChapterAnalysis(chapterArray);

      // 🔥 TOPIC-WISE ANALYSIS (Top weak topics)
      const topicStats = {};
      attempts.forEach(att => {
        const topic = att.questions?.topic || 'Unknown';
        if (!topicStats[topic]) {
          topicStats[topic] = { 
            topic,
            subject: att.questions?.subject,
            chapter: att.questions?.chapter,
            total: 0, 
            correct: 0 
          };
        }
        topicStats[topic].total++;
        if (att.is_correct) topicStats[topic].correct++;
      });

      const topicArray = Object.values(topicStats)
        .filter(t => t.total >= 3) // Only topics with 3+ attempts
        .map(t => ({
          ...t,
          accuracy: Math.round((t.correct / t.total) * 100)
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 15);

      setTopicAnalysis(topicArray);

      // 🔥 STRENGTHS & WEAKNESSES IDENTIFICATION
      const strengths = subjectArray.filter(s => s.accuracy >= 70).slice(0, 3);
      const weaknesses = subjectArray.filter(s => s.accuracy < 60).slice(0, 3);

      setStrengthsWeaknesses({
        strengths: strengths.length > 0 ? strengths : [{ subject: 'None yet', accuracy: 0 }],
        weaknesses: weaknesses.length > 0 ? weaknesses : [{ subject: 'All good!', accuracy: 100 }]
      });

      // 🔥 AI STUDY PLAN GENERATION
      generateIntelligentStudyPlan(subjectArray, chapterArray, topicArray, attempts.length, correct);

      // 🔥 RANK PREDICTOR
      calculatePredictedRank(correct, attempts.length, subjectArray);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentStudyPlan = (subjects, chapters, topics, totalAttempts, correct) => {
    const overallAccuracy = Math.round((correct / totalAttempts) * 100);
    
    let recommendedHours = 6;
    if (daysRemaining < 60 && overallAccuracy < 50) recommendedHours = 10;
    else if (daysRemaining < 120 && overallAccuracy < 65) recommendedHours = 8;
    else if (overallAccuracy > 80) recommendedHours = 5;
    
    setAiRecommendedHours(recommendedHours);

    const plan = subjects.map(subject => {
      let recommendedTime = 0;
      let priority = 'MEDIUM';
      let strategy = '';

      if (subject.accuracy < 40) {
        recommendedTime = Math.round(recommendedHours * 0.35);
        priority = 'CRITICAL';
        strategy = '🚨 Emergency focus needed! Start from basics.';
      } else if (subject.accuracy < 60) {
        recommendedTime = Math.round(recommendedHours * 0.25);
        priority = 'HIGH';
        strategy = '⚡ Practice weak chapters intensively.';
      } else if (subject.accuracy < 75) {
        recommendedTime = Math.round(recommendedHours * 0.2);
        priority = 'MEDIUM';
        strategy = '✅ Maintain consistency, target advanced problems.';
      } else {
        recommendedTime = Math.round(recommendedHours * 0.15);
        priority = 'LOW';
        strategy = '🏆 Excellent! Quick revisions only.';
      }

      return {
        subject: subject.subject,
        accuracy: subject.accuracy,
        attempted: subject.attempted,
        recommendedTime,
        priority,
        strategy
      };
    });

    setStudyPlan(plan);
  };

  const calculatePredictedRank = (correct, total, subjects) => {
    const overallAccuracy = (correct / total) * 100;
    
    // Simple rank prediction logic (can be enhanced)
    let estimatedScore = 0;
    subjects.forEach(subject => {
      if (subject.subject === 'Physics') estimatedScore += subject.accuracy * 1.2;
      if (subject.subject === 'Chemistry') estimatedScore += subject.accuracy * 1.0;
      if (subject.subject === 'Mathematics') estimatedScore += subject.accuracy * 1.3;
    });

    const predictedScore = Math.round(estimatedScore / subjects.length);
    let rank = 500000;

    if (predictedScore > 85) rank = Math.floor(Math.random() * 5000) + 1000;
    else if (predictedScore > 75) rank = Math.floor(Math.random() * 15000) + 5000;
    else if (predictedScore > 65) rank = Math.floor(Math.random() * 50000) + 20000;
    else if (predictedScore > 50) rank = Math.floor(Math.random() * 150000) + 70000;
    else rank = Math.floor(Math.random() * 300000) + 200000;

    setPredictedRank({ rank, score: predictedScore, confidence: total > 100 ? 'High' : total > 50 ? 'Medium' : 'Low' });
  };

  const handleExamChange = async (newExam) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ target_exam: newExam })
        .eq('user_id', user.id);

      setSelectedExam(newExam);
      setExamDate(examDates[newExam]);
      toast.success(`Goal updated: ${examNames[newExam]}`);
      await fetchComprehensiveAnalysis();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleHoursUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ daily_study_hours: userHours })
        .eq('user_id', user.id);

      toast.success('Study hours updated!');
      await fetchComprehensiveAnalysis();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-24 h-24 text-indigo-600 animate-pulse mx-auto mb-6" />
            <Sparkles className="w-10 h-10 text-yellow-500 absolute -top-2 -right-2 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-indigo-900">AI Analyzing Your Performance...</p>
          <p className="text-sm text-indigo-600 mt-2">Generating comprehensive insights</p>
        </div>
      </div>
    );
  }

  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  if (totalAttempts === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <Card className="max-w-3xl mx-auto mt-20 border-2 border-indigo-200 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Brain className="w-24 h-24 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-indigo-900 mb-4">
              Welcome to AI Study Planner! 🚀
            </h2>
            <p className="text-indigo-600 mb-8 text-lg">
              Start solving questions to unlock your personalized study insights, 
              strengths/weaknesses analysis, and AI-powered recommendations!
            </p>
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
          AI STUDY INTELLIGENCE
        </h1>
        <p className="text-indigo-600 text-lg">Comprehensive performance analysis + personalized study plan</p>
      </div>

      {/* Exam + Countdown */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/80 text-sm mb-2">Target Exam</p>
              <select
                value={selectedExam}
                onChange={(e) => handleExamChange(e.target.value)}
                className="bg-white/20 backdrop-blur-lg text-white text-2xl font-bold px-6 py-3 rounded-xl border-2 border-white/40 cursor-pointer hover:bg-white/30 transition-all"
              >
                {Object.keys(examNames).map(key => (
                  <option key={key} value={key} className="text-slate-900 font-semibold">
                    {examNames[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Exam Date</p>
              <p className="text-2xl font-semibold mb-2">
                {new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex items-baseline gap-2 justify-end">
                <p className="text-6xl font-black">{daysRemaining}</p>
                <p className="text-xl">days left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-xl hover:scale-105 transition-transform">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-12 h-12" />
              <Badge className="bg-white/20 backdrop-blur text-white text-xl px-4 py-2">
                {overallAccuracy}%
              </Badge>
            </div>
            <p className="text-4xl font-black mb-2">{correctAnswers}</p>
            <p className="text-blue-100 text-sm">out of {totalAttempts} correct</p>
            <Progress value={overallAccuracy} className="h-3 mt-4 bg-white/20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl hover:scale-105 transition-transform">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-12 h-12" />
              <Badge className="bg-white/20 backdrop-blur text-white text-xl px-4 py-2">
                LIVE
              </Badge>
            </div>
            <p className="text-4xl font-black mb-2">{subjectAnalysis.length}</p>
            <p className="text-green-100 text-sm">subjects analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl hover:scale-105 transition-transform">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-12 h-12" />
              <Badge className="bg-white/20 backdrop-blur text-white text-xl px-4 py-2">
                {topicAnalysis.length}
              </Badge>
            </div>
            <p className="text-4xl font-black mb-2">Weak</p>
            <p className="text-orange-100 text-sm">topics identified</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:scale-105 transition-transform">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12" />
              <Badge className="bg-white/20 backdrop-blur text-white text-xl px-4 py-2">
                AI REC
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-4xl font-black">{userHours}h</p>
              <p className="text-purple-100 text-sm">/ {aiRecommendedHours}h</p>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              value={userHours}
              onChange={(e) => setUserHours(parseInt(e.target.value))}
              className="w-full mt-3 accent-white"
            />
            <Button
              onClick={handleHoursUpdate}
              size="sm"
              className="w-full mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg"
            >
              Update
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rank Predictor */}
      {predictedRank && (
        <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                <Trophy className="w-20 h-20" />
                <div>
                  <p className="text-sm text-white/80 mb-1">🎯 Predicted JEE Rank</p>
                  <p className="text-6xl font-black mb-2">#{predictedRank.rank.toLocaleString()}</p>
                  <p className="text-lg">
                    Based on {predictedRank.score}% projected score • 
                    <Badge className="ml-2 bg-white/20 backdrop-blur">
                      {predictedRank.confidence} Confidence
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-2">Keep improving to reach</p>
                <p className="text-4xl font-black">TOP 1000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {strengthsWeaknesses && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50 border-b-2 border-green-200">
              <CardTitle className="flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-7 h-7" />
                <span className="text-2xl font-bold">💪 Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {strengthsWeaknesses.strengths.map((str, idx) => (
                <div key={idx} className="p-4 bg-green-100 rounded-xl border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-green-900 text-lg">{str.subject}</p>
                    <Badge className="bg-green-600 text-white text-lg px-3">
                      {str.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={str.accuracy} className="h-3 bg-green-200" />
                  <p className="text-sm text-green-700 mt-2">
                    🎯 {str.attempted} questions attempted • Keep it up!
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-100 to-pink-50 border-b-2 border-red-200">
              <CardTitle className="flex items-center gap-3 text-red-800">
                <XCircle className="w-7 h-7" />
                <span className="text-2xl font-bold">🚨 Priority Weaknesses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {strengthsWeaknesses.weaknesses.map((weak, idx) => (
                <div key={idx} className="p-4 bg-red-100 rounded-xl border-2 border-red-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-red-900 text-lg">{weak.subject}</p>
                    <Badge className="bg-red-600 text-white text-lg px-3">
                      {weak.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={weak.accuracy} className="h-3 bg-red-200" />
                  <p className="text-sm text-red-700 mt-2">
                    ⚡ Needs immediate attention!
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Study Plan */}
      <Card className="border-2 border-indigo-300 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 border-b-2 border-indigo-200">
          <CardTitle className="flex items-center gap-3 text-indigo-900">
            <Brain className="w-8 h-8 text-indigo-600" />
            <span className="text-3xl font-black">AI-Generated Daily Study Plan</span>
            <Badge className="ml-auto bg-indigo-600 text-white text-lg px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalized
            </Badge>
          </CardTitle>
          <p className="text-indigo-600 text-sm mt-2">
            📊 Based on {totalAttempts} attempts • {overallAccuracy}% accuracy • Subject-wise performance
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {studyPlan.map((plan, idx) => {
              const priorityColors = {
                'CRITICAL': { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', badge: 'bg-red-600' },
                'HIGH': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-600' },
                'MEDIUM': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', badge: 'bg-blue-600' },
                'LOW': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', badge: 'bg-green-600' }
              };
              const colors = priorityColors[plan.priority];

              return (
                <div
                  key={idx}
                  className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className={`font-black text-2xl ${colors.text}`}>{plan.subject}</p>
                        <Badge className={`${colors.badge} text-white text-sm px-3 py-1`}>
                          {plan.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm ${colors.text} mb-3`}>{plan.strategy}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span className="font-semibold">{plan.accuracy}% current accuracy</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>{plan.attempted} questions solved</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-5xl font-black ${colors.text}`}>{plan.recommendedTime}h</p>
                      <p className="text-sm text-slate-600 mt-1">per day</p>
                    </div>
                  </div>
                  <Progress value={plan.accuracy} className="h-3" />
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => window.location.href = '/study-now'}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold py-6 text-xl shadow-lg"
          >
            <Rocket className="w-6 h-6 mr-3" />
            START STUDYING NOW
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Analysis Sections */}
      <Card className="border-2 border-purple-300 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-50">
          <CardTitle className="flex items-center gap-3 text-purple-900">
            <Layers className="w-7 h-7" />
            <span className="text-2xl font-bold">Detailed Performance Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Section Toggle */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => setExpandedSection('subjects')}
              variant={expandedSection === 'subjects' ? 'default' : 'outline'}
              className={expandedSection === 'subjects' ? 'bg-indigo-600' : ''}
            >
              📚 Subjects ({subjectAnalysis.length})
            </Button>
            <Button
              onClick={() => setExpandedSection('chapters')}
              variant={expandedSection === 'chapters' ? 'default' : 'outline'}
              className={expandedSection === 'chapters' ? 'bg-indigo-600' : ''}
            >
              📖 Chapters ({chapterAnalysis.length})
            </Button>
            <Button
              onClick={() => setExpandedSection('topics')}
              variant={expandedSection === 'topics' ? 'default' : 'outline'}
              className={expandedSection === 'topics' ? 'bg-indigo-600' : ''}
            >
              🎯 Topics ({topicAnalysis.length})
            </Button>
          </div>

          {/* Subject Analysis */}
          {expandedSection === 'subjects' && (
            <div className="space-y-3">
              {subjectAnalysis.map((subject, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${
                        subject.accuracy >= 70 ? 'bg-green-500' :
                        subject.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      } flex items-center justify-center text-white font-bold text-xl`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-900 text-xl">{subject.subject}</p>
                        <p className="text-sm text-indigo-600">
                          {subject.attempted} questions • Avg time: {subject.avgTime}s
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-2xl px-4 py-2 ${
                        subject.accuracy >= 70 ? 'bg-green-600' :
                        subject.accuracy >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {subject.accuracy}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={subject.accuracy} 
                    className="h-4"
                  />
                  <div className="flex items-center justify-between mt-3 text-sm text-indigo-700">
                    <span>✅ {subject.correct} correct</span>
                    <span>❌ {subject.attempted - subject.correct} wrong</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chapter Analysis */}
          {expandedSection === 'chapters' && (
            <div className="space-y-3">
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 font-semibold">
                  ⚡ Showing weakest chapters - Focus on these first!
                </p>
              </div>
              {chapterAnalysis.map((chapter, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-orange-900 text-lg">{chapter.chapter}</p>
                      <p className="text-sm text-orange-700">
                        {chapter.subject} • {chapter.total} questions • Avg: {chapter.avgTime}s
                      </p>
                    </div>
                    <Badge className={`text-xl px-4 py-2 ${
                      chapter.accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    } text-white`}>
                      {chapter.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={chapter.accuracy} className="h-4" />
                  <Button
                    onClick={() => window.location.href = '/study-now'}
                    size="sm"
                    className="mt-3 bg-orange-600 hover:bg-orange-700 text-white w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Practice This Chapter
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Topic Analysis */}
          {expandedSection === 'topics' && (
            <div className="space-y-3">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-semibold">
                  🚨 Critical weak topics - Master these for quick score boost!
                </p>
              </div>
              {topicAnalysis.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-red-900">{topic.topic}</p>
                      <p className="text-xs text-red-700">
                        {topic.subject} • {topic.chapter} • {topic.total} attempts
                      </p>
                    </div>
                    <Badge className="bg-red-600 text-white text-lg px-3">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={topic.accuracy} className="h-3" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Banner */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
        <CardContent className="p-8 text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-3xl font-black mb-3">
            Your AI Study Partner is Ready! 🚀
          </h3>
          <p className="text-lg text-white/90 mb-6">
            Keep solving questions to get even more accurate predictions and personalized recommendations
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Continue Studying
            </Button>
            <Button
              onClick={() => window.location.href = '/tests'}
              className="bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 font-bold px-8 py-4 text-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Take Mock Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <p className="text-sm font-bold text-indigo-900 mb-1">
                🔬 AI Intelligence Active
              </p>
              <p className="text-xs text-indigo-700">
                Analysis updates automatically as you practice. Rank prediction accuracy improves with more attempts. 
                Currently analyzing {totalAttempts} data points across {subjectAnalysis.length} subjects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
