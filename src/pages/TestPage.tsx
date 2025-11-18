import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Header from '@/components/Header';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  BookOpen, Trophy, Play, Clock, Target, FileText, ArrowLeft, CheckCircle2,
  Brain, Sparkles, Crown, Award
} from "lucide-react";
import PricingModal from '@/components/PricingModal';

const TestPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [testMode, setTestMode] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isPremium } = useAuth();
  const [monthlyTestsUsed, setMonthlyTestsUsed] = useState(0);
  const MONTHLY_LIMIT_FREE = 2;

  useEffect(() => {
    checkMonthlyUsage();
    fetchSubjectsAndChapters();
  }, [isPremium]);

  const fetchSubjectsAndChapters = async () => {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('subject, chapter');
      
      if (error) throw error;

      const uniqueSubjects = [...new Set(questions.map(q => q.subject))];
      const chaptersBySubject = {};
      
      uniqueSubjects.forEach(subject => {
        const subjectChapters = [...new Set(
          questions
            .filter(q => q.subject === subject)
            .map(q => q.chapter)
        )];
        chaptersBySubject[subject] = subjectChapters;
      });

      setSubjects(uniqueSubjects);
      setChapters(chaptersBySubject);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const checkMonthlyUsage = async () => {
    try {
      if (!isPremium) {
        const { data: { user } } = await supabase.auth.getUser();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        
        const { data: tests } = await supabase
          .from('test_attempts')
          .select('id')
          .eq('user_id', user?.id)
          .gte('created_at', startOfMonth.toISOString());
        
        setMonthlyTestsUsed(tests?.length || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subject) 
        ? prev.filter(s => s !== subject) : [...prev, subject];
      const newChapters = newSelection.flatMap(s => 
        chapters[s]?.map(ch => ({ subject: s, chapter: ch })) || []
      );
      setAvailableChapters(newChapters);
      setSelectedChapters(prevChapters => 
        prevChapters.filter(ch => newChapters.some(nc => nc.subject === ch.subject && nc.chapter === ch.chapter))
      );
      return newSelection;
    });
  };

  const handleChapterToggle = (subject, chapter) => {
    setSelectedChapters(prev => {
      const exists = prev.some(ch => ch.subject === subject && ch.chapter === chapter);
      return exists ? prev.filter(ch => !(ch.subject === subject && ch.chapter === chapter))
        : [...prev, { subject, chapter }];
    });
  };

  const startTest = async (mode = testMode) => {
    if (!isPremium && monthlyTestsUsed >= MONTHLY_LIMIT_FREE) {
      setShowUpgradeModal(true);
      toast.error(`You've used all ${MONTHLY_LIMIT_FREE} free tests this month!`);
      return;
    }

    // For full mock test
    if (mode === "full") {
      setLoading(true);
      toast.loading("Preparing your full mock test...");

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Please login to take tests");
          navigate('/login');
          return;
        }
        
        const { data: attemptedQuestions } = await supabase
          .from('question_attempts')
          .select('question_id')
          .eq('user_id', user.id);
        
        const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];
        
        let query = supabase.from('questions').select('*');
        
        if (attemptedIds.length > 0) {
          query = query.not('id', 'in', `(${attemptedIds.join(',')})`);
        }

        const { data: questions, error } = await query.limit(100);
        
        if (error) throw error;
        
        if (!questions || questions.length === 0) {
          toast.dismiss();
          toast.error("No new questions available! All questions already attempted.");
          setLoading(false);
          return;
        }

        if (questions.length < 75) {
          toast.dismiss();
          toast.info(`Only ${questions.length} new questions available. Starting test with ${questions.length} questions.`);
        }

        const shuffled = questions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(75, questions.length));

        const testSession = {
          id: Date.now().toString(),
          title: "Full Syllabus Mock Test - JEE Pattern",
          questions: selected,
          duration: 180,
          startTime: new Date().toISOString()
        };

        localStorage.setItem('currentTest', JSON.stringify(testSession));

        if (!isPremium) {
          await supabase.from('test_attempts').insert({
            user_id: user?.id,
            test_type: 'full',
            created_at: new Date().toISOString()
          });
          
          setMonthlyTestsUsed(prev => prev + 1);
        }
            
        toast.dismiss();
        toast.success(`Full mock test started with ${selected.length} questions!`);
        navigate('/test-attempt');
      } catch (error) {
        console.error('Error starting test:', error);
        toast.dismiss();
        toast.error("Failed to start test");
        setLoading(false);
      }
      return;
    }

    // For chapter/subject tests
    if (selectedChapters.length === 0 && selectedSubjects.length === 0) {
      toast.error("Please select at least one chapter or subject");
      return;
    }

    setLoading(true);
    toast.loading("Preparing your test...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to take tests");
        navigate('/login');
        return;
      }
      
      const { data: attemptedQuestions } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('user_id', user.id);
      
      const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];
      
      let query = supabase.from('questions').select('*');
      
      if (mode === "chapter" && selectedChapters.length > 0) {
        const chapterNames = selectedChapters.map(ch => ch.chapter);
        query = query.in('chapter', chapterNames);
      } else if (mode === "subject" && selectedSubjects.length > 0) {
        query = query.in('subject', selectedSubjects);
      }

      if (attemptedIds.length > 0) {
        query = query.not('id', 'in', `(${attemptedIds.join(',')})`);
      }

      const { data: questions, error } = await query.limit(100);
      
      if (error) throw error;
      
      if (!questions || questions.length === 0) {
        toast.dismiss();
        toast.error("No new questions available! All questions already attempted.");
        setLoading(false);
        return;
      }

      if (questions.length < 25) {
        toast.dismiss();
        toast.info(`Only ${questions.length} new questions available. Starting test with ${questions.length} questions.`);
      }

      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(25, questions.length));

      const testSession = {
        id: Date.now().toString(),
        title: mode === "chapter" 
          ? `${selectedChapters.map(ch => ch.chapter).join(', ')} - Chapter Test`
          : `${selectedSubjects.join(', ')} - Subject Test`,
        questions: selected,
        duration: 60,
        startTime: new Date().toISOString()
      };

      localStorage.setItem('currentTest', JSON.stringify(testSession));

      if (!isPremium) {
        await supabase.from('test_attempts').insert({
          user_id: user?.id,
          test_type: mode,
          created_at: new Date().toISOString()
        });
        
        setMonthlyTestsUsed(prev => prev + 1);
      }
          
      toast.dismiss();
      toast.success(`Test started with ${selected.length} fresh questions!`);
      navigate('/test-attempt');
    } catch (error) {
      console.error('Error starting test:', error);
      toast.dismiss();
      toast.error("Failed to start test");
      setLoading(false);
    }
  };

  if (showUpgradeModal) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Header />
        </div>
        <PricingModal 
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            navigate('/subscription-plans');
          }}
          limitType="test_limit"
        />
      </>
    );
  }
  
  if (loading) {
    return <LoadingScreen message="Loading your tests..." />;
  }

  if (!testMode) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 sm:pt-20 pb-4">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl">
            {!isPremium && (
              <div className="mb-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-orange-500 p-2 rounded-lg shrink-0">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-orange-900 text-sm sm:text-base">
                        📝 Mock Tests: {monthlyTestsUsed}/{MONTHLY_LIMIT_FREE} this month
                      </p>
                      <p className="text-xs sm:text-sm text-orange-700 mt-1">
                        {monthlyTestsUsed >= MONTHLY_LIMIT_FREE ? (
                          <span className="font-semibold">⚠️ Limit reached! Upgrade for unlimited tests.</span>
                        ) : (
                          <span>Upgrade to Pro for unlimited mock tests + AI features!</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/subscription-plans')}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold text-sm px-4 py-2"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setTestMode("chapter")}
              >
                <div className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                    Chapter-wise Test
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                    Select multiple chapters for laser-focused practice
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">25</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">60</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-md transition-all duration-300 text-sm sm:text-base">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Select Chapters
                  </Button>
                  
                  <Badge className="mt-3 sm:mt-4 bg-green-50 text-green-700 border-green-200 text-xs">
                    Beginner Friendly
                  </Badge>
                </div>
              </div>

              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setTestMode("subject")}
              >
                <div className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                    Subject-wise Test
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                    Master entire subjects with comprehensive coverage
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">25</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">60</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/90 hover:to-indigo-600/90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-md transition-all duration-300 text-sm sm:text-base">
                    <Brain className="w-4 h-4 mr-2" />
                    Select Subjects
                  </Button>
                  
                  <Badge className="mt-3 sm:mt-4 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                    Intermediate Level
                  </Badge>
                </div>
              </div>

              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-orange-200 hover:border-orange-400 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => startTest("full")}
              >
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                
                <div className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                    Full Syllabus Mock
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                    Complete JEE pattern mock test for real exam simulation
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">75</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold text-sm sm:text-base">180</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-600/90 hover:to-red-600/90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-md transition-all duration-300 text-sm sm:text-base">
                    <Play className="w-4 h-4 mr-2" />
                    Start Mock Test
                  </Button>
                  
                  <Badge className="mt-3 sm:mt-4 bg-orange-50 text-orange-700 border-orange-200 text-xs">
                    Advanced • JEE Pattern
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testMode === "chapter") {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 sm:pt-20 pb-4">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-6xl">
            
            <Button 
              variant="outline"
              className="mb-4 sm:mb-6 border-2 border-primary text-sm"
              onClick={() => {
                setTestMode("");
                setSelectedSubjects([]);
                setSelectedChapters([]);
                setAvailableChapters([]);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Test Selection
            </Button>

            <Card className="border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-50 border-b border-primary/20 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-base sm:text-3xl">Chapter-wise Test Setup</span>
                </CardTitle>
                <p className="text-gray-600 mt-2 flex items-center gap-2 text-xs sm:text-base">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  Select subjects first, then choose specific chapters
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      1
                    </div>
                    <span className="text-sm sm:text-xl">Select Subjects</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {subjects.map((subject) => (
                      <div 
                        key={subject}
                        className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedSubjects.includes(subject)
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary/50'
                        }`}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <label className="cursor-pointer flex-1">
                            <div className="font-bold text-gray-900 text-sm sm:text-base">{subject}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{chapters[subject]?.length || 0} chapters</div>
                          </label>
                          {selectedSubjects.includes(subject) && (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        2
                      </div>
                      <span className="text-sm sm:text-xl">Select Chapters</span>
                      <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">
                        {selectedChapters.length} selected
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                      {availableChapters.map(({ subject, chapter }) => (
                        <div 
                          key={`${subject}-${chapter}`}
                          className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedChapters.some(ch => ch.subject === subject && ch.chapter === chapter)
                              ? 'border-purple-500 bg-purple-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                          onClick={() => handleChapterToggle(subject, chapter)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              checked={selectedChapters.some(ch => ch.subject === subject && ch.chapter === chapter)}
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <label className="cursor-pointer flex-1">
                              <span className="font-semibold text-gray-900 block text-sm sm:text-base">{chapter}</span>
                              <Badge variant="outline" className="text-xs mt-1">
                                {subject}
                              </Badge>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChapters.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-xl bg-gradient-to-r from-primary/10 to-purple-50 border-2 border-primary/20 shadow-md gap-3">
                    <div>
                      <p className="font-bold text-xl sm:text-2xl text-gray-900 mb-2">
                        {selectedChapters.length} Chapter{selectedChapters.length > 1 ? 's' : ''} Selected
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">25 Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">60 Minutes</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => startTest("chapter")}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md text-sm sm:text-base"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Start Test Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (testMode === "subject") {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto pt-16 sm:pt-20 pb-4">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-6xl">
            
            <Button 
              variant="outline"
              className="mb-4 sm:mb-6 border-2 border-primary text-sm"
              onClick={() => {
                setTestMode("");
                setSelectedSubjects([]);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Test Selection
            </Button>

            <Card className="border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-base sm:text-3xl">Subject-wise Test Setup</span>
                </CardTitle>
                <p className="text-gray-600 mt-2 flex items-center gap-2 text-xs sm:text-base">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  Choose subjects to test your understanding
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {subjects.map((subject, index) => {
                    const icons = ['⚛️', '🧪', '📐'];
                    
                    return (
                      <div 
                        key={subject}
                        className={`p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedSubjects.includes(subject)
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary/50'
                        }`}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                          {selectedSubjects.includes(subject) && (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                        </div>
                        
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 text-center">{icons[index % 3]}</div>
                        <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1 sm:mb-2 text-center">{subject}</div>
                        <div className="text-xs sm:text-sm text-gray-500 text-center">
                          {chapters[subject]?.length || 0} chapters
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md gap-3">
                    <div>
                      <p className="font-bold text-xl sm:text-2xl text-gray-900 mb-2">
                        {selectedSubjects.length} Subject{selectedSubjects.length > 1 ? 's' : ''} Selected
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">25 Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">60 Minutes</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => startTest("subject")}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-600/90 hover:to-pink-600/90 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md text-sm sm:text-base"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Start Test Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TestPage;
