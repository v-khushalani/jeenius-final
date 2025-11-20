import { useNavigate } from "react-router-dom";
import FloatingAIButton from '@/components/FloatingAIButton';
import { useAuth } from '@/contexts/AuthContext';
import AIDoubtSolver from '@/components/AIDoubtSolver';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from '@/components/Header';
import LoadingScreen from '@/components/ui/LoadingScreen';
import PricingModal from '@/components/PricingModal';
import {
  Flame, ArrowLeft, Lightbulb, XCircle, CheckCircle2, Target,
  Sparkles, Zap, Play, Lock, TrendingUp
} from "lucide-react";

// Import gamification services
import StreakService from '@/services/streakService';
import UserLimitsService from '@/services/userLimitsService';
import PointsService from '@/services/pointsService';
import { useStreakData } from '@/hooks/useStreakData';

const StudyNowPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('subjects');
  
  // 🔧 FIX: Initialize ALL arrays to empty arrays
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [userStats, setUserStats] = useState({ attempted: 0, accuracy: 0 });
  const [showAIModal, setShowAIModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [dailyQuestionsUsed, setDailyQuestionsUsed] = useState(0);
  
  // Gamification states
  const [dailyLimit, setDailyLimit] = useState(20);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePromptType, setUpgradePromptType] = useState('');
  const [upgradePromptData, setUpgradePromptData] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [currentLevel, setCurrentLevel] = useState(1); // Adaptive level

  const { isPremium } = useAuth();

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      await Promise.all([
        loadProfile(),
        fetchSubjects(),
        loadGamificationData()
      ]);
    } catch (error) {
      console.error('Error initializing page:', error);
    }
  };

  // Load gamification data
  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [streakStatus, limit] = await Promise.all([
        StreakService.getStreakStatus(user.id),
        UserLimitsService.getDailyLimit(user.id)
      ]);

      setDailyQuestionsUsed(streakStatus.todayCompleted);
      setDailyLimit(limit);
      setIsPro(isPremium);

      const shouldPrompt = await UserLimitsService.shouldShowUpgradePrompt(user.id);
      if (shouldPrompt.show && !isPremium) {
        setUpgradePromptType(shouldPrompt.promptType);
        setUpgradePromptData(shouldPrompt.data);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('subject, difficulty');

      if (error) throw error;

      const uniqueSubjects = [...new Set(allQuestions?.map(q => q.subject) || [])];

      const { data: userAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject)')
        .eq('user_id', user.id);

      const subjectStats = uniqueSubjects.map((subject) => {
        const subjectQuestions = allQuestions?.filter(q => q.subject === subject) || [];
        const totalQuestions = subjectQuestions.length;

        const difficulties = {
          easy: subjectQuestions.filter(q => q.difficulty === 'Easy').length,
          medium: subjectQuestions.filter(q => q.difficulty === 'Medium').length,
          hard: subjectQuestions.filter(q => q.difficulty === 'Hard').length
        };

        const subjectAttempts = userAttempts?.filter(
          a => a.questions?.subject === subject
        ) || [];

        const attempted = subjectAttempts.length;
        const correct = subjectAttempts.filter(a => a.is_correct).length;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        const icons = {
          'Physics': '⚛️',
          'Chemistry': '🧪',
          'Mathematics': '📐'
        };

        const colors = {
          'Physics': {
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200'
          },
          'Chemistry': {
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200'
          },
          'Mathematics': {
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50',
            borderColor: 'border-purple-200'
          }
        };

        return {
          name: subject,
          emoji: icons[subject] || '📚',
          ...colors[subject],
          totalQuestions,
          difficulties,
          attempted,
          accuracy
        };
      });

      const totalAttempted = userAttempts?.length || 0;
      const totalCorrect = userAttempts?.filter(a => a.is_correct).length || 0;
      const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      setUserStats({ attempted: totalAttempted, accuracy: overallAccuracy });
      setSubjects(subjectStats);

    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (subject) => {
    setLoading(true);
    setSelectedSubject(subject);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('questions')
        .select('chapter, difficulty')
        .eq('subject', subject);

      if (error) throw error;

      const uniqueChapters = [...new Set(data?.map(q => q.chapter) || [])];

      const { data: userAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject, chapter)')
        .eq('user_id', user?.id)
        .eq('questions.subject', subject);

      const chapterStats = uniqueChapters.map((chapter, index) => {
        const chapterQuestions = data?.filter(q => q.chapter === chapter) || [];
        const totalQuestions = chapterQuestions.length;

        const difficulties = {
          easy: chapterQuestions.filter(q => q.difficulty === 'Easy').length,
          medium: chapterQuestions.filter(q => q.difficulty === 'Medium').length,
          hard: chapterQuestions.filter(q => q.difficulty === 'Hard').length
        };

        const chapterAttempts = userAttempts?.filter(
          a => a.questions?.chapter === chapter
        ) || [];

        const attempted = chapterAttempts.length;
        const correct = chapterAttempts.filter(a => a.is_correct).length;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        const progress = attempted > 0 ? Math.min(100, Math.round((attempted / totalQuestions) * 100)) : 0;

        const isLocked = false; // All chapters are now free

        return {
          name: chapter,
          sequence: index + 1,
          totalQuestions,
          difficulties,
          attempted,
          accuracy,
          progress,
          isLocked
        };
      });

      setChapters(chapterStats);
      setView('chapters');

    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (chapter) => {
    setLoading(true);
    setSelectedChapter(chapter);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('questions')
        .select('topic, difficulty')
        .eq('subject', selectedSubject)
        .eq('chapter', chapter);

      if (error) throw error;

      const uniqueTopics = [...new Set(data?.map(q => q.topic).filter(Boolean) || [])];

      if (uniqueTopics.length === 0) {
        startPractice(null);
        return;
      }

      const { data: userAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject, chapter, topic)')
        .eq('user_id', user?.id)
        .eq('questions.subject', selectedSubject)
        .eq('questions.chapter', chapter);

      const topicStats = uniqueTopics.map((topic) => {
        const topicQuestions = data?.filter(q => q.topic === topic) || [];
        const totalQuestions = topicQuestions.length;

        const difficulties = {
          easy: topicQuestions.filter(q => q.difficulty === 'Easy').length,
          medium: topicQuestions.filter(q => q.difficulty === 'Medium').length,
          hard: topicQuestions.filter(q => q.difficulty === 'Hard').length
        };

        const topicAttempts = userAttempts?.filter(
          a => a.questions?.topic === topic
        ) || [];

        const attempted = topicAttempts.length;
        const correct = topicAttempts.filter(a => a.is_correct).length;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        return {
          name: topic,
          totalQuestions,
          difficulties,
          attempted,
          accuracy
        };
      });

      setTopics(topicStats);
      setView('topics');
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = async (topic = null) => {
    setLoading(true);
    setSelectedTopic(topic);
    setQuestionStartTime(Date.now());

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: attemptedQuestions } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('user_id', user.id);

      const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];

      let query = supabase
        .from('questions')
        .select('*')
        .eq('subject', selectedSubject)
        .eq('chapter', selectedChapter);

      if (attemptedIds.length > 0) {
        query = query.not('id', 'in', `(${attemptedIds.join(',')})`);
      }

      if (topic) {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('🎉 You\'ve completed all questions in this topic!');
        setLoading(false);
        return;
      }

      const shuffled = data.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(25, shuffled.length));

      setPracticeQuestions(selected);
      setCurrentQuestionIndex(0);
      setSessionStats({ correct: 0, total: 0, streak: 0 });
      setSelectedAnswer(null);
      setShowResult(false);
      setView('practice');
    } catch (error) {
      console.error('Error starting practice:', error);
      toast.error('Failed to start practice');
    } finally {
      setLoading(false);
    }
  };

  // Find this function in StudyNowPage.tsx (around line 450)
