// EnhancedAIStudyPlanner.ui.tsx
// READY-TO-PASTE updated UI (keeps ALL backend logic and queries unchanged).
// Design matched to your screenshot + brand colors: primary #013062, light #E6EEFF, gray #E9E9E9
// NOTE: This file injects component-scoped CSS via a <style> tag so you don't have to change global files.

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, TrendingDown, Brain, BookOpen, AlertTriangle, Activity, Zap,
  ChevronRight, Award, BarChart3, TrendingUp, CheckCircle2, XCircle,
  Sparkles, Rocket, Timer, PieChart, Clock, Trophy, Flame, Star,
  ChevronDown, ChevronUp, Layers, Gauge, Calendar, Play, Lock, Crown,
  Lightbulb
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
  // --- STATES & LOGIC (unchanged from your original file) ---
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);

  const [userPoints, setUserPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState(0);
  const [badges, setBadges] = useState([]);

  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [stats, setStats] = useState({
    todayProgress: 0,
    weeklyStreak: 0,
    totalStudyTime: 0,
    targetHours: 6
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Login required');
        setLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_exam, total_points')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setSelectedExam(profile.target_exam || 'JEE_MAINS');
        setExamDate(examDates[profile.target_exam] || examDates['JEE_MAINS']);
        setUserPoints(profile.total_points || 0);
      }

      // Fetch all attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (attemptsError) {
        console.error('❌ Attempts fetch error:', attemptsError);
        toast.error('Failed to fetch attempts');
        setLoading(false);
        return;
      }

      if (!attempts || attempts.length === 0) {
        console.log('⚠️ No attempts found for user');
        setLoading(false);
        return;
      }

      // Fetch question details
      const questionIds = [...new Set(attempts.map(a => a.question_id))];
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, subject, chapter, topic, difficulty')
        .in('id', questionIds);

      if (questionsError) {
        console.error('❌ Questions fetch error:', questionsError);
      }

      // Merge attempts with question data
      const enrichedAttempts = attempts.map(attempt => ({
        ...attempt,
        questions: questions?.find(q => q.id === attempt.question_id) || null
      }));

      setTotalAttempts(enrichedAttempts.length);
      const correct = enrichedAttempts.filter(a => a.is_correct).length;
      setCorrectAnswers(correct);

      // Subject-wise Analysis
      const subjectStats: any = {};
      enrichedAttempts.forEach((att: any) => {
        const subject = att.questions?.subject || 'Unknown';
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, correct: 0, time: 0 };
        }
        subjectStats[subject].total++;
        if (att.is_correct) subjectStats[subject].correct++;
        subjectStats[subject].time += att.time_taken || 0;
      });

      const subjectArray = Object.keys(subjectStats).map(subject => ({
        subject,
        attempted: subjectStats[subject].total,
        correct: subjectStats[subject].correct,
        accuracy: Math.round((subjectStats[subject].correct / subjectStats[subject].total) * 100),
        avgTime: Math.round(subjectStats[subject].time / subjectStats[subject].total)
      })).sort((a, b) => b.accuracy - a.accuracy);

      setSubjectAnalysis(subjectArray);

      // Chapter-wise Analysis
      const chapterStats: any = {};
      enrichedAttempts.forEach((att: any) => {
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
        chapterStats[key].time += att.time_taken || 0;
      });

      const chapterArray = Object.values(chapterStats).map((ch: any) => ({
        ...ch,
        accuracy: Math.round((ch.correct / ch.total) * 100),
        avgTime: Math.round(ch.time / ch.total)
      })).sort((a, b) => a.accuracy - b.accuracy).slice(0, 10);

      setChapterAnalysis(chapterArray);

      // Topic-wise Analysis
      const topicStats: any = {};
      enrichedAttempts.forEach((att: any) => {
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
        .filter((t: any) => t.total >= 3)
        .map((t: any) => ({
          ...t,
          accuracy: Math.round((t.correct / t.total) * 100)
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 15);

      setTopicAnalysis(topicArray);

      // Strengths & Weaknesses
      const strengths = subjectArray.filter(s => s.accuracy >= 70).slice(0, 3);
      const weaknesses = subjectArray.filter(s => s.accuracy < 60).slice(0, 3);

      setStrengthsWeaknesses({
        strengths: strengths.length > 0 ? strengths : [{ subject: 'Keep practicing!', accuracy: 0, attempted: 0 }],
        weaknesses: weaknesses.length > 0 ? weaknesses : [{ subject: 'All good!', accuracy: 100, attempted: 0 }]
      });

      // Weekly Trend
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayAttempts = enrichedAttempts.filter(a => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= date && attemptDate < nextDate;
        });

        const dayCorrect = dayAttempts.filter(a => a.is_correct).length;
        const dayAccuracy = dayAttempts.length > 0 ? Math.round((dayCorrect / dayAttempts.length) * 100) : 0;

        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          questions: dayAttempts.length,
          accuracy: dayAccuracy
        });
      }

      setWeeklyTrend(last7Days);

      // Calculate streak (consecutive days with any activity)
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const dayHasAttempts = enrichedAttempts.some(a => {
          const attemptDate = new Date(a.created_at);
          attemptDate.setHours(0, 0, 0, 0);
          return attemptDate.getTime() === currentDate.getTime();
        });

        if (dayHasAttempts) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (i === 0) {
          // If no activity today, check yesterday to see if streak is still valid
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

      // Today's progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttempts = enrichedAttempts.filter(a => new Date(a.created_at) >= today);
      const todayProgress = Math.min(100, todayAttempts.length * 4);

      setStats({
        todayProgress,
        weeklyStreak: streak,
        totalStudyTime: Math.floor(todayAttempts.length * 2 / 60), // Rough estimate
        targetHours: 6
      });

      // Fetch badges
      await fetchBadges();

      // Generate AI recommendations
      await generateSmartRecommendations(enrichedAttempts, topicStats);

      // Generate study plan
      generateIntelligentStudyPlan(subjectArray, chapterArray, topicArray, enrichedAttempts.length, correct);

      // Calculate rank
      calculatePredictedRank(correct, enrichedAttempts.length, subjectArray);

      // Fetch recent points
      const { data: logs } = await supabase
        .from('points_log')
        .select('points')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logs && logs.length > 0) {
        setRecentPoints(logs[0].points);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      const badgeMap = userBadges?.reduce((acc: any, ub) => {
        acc[ub.badge_id] = ub.earned_at;
        return acc;
      }, {}) || {};

      const enrichedBadges = allBadges?.map(badge => ({
        ...badge,
        earned: !!badgeMap[badge.id],
        earned_at: badgeMap[badge.id]
      })) || [];

      setBadges(enrichedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const generateSmartRecommendations = async (enrichedAttempts: any[], topicStats: any) => {
    const recs: StudyRecommendation[] = Object.values(topicStats)
      .filter((stat: any) => stat.total >= 3)
      .map((stat: any) => {
        const accuracy = (stat.correct / stat.total) * 100;
        let priority: 'high' | 'medium' | 'low' = 'low';
        let reason = '';

        if (accuracy < 40) {
          priority = 'high';
          reason = 'Critical weakness - needs immediate attention';
        } else if (accuracy < 70) {
          priority = 'medium';
          reason = 'Moderate weakness - practice recommended';
        } else {
          priority = 'low';
          reason = 'Strong area - maintain with revision';
        }

        return {
          subject: stat.subject,
          chapter: stat.chapter,
          topic: stat.topic,
          priority,
          reason,
          estimatedTime: priority === 'high' ? 60 : priority === 'medium' ? 45 : 30,
          accuracy: Math.round(accuracy)
        };
      })
      .filter((rec) => rec.priority !== 'low') // Only show weak/medium topics, not strong ones
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);

    setRecommendations(recs);
  };

  const generateIntelligentStudyPlan = (subjects, chapters, topics, totalAttempts, correct) => {
    const overallAccuracy = Math.round((correct / totalAttempts) * 100);

    let recommendedHours = 6;
    if (daysRemaining < 30 && overallAccuracy < 60) recommendedHours = 12;
    else if (daysRemaining < 60 && overallAccuracy < 50) recommendedHours = 10;
    else if (daysRemaining < 90 && overallAccuracy < 65) recommendedHours = 8;
    else if (daysRemaining < 180 && overallAccuracy < 70) recommendedHours = 7;
    else if (overallAccuracy > 85) recommendedHours = 5;

    setAiRecommendedHours(recommendedHours);

    const plan = subjects.map(subject => {
      let recommendedTime = 0;
      let priority = 'MEDIUM';
      let strategy = '';

      const accuracyGap = 80 - subject.accuracy;

      if (subject.accuracy < 40 || (subject.accuracy < 60 && subject.attempted < 20)) {
        recommendedTime = Math.round(recommendedHours * 0.4);
        priority = 'CRITICAL';
        strategy = `🚨 Urgent! Master basics first. Target: 50+ questions this week.`;
      }
      else if (subject.accuracy < 60) {
        recommendedTime = Math.round(recommendedHours * 0.3);
        priority = 'HIGH';
        strategy = `⚡ Focus on weak chapters. Solve 30+ questions daily.`;
      }
      else if (subject.accuracy < 75) {
        recommendedTime = Math.round(recommendedHours * 0.25);
        priority = 'MEDIUM';
        strategy = `✅ Good progress! Practice advanced problems daily.`;
      }
      else {
        recommendedTime = Math.round(recommendedHours * 0.15);
        priority = 'LOW';
        strategy = `🏆 Excellent! Maintain with 15-20 questions daily.`;
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

    const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
    plan.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setStudyPlan(plan);
  };

  const calculatePredictedRank = (correct, total, subjects) => {
    if (total < 10) {
      setPredictedRank(null);
      return;
    }

    const overallAccuracy = (correct / total) * 100;

    let estimatedScore = 0;
    let subjectCount = 0;

    subjects.forEach(subject => {
      if (subject.subject === 'Physics') {
        estimatedScore += subject.accuracy * 1.2;
        subjectCount++;
      }
      if (subject.subject === 'Chemistry') {
        estimatedScore += subject.accuracy * 1.0;
        subjectCount++;
      }
      if (subject.subject === 'Mathematics') {
        estimatedScore += subject.accuracy * 1.3;
        subjectCount++;
      }
    });

    const predictedScore = subjectCount > 0 ? Math.round(estimatedScore / subjectCount) : overallAccuracy;

    let rank;
    if (predictedScore >= 95) rank = Math.floor(500 + (100 - predictedScore) * 100);
    else if (predictedScore >= 90) rank = Math.floor(1000 + (95 - predictedScore) * 400);
    else if (predictedScore >= 85) rank = Math.floor(3000 + (90 - predictedScore) * 800);
    else if (predictedScore >= 80) rank = Math.floor(8000 + (85 - predictedScore) * 1500);
    else if (predictedScore >= 75) rank = Math.floor(15000 + (80 - predictedScore) * 2500);
    else if (predictedScore >= 70) rank = Math.floor(30000 + (75 - predictedScore) * 4000);
    else if (predictedScore >= 65) rank = Math.floor(50000 + (70 - predictedScore) * 6000);
    else if (predictedScore >= 60) rank = Math.floor(80000 + (65 - predictedScore) * 8000);
    else if (predictedScore >= 50) rank = Math.floor(120000 + (60 - predictedScore) * 12000);
    else rank = Math.floor(200000 + (50 - predictedScore) * 15000);

    let confidence;
    if (total >= 200) confidence = 'High';
    else if (total >= 100) confidence = 'Medium';
    else confidence = 'Low';

    setPredictedRank({
      rank: Math.min(rank, 1200000),
      score: predictedScore,
      confidence,
      totalAttempts: total
    });
  };

  const handleExamChange = async (newExam) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ target_exam: newExam })
        .eq('id', user.id);

      setSelectedExam(newExam);
      setExamDate(examDates[newExam]);
      toast.success(`Goal updated: ${examNames[newExam]}`);
      await fetchComprehensiveAnalysis();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const priorityConfig = {
    high: {
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: AlertTriangle
    },
    medium: {
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: TrendingUp
    },
    low: {
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: CheckCircle2
    }
  };

  const colorClasses: any = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    gold: 'from-yellow-400 to-yellow-600'
  };

  // --- UI RENDERING (modified styling to match your brand/dashboard look) ---
  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <style>{THEME_CSS}</style>
        <div className="j-loading-card text-center p-10 rounded-2xl">
          <div className="relative mx-auto w-28 h-28 rounded-full bg-primary-glow flex items-center justify-center mb-6">
            <Brain className="w-14 h-14 text-white animate-pulse" />
          </div>
          <p className="text-2xl font-black j-primary-text mb-2">AI Analyzing Your Performance...</p>
          <p className="text-sm j-subtext">Generating comprehensive insights</p>
        </div>
      </div>
    );
  }

  if (totalAttempts === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen">
        <style>{THEME_CSS}</style>
        <Card className="j-card max-w-3xl mx-auto mt-20 border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-xl bg-primary-light flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold j-primary-text mb-4">
              Welcome to AI Study Planner! 🚀
            </h2>
            <p className="j-subtext mb-8 text-lg">
              Start solving questions to unlock your personalized study insights, strengths/weaknesses analysis, and AI-powered recommendations!
            </p>
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="j-primary-btn px-8 py-4 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen">
      <style>{THEME_CSS}</style>

      {/* Header */}
      <div className="text-center pt-24 pb-6">
        <h1 className="text-4xl sm:text-5xl font-black j-title mb-2">AI STUDY INTELLIGENCE</h1>
        <p className="j-subtext">Comprehensive performance analysis + personalized study plan</p>
      </div>

      {/* Points Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="j-card col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary p-3 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs j-subtext uppercase">JEEnius Points</p>
                  <p className="text-3xl font-bold j-primary-text">{userPoints.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                {recentPoints > 0 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success-glow">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="font-bold text-white">+{recentPoints}</span>
                  </div>
                ) : (
                  <div className="text-sm j-subtext">Level • {Math.min(100, Math.floor(userPoints / 100))}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="j-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs j-subtext">Target Exam</p>
                <select
                  value={selectedExam}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full mt-2 py-2 px-3 rounded-lg border j-select"
                >
                  {Object.keys(examNames).map(key => (
                    <option key={key} value={key}>
                      {examNames[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm j-subtext text-right">
              <p className="font-semibold j-primary-text">{new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <div className="mt-2">
                <span className="text-5xl font-black j-primary-text">{daysRemaining}</span>
                <span className="j-subtext ml-2">days left</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="j-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs j-subtext">Today's Progress</p>
                <p className="text-2xl font-bold j-primary-text">{stats.todayProgress}%</p>
              </div>
            </div>
            <div className="mt-3 j-progress">
              <div className="j-progress-fill" style={{ width: `${stats.todayProgress}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="j-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-3 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs j-subtext">Study Streak</p>
                <p className="text-2xl font-bold j-primary-text">{stats.weeklyStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="j-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs j-subtext">Study Time Today</p>
                <p className="text-2xl font-bold j-primary-text">{stats.totalStudyTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="j-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs j-subtext">Daily Target</p>
                <p className="text-2xl font-bold j-primary-text">{stats.targetHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tiles (Performance Overview) */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="j-card j-primary-tile">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-10 h-10 text-white" />
              <Badge className="bg-white/10 text-white px-4 py-2"> {overallAccuracy}% </Badge>
            </div>
            <p className="text-4xl font-black j-primary-text mb-2">{correctAnswers}</p>
            <p className="j-subtext">out of {totalAttempts} correct</p>
            <div className="mt-4 j-progress">
              <div className="j-progress-fill" style={{ width: `${overallAccuracy}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="j-card j-success-tile">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-10 h-10 text-white" />
              <Badge className="bg-white/10 text-white px-4 py-2">LIVE</Badge>
            </div>
            <p className="text-4xl font-black j-primary-text mb-2">{subjectAnalysis.length}</p>
            <p className="j-subtext">subjects analyzed</p>
          </CardContent>
        </Card>

        <Card className="j-card j-warn-tile">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
              <Badge className="bg-white/10 text-white px-4 py-2">{topicAnalysis.length}</Badge>
            </div>
            <p className="text-4xl font-black j-primary-text mb-2">Weak</p>
            <p className="j-subtext">topics identified</p>
          </CardContent>
        </Card>

        <Card className="j-card j-rec-tile">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-white" />
              <Badge className="bg-white/10 text-white px-4 py-2">AI REC</Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-3xl font-black j-primary-text">{userHours}h</p>
              <p className="j-subtext">/ {aiRecommendedHours}h</p>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              value={userHours}
              onChange={(e) => setUserHours(parseInt(e.target.value))}
              className="w-full mt-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <Card className="j-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Your Badge Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {badges.slice(0, 10).map((badge: any) => {
                const progress = Math.min(100, (userPoints / badge.points_required) * 100);

                return (
                  <div key={badge.id} className="relative group">
                    <div className={`p-4 rounded-xl border-2 transition-all ${badge.earned ? 'j-badge-earned' : 'bg-gray-100 border-gray-300 opacity-70'}`}>
                      <div className="text-center space-y-2">
                        <div className={`text-4xl ${badge.earned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <p className={`text-xs font-bold ${badge.earned ? 'text-white' : 'text-gray-600'}`}>
                          {badge.name}
                        </p>
                        {!badge.earned && (
                          <div className="space-y-1">
                            <div className="j-progress">
                              <div className="j-progress-fill" style={{ width: `${progress}%`, background: '#cbd8ff' }} />
                            </div>
                            <p className="text-[10px] text-gray-500">{badge.points_required} pts</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {!badge.earned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                        <Lock className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="j-card">
          <CardHeader className="j-card-header">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5" />
              AI-Powered Study Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const config = priorityConfig[rec.priority];
                const PriorityIcon = config.icon;

                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 ${rec.priority === 'high' ? 'border-red-200 bg-red-50' : rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`j-tag ${rec.priority === 'high' ? 'j-tag-orange' : rec.priority === 'medium' ? 'j-tag-yellow' : 'j-tag-green'}`}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs j-subtext">{rec.subject} • {rec.chapter}</span>
                        </div>

                        <h4 className="font-bold text-lg j-primary-text mb-1">{rec.topic}</h4>

                        <div className="flex items-center gap-4 text-sm j-subtext mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {rec.estimatedTime} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {rec.accuracy}% accuracy
                          </span>
                        </div>

                        <p className={`text-sm ${rec.priority === 'high' ? 'text-red-700' : rec.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'} flex items-center gap-2`}>
                          <PriorityIcon className="w-4 h-4" />
                          {rec.reason}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => window.location.href = '/study-now'}
                        className="j-primary-btn ml-4"
                      >
                        Practice Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rank Predictor */}
      {predictedRank && predictedRank.totalAttempts >= 10 && (
        <Card className="j-card j-rank-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Trophy className="w-16 h-16 text-white" />
                <div>
                  <p className="text-sm text-white/80 mb-1">🎯 Predicted JEE Rank</p>
                  <p className="text-5xl font-black text-white mb-2">#{predictedRank.rank.toLocaleString()}</p>
                  <p className="text-white/90">Based on {predictedRank.score}% projected score • <Badge className="ml-2 bg-white/20 text-white">{predictedRank.confidence} Confidence</Badge></p>
                  <p className="text-sm text-white/90 mt-2">📊 Analyzed from {predictedRank.totalAttempts} attempts{predictedRank.confidence === 'Low' && ' • Solve 100+ for better accuracy'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/90 mb-2">
                  {predictedRank.rank < 10000 ? 'Target IIT Bombay!' :
                    predictedRank.rank < 50000 ? 'Keep pushing for Top 10K' :
                      'Focus on consistency'}
                </p>
                <p className="text-2xl font-black text-white">
                  {predictedRank.rank < 10000 ? 'TOP 10K' :
                    predictedRank.rank < 50000 ? 'TOP 50K' :
                      'TOP 1L+'}
                </p>
                {predictedRank.rank > 50000 && (
                  <p className="text-sm mt-2 text-white/90">+{Math.round((predictedRank.rank - 10000) / 1000)}K gap to close</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not enough data */}
      {(!predictedRank || predictedRank.totalAttempts < 10) && totalAttempts > 0 && (
        <Card className="j-card">
          <CardContent className="p-6 text-center">
            <Gauge className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold j-primary-text mb-2">🎯 Rank Predictor Loading...</h3>
            <p className="j-subtext mb-4">Solve <span className="font-bold">{10 - totalAttempts} more questions</span> to unlock accurate rank prediction!</p>
            <Button onClick={() => window.location.href = '/study-now'} className="j-primary-btn">
              <Rocket className="w-4 h-4 mr-2" />
              Continue Practicing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {strengthsWeaknesses && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="j-card">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-xl font-bold">💪 Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {strengthsWeaknesses.strengths.map((str, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-green-900 text-lg">{str.subject}</p>
                    <Badge className="bg-green-600 text-white px-3 py-1">{str.accuracy}%</Badge>
                  </div>
                  <div className="j-progress mb-2"><div className="j-progress-fill" style={{ width: `${str.accuracy}%` }} /></div>
                  <p className="text-sm text-green-700">🎯 {str.attempted} questions attempted • Keep it up!</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="j-card">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3 text-red-700">
                <XCircle className="w-6 h-6" />
                <span className="text-xl font-bold">🚨 Priority Weaknesses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {strengthsWeaknesses.weaknesses.map((weak, idx) => (
                <div key={idx} className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-red-900 text-lg">{weak.subject}</p>
                    <Badge className="bg-red-600 text-white px-3 py-1">{weak.accuracy}%</Badge>
                  </div>
                  <div className="j-progress mb-2"><div className="j-progress-fill" style={{ width: `${weak.accuracy}%` }} /></div>
                  <p className="text-sm text-red-700">⚡ Needs immediate attention!</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Study Plan */}
      {studyPlan.length > 0 && (
        <Card className="j-card">
          <CardHeader className="border-b j-card-header-alt">
            <CardTitle className="flex items-center gap-3 text-primary">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-2xl font-black">AI-Generated Daily Study Plan</span>
              <Badge className="ml-auto bg-primary text-white px-3 py-1">Personalized</Badge>
            </CardTitle>
            <p className="j-subtext mt-2">📊 Based on {totalAttempts} attempts • {overallAccuracy}% accuracy • Subject-wise performance</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {studyPlan.map((plan, idx) => {
                const priorityColors = {
                  'CRITICAL': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-600' },
                  'HIGH': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', badge: 'bg-orange-600' },
                  'MEDIUM': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-600' },
                  'LOW': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', badge: 'bg-green-600' }
                };
                const colors = priorityColors[plan.priority];

                return (
                  <div key={idx} className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className={`font-black text-2xl ${colors.text}`}>{plan.subject}</p>
                          <Badge className={`${colors.badge} text-white`}>{plan.priority}</Badge>
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
                        <p className={`text-4xl font-black ${colors.text}`}>{plan.recommendedTime}h</p>
                        <p className="text-sm text-slate-600 mt-1">per day</p>
                      </div>
                    </div>
                    <div className="j-progress"><div className="j-progress-fill" style={{ width: `${plan.accuracy}%` }} /></div>
                  </div>
                );
              })}
            </div>

            <Button onClick={() => window.location.href = '/study-now'} className="j-primary-btn w-full mt-6 py-4 text-lg">
              <Rocket className="w-5 h-5 mr-2" />
              START STUDYING NOW
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <Card className="j-card">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3 text-primary">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xl font-bold">📈 7-Day Performance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-3">
              {weeklyTrend.map((day, idx) => (
                <div key={idx} className={`p-3 rounded-xl text-center ${day.questions === 0 ? 'bg-slate-100 border border-slate-200' : day.accuracy >= 70 ? 'bg-green-50 border border-green-200' : day.accuracy >= 50 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-xs font-semibold j-subtext mb-1">{day.day}</p>
                  <p className="text-2xl font-black j-primary-text mb-1">{day.questions}</p>
                  <p className="text-xs j-subtext">questions</p>
                  {day.questions > 0 && <Badge className={`mt-2 ${day.accuracy >= 70 ? 'bg-green-600' : day.accuracy >= 50 ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>{day.accuracy}%</Badge>}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-primary-light rounded-lg border border-[#dce9ff]">
              <p className="text-sm text-primary font-semibold">
                💡 Insight: {weeklyTrend.reduce((sum, d) => sum + d.questions, 0)} questions this week • Avg accuracy: {
                  Math.round(
                    weeklyTrend.filter(d => d.questions > 0).length > 0
                      ? weeklyTrend.reduce((sum, d) => sum + d.accuracy, 0) / weeklyTrend.filter(d => d.questions > 0).length
                      : 0
                  )
                }%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed sections */}
      <Card className="j-card">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3 text-primary">
            <Layers className="w-6 h-6" />
            <span className="text-xl font-bold">Detailed Performance Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setExpandedSection('subjects')} className={`px-4 py-2 rounded ${expandedSection === 'subjects' ? 'bg-primary text-white' : 'bg-white border'}`}>📚 Subjects ({subjectAnalysis.length})</Button>
            <Button onClick={() => setExpandedSection('chapters')} className={`px-4 py-2 rounded ${expandedSection === 'chapters' ? 'bg-primary text-white' : 'bg-white border'}`}>📖 Chapters ({chapterAnalysis.length})</Button>
            <Button onClick={() => setExpandedSection('topics')} className={`px-4 py-2 rounded ${expandedSection === 'topics' ? 'bg-primary text-white' : 'bg-white border'}`}>🎯 Topics ({topicAnalysis.length})</Button>
          </div>

          {expandedSection === 'subjects' && (
            <div className="space-y-3">
              {subjectAnalysis.map((subject: any, idx) => (
                <div key={idx} className="p-5 rounded-xl border-2 bg-primary-light border-[#e5edff]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${subject.accuracy >= 70 ? 'bg-green-500' : subject.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-xl">{subject.subject}</p>
                        <p className="text-sm j-subtext">{subject.attempted} questions • Avg time: {subject.avgTime}s</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`px-4 py-2 ${subject.accuracy >= 70 ? 'bg-green-600' : subject.accuracy >= 50 ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>{subject.accuracy}%</Badge>
                    </div>
                  </div>
                  <div className="j-progress"><div className="j-progress-fill" style={{ width: `${subject.accuracy}%` }} /></div>
                  <div className="flex items-center justify-between mt-3 text-sm j-subtext">
                    <span>✅ {subject.correct} correct</span>
                    <span>❌ {subject.attempted - subject.correct} wrong</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expandedSection === 'chapters' && chapterAnalysis.length > 0 && (
            <div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 font-semibold">⚡ Showing weakest chapters - Focus on these first!</p>
              </div>
              <div className="space-y-3">
                {chapterAnalysis.map((chapter: any, idx) => (
                  <div key={idx} className="p-5 rounded-xl border-2 bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-orange-900 text-lg">{chapter.chapter}</p>
                        <p className="text-sm text-orange-700">{chapter.subject} • {chapter.total} questions • Avg: {chapter.avgTime}s</p>
                      </div>
                      <Badge className={`px-4 py-2 ${chapter.accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>{chapter.accuracy}%</Badge>
                    </div>
                    <div className="j-progress"><div className="j-progress-fill" style={{ width: `${chapter.accuracy}%` }} /></div>
                    <Button onClick={() => window.location.href = '/study-now'} size="sm" className="mt-3 bg-orange-600 text-white w-full">Practice This Chapter</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expandedSection === 'topics' && topicAnalysis.length > 0 && (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-semibold">🚨 Critical weak topics - Master these for quick score boost!</p>
              </div>
              <div className="space-y-3">
                {topicAnalysis.map((topic: any, idx) => (
                  <div key={idx} className="p-4 rounded-xl border-2 bg-red-50 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-red-900">{topic.topic}</p>
                        <p className="text-xs text-red-700">{topic.subject} • {topic.chapter} • {topic.total} attempts</p>
                      </div>
                      <Badge className="bg-red-600 text-white px-3 py-1">{topic.accuracy}%</Badge>
                    </div>
                    <div className="j-progress"><div className="j-progress-fill" style={{ width: `${topic.accuracy}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="j-card">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-700">🔥 Current Study Streak</p>
              <p className="text-4xl font-black text-amber-900">{currentStreak}</p>
              <p className="text-sm text-amber-700 mt-1">{currentStreak >= 30 ? '🏆 Legendary streak!' : currentStreak >= 7 ? '⚡ Great momentum!' : '💪 Keep building!'}</p>
            </div>
          </div>
          <div>
            <Badge className={`px-4 py-2 ${currentStreak >= 30 ? 'bg-amber-600' : currentStreak >= 7 ? 'bg-orange-500' : 'bg-amber-500'} text-white`}>{currentStreak >= 30 ? 'LEGEND' : currentStreak >= 7 ? 'ON FIRE' : 'BUILDING'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="j-card j-cta-card">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-black j-primary-text mb-2">Your AI Study Partner is Ready! 🚀</h3>
          <p className="j-subtext mb-6">Keep solving questions to get even more accurate predictions and personalized recommendations</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.href = '/study-now'} className="j-primary-btn px-6 py-3">Continue Studying</Button>
            <Button onClick={() => window.location.href = '/test'} className="px-6 py-3 border">Take Mock Test</Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="j-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-primary mt-1" />
            <div>
              <p className="text-sm font-bold j-primary-text mb-1">🔬 AI Intelligence Active</p>
              <p className="text-xs j-subtext">Analysis updates automatically as you practice. Rank prediction accuracy improves with more attempts. Currently analyzing {totalAttempts} data points across {subjectAnalysis.length} subjects.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------
// Theming CSS injected into component
// ----------------------
const THEME_CSS = `
:root{
  --primary: #013062;
  --primary-light: #E6EEFF;
  --gray-light: #E9E9E9;
  --card-radius: 18px;
  --shadow-soft: 0 8px 20px rgba(2,6,23,0.06);
}

/* Basic helpers */
.j-card {
  background: #fff;
  border: 1px solid rgba(14, 22, 54, 0.04);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-soft);
}

.j-title { color: var(--primary); }
.j-primary-text { color: var(--primary); font-weight: 800; }
.j-subtext { color: #425066; }

/* progress */
.j-progress { height: 8px; border-radius: 9999px; background: #f1f5ff; overflow: hidden; margin-top: 10px; }
.j-progress-fill { height: 8px; border-radius: 9999px; background: linear-gradient(90deg, var(--primary), #6b4aa8); box-shadow: inset 0 -2px 6px rgba(0,0,0,0.03); }

/* small tags */
.j-tag { font-size: 12px; padding: 4px 8px; border-radius: 12px; font-weight: 700; display: inline-block; }
.j-tag-orange { background: #FFEFE6; color: #D35400; }
.j-tag-yellow { background: #FFF7CC; color: #A67C00; }
.j-tag-green { background: #DFF4EA; color: #0F8A5F; }

/* primary button */
.j-primary-btn {
  background: linear-gradient(90deg, var(--primary), #6b4aa8);
  color: white;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* small surfaces */
.bg-primary { background: var(--primary); color: #fff; }
.bg-primary-light { background: var(--primary-light); color: var(--primary); }

/* tile variants */
.j-primary-tile { background: linear-gradient(90deg, var(--primary), #6b4aa8); color: #fff; }
.j-success-tile { background: linear-gradient(90deg, #04966b, #16b786); color: #fff;}
.j-warn-tile { background: linear-gradient(90deg, #f97316, #fb923c); color: #fff;}
.j-rec-tile { background: linear-gradient(90deg, #5b6be6, #9b5be6); color: #fff; }

/* badges earned */
.j-badge-earned { background: linear-gradient(90deg, #5b6be6, #6b8cff); border: none; color: white; box-shadow: 0 4px 12px rgba(91,107,230,0.18);}

/* loading */
.j-loading-card { background: linear-gradient(180deg, #fff, var(--primary-light)); border-radius: 20px; padding: 28px; box-shadow: 0 20px 40px rgba(1,48,98,0.08); border: 1px solid rgba(1,48,98,0.06); width: 480px; }

/* small color glows */
.primary-glow { box-shadow: 0 8px 30px rgba(1,48,98,0.12); }
.success-glow { background: linear-gradient(90deg,#12b76a,#34d399); color: white; padding: 6px 10px; border-radius: 10px; }

/* card headers */
.j-card-header { background: linear-gradient(90deg,var(--primary), #6b4aa8); padding: 12px 16px; border-top-left-radius: var(--card-radius); border-top-right-radius: var(--card-radius); }
.j-card-header-alt { background: linear-gradient(90deg, rgba(1,48,98,0.04), rgba(107,118,255,0.02)); padding: 12px 16px; }

/* smaller utilities */
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.font-black { font-weight: 900; }
`;

/* End of file */
