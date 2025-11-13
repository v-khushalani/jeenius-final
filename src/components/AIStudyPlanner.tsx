// EnhancedAIStudyPlanner.redesigned.tsx
// READY-TO-PASTE — UI-redesigned, backend logic preserved.
// Brand colors: primary #013062, light #E6EEFF, light gray #E9E9E9

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, TrendingDown, Brain, BookOpen, AlertTriangle, Activity, Zap,
  ChevronRight, Award, BarChart3, TrendingUp, CheckCircle2, XCircle,
  Sparkles, Rocket, Timer, PieChart, Clock, Trophy, Flame, Star,
  ChevronDown, ChevronUp, Layers, Gauge, Calendar, Play, Lock, Crown,
  Lightbulb, MessageCircle, User
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
  // ========= States & backend logic (unchanged semantics) =========
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [aiRecommendedHours, setAiRecommendedHours] = useState(6);
  const [userHours, setUserHours] = useState(6);

  const [userPoints, setUserPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);

  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [stats, setStats] = useState({
    todayProgress: 0,
    weeklyStreak: 0,
    totalStudyTime: 0,
    targetHours: 6
  });

  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [subjectAnalysis, setSubjectAnalysis] = useState<any[]>([]);
  const [chapterAnalysis, setChapterAnalysis] = useState<any[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [predictedRank, setPredictedRank] = useState<any | null>(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState<any | null>(null);
  const [expandedSection, setExpandedSection] = useState<'subjects'|'chapters'|'topics'>('subjects');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [openRecIndex, setOpenRecIndex] = useState<number | null>(null);
  const [showAssistant, setShowAssistant] = useState(true);

  const examDates: Record<string,string> = {
    'JEE_MAINS': '2026-01-24',
    'JEE_ADVANCED': '2026-05-24',
    'NEET': '2026-05-03',
    'BITSAT': '2026-05-15'
  };

  const examNames: Record<string,string> = {
    'JEE_MAINS': 'JEE Mains 2026',
    'JEE_ADVANCED': 'JEE Advanced 2026',
    'NEET': 'NEET 2026',
    'BITSAT': 'BITSAT 2026'
  };

  const daysRemaining = useMemo(() => Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))), [examDate]);

  useEffect(() => { fetchComprehensiveAnalysis(); }, []); // unchanged logic

  // NOTE: I pasted your original fetchComprehensiveAnalysis and helper functions but kept them intact.
  // I also added small UI-only helpers (no changes to DB schema or queries).

  const fetchComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Login required');
        setLoading(false);
        return;
      }

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

      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (attemptsError) {
        console.error('Attempts fetch error:', attemptsError);
        toast.error('Failed to fetch attempts');
        setLoading(false);
        return;
      }

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      const questionIds = [...new Set(attempts.map((a: any) => a.question_id))];
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, subject, chapter, topic, difficulty')
        .in('id', questionIds);

      if (questionsError) {
        console.error('Questions fetch error:', questionsError);
      }

      const enrichedAttempts = attempts.map((attempt: any) => ({
        ...attempt,
        questions: questions?.find((q: any) => q.id === attempt.question_id) || null
      }));

      setTotalAttempts(enrichedAttempts.length);
      const correct = enrichedAttempts.filter((a: any) => a.is_correct).length;
      setCorrectAnswers(correct);

      const subjectStats: any = {};
      enrichedAttempts.forEach((att: any) => {
        const subject = att.questions?.subject || 'Unknown';
        if (!subjectStats[subject]) subjectStats[subject] = { total: 0, correct: 0, time: 0 };
        subjectStats[subject].total++;
        if (att.is_correct) subjectStats[subject].correct++;
        subjectStats[subject].time += att.time_taken || 0;
      });

      const subjectArray = Object.keys(subjectStats).map(subject => ({
        subject,
        attempted: subjectStats[subject].total,
        correct: subjectStats[subject].correct,
        accuracy: Math.round((subjectStats[subject].correct / subjectStats[subject].total) * 100) || 0,
        avgTime: Math.round(subjectStats[subject].time / subjectStats[subject].total) || 0
      })).sort((a,b) => b.accuracy - a.accuracy);

      setSubjectAnalysis(subjectArray);

      const chapterStats: any = {};
      enrichedAttempts.forEach((att: any) => {
        const key = `${att.questions?.subject}-${att.questions?.chapter}`;
        if (!chapterStats[key]) chapterStats[key] = { subject: att.questions?.subject, chapter: att.questions?.chapter, total: 0, correct: 0, time: 0 };
        chapterStats[key].total++;
        if (att.is_correct) chapterStats[key].correct++;
        chapterStats[key].time += att.time_taken || 0;
      });

      const chapterArray = Object.values(chapterStats).map((ch: any) => ({
        ...ch,
        accuracy: Math.round((ch.correct / ch.total) * 100) || 0,
        avgTime: Math.round(ch.time / ch.total) || 0
      })).sort((a,b) => a.accuracy - b.accuracy).slice(0,10);
      setChapterAnalysis(chapterArray);

      const topicStats: any = {};
      enrichedAttempts.forEach((att: any) => {
        const topic = att.questions?.topic || 'Unknown';
        if (!topicStats[topic]) topicStats[topic] = { topic, subject: att.questions?.subject, chapter: att.questions?.chapter, total: 0, correct: 0 };
        topicStats[topic].total++;
        if (att.is_correct) topicStats[topic].correct++;
      });

      const topicArray = Object.values(topicStats)
        .filter((t: any) => t.total >= 3)
        .map((t: any) => ({ ...t, accuracy: Math.round((t.correct / t.total) * 100) || 0 }))
        .sort((a:any,b:any) => a.accuracy - b.accuracy)
        .slice(0,15);

      setTopicAnalysis(topicArray);

      const strengths = subjectArray.filter((s:any) => s.accuracy >= 70).slice(0,3);
      const weaknesses = subjectArray.filter((s:any) => s.accuracy < 60).slice(0,3);

      setStrengthsWeaknesses({
        strengths: strengths.length > 0 ? strengths : [{ subject: 'Keep practicing!', accuracy: 0, attempted: 0 }],
        weaknesses: weaknesses.length > 0 ? weaknesses : [{ subject: 'All good!', accuracy: 100, attempted: 0 }]
      });

      const last7Days: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0,0,0,0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayAttempts = enrichedAttempts.filter(a => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= date && attemptDate < nextDate;
        });

        const dayCorrect = dayAttempts.filter(a => a.is_correct).length;
        const dayAccuracy = dayAttempts.length > 0 ? Math.round((dayCorrect / dayAttempts.length) * 100) : 0;

        last7Days.push({ day: date.toLocaleDateString('en-US', { weekday:'short' }), questions: dayAttempts.length, accuracy: dayAccuracy });
      }
      setWeeklyTrend(last7Days);

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0,0,0,0);

      for (let i = 0; i < 365; i++) {
        const dayHasAttempts = enrichedAttempts.some((a:any) => {
          const attemptDate = new Date(a.created_at);
          attemptDate.setHours(0,0,0,0);
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

      const today = new Date();
      today.setHours(0,0,0,0);
      const todayAttempts = enrichedAttempts.filter(a => new Date(a.created_at) >= today);
      const todayProgress = Math.min(100, todayAttempts.length * 4);

      setStats({
        todayProgress,
        weeklyStreak: streak,
        totalStudyTime: Math.floor(todayAttempts.length * 2 / 60),
        targetHours: 6
      });

      await fetchBadges();
      await generateSmartRecommendations(enrichedAttempts, topicStats);
      generateIntelligentStudyPlan(subjectArray, chapterArray, topicArray, enrichedAttempts.length, correct);
      calculatePredictedRank(correct, enrichedAttempts.length, subjectArray);

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

      const badgeMap = userBadges?.reduce((acc:any, ub:any) => {
        acc[ub.badge_id] = ub.earned_at;
        return acc;
      }, {}) || {};

      const enrichedBadges = allBadges?.map((badge:any) => ({ ...badge, earned: !!badgeMap[badge.id], earned_at: badgeMap[badge.id] })) || [];

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
        if (accuracy < 40) { priority = 'high'; reason = 'Critical weakness - needs immediate attention'; }
        else if (accuracy < 70) { priority = 'medium'; reason = 'Moderate weakness - practice recommended'; }
        else { priority = 'low'; reason = 'Strong area - maintain with revision'; }
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
      .sort((a,b) => ({high:0,medium:1,low:2}[a.priority] - {high:0,medium:1,low:2}[b.priority]))
      .slice(0, 12);

    setRecommendations(recs);
  };

  const generateIntelligentStudyPlan = (subjects:any, chapters:any, topics:any, totalAttempts:number, correct:number) => {
    const overallAccuracy = Math.round((correct / totalAttempts) * 100);
    let recommendedHours = 6;
    if (daysRemaining < 30 && overallAccuracy < 60) recommendedHours = 12;
    else if (daysRemaining < 60 && overallAccuracy < 50) recommendedHours = 10;
    else if (daysRemaining < 90 && overallAccuracy < 65) recommendedHours = 8;
    else if (daysRemaining < 180 && overallAccuracy < 70) recommendedHours = 7;
    else if (overallAccuracy > 85) recommendedHours = 5;
    setAiRecommendedHours(recommendedHours);

    const plan = subjects.map((subject:any) => {
      let recommendedTime = 0;
      let priority = 'MEDIUM';
      let strategy = '';
      if (subject.accuracy < 40 || (subject.accuracy < 60 && subject.attempted < 20)) {
        recommendedTime = Math.round(recommendedHours * 0.4); priority = 'CRITICAL';
        strategy = `🚨 Urgent! Master basics first. Target: 50+ questions this week.`;
      } else if (subject.accuracy < 60) {
        recommendedTime = Math.round(recommendedHours * 0.3); priority = 'HIGH';
        strategy = `⚡ Focus on weak chapters. Solve 30+ questions daily.`;
      } else if (subject.accuracy < 75) {
        recommendedTime = Math.round(recommendedHours * 0.25); priority = 'MEDIUM';
        strategy = `✅ Good progress! Practice advanced problems daily.`;
      } else {
        recommendedTime = Math.round(recommendedHours * 0.15); priority = 'LOW';
        strategy = `🏆 Excellent! Maintain with 15-20 questions daily.`;
      }
      return { subject: subject.subject, accuracy: subject.accuracy, attempted: subject.attempted, recommendedTime, priority, strategy };
    });

    const priorityOrder: any = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
    plan.sort((a:any,b:any) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setStudyPlan(plan);
  };

  const calculatePredictedRank = (correct:number, total:number, subjects:any[]) => {
    if (total < 10) { setPredictedRank(null); return; }
    const overallAccuracy = (correct / total) * 100;
    let estimatedScore = 0;
    let subjectCount = 0;
    subjects.forEach(subject => {
      if (subject.subject === 'Physics') { estimatedScore += subject.accuracy * 1.2; subjectCount++; }
      if (subject.subject === 'Chemistry') { estimatedScore += subject.accuracy * 1.0; subjectCount++; }
      if (subject.subject === 'Mathematics') { estimatedScore += subject.accuracy * 1.3; subjectCount++; }
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

    setPredictedRank({ rank: Math.min(rank, 1200000), score: predictedScore, confidence, totalAttempts: total });
  };

  const handleExamChange = async (newExam: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ target_exam: newExam }).eq('id', user.id);
      setSelectedExam(newExam);
      setExamDate(examDates[newExam]);
      toast.success(`Goal updated: ${examNames[newExam]}`);
      await fetchComprehensiveAnalysis();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ========= UI Helpers (new, UI-only) =========

  // Small animated counter hook
  const useAnimatedNumber = (value:number, duration = 700) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let raf: any;
      const start = performance.now();
      const initial = display;
      const diff = value - initial;
      const step = (t: number) => {
        const now = performance.now();
        const p = Math.min(1, (now - start)/duration);
        setDisplay(Math.round(initial + diff * p));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return display;
  };

  const animatedCorrect = useAnimatedNumber(correctAnswers);
  const animatedPoints = useAnimatedNumber(userPoints);

  // Progress ring component (simple, lightweight)
  const ProgressRing = ({ size=88, stroke=8, value=0, label='' }: { size?:number, stroke?:number, value?:number, label?:string }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value/100) * circumference;
    const center = size / 2;
    return (
      <div className="pr-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <linearGradient id="gradPrimary" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#013062"/>
              <stop offset="100%" stopColor="#6b4aa8"/>
            </linearGradient>
          </defs>
          <circle cx={center} cy={center} r={radius} stroke="#E9E9E9" strokeWidth={stroke} fill="none" />
          <circle cx={center} cy={center} r={radius} stroke="url(#gradPrimary)" strokeWidth={stroke} fill="none"
            strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`} />
        </svg>
        <div className="pr-label">
          <div className="pr-value">{value}%</div>
          <div className="pr-sub">{label}</div>
        </div>
      </div>
    );
  };

  const priorityConfig = {
    high: { color: '#ff6b6b', bg: '#fff0f0', icon: AlertTriangle },
    medium: { color: '#f59e0b', bg: '#fff8e6', icon: TrendingUp },
    low: { color: '#16a34a', bg: '#ecfdf5', icon: CheckCircle2 }
  };

  // ========= Render =========

  if (loading) {
    return (
      <div className="ea-wrapper" data-theme="jeenius">
        <style>{THEME_CSS}</style>
        <div className="ea-center">
          <div className="ea-loading-card">
            <div className="ea-loading-left">
              <div className="ea-glow-circle"><Brain className="icon big" /></div>
            </div>
            <div className="ea-loading-right">
              <h3 className="title">AI analyzing your performance…</h3>
              <p className="muted">Gathering insights and building your study plan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (totalAttempts === 0) {
    // Empty state — improved copy and CTA
    return (
      <div className="ea-wrapper" data-theme="jeenius">
        <style>{THEME_CSS}</style>
        <div className="ea-empty">
          <Card className="ea-card ea-empty-card">
            <CardContent className="p-10 text-center">
              <div className="avatar-hero"><Brain className="icon hero" /></div>
              <h2 className="title">Welcome to AI Study Intelligence</h2>
              <p className="muted">Start solving questions and the planner will build you a personalized plan, rank predictor, and recommendations.</p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/study-now'} className="primary">Start Practicing</Button>
                <Button onClick={() => window.location.href = '/test'} className="ghost">Take a Mock</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="ea-wrapper" data-theme="jeenius">
      <style>{THEME_CSS}</style>

      {/* Floating Assistant */}
      {showAssistant && (
        <button className="ea-assistant" onClick={() => { setShowAssistant(false); toast.success('Assistant minimized — open Study Now to chat with JEEnius AI.'); }}>
          <div className="assistant-bubble"><Sparkles className="icon small" /></div>
          <div className="assistant-text">
            <div className="small">JEEnius AI</div>
            <div className="muted">Quick tips & micro reviews</div>
          </div>
        </button>
      )}

      <div className="ea-container">
        {/* Hero */}
        <header className="ea-hero">
          <div className="ea-hero-left">
            <h1 className="ea-title">AI Study Intelligence</h1>
            <p className="ea-sub">Personalized study plan · Smart recommendations · Rank predictor</p>

            <div className="ea-hero-stats">
              <div className="ea-hero-stat">
                <div className="stat-label">JEEnius Points</div>
                <div className="stat-value">{animatedPoints.toLocaleString()}</div>
                <div className="stat-sub muted">{recentPoints > 0 ? `+${recentPoints} recent` : 'No recent activity'}</div>
              </div>

              <div className="ea-hero-stat">
                <div className="stat-label">Exam</div>
                <select className="ea-select" value={selectedExam} onChange={(e) => handleExamChange(e.target.value)}>
                  {Object.keys(examNames).map(k => <option key={k} value={k}>{examNames[k]}</option>)}
                </select>
                <div className="stat-sub muted">{new Date(examDate).toLocaleDateString('en-US', { month: 'short', day:'numeric', year: 'numeric' })} • <strong>{daysRemaining} days</strong></div>
              </div>

              <div className="ea-hero-stat">
                <div className="stat-label">Today's Progress</div>
                <div className="stat-value">{stats.todayProgress}%</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.todayProgress}%` }} /></div>
              </div>

              <div className="ea-hero-stat">
                <div className="stat-label">Study Time Today</div>
                <div className="stat-value">{stats.totalStudyTime}h</div>
                <div className="stat-sub muted">{stats.weeklyStreak} day streak</div>
              </div>
            </div>
          </div>

          <div className="ea-hero-right">
            <div className="ea-ring-card">
              <ProgressRing value={Math.round((correctAnswers/totalAttempts)*100)} label="Accuracy" />
              <div className="ea-ring-meta">
                <div className="meta-item">
                  <div className="meta-label">Correct</div>
                  <div className="meta-value">{animatedCorrect}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Attempts</div>
                  <div className="meta-value">{totalAttempts}</div>
                </div>
              </div>
            </div>

            <div className="ea-quick-actions">
              <Button className="primary" onClick={() => window.location.href = '/study-now'}><Rocket className="icon tiny"/> Continue Studying</Button>
              <Button className="ghost" onClick={() => window.location.href = '/test'}><Trophy className="icon tiny"/> Take Mock</Button>
            </div>
          </div>
        </header>

        {/* strip of small cards */}
        <section className="ea-strip">
          <div className="ea-strip-grid">
            <div className="strip-card">
              <div className="strip-left"><Target className="icon" /></div>
              <div className="strip-right">
                <div className="strip-title">Daily Target</div>
                <div className="strip-value">{stats.targetHours}h</div>
              </div>
            </div>

            <div className="strip-card">
              <div className="strip-left"><Flame className="icon" /></div>
              <div className="strip-right">
                <div className="strip-title">Current Streak</div>
                <div className="strip-value">{currentStreak} days</div>
              </div>
            </div>

            <div className="strip-card">
              <div className="strip-left"><BookOpen className="icon" /></div>
              <div className="strip-right">
                <div className="strip-title">Subjects Analyzed</div>
                <div className="strip-value">{subjectAnalysis.length}</div>
              </div>
            </div>

            <div className="strip-card">
              <div className="strip-left"><AlertTriangle className="icon" /></div>
              <div className="strip-right">
                <div className="strip-title">Weak Topics</div>
                <div className="strip-value">{topicAnalysis.length}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <main className="ea-main-grid">
          {/* Left Column */}
          <div className="col-left">
            {/* Recommendations — swipe-like cards with expand */}
            <Card className="ea-card ea-recs">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <Brain className="icon medium" />
                    <div>
                      <div className="h-title">AI Recommendations</div>
                      <div className="muted">Personalized topics to practice now</div>
                    </div>
                  </div>
                </CardTitle>
                <div className="header-right">
                  <Badge className="small">Top picks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="recs-scroll">
                  {recommendations.map((rec, idx) => {
                    const cfg = priorityConfig[rec.priority];
                    const isOpen = openRecIndex === idx;
                    const Icon = cfg.icon;
                    return (
                      <div key={idx} className={`rec-card ${isOpen ? 'open' : ''}`} onClick={() => setOpenRecIndex(isOpen ? null : idx)}>
                        <div className="rec-left">
                          <div className="rec-priority" style={{ background: cfg.bg, borderColor: cfg.color }}>
                            <Icon className="icon tiny" />
                          </div>
                        </div>
                        <div className="rec-mid">
                          <div className="rec-topic">{rec.topic}</div>
                          <div className="rec-meta muted">{rec.subject} • {rec.chapter}</div>
                          <div className="rec-stats">
                            <div className="pill"><Clock className="icon tiny"/>{rec.estimatedTime} mins</div>
                            <div className="pill"><Target className="icon tiny"/>{rec.accuracy}%</div>
                          </div>
                          {isOpen && <div className="rec-expanded">
                            <div className="muted">{rec.reason}</div>
                            <div className="mt-3">
                              <Button className="primary sm" onClick={(e:any) => { e.stopPropagation(); window.location.href = '/study-now'; }}>Practice now</Button>
                              <Button className="ghost sm" onClick={(e:any) => { e.stopPropagation(); toast.success('Added to today\'s plan'); }}>Add to plan</Button>
                            </div>
                          </div>}
                        </div>
                        <div className="rec-right">
                          <div className="rec-accuracy">{rec.accuracy}%</div>
                          <ChevronRight className="icon small" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Study Plan */}
            <Card className="ea-card ea-plan">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <BookOpen className="icon medium" />
                    <div>
                      <div className="h-title">Daily Study Plan</div>
                      <div className="muted">Time allocation by subject</div>
                    </div>
                  </div>
                </CardTitle>
                <div className="header-right">
                  <Badge className="small">Recommended {aiRecommendedHours}h</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="plan-grid">
                  {studyPlan.slice(0,6).map((p, i) => (
                    <div key={i} className={`plan-item ${p.priority === 'CRITICAL' ? 'critical' : p.priority === 'HIGH' ? 'high' : p.priority === 'LOW' ? 'low' : 'medium'}`}>
                      <div className="pi-left">
                        <div className="pi-sub">{p.subject}</div>
                        <div className="muted">{p.attempted} solved • {p.accuracy}%</div>
                      </div>
                      <div className="pi-right">
                        <div className="pi-time">{p.recommendedTime}h</div>
                        <div className="pi-strat muted">{p.strategy}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button className="primary" onClick={() => window.location.href = '/study-now'}>Start Today's Session</Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card className="ea-card ea-trend">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <TrendingUp className="icon medium" />
                    <div>
                      <div className="h-title">7-Day Performance</div>
                      <div className="muted">Questions & accuracy</div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="trend-grid">
                  {weeklyTrend.map((d,i) => (
                    <div key={i} className={`trend-day ${d.questions === 0 ? 'idle' : d.accuracy >= 70 ? 'good' : d.accuracy >= 50 ? 'ok' : 'bad'}`}>
                      <div className="trend-day-name">{d.day}</div>
                      <div className="trend-day-qty">{d.questions}</div>
                      <div className="trend-day-acc">{d.accuracy}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-note">💡 Tip: Try to keep daily accuracy above 60% for steady rank improvements.</div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <aside className="col-right">
            {/* Rank Predictor */}
            <Card className="ea-card ea-rank">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <Trophy className="icon medium" />
                    <div>
                      <div className="h-title">Predicted Rank</div>
                      <div className="muted">Based on current performance</div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="rank-content">
                {predictedRank && predictedRank.totalAttempts >= 10 ? (
                  <>
                    <div className="rank-number">#{predictedRank.rank.toLocaleString()}</div>
                    <div className="rank-sub muted">Projected score: {predictedRank.score}% • Confidence: {predictedRank.confidence}</div>
                    <div className="rank-actions">
                      <Button className="primary" onClick={() => window.location.href = '/test'}>Take Mock Test</Button>
                      <Button className="ghost" onClick={() => toast('Solve 50+ more for better confidence')}>Improve</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rank-loading">
                      <Gauge className="icon large"/>
                      <div className="muted">Solve {Math.max(0,10 - totalAttempts)} more questions to unlock rank prediction</div>
                    </div>
                    <div className="mt-3">
                      <Button className="primary" onClick={() => window.location.href = '/study-now'}>Continue Practicing</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card className="ea-card ea-sw">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <CheckCircle2 className="icon medium" />
                    <div>
                      <div className="h-title">Strengths & Weaknesses</div>
                      <div className="muted">Where you stand today</div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="sw-grid">
                  <div className="sw-block">
                    <div className="sw-head">Top Strengths</div>
                    {strengthsWeaknesses?.strengths?.map((s:any, i:number) => (
                      <div key={i} className="sw-item">
                        <div className="sw-name">{s.subject}</div>
                        <div className="sw-bar"><div style={{ width: `${s.accuracy}%` }} /></div>
                        <div className="sw-pct">{s.accuracy}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="sw-block">
                    <div className="sw-head">Priority Weaknesses</div>
                    {strengthsWeaknesses?.weaknesses?.map((w:any, i:number) => (
                      <div key={i} className="sw-item">
                        <div className="sw-name">{w.subject}</div>
                        <div className="sw-bar"><div style={{ width: `${w.accuracy}%` }} /></div>
                        <div className="sw-pct">{w.accuracy}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="ea-card ea-badges">
              <CardHeader>
                <CardTitle>
                  <div className="header-left">
                    <Award className="icon medium" />
                    <div>
                      <div className="h-title">Badges</div>
                      <div className="muted">Earned & progress</div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="badges-grid">
                  {badges.slice(0,8).map((b:any, i:number) => {
                    const progress = Math.min(100, (userPoints / (b.points_required || 100)) * 100);
                    return (
                      <div key={i} className={`badge-tile ${b.earned ? 'earned' : ''}`}>
                        <div className="badge-icon">{b.icon || <Star className="icon small" />}</div>
                        <div className="badge-name">{b.name}</div>
                        {!b.earned && <div className="badge-progress"><div style={{ width: `${progress}%` }} /></div>}
                        {b.earned && <div className="badge-earned">Earned</div>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        {/* Footer CTA */}
        <section className="ea-cta">
          <Card className="ea-card ea-cta-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="h-title">Keep the streak going</div>
                <div className="muted">Small consistent practice beats occasional cramming — JEEnius will guide you.</div>
              </div>
              <div className="cta-actions">
                <Button className="primary" onClick={() => window.location.href = '/study-now'}><Rocket className="icon tiny"/> Continue</Button>
                <Button className="ghost" onClick={() => window.location.href = '/test'}><Trophy className="icon tiny"/> Mock Test</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// ========== THEME CSS (component-scoped) ==========
const THEME_CSS = `
:root {
  --je-primary: #013062;
  --je-primary-2: #6b4aa8;
  --je-light: #E6EEFF;
  --je-gray: #E9E9E9;
  --muted: #5a6b80;
  --card-radius: 20px;
  --glass: rgba(255,255,255,0.7);
  --shadow-1: 0 8px 28px rgba(2,6,23,0.06);
  --shadow-2: 0 6px 18px rgba(2,6,23,0.05);
  --accent-gradient: linear-gradient(90deg, var(--je-primary), var(--je-primary-2));
}

/* Global wrapper */
.ea-wrapper { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg, #f9fbff 0%, #ffffff 60%); min-height: 100vh; color: #0b1b2b; padding: 28px 20px; box-sizing: border-box; }

/* container */
.ea-container { max-width: 1220px; margin: 0 auto; display: grid; gap: 18px; }

/* Loading / empty */
.ea-center { display:flex; align-items:center; justify-content:center; min-height:60vh; }
.ea-loading-card { display:flex; gap:18px; background: linear-gradient(180deg, #ffffff, var(--je-light)); padding:20px; border-radius:18px; box-shadow: var(--shadow-1); border: 1px solid rgba(1,48,98,0.05); align-items:center; }
.ea-loading-card .icon.big{ width:48px; height:48px; color:#fff; }
.title{ font-size:20px; font-weight:800; color:var(--je-primary); margin:0; }
.muted{ color:var(--muted); font-size:13px; margin-top:4px; }

/* Hero */
.ea-hero { display:flex; gap:18px; align-items:flex-start; justify-content:space-between; }
.ea-hero-left { flex:1; }
.ea-hero-right { width:320px; display:flex; flex-direction:column; gap:12px; align-items:flex-end; }
.ea-title { font-size:28px; margin:0; color:var(--je-primary); font-weight:900; letter-spacing:-0.4px; }
.ea-sub { margin-top:6px; color:var(--muted); }

/* hero stats */
.ea-hero-stats { display:flex; gap:12px; margin-top:18px; flex-wrap:wrap; }
.ea-hero-stat { background: #fff; border-radius:14px; padding:12px; min-width:160px; box-shadow: var(--shadow-2); border: 1px solid rgba(2,6,23,0.03); }
.stat-label { font-size:12px; color:var(--muted); }
.stat-value { font-size:18px; font-weight:800; color:var(--je-primary); margin-top:6px; }
.progress-track { height:8px; background:#f2f6ff; border-radius:999px; margin-top:8px; overflow:hidden; }
.progress-fill { height:8px; background:var(--je-primary); border-radius:999px; box-shadow: inset 0 -3px 8px rgba(0,0,0,0.06); }

/* ring card */
.ea-ring-card { background: linear-gradient(180deg,#fff,#fbfdff); padding:12px; border-radius:16px; box-shadow: var(--shadow-2); width:100%; display:flex; gap:12px; align-items:center; }
.pr-ring { position:relative; display:inline-block; }
.pr-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
.pr-value { font-weight:800; color:var(--je-primary); font-size:18px; }
.pr-sub { font-size:12px; color:var(--muted); margin-top:2px; }
.ea-ring-meta { display:flex; gap:12px; align-items:center; margin-left:8px; }
.meta-item { text-align:left; }
.meta-label { font-size:12px; color:var(--muted); }
.meta-value { font-size:16px; font-weight:800; color:var(--je-primary); }

/* hero quick actions */
.ea-quick-actions { display:flex; gap:10px; width:100%; justify-content:space-between; margin-top:8px; }
.primary { background: var(--accent-gradient); color:#fff; border-radius:12px; padding:8px 12px; border:none; font-weight:700; display:inline-flex; gap:8px; align-items:center; }
.ghost { background: transparent; border:1px solid rgba(2,6,23,0.06); border-radius:12px; padding:8px 12px; color:var(--je-primary); font-weight:700; }
.primary.sm{ padding:6px 10px; font-size:13px; }
.ghost.sm{ padding:6px 10px; font-size:13px; }

/* strip cards */
.ea-strip { margin-top:8px; }
.ea-strip-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.strip-card { display:flex; gap:12px; align-items:center; padding:12px; background:#fff; border-radius:14px; box-shadow: var(--shadow-2); border: 1px solid rgba(2,6,23,0.03); }
.strip-left{ width:44px; height:44px; border-radius:10px; background: linear-gradient(180deg,#f2f7ff, #fff); display:flex; align-items:center; justify-content:center; color:var(--je-primary); }
.strip-title{ font-size:12px; color:var(--muted); }
.strip-value{ font-weight:800; color:var(--je-primary); font-size:16px; margin-top:4px; }

/* main grid */
.ea-main-grid { display:grid; grid-template-columns: 1fr 360px; gap:18px; margin-top:12px; align-items:start; }

/* generic card */
.ea-card { background:#fff; border-radius:var(--card-radius); box-shadow: var(--shadow-1); border: 1px solid rgba(2,6,23,0.04); overflow:hidden; }
.ea-card .card-header { padding:14px 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(2,6,23,0.03); }
.ea-card .card-content { padding:16px; }

/* headers */
.header-left { display:flex; gap:12px; align-items:center; }
.h-title { font-weight:800; color:var(--je-primary); font-size:16px; }
.header-right { display:flex; gap:8px; align-items:center; }

/* rec cards */
.recs-scroll { display:flex; flex-direction:column; gap:10px; max-height:420px; overflow:auto; padding-right:6px; }
.rec-card { display:flex; gap:12px; padding:12px; border-radius:12px; align-items:center; transition:all .16s ease; cursor:pointer; border:1px solid rgba(2,6,23,0.03); }
.rec-card:hover { transform: translateY(-6px); box-shadow: 0 14px 34px rgba(2,6,23,0.07); }
.rec-card.open { background: linear-gradient(180deg, #fbfdff, var(--je-light)); }
.rec-priority { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; border:2px solid; }
.rec-topic { font-weight:800; color:#07203a; }
.rec-meta { font-size:13px; color:var(--muted); margin-top:6px; }
.rec-stats { margin-top:8px; display:flex; gap:8px; }
.pill { background: #fff; border-radius:999px; padding:5px 8px; font-weight:700; color:var(--muted); display:inline-flex; gap:6px; align-items:center; border:1px solid rgba(2,6,23,0.03); font-size:12px; }
.rec-right{ margin-left:auto; display:flex; gap:8px; align-items:center; }

/* plan items */
.plan-grid { display:flex; flex-direction:column; gap:10px; }
.plan-item { display:flex; justify-content:space-between; padding:12px; border-radius:12px; border:1px solid rgba(2,6,23,0.03); background: linear-gradient(180deg,#fff,#fbfdff); }
.plan-item.critical { border-left:4px solid #ff4d4d; }
.plan-item.high { border-left:4px solid #ff9f1c; }
.plan-item.medium { border-left:4px solid #6b4aa8; }
.plan-item.low { border-left:4px solid #12b76a; }
.pi-sub { font-weight:800; color:var(--je-primary); }
.pi-time { font-weight:900; font-size:20px; color:#07203a; }

/* trend */
.trend-grid { display:flex; gap:8px; }
.trend-day { padding:10px; flex:1; border-radius:10px; text-align:center; border:1px solid rgba(2,6,23,0.03); }
.trend-day.idle { background:#f7f8fb; color:var(--muted); }
.trend-day.good { background:#ecfdf5; }
.trend-day.ok { background:#fffaf0; }
.trend-day.bad { background:#fff0f0; }
.trend-day-name{ font-weight:700; color:var(--je-primary); }

/* right column */
.col-right { display:flex; flex-direction:column; gap:12px; }

/* rank card */
.rank-content { display:flex; flex-direction:column; gap:12px; align-items:flex-start; }
.rank-number { font-weight:900; font-size:28px; color:var(--je-primary); }
.rank-sub { color:var(--muted); }

/* strengths & weaknesses */
.sw-grid { display:flex; gap:12px; }
.sw-block { flex:1; background:#fff; padding:12px; border-radius:12px; border:1px solid rgba(2,6,23,0.03); }
.sw-head { font-weight:800; color:var(--je-primary); margin-bottom:8px; }
.sw-item { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sw-name { flex:1; }
.sw-bar { width:120px; height:8px; background:#f1f5ff; border-radius:999px; overflow:hidden; }
.sw-bar > div { height:8px; background:var(--je-primary); }

/* badges */
.badges-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.badge-tile { background:#fff; padding:10px; border-radius:12px; text-align:center; border:1px solid rgba(2,6,23,0.03); }
.badge-tile.earned { background:linear-gradient(90deg,var(--je-primary),var(--je-primary-2)); color:#fff; }
.badge-progress { height:6px; background:#f1f5ff; border-radius:6px; overflow:hidden; margin-top:8px; }
.badge-progress > div { height:6px; background:linear-gradient(90deg,#cbd8ff,#8fb0ff); }

/* CTA */
.ea-cta { margin-top:12px; }
.ea-cta-card { display:flex; align-items:center; justify-content:space-between; }

/* assistant floating */
.ea-assistant { position:fixed; right:22px; bottom:22px; display:flex; gap:10px; align-items:center; padding:10px; border-radius:16px; box-shadow: 0 18px 40px rgba(1,48,98,0.12); background: linear-gradient(90deg,#fff,#f6fbff); border:1px solid rgba(1,48,98,0.06); cursor:pointer; z-index:9999; }
.assistant-bubble{ width:44px; height:44px; border-radius:12px; background:linear-gradient(90deg,var(--je-primary),var(--je-primary-2)); display:flex; align-items:center; justify-content:center; color:#fff; }
.assistant-text .small{ font-weight:800; color:var(--je-primary); }
.assistant-text .muted{ font-size:12px; color:var(--muted); }

/* small icon sizes */
.icon{ width:20px; height:20px; color:var(--je-primary); }
.icon.small{ width:14px; height:14px;}
.icon.tiny{ width:12px; height:12px;}
.icon.medium{ width:28px; height:28px;}
.icon.large{ width:44px; height:44px;}
.icon.hero{ width:36px; height:36px; color:var(--je-primary); }

/* responsive */
@media (max-width: 1024px) {
  .ea-main-grid { grid-template-columns: 1fr; }
  .ea-hero-right { width:260px; }
  .ea-strip-grid { grid-template-columns:repeat(2,1fr); }
  .badges-grid { grid-template-columns:repeat(3,1fr); }
}
@media (max-width: 540px) {
  .ea-hero { flex-direction:column; gap:12px; }
  .ea-hero-right { width:100%; align-items:flex-start; }
  .ea-strip-grid { grid-template-columns:1fr; }
  .badges-grid { grid-template-columns:repeat(2,1fr); }
}
`;

