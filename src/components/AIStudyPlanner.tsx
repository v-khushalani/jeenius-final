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
  Lightbulb, Home, GraduationCap, ClipboardList
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
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);
  
  // Points & Badges
  const [userPoints, setUserPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  
  // AI Recommendations
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [stats, setStats] = useState({
    todayProgress: 0,
    weeklyStreak: 0,
    totalStudyTime: 0,
    targetHours: 6
  });
  
  // Analysis Data
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [subjectAnalysis, setSubjectAnalysis] = useState<any[]>([]);
  const [chapterAnalysis, setChapterAnalysis] = useState<any[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [predictedRank, setPredictedRank] = useState<any>(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<'subjects' | 'chapters' | 'topics'>('subjects');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);

  // theme
  const COLORS = {
    bg: '#F6F9FF',
    primary: '#013062',
    accent: '#4C6FFF',
    green: '#16a34a',
    orange: '#FF9F45'
  };

  const examDates = {
    'JEE_MAINS': '2026-01-24',
    'JEE_ADVANCED': '2026-05-24',
    'NEET': '2026-05-03',
    'BITSAT': '2026-05-15'
  } as const;

  const examNames: Record<string, string> = {
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
        setExamDate((examDates as any)[profile.target_exam] || examDates['JEE_MAINS']);
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
        setTotalAttempts(0);
        setCorrectAnswers(0);
        setWeeklyTrend([]);
        setStrengthsWeaknesses(null);
        setRecommendations([]);
        setStudyPlan([]);
        setPredictedRank(null);
        await fetchBadges();
        // minimal stats
        setStats(s => ({ ...s, todayProgress: 0, weeklyStreak: 0, totalStudyTime: 0 }));
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
      const enrichedAttempts = attempts.map((attempt: any) => ({
        ...attempt,
        questions: questions?.find((q: any) => q.id === attempt.question_id) || null
      }));

      setTotalAttempts(enrichedAttempts.length);
      const correct = enrichedAttempts.filter(a => a.is_correct).length;
      setCorrectAnswers(correct);

      // Subject-wise Analysis
      const subjectStats: Record<string, { total: number; correct: number; time: number; }> = {};
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
      })).sort((a: any, b: any) => a.accuracy - b.accuracy).slice(0, 10);

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
        .sort((a: any, b: any) => a.accuracy - b.accuracy)
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
      const last7Days: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayAttempts = enrichedAttempts.filter((a: any) => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= date && attemptDate < nextDate;
        });

        const dayCorrect = dayAttempts.filter((a: any) => a.is_correct).length;
        const dayAccuracy = dayAttempts.length > 0 ? Math.round((dayCorrect / dayAttempts.length) * 100) : 0;

        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          questions: dayAttempts.length,
          accuracy: dayAccuracy
        });
      }

      setWeeklyTrend(last7Days);

      // Calculate streak
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 365; i++) {
        const dayHasAttempts = enrichedAttempts.some((a: any) => {
          const attemptDate = new Date(a.created_at);
          attemptDate.setHours(0, 0, 0, 0);
          return attemptDate.getTime() === currentDate.getTime();
        });

        if (dayHasAttempts) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (i === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

      // Today's progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttempts = enrichedAttempts.filter((a: any) => new Date(a.created_at) >= today);
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
      generateIntelligentStudyPlan(subjectArray as any, chapterArray as any, topicArray as any, enrichedAttempts.length, correct);

      // Calculate rank
      calculatePredictedRank(correct, enrichedAttempts.length, subjectArray as any);

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

      const badgeMap = userBadges?.reduce((acc: any, ub: any) => {
        acc[ub.badge_id] = ub.earned_at;
        return acc;
      }, {}) || {};

      const enrichedBadges = allBadges?.map((badge: any) => ({
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
      .filter((rec) => rec.priority !== 'low')
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 } as any;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);

    setRecommendations(recs);
  };

  const generateIntelligentStudyPlan = (subjects: any[], chapters: any[], topics: any[], totalAttempts: number, correct: number) => {
    const overallAccuracy = Math.round((correct / totalAttempts) * 100);
    
    let recommendedHours = 6;
    if (daysRemaining < 30 && overallAccuracy < 60) recommendedHours = 12;
    else if (daysRemaining < 60 && overallAccuracy < 50) recommendedHours = 10;
    else if (daysRemaining < 90 && overallAccuracy < 65) recommendedHours = 8;
    else if (daysRemaining < 180 && overallAccuracy < 70) recommendedHours = 7;
    else if (overallAccuracy > 85) recommendedHours = 5;
    
    setAiRecommendedHours(recommendedHours);

    const plan = subjects.map((subject: any) => {
      let recommendedTime = 0;
      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      let strategy = '';

      if (subject.accuracy < 40 || (subject.accuracy < 60 && subject.attempted < 20)) {
        recommendedTime = Math.round(recommendedHours * 0.4);
        priority = 'CRITICAL';
        strategy = `Master basics first. Target: 50+ questions this week.`;
      } 
      else if (subject.accuracy < 60) {
        recommendedTime = Math.round(recommendedHours * 0.3);
        priority = 'HIGH';
        strategy = `Focus on weak chapters. Solve 30+ questions daily.`;
      } 
      else if (subject.accuracy < 75) {
        recommendedTime = Math.round(recommendedHours * 0.25);
        priority = 'MEDIUM';
        strategy = `Good progress—add advanced problems daily.`;
      } 
      else {
        recommendedTime = Math.round(recommendedHours * 0.15);
        priority = 'LOW';
        strategy = `Excellent—maintain with 15–20 questions daily.`;
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

    const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 } as any;
    plan.sort((a: any, b: any) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    setStudyPlan(plan);
  };

  const calculatePredictedRank = (correct: number, total: number, subjects: any[]) => {
    if (total < 10) {
      setPredictedRank(null);
      return;
    }

    const overallAccuracy = (correct / total) * 100;
    
    let estimatedScore = 0;
    let subjectCount = 0;
    
    subjects.forEach((subject: any) => {
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

  const handleExamChange = async (newExam: keyof typeof examDates) => {
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

  // ---------- Loading -----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: COLORS.bg }}>
        <div className="text-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-[#4C6FFF] animate-pulse mx-auto mb-4" />
          </div>
          <p className="text-base font-semibold text-slate-700">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  // ---------- Empty State -----------
  if (totalAttempts === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen" style={{ backgroundColor: COLORS.bg }}>
        <Card className="max-w-3xl mx-auto mt-24 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-10 text-center">
            <Brain className="w-16 h-16 text-[#4C6FFF] mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Welcome to AI Study Planner
            </h2>
            <p className="text-slate-600 mb-6">
              Start solving questions to unlock personalized insights, strengths/weaknesses, and AI-powered plans.
            </p>
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="bg-[#4C6FFF] hover:bg-[#013062] text-white px-6 py-6 text-base rounded-xl font-semibold"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Main UI -----------
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <div className="text-center pt-20">
        <h1 className="text-3xl font-extrabold text-[#013062]">
          AI Study Intelligence
        </h1>
        <p className="text-slate-600 text-sm">Comprehensive performance analysis + personalized study plan</p>
      </div>

      {/* Points */}
      <Card className="relative overflow-hidden border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#4C6FFF]/10 p-3 rounded-xl">
                <Sparkles className="w-5 h-5 text-[#4C6FFF]" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">JEEnius Points</p>
                <p className="text-slate-900 text-2xl font-extrabold">{userPoints.toLocaleString()}</p>
              </div>
            </div>
            {recentPoints > 0 && (
              <div className="bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-green-200">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-bold">+{recentPoints}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exam + Countdown */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs mb-1">Target Exam</p>
              <select
                value={selectedExam}
                onChange={(e) => handleExamChange(e.target.value as any)}
                className="bg-white text-slate-900 text-base font-semibold px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4C6FFF]"
              >
                {Object.keys(examNames).map(key => (
                  <option key={key} value={key} className="text-slate-900 font-semibold">
                    {examNames[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs mb-1">Exam Date</p>
              <p className="text-base font-semibold text-slate-900 mb-1">
                {new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex items-baseline gap-2 justify-end">
                <p className="text-4xl font-black text-[#013062]">{daysRemaining}</p>
                <p className="text-sm text-slate-600">days left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#013062]/10 p-2.5 rounded-lg">
                <Target className="w-5 h-5 text-[#013062]" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Today's Progress</p>
                <p className="text-2xl font-bold text-[#013062]">{stats.todayProgress}%</p>
              </div>
            </div>
            <Progress value={stats.todayProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2.5 rounded-lg">
                <Flame className="w-5 h-5 text-[#FF9F45]" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Study Streak</p>
                <p className="text-2xl font-bold text-orange-600">{stats.weeklyStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#4C6FFF]/10 p-2.5 rounded-lg">
                <Clock className="w-5 h-5 text-[#4C6FFF]" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Study Time Today</p>
                <p className="text-2xl font-bold text-[#4C6FFF]">{stats.totalStudyTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-lg">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Daily Target</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.targetHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-4 gap-3">
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-[#013062]" />
              <Badge className="bg-slate-900 text-white text-sm px-3 py-1">
                {overallAccuracy}%
              </Badge>
            </div>
            <p className="text-3xl font-black mb-1 text-slate-900">{correctAnswers}</p>
            <p className="text-slate-500 text-sm">out of {totalAttempts} correct</p>
            <Progress value={overallAccuracy} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 text-emerald-700" />
              <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
                LIVE
              </Badge>
            </div>
            <p className="text-3xl font-black mb-1 text-slate-900">{subjectAnalysis.length}</p>
            <p className="text-slate-500 text-sm">subjects analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-600 text-white text-sm px-3 py-1">
                {topicAnalysis.length}
              </Badge>
            </div>
            <p className="text-3xl font-black mb-1 text-slate-900">Weak</p>
            <p className="text-slate-500 text-sm">topics identified</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-[#4C6FFF]" />
              <Badge className="bg-[#4C6FFF] text-white text-sm px-3 py-1">
                AI REC
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-3xl font-black text-slate-900">{userHours}h</p>
              <p className="text-slate-500 text-sm">/ {aiRecommendedHours}h</p>
            </div>
            <input
              type="range"
              min="2"
              max="14"
              value={userHours}
              onChange={(e) => setUserHours(parseInt(e.target.value))}
              className="w-full mt-3 accent-[#4C6FFF]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Badges Showcase */}
      {badges.length > 0 && (
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Trophy className="w-5 h-5 text-amber-600" />
              Your Badge Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {badges.slice(0, 10).map((badge: any) => {
                const progress = Math.min(100, (userPoints / badge.points_required) * 100);
                return (
                  <div key={badge.id} className="relative">
                    <div className={`p-4 rounded-xl border transition-all ${
                      badge.earned
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="text-center space-y-2">
                        <div className={`text-3xl ${badge.earned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <p className={`text-xs font-semibold ${badge.earned ? 'text-slate-900' : 'text-slate-600'}`}>
                          {badge.name}
                        </p>
                        {!badge.earned && (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-1" />
                            <p className="text-[10px] text-slate-500">
                              {badge.points_required} pts
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {!badge.earned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
                        <Lock className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Brain className="w-5 h-5 text-[#4C6FFF]" />
              AI-Powered Study Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recommendations.map((rec, idx) => {
                const config = priorityConfig[rec.priority];
                const PriorityIcon = config.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-slate-900 text-white">{rec.priority.toUpperCase()}</Badge>
                          <span className="text-xs text-slate-500">
                            {rec.subject} • {rec.chapter}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base mb-1 text-slate-900">{rec.topic}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {rec.estimatedTime} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {rec.accuracy}% accuracy
                          </span>
                        </div>
                        <p className={`text-sm ${config.textColor} flex items-center gap-2`}>
                          <PriorityIcon className="w-4 h-4" />
                          {rec.reason}
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => window.location.href = '/study-now'}
                        className="bg-[#4C6FFF] hover:bg-[#013062] text-white"
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
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <Trophy className="w-12 h-12 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Predicted JEE Rank</p>
                  <p className="text-4xl font-black text-[#4C6FFF]">#{predictedRank.rank.toLocaleString()}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Based on {predictedRank.score}% projected score • 
                    <Badge className="ml-2 bg-slate-900 text-white">{predictedRank.confidence} Confidence</Badge>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Analyzed from {predictedRank.totalAttempts} attempts
                    {predictedRank.confidence === 'Low' && ' • Solve 100+ for better accuracy'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">
                  {predictedRank.rank < 10000 ? 'Target IIT Bombay!' : 
                   predictedRank.rank < 50000 ? 'Keep pushing for Top 10K' : 
                   'Focus on consistency'}
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {predictedRank.rank < 10000 ? 'TOP 10K' : 
                   predictedRank.rank < 50000 ? 'TOP 50K' : 
                   'TOP 1L+'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Enough Data Warning */}
      {(!predictedRank || predictedRank.totalAttempts < 10) && totalAttempts > 0 && (
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5 text-center">
            <Gauge className="w-12 h-12 text-[#4C6FFF] mx-auto mb-2" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Rank Predictor Loading...
            </h3>
            <p className="text-slate-600 mb-3">
              Solve <span className="font-bold">{10 - totalAttempts} more questions</span> to unlock accurate rank prediction!
            </p>
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="bg-[#4C6FFF] hover:bg-[#013062] text-white"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Continue Practicing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {strengthsWeaknesses && (
        <div className="grid md:grid-cols-2 gap-3">
          <Card className="border border-emerald-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="border-b border-emerald-100 rounded-t-2xl">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-bold">Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {strengthsWeaknesses.strengths.map((str: any, idx: number) => (
                <div key={idx} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-emerald-900">{str.subject}</p>
                    <Badge className="bg-emerald-600 text-white">{str.accuracy}%</Badge>
                  </div>
                  <Progress value={str.accuracy} />
                  <p className="text-xs text-emerald-700 mt-2">
                    {str.attempted} questions attempted
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-rose-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="border-b border-rose-100 rounded-t-2xl">
              <CardTitle className="flex items-center gap-3 text-rose-800">
                <XCircle className="w-6 h-6" />
                <span className="text-lg font-bold">Priority Weaknesses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {strengthsWeaknesses.weaknesses.map((weak: any, idx: number) => (
                <div key={idx} className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-rose-900">{weak.subject}</p>
                    <Badge className="bg-rose-600 text-white">{weak.accuracy}%</Badge>
                  </div>
                  <Progress value={weak.accuracy} />
                  <p className="text-xs text-rose-700 mt-2">
                    Needs immediate attention
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Study Plan */}
      {studyPlan.length > 0 && (
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <Brain className="w-6 h-6 text-[#4C6FFF]" />
              <span className="text-xl font-extrabold">AI-Generated Daily Study Plan</span>
              <Badge className="ml-auto bg-slate-900 text-white">
                Personalized
              </Badge>
            </CardTitle>
            <p className="text-slate-600 text-xs mt-2">
              Based on {totalAttempts} attempts • {overallAccuracy}% accuracy • Subject-wise performance
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {studyPlan.map((plan: any, idx: number) => {
                const priorityColors: any = {
                  'CRITICAL': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', badge: 'bg-rose-600' },
                  'HIGH': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-600' },
                  'MEDIUM': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600' },
                  'LOW': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-600' }
                };
                const colors = priorityColors[plan.priority];

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border ${colors.border} ${colors.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-extrabold text-lg ${colors.text}`}>{plan.subject}</p>
                          <Badge className={`${colors.badge} text-white`}>{plan.priority}</Badge>
                        </div>
                        <p className={`text-sm ${colors.text}`}>{plan.strategy}</p>
                        <div className="flex items-center gap-4 text-sm mt-2 text-slate-700">
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
                        <p className="text-xs text-slate-500 mt-1">per day</p>
                      </div>
                    </div>
                    <Progress value={plan.accuracy} className="h-2" />
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => window.location.href = '/study-now'}
              className="w-full mt-5 bg-[#4C6FFF] hover:bg-[#013062] text-white font-bold py-5 text-base rounded-xl"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Studying Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Performance Trend */}
      {weeklyTrend.length > 0 && (
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <TrendingUp className="w-6 h-6 text-[#013062]" />
              <span className="text-lg font-bold">7-Day Performance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-7 gap-2">
              {weeklyTrend.map((day: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-center border ${
                    day.questions === 0 
                      ? 'bg-slate-50 border-slate-200' 
                      : day.accuracy >= 70 
                      ? 'bg-emerald-50 border-emerald-200'
                      : day.accuracy >= 50
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <p className="text-[11px] font-medium text-slate-600 mb-1">{day.day}</p>
                  <p className="text-xl font-extrabold text-slate-900 mb-0.5">{day.questions}</p>
                  <p className="text-[11px] text-slate-500">questions</p>
                  {day.questions > 0 && (
                    <Badge className={`mt-2 text-[11px] ${
                      day.accuracy >= 70 ? 'bg-emerald-600' : 
                      day.accuracy >= 50 ? 'bg-amber-600' : 'bg-rose-600'
                    } text-white`}>
                      {day.accuracy}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-800 font-semibold">
                {weeklyTrend.reduce((sum, d) => sum + d.questions, 0)} questions this week • 
                Avg accuracy: {Math.round(
                  weeklyTrend.filter(d => d.questions > 0).length
                    ? weeklyTrend.reduce((sum, d) => sum + d.accuracy, 0) / weeklyTrend.filter(d => d.questions > 0).length
                    : 0
                )}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Sections */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <Layers className="w-6 h-6 text-[#4C6FFF]" />
            <span className="text-lg font-bold">Detailed Performance Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex gap-2 mb-5">
            <Button
              onClick={() => setExpandedSection('subjects')}
              variant={expandedSection === 'subjects' ? 'default' : 'outline'}
              className={`${expandedSection === 'subjects' ? 'bg-[#4C6FFF]' : 'bg-white'} text-sm`}
            >
              📚 Subjects ({subjectAnalysis.length})
            </Button>
            <Button
              onClick={() => setExpandedSection('chapters')}
              variant={expandedSection === 'chapters' ? 'default' : 'outline'}
              className={`${expandedSection === 'chapters' ? 'bg-[#4C6FFF]' : 'bg-white'} text-sm`}
            >
              📖 Chapters ({chapterAnalysis.length})
            </Button>
            <Button
              onClick={() => setExpandedSection('topics')}
              variant={expandedSection === 'topics' ? 'default' : 'outline'}
              className={`${expandedSection === 'topics' ? 'bg-[#4C6FFF]' : 'bg-white'} text-sm`}
            >
              🎯 Topics ({topicAnalysis.length})
            </Button>
          </div>

          {expandedSection === 'subjects' && (
            <div className="space-y-3">
              {subjectAnalysis.map((subject: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        subject.accuracy >= 70 ? 'bg-emerald-600' :
                        subject.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      } flex items-center justify-center text-white font-bold`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{subject.subject}</p>
                        <p className="text-xs text-slate-600">
                          {subject.attempted} questions • Avg time: {subject.avgTime}s
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-base px-3 py-1 ${
                        subject.accuracy >= 70 ? 'bg-emerald-600' :
                        subject.accuracy >= 50 ? 'bg-amber-600' : 'bg-rose-600'
                      } text-white`}>
                        {subject.accuracy}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={subject.accuracy} className="h-2" />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-700">
                    <span>✅ {subject.correct} correct</span>
                    <span>❌ {subject.attempted - subject.correct} wrong</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expandedSection === 'chapters' && chapterAnalysis.length > 0 && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-amber-800 font-semibold">
                  Showing weakest chapters — focus here first
                </p>
              </div>
              {chapterAnalysis.map((chapter: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-amber-50 rounded-xl border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-amber-900">{chapter.chapter}</p>
                      <p className="text-xs text-amber-700">
                        {chapter.subject} • {chapter.total} questions • Avg: {chapter.avgTime}s
                      </p>
                    </div>
                    <Badge className={`text-sm px-3 py-1 ${
                      chapter.accuracy >= 60 ? 'bg-amber-600' : 'bg-rose-600'
                    } text-white`}>
                      {chapter.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={chapter.accuracy} className="h-2" />
                  <Button
                    onClick={() => window.location.href = '/study-now'}
                    size="sm"
                    className="mt-3 bg-[#4C6FFF] hover:bg-[#013062] text-white w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Practice This Chapter
                  </Button>
                </div>
              ))}
            </div>
          )}

          {expandedSection === 'topics' && topicAnalysis.length > 0 && (
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-rose-800 font-semibold">
                  Critical weak topics — master these for quick score boost
                </p>
              </div>
              {topicAnalysis.map((topic: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-rose-50 rounded-xl border border-rose-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-rose-900">{topic.topic}</p>
                      <p className="text-[11px] text-rose-700">
                        {topic.subject} • {topic.chapter} • {topic.total} attempts
                      </p>
                    </div>
                    <Badge className="bg-rose-600 text-white">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <Progress value={topic.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Streak Card */}
      <Card className="border border-amber-200 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-700 mb-1">Current Study Streak</p>
                <p className="text-4xl font-black text-amber-900">{currentStreak}</p>
                <p className="text-sm text-amber-700 mt-1">
                  {currentStreak >= 30 ? 'Legendary streak!' : 
                   currentStreak >= 7 ? 'Great momentum!' : 
                   'Keep building!'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`text-xs px-3 py-1 ${
                currentStreak >= 30 ? 'bg-amber-600' :
                currentStreak >= 7 ? 'bg-orange-500' : 'bg-amber-500'
              } text-white`}>
                {currentStreak >= 30 ? 'LEGEND' : currentStreak >= 7 ? 'ON FIRE' : 'BUILDING'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Banner */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-[#4C6FFF] mx-auto mb-3" />
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            Your AI Study Partner is Ready
          </h3>
          <p className="text-sm text-slate-600 mb-5">
            Keep solving questions to get even more accurate predictions and personalized recommendations.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.href = '/study-now'}
              className="bg-[#4C6FFF] hover:bg-[#013062] text-white font-bold px-6 py-5 text-base rounded-xl"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Continue Studying
            </Button>
            <Button
              onClick={() => window.location.href = '/test'}
              className="bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 font-bold px-6 py-5 text-base rounded-xl"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Take Mock Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-24">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-[#4C6FFF] mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 mb-1">
                AI Intelligence Active
              </p>
              <p className="text-xs text-slate-600">
                Analysis updates automatically as you practice. Rank prediction accuracy improves with more attempts. 
                Currently analyzing {totalAttempts} data points across {subjectAnalysis.length} subjects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-around bg-white border-t border-slate-200 py-2 shadow-sm">
            <Button
              variant="ghost"
              className="flex flex-col items-center text-[11px] text-slate-700"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <Home className="w-5 h-5 mb-1" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center text-[11px] text-slate-700"
              onClick={() => (window.location.href = '/study-now')}
            >
              <BookOpen className="w-5 h-5 mb-1" />
              Study
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center text-[11px] text-[#4C6FFF] font-semibold"
            >
              <GraduationCap className="w-5 h-5 mb-1" />
              Planner
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center text-[11px] text-slate-700"
              onClick={() => (window.location.href = '/test')}
            >
              <ClipboardList className="w-5 h-5 mb-1" />
              Tests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