// DELETE the old handleAnswer function completely
// PASTE this new one:

const handleAnswer = async (answer: string) => {
  if (isSubmitting || showResult) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // ✅ INSTANT UI feedback - NO BLOCKING CHECKS
  setIsSubmitting(true);
  setSelectedAnswer(answer);
  setShowResult(true);

  const question = practiceQuestions[currentQuestionIndex];
  const correctLetter = question.correct_option.replace('option_', '').toUpperCase();
  const isCorrect = answer === correctLetter;
  const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

  // Update session stats immediately
  setSessionStats(prev => ({
    correct: prev.correct + (isCorrect ? 1 : 0),
    total: prev.total + 1,
    streak: isCorrect ? prev.streak + 1 : 0
  }));

  try {
    // Check for duplicate attempt
    const { data: existingAttempt } = await supabase
      .from('question_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', question.id)
      .maybeSingle();

    if (existingAttempt) {
      console.log('⚠️ Already attempted - skipping');
      setIsSubmitting(false);
      setTimeout(() => nextQuestion(), 800);
      return;
    }

    // PARALLEL execution - faster!
    const [, pointsResult] = await Promise.all([
      // Insert attempt
      supabase.from('question_attempts').insert({
        user_id: user.id,
        question_id: question.id,
        selected_option: `option_${answer.toLowerCase()}`,
        is_correct: isCorrect,
        time_taken: timeSpent,
        mode: 'study'
      }),
      
      // Calculate points
      PointsService.calculatePoints(
        user.id,
        question.difficulty,
        isCorrect,
        timeSpent
      )
    ]);

    // Display points with detailed breakdown
    const { points, breakdown } = pointsResult;
    
    console.log('✅ Points Earned:', points);
    console.log('📊 Breakdown:', breakdown);

    if (points !== 0) {
      setPointsEarned(points);
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 2000);
      
      // Show detailed breakdown in console
      breakdown.forEach(b => {
        console.log(`  ${b.label}: ${b.points > 0 ? '+' : ''}${b.points}`);
      });
      
      // Show toast with breakdown
      if (points > 0) {
        const details = breakdown
          .filter(b => b.type !== 'badge')
          .map(b => `${b.label}`)
          .join(' • ');
        
        const badges = breakdown
          .filter(b => b.type === 'badge')
          .map(b => b.label);
        
        if (badges.length > 0) {
          // Show badge toast separately
          badges.forEach(badge => {
            setTimeout(() => {
              toast.success(badge, { duration: 4000 });
            }, 500);
          });
        }
        
        toast.success(`+${points} Points! ${details}`, { duration: 3000 });
      } else {
        toast.error(`${points} points - Keep trying! 💪`, { duration: 2000 });
      }
    }

    // ✅ Check limits AFTER submission (non-blocking UX)
    UserLimitsService.canSolveMore(user.id).then(canSolve => {
      if (!canSolve.canSolve) {
        setShowUpgradeModal(true);
        setUpgradePromptType('daily_limit_reached');
      }
    }).catch(e => console.error('Limit check error:', e));

    // Update streak in background (non-blocking)
    setTimeout(() => {
      Promise.all([
        StreakService.updateProgress(user.id),
        loadGamificationData()
      ]).catch(err => console.error('Background update error:', err));
    }, 500);

  } catch (error) {
    console.error('❌ Error in handleAnswer:', error);
    toast.error('Something went wrong!');
  } finally {
    setIsSubmitting(false);
    // Auto-advance to next question
    setTimeout(() => nextQuestion(), 1200);
  }
};

  
  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      const accuracy = sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0;
      toast.success(`🎉 Session Completed! Score: ${sessionStats.correct}/${sessionStats.total} (${Math.round(accuracy)}%)`);
      setView('topics');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // PRACTICE VIEW
  if (view === 'practice' && practiceQuestions.length > 0) {
    const question = practiceQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto pt-16 sm:pt-20 pb-6">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="mb-3">
              <Button
                variant="outline"
                className="border-2 border-blue-600 text-sm px-3 py-2"
                onClick={() => setView('topics')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Topics
              </Button>
            </div>

            {!isPro && (
              <Card className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        <div className="text-sm font-bold text-orange-900">
                          Daily: {dailyQuestionsUsed}/{dailyLimit}
                        </div>
                      </div>
                      <div className="mt-2 w-full rounded-full bg-orange-200 h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                          style={{ width: `${Math.min(100, (dailyQuestionsUsed / dailyLimit) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-orange-700 mt-2">
                        {dailyQuestionsUsed >= dailyLimit - 5 ? (
                          <span className="font-semibold">⚠️ Almost at your limit! Upgrade for unlimited.</span>
                        ) : (
                          <span>Upgrade to Pro for unlimited questions + AI features!</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-2 text-sm shadow-lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showPointsAnimation && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl text-2xl font-bold">
                  +{pointsEarned} points! ⚡
                </div>
              </div>
            )}

            <Card className="mb-4 border border-slate-200 shadow-2xl bg-white/90">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs">
                      {`Q ${currentQuestionIndex + 1}/${practiceQuestions.length}`}
                    </Badge>
                    <div className="text-sm text-slate-500 hidden sm:block">
                      {selectedSubject} • {selectedChapter}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {sessionStats.correct}/{sessionStats.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}% Accurate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 border border-slate-200 shadow-2xl bg-white">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {currentQuestionIndex + 1}
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{question.question}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['option_a','option_b','option_c','option_d'].map((key, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedAnswer === letter;
                    const correctLetter = question.correct_option.replace('option_', '').toUpperCase();
                    const isCorrect = letter === correctLetter;

                    let baseClass = 'w-full text-left p-3 rounded-xl border-2 transition-all';
                    if (showResult) {
                      if (isCorrect) {
                        baseClass += ' border-green-500 bg-gradient-to-r from-green-50 to-emerald-50';
                      } else if (isSelected) {
                        baseClass += ' border-red-500 bg-gradient-to-r from-red-50 to-orange-50';
                      } else {
                        baseClass += ' border-gray-200 opacity-60';
                      }
                    } else {
                      baseClass += isSelected
                        ? ' border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50'
                        : ' border-gray-300 hover:border-blue-500 hover:bg-blue-50/30';
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswer(letter)}
                        disabled={showResult || isSubmitting}
                        className={baseClass}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow ${
                              showResult && isCorrect ? 'bg-green-500 text-white' : 
                              showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' : 
                              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-700'
                            }`}>
                              {letter}
                            </div>
                            <div className="text-sm font-medium text-slate-900">{question[key]}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-slate-500">{Math.round(progress)}% completed</div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setShowAIModal(true)} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 text-sm shadow"
                    >
                      <Sparkles className="w-4 h-4 mr-2 inline" />
                      Ask AI
                    </Button>
                    <div className="w-28">
                      <Progress value={Math.round(progress)} className="h-2" />
                    </div>
                  </div>
                </div>

                {showResult && question.explanation && (
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-900 mb-1">Explanation</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <PricingModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="daily_limit"
        />

        <AIDoubtSolver
          question={practiceQuestions[currentQuestionIndex]}
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
        />
      </div>
    );
  }

  // SUBJECTS VIEW
  if (view === 'subjects') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="pt-20 sm:pt-24 pb-10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card
                  key={subject.name}
                  onClick={() => loadChapters(subject.name)}
                  className={`group cursor-pointer transform hover:scale-105 transition-all border-2 ${subject.borderColor} shadow-xl overflow-hidden`}
                >
                  <div className={`p-5 text-center bg-gradient-to-br ${subject.bgColor}`}>
                    <div className="text-5xl mb-2">{subject.emoji}</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{subject.name}</h3>
                    <Badge className="bg-white/80 text-slate-700 text-sm">AI Powered</Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-extrabold text-slate-900">{subject.totalQuestions}</div>
                      <div className="text-xs text-slate-500">Total Questions</div>
                    </div>

                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-bold text-green-600">{subject.difficulties.easy}</div>
                          <div className="text-slate-500">Easy</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600">{subject.difficulties.medium}</div>
                          <div className="text-slate-500">Medium</div>
                        </div>
                        <div>
                          <div className="font-bold text-red-600">{subject.difficulties.hard}</div>
                          <div className="text-slate-500">Hard</div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 font-semibold"
                      onClick={() => loadChapters(subject.name)}
                    >
                      <Play className="w-4 h-4 mr-2 inline" />
                      Start Practicing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {isPro && <FloatingAIButton />}
        </div>
      </div>
    );
  }

  // CHAPTERS VIEW
  if (view === 'chapters') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="pt-20 sm:pt-24 pb-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setView('subjects')}
                className="border-2 border-blue-600 text-sm px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subjects
              </Button>
            </div>

            <div className="text-center mb-6">
              <Badge className="bg-blue-600 text-white text-base px-3 py-1.5">{selectedSubject}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => {
                if (chapter.isLocked) {
                  return (
                    <Card
                      key={chapter.name}
                      className="relative border-2 border-gray-200 shadow-lg opacity-70"
                    >
                      <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10 p-4">
                        <div className="text-center">
                          <div className="p-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 inline-block mb-3">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <div className="font-bold text-lg mb-1">Premium Chapter</div>
                          <div className="text-sm text-slate-600 mb-3">Upgrade to unlock all chapters</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/subscription-plans');
                            }}
                            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                          >
                            🔓 Unlock Now
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Badge className="mb-2 text-xs">Chapter {chapter.sequence}</Badge>
                        <h3 className="font-bold text-lg text-slate-900">{chapter.name}</h3>
                      </div>

                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <div className="text-xl font-bold text-slate-900">{chapter.totalQuestions}</div>
                          <div className="text-xs text-slate-500">Questions</div>
                        </div>

                        <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                          <div className="grid grid-cols-3 text-center text-xs gap-1">
                            <div>
                              <div className="font-bold text-green-600">{chapter.difficulties.easy}</div>
                              <div className="text-slate-500">Easy</div>
                            </div>
                            <div>
                              <div className="font-bold text-yellow-600">{chapter.difficulties.medium}</div>
                              <div className="text-slate-500">Med</div>
                            </div>
                            <div>
                              <div className="font-bold text-red-600">{chapter.difficulties.hard}</div>
                              <div className="text-slate-500">Hard</div>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-blue-600 text-white text-sm" disabled>
                          <Sparkles className="w-4 h-4 mr-2 inline" />
                          Explore Topics
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={chapter.name}
                    onClick={() => loadTopics(chapter.name)}
                    className="group cursor-pointer hover:scale-105 transition-all border-2 border-blue-200 shadow-lg"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <Badge className="mb-2 text-xs">Chapter {chapter.sequence}</Badge>
                      <h3 className="font-bold text-lg text-slate-900">{chapter.name}</h3>
                    </div>

                    <CardContent className="p-4">
                      <div className="text-center mb-3">
                        <div className="text-xl font-bold text-slate-900">{chapter.totalQuestions}</div>
                        <div className="text-xs text-slate-500">Questions</div>
                      </div>

                      <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-3 text-center text-xs gap-1">
                          <div>
                            <div className="font-bold text-green-600">{chapter.difficulties.easy}</div>
                            <div className="text-slate-500">Easy</div>
                          </div>
                          <div>
                            <div className="font-bold text-yellow-600">{chapter.difficulties.medium}</div>
                            <div className="text-slate-500">Med</div>
                          </div>
                          <div>
                            <div className="font-bold text-red-600">{chapter.difficulties.hard}</div>
                            <div className="text-slate-500">Hard</div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm" 
                        onClick={() => loadTopics(chapter.name)}
                      >
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Explore Topics
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {isPro && <FloatingAIButton />}
          </div>
        </div>
      </div>
    );
  }

  // TOPICS VIEW
  if (view === 'topics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="pt-20 sm:pt-24 pb-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setView('chapters')}
                className="border-2 border-blue-600 text-sm px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chapters
              </Button>
            </div>

            <div className="text-center mb-6">
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1.5">
                {selectedSubject} • {selectedChapter}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card
                  key={topic.name}
                  onClick={() => startPractice(topic.name)}
                  className="group cursor-pointer hover:scale-105 transition-all border-2 border-purple-200 shadow-lg"
                >
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{topic.name}</h3>
                  </div>

                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <div className="text-xl font-bold text-slate-900">{topic.totalQuestions}</div>
                      <div className="text-xs text-slate-500">Questions</div>
                    </div>

                    <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                      <div className="grid grid-cols-3 text-center text-xs gap-1">
                        <div>
                          <div className="font-bold text-green-600">{topic.difficulties.easy}</div>
                          <div className="text-slate-500">Easy</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600">{topic.difficulties.medium}</div>
                          <div className="text-slate-500">Med</div>
                        </div>
                        <div>
                          <div className="font-bold text-red-600">{topic.difficulties.hard}</div>
                          <div className="text-slate-500">Hard</div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm" 
                      onClick={() => startPractice(topic.name)}
                    >
                      <Zap className="w-4 h-4 mr-2 inline" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isPro && <FloatingAIButton />}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudyNowPage;
