import { useNavigate } from "react-router-dom";
import FloatingAIButton from '@/components/FloatingAIButton';
import { checkIsPremium } from '@/utils/premiumChecker';
import AIDoubtSolver from '@/components/AIDoubtSolver';
import { SubscriptionPaywall } from '@/components/paywall/SubscriptionPaywall';
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PricingModal from '@/components/PricingModal';
import Header from '@/components/Header';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  Flame, ArrowLeft, Lightbulb, XCircle, CheckCircle2, Trophy, Target,
  Sparkles, Zap, Play, Lock
} from "lucconst startPractice = async (topic = null) => {
  setLoading(true);
  setSelectedTopic(topic);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // ✅ Get already attempted question IDs
    const { data: attemptedQuestions } = await supabase
      .from('question_attempts')
      .select('question_id')
      .eq('user_id', user.id);
    
    const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];

    // ✅ Fetch only NON-attempted questions
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', selectedSubject)
      .eq('chapter', selectedChapter)
      .not('id', 'in', `(${attemptedIds.join(',') || 0})`); // Exclude attempted

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
ide-react";

const StudyNowPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [userStats, setUserStats] = useState({ attempted: 0, accuracy: 0 });
  const [showAIModal, setShowAIModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [dailyQuestionsUsed, setDailyQuestionsUsed] = useState(0);
  const DAILY_LIMIT_FREE = 20;

  useEffect(() => {
    checkSubscriptionStatus();
    loadProfile();
    fetchSubjects();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const isPremium = await checkIsPremium();
      setIsPro(isPremium);
      
      if (!isPremium) {
        const { data: { user } } = await supabase.auth.getUser();
        const today = new Date().toISOString().split('T')[0];
        const { data: usage } = await supabase
          .from('usage_limits')
          .select('questions_today')
          .eq('user_id', user?.id)
          .eq('last_reset_date', today)
          .single();
        
        setDailyQuestionsUsed(usage?.questions_today || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
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
      
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('subject, difficulty');
        
      if (error) throw error;

      const uniqueSubjects = [...new Set(allQuestions.map(q => q.subject))];
      
      const { data: userAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject)')
        .eq('user_id', user?.id);

      const subjectStats = await Promise.all(
        uniqueSubjects.map(async (subject) => {
          const subjectQuestions = allQuestions.filter(q => q.subject === subject);
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
        })
      );

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

      const uniqueChapters = [...new Set(data.map(q => q.chapter))];
      
      const { data: userAttempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject, chapter)')
        .eq('user_id', user?.id)
        .eq('questions.subject', subject);
      
      const chapterStats = await Promise.all(
        uniqueChapters.map(async (chapter, index) => {
          const chapterQuestions = data.filter(q => q.chapter === chapter);
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

          // Check if locked - first 2 chapters are free
          const isLocked = !profile?.is_premium && index >= 2;

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
        })
      );

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

      const uniqueTopics = [...new Set(data.map(q => q.topic).filter(Boolean))];
      
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

      const topicStats = await Promise.all(
        uniqueTopics.map(async (topic) => {
          const topicQuestions = data.filter(q => q.topic === topic);
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
        })
      );

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
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // ✅ Get already attempted question IDs
    const { data: attemptedQuestions } = await supabase
      .from('question_attempts')
      .select('question_id')
      .eq('user_id', user.id);
    
    const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];

    // ✅ Fetch only NON-attempted questions
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', selectedSubject)
      .eq('chapter', selectedChapter)
      .not('id', 'in', `(${attemptedIds.join(',') || 0})`); // Exclude attempted

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
  
  const handleAnswer = async (answer) => {
  // 🚨 CHECK DAILY LIMIT FOR FREE USERS
  if (!isPro && dailyQuestionsUsed >= DAILY_LIMIT_FREE) {
    toast.error('Daily limit reached! Upgrade to Pro for unlimited practice.');
    setTimeout(() => navigate('/subscription-plans'), 2000);
    return;
  }
  
  if (showResult) return;
  
  setSelectedAnswer(answer);
  setShowResult(true);
  
  const question = practiceQuestions[currentQuestionIndex];
  const correctLetter = question.correct_option.replace('option_', '').toUpperCase();
  const isCorrect = answer === correctLetter;
  
  // Update session stats first (no async issues)
  setSessionStats(prev => ({
    correct: prev.correct + (isCorrect ? 1 : 0),
    total: prev.total + 1,
    streak: isCorrect ? prev.streak + 1 : 0
  }));

  // Save attempt in background
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.error('No authenticated user');
        return;
      }

      // ✅ CHECK IF ALREADY ATTEMPTED (PREVENT DUPLICATES)
      const { data: existingAttempt } = await supabase
        .from('question_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', question.id)
        .maybeSingle();

      if (existingAttempt) {
        console.log('⚠️ Question already attempted, skipping save');
        return; // Don't save duplicate
      }

      // ✅ INSERT NEW ATTEMPT
      const attemptPayload = {
        user_id: user.id,
        question_id: question.id,
        selected_option: `option_${answer.toLowerCase()}`,
        is_correct: isCorrect,
        time_taken: 30,
        mode: 'study'
      };

      console.log('💾 Saving attempt:', attemptPayload);

      const { data: attemptData, error: attemptError } = await supabase
        .from('question_attempts')
        .insert(attemptPayload)
        .select();

      if (attemptError) {
        console.error('❌ Database error:', attemptError);
        toast.error('Failed to save answer');
        return;
      }

      console.log('✅ Attempt saved successfully!');

      // ✅ UPDATE USAGE LIMITS FOR FREE USERS
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: existingUsage } = await supabase
          .from('usage_limits')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingUsage) {
          const needsReset = existingUsage.last_reset_date !== today;
          
          await supabase
            .from('usage_limits')
            .update({
              questions_today: needsReset ? 1 : (existingUsage.questions_today || 0) + 1,
              last_reset_date: today
            })
            .eq('user_id', user.id);

          setDailyQuestionsUsed(needsReset ? 1 : (existingUsage.questions_today || 0) + 1);
        } else {
          await supabase
            .from('usage_limits')
            .insert({
              user_id: user.id,
              questions_today: 1,
              mock_tests_this_month: 0,
              last_reset_date: today
            });

          setDailyQuestionsUsed(1);
        }

        const newCount = dailyQuestionsUsed + 1;
        if (newCount >= DAILY_LIMIT_FREE - 3 && newCount < DAILY_LIMIT_FREE) {
          toast.warning(`⚠️ Only ${DAILY_LIMIT_FREE - newCount} questions left today!`);
        }
        
        if (newCount >= DAILY_LIMIT_FREE) {
          setTimeout(() => {
            toast.error('Daily limit reached! Upgrade to Pro.');
          }, 2000);
        }
      }

      // Calculate topic mastery (non-blocking)
      if (selectedTopic) {
        supabase.functions.invoke('calculate-topic-mastery', {
          body: {
            userId: user.id,
            subject: selectedSubject,
            chapter: selectedChapter,
            topic: selectedTopic
          }
        }).catch(err => console.log('Mastery calc error:', err));
      }

    } catch (error) {
      console.error('❌ handleAnswer error:', error);
      toast.error('Failed to save progress');
    }
  })();

  // Move to next question
  setTimeout(() => {
    nextQuestion();
  }, 800);
};
  
  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const accuracy = (sessionStats.correct / sessionStats.total) * 100;
      toast.success(`🎉 Session Completed! Score: ${sessionStats.correct}/${sessionStats.total} (${accuracy.toFixed(0)}%)`);
      setView('topics');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // PRACTICE MODE
  if (view === 'practice' && practiceQuestions.length > 0) {
    const question = practiceQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            
            <Button 
              variant="outline"
              className="mb-6 border-2 border-blue-600"
              onClick={() => setView('topics')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>

            {!isPro && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-orange-600" />
                      <p className="font-bold text-orange-900 text-lg">
                        Daily Progress: {dailyQuestionsUsed}/{DAILY_LIMIT_FREE} Questions
                      </p>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(dailyQuestionsUsed / DAILY_LIMIT_FREE) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-orange-700">
                      {dailyQuestionsUsed >= DAILY_LIMIT_FREE - 5 ? (
                        <span className="font-semibold">⚠️ Almost at your limit! Upgrade for unlimited practice.</span>
                      ) : (
                        <span>Upgrade to Pro for unlimited questions + AI features!</span>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/subscription-plans')}
                    className="ml-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6 py-3 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}

            <Card className="mb-6 border-2 border-blue-200 shadow-xl bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      Question {currentQuestionIndex + 1}/{practiceQuestions.length}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {selectedSubject} • {selectedChapter}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {sessionStats.correct}/{sessionStats.total}
                      </div>
                      <div className="text-xs text-gray-500">Correct</div>
                    </div>
                    {sessionStats.streak > 2 && (
                      <Badge className="bg-orange-500 text-white animate-pulse">
                        <Flame className="w-3 h-3 mr-1" />
                        {sessionStats.streak}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-xl bg-white mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                      {currentQuestionIndex + 1}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 flex-1">{question.question}</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {['option_a', 'option_b', 'option_c', 'option_d'].map((key, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedAnswer === letter;
                    const correctLetter = question.correct_option.replace('option_', '').toUpperCase();
                    const isCorrect = letter === correctLetter;
        
                    let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50';
                      } else if (isSelected) {
                        buttonClass += 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50';
                      } else {
                        buttonClass += 'border-gray-200 opacity-50';
                      }
                    } else {
                      buttonClass += isSelected 
                        ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50' 
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/30';
                    }

                    return (
                      <button 
                        key={key} 
                        onClick={() => handleAnswer(letter)} 
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-md ${
                              showResult && isCorrect ? 'bg-green-500 text-white' :
                              showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {letter}
                            </div>
                            <span className="text-base font-medium text-gray-900">{question[key]}</span>
                          </div>
                          {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setShowAIModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold shadow-lg px-6 py-3"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Ask AI for Help
                  </Button>
                </div>
                
                {showResult && question.explanation && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-900 mb-2">Explanation</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <AIDoubtSolver 
          question={practiceQuestions[currentQuestionIndex]}
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
        />
        {/* Upgrade Modal */}
        <PricingModal 
          isOpen={dailyQuestionsUsed >= DAILY_LIMIT_FREE}
          onClick={() => navigate('/subscription-plans')}
          limitType="daily_limit"
        />
      </div>
    );
  }

  // SUBJECTS VIEW
  if (view === 'subjects') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12 text-center">
              <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white border border-gray-200 shadow-lg">
                <div className="flex justify-center gap-3">
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-1.5">
                    <Target className="w-4 h-4 mr-1" />
                    Attempted: {userStats.attempted}
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1.5">
                    <Trophy className="w-4 h-4 mr-1" />
                    Accuracy: {userStats.accuracy}%
                  </Badge>
                </div>
              </div>
            </div>  
            <div className="grid md:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card 
                  key={subject.name}
                  onClick={() => loadChapters(subject.name)}
                  className={`group cursor-pointer hover:scale-105 transition-all duration-300 border-2 ${subject.borderColor} shadow-lg hover:shadow-xl overflow-hidden`}
                >
                  <div className={`p-6 text-center bg-gradient-to-br ${subject.bgColor}`}>
                    <div className="text-5xl mb-3">{subject.emoji}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{subject.name}</h3>
                    <Badge className="bg-white/80 text-gray-700">AI Powered</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{subject.totalQuestions}</div>
                        <div className="text-xs text-gray-500">Questions</div>
                      </div>
                      {subject.attempted > 0 && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            subject.accuracy >= 80 ? 'text-green-600' : 
                            subject.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {subject.accuracy}%
                          </div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-bold text-green-600">{subject.difficulties.easy}</div>
                          <div className="text-gray-600">Easy</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600">{subject.difficulties.medium}</div>
                          <div className="text-gray-600">Medium</div>
                        </div>
                        <div>
                          <div className="font-bold text-red-600">{subject.difficulties.hard}</div>
                          <div className="text-gray-600">Hard</div>
                        </div>
                      </div>
                    </div>

                    <Button className={`w-full bg-gradient-to-r ${subject.color} hover:opacity-90 text-white font-semibold`}>
                      <Play className="w-4 h-4 mr-2" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <Button 
              variant="outline" 
              onClick={() => setView('subjects')} 
              className="mb-8 border-2 border-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>

            <div className="mb-8 text-center">
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2 mb-4">
                {selectedSubject}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => {
                if (chapter.isLocked) {
                  return (
                    <Card 
                      key={chapter.name}
                      className="group relative border-2 border-gray-200 shadow-lg opacity-60"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-100/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-full inline-block mb-3">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          <p className="font-bold text-lg mb-2">Premium Chapter</p>
                          <p className="text-sm text-gray-600 mb-4 max-w-xs px-4">
                            Upgrade to unlock all chapters!
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/subscription-plans');
                            }}
                            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow"
                          >
                            🔓 Unlock Now
                          </button>
                        </div>
                      </div>
            
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Badge className="mb-2">Chapter {chapter.sequence}</Badge>
                        <h3 className="font-bold text-lg text-gray-900">{chapter.name}</h3>
                      </div>
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <div className="text-xl font-bold text-gray-900">{chapter.totalQuestions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                        
                        <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-1 text-center text-xs">
                            <div>
                              <div className="font-bold text-green-600">{chapter.difficulties.easy}</div>
                              <div className="text-gray-600">Easy</div>
                            </div>
                            <div>
                              <div className="font-bold text-yellow-600">{chapter.difficulties.medium}</div>
                              <div className="text-gray-600">Med</div>
                            </div>
                            <div>
                              <div className="font-bold text-red-600">{chapter.difficulties.hard}</div>
                              <div className="text-gray-600">Hard</div>
                            </div>
                          </div>
                        </div>
            
                        <Button className="w-full bg-blue-600 text-white" disabled>
                          <Sparkles className="w-4 h-4 mr-2" />
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
                    className="group cursor-pointer hover:border-gray-800 hover:scale-105 transition-all border-2 border-blue-200 shadow-lg hover:shadow-xl"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <Badge className="mb-2">Chapter {chapter.sequence}</Badge>
                      <h3 className="font-bold text-lg text-gray-900">{chapter.name}</h3>
                    </div>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{chapter.totalQuestions}</div>
                          <div className="text-xs text-gray-500">Questions</div>
                        </div>
                      </div>
            
                      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <div className="font-bold text-green-600">{chapter.difficulties.easy}</div>
                            <div className="text-gray-600">Easy</div>
                          </div>
                          <div>
                            <div className="font-bold text-yellow-600">{chapter.difficulties.medium}</div>
                            <div className="text-gray-600">Med</div>
                          </div>
                          <div>
                            <div className="font-bold text-red-600">{chapter.difficulties.hard}</div>
                            <div className="text-gray-600">Hard</div>
                          </div>
                        </div>
                      </div>
            
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Explore Topics
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          {isPro && <FloatingAIButton />}
        </div>
      </div>
    );
  }

  // TOPICS VIEW
  if (view === 'topics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <Button 
              variant="outline" 
              onClick={() => setView('chapters')} 
              className="mb-8 border-2 border-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            <div className="mb-8 text-center">
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2 mb-2">
                {selectedSubject} • {selectedChapter}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card 
                  key={topic.name}
                  onClick={() => startPractice(topic.name)}
                  className="group cursor-pointer hover:scale-105 transition-all border-2 border-purple-200 shadow-lg hover:shadow-xl"
                >
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{topic.name}</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{topic.totalQuestions}</div>
                        <div className="text-xs text-gray-500">Questions</div>
                      </div>
                      {topic.attempted > 0 && (
                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            topic.accuracy >= 80 ? 'text-green-600' : 
                            topic.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {topic.accuracy}%
                          </div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                          <div className="font-bold text-green-600">{topic.difficulties.easy}</div>
                          <div className="text-gray-600">Easy</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600">{topic.difficulties.medium}</div>
                          <div className="text-gray-600">Med</div>
                        </div>
                        <div>
                          <div className="font-bold text-red-600">{topic.difficulties.hard}</div>
                          <div className="text-gray-600">Hard</div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold">
                      <Zap className="w-4 h-4 mr-2" />
                      Start Practice
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

  return null;
};

export default StudyNowPage;
