import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  TrendingUp, Zap, Users, Star, Award, Brain, Sparkles, Crown
} from "lucide-react";
import PricingModal from '@/components/PricingModal';

import { UsageLimitBanner } from '@/components/paywall/UsageLimitBanner';

const TestPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [testMode, setTestMode] = useState("");
  const [subjects] = useState(["Physics", "Chemistry", "Mathematics"]);
  const [chapters] = useState({
    "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism"],
    "Chemistry": ["Organic", "Inorganic", "Physical Chemistry"],
    "Mathematics": ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry"]
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [liveUsers, setLiveUsers] = useState(247);
  const [userStats] = useState({
    testsCompleted: 23, averageScore: 78, streak: 5, rank: 142,
    strongSubject: "Physics", weakSubject: "Chemistry"
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [monthlyTestsUsed, setMonthlyTestsUsed] = useState(0);
  const MONTHLY_LIMIT_FREE = 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkSub = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('expires_at')
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .single();
        setIsPro(sub && new Date(sub.expires_at) > new Date());
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { data: tests } = await supabase
          .from('test_attempts')
          .select('id')
          .eq('user_id', user?.id)
          .gte('created_at', startOfMonth.toISOString());
        setMonthlyTestsUsed(tests?.length || 0);
      } catch (e) { setIsPro(false); }
    };
    checkSub();
  }, []);

  useEffect(() => {
    checkSubscription();
  }, []);
  
  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();
      
      const isProUser = subscription && 
        new Date(subscription.expires_at) > new Date();
      setIsPro(isProUser);
  
      // Get this month's test count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const { data: tests } = await supabase
        .from('test_attempts')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());
      
      setMonthlyTestsUsed(tests?.length || 0);
    } catch (error) {
      console.error('Error checking subscription:', error);
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

  // Replace the startTest function in TestPage.tsx with this:

const startTest = async () => {
  // 🚨 CHECK MONTHLY LIMIT FOR FREE USERS
  if (!isPro && monthlyTestsUsed >= MONTHLY_LIMIT_FREE) {
    setShowUpgradeModal(true);
    toast.error(`You've used all ${MONTHLY_LIMIT_FREE} free tests this month!`);
    return;  // ✅ Bas return karo, setTimeout hatao
  }
  if (selectedChapters.length === 0 && selectedSubjects.length === 0) {
    toast.error("Please select at least one chapter or subject");
    return;
  }

  setLoading(true);
  toast.loading("Preparing your test...");

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to take tests");
      navigate('/login');
      return;
    }
    
    // Get all attempted question IDs by this user
    const { data: attemptedQuestions } = await supabase
      .from('question_attempts')
      .select('question_id')
      .eq('user_id', user.id);
    
    const attemptedIds = attemptedQuestions?.map(a => a.question_id) || [];
    
    let query = supabase.from('questions').select('*');
    
    if (testMode === "chapter" && selectedChapters.length > 0) {
      // Chapter-wise test
      const chapterNames = selectedChapters.map(ch => ch.chapter);
      query = query.in('chapter', chapterNames);
    } else if (testMode === "subject" && selectedSubjects.length > 0) {
      // Subject-wise test
      query = query.in('subject', selectedSubjects);
    }

    // Exclude already attempted questions
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

    // Shuffle and select 25 questions (or less if not available)
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(25, questions.length));

    // Create test session
    const testSession = {
      id: Date.now().toString(),
      title: testMode === "chapter" 
        ? `${selectedChapters.map(ch => ch.chapter).join(', ')} - Chapter Test`
        : `${selectedSubjects.join(', ')} - Subject Test`,
      questions: selected,
      duration: 60, // 60 minutes
      startTime: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('currentTest', JSON.stringify(testSession));

    // Log test attempt
    if (!isPro) {
      await supabase.from('test_attempts').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        test_type: testMode,
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
            navigate('/pricing');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        {!isPro && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24 pb-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 text-lg">
                      📝 Mock Tests: {monthlyTestsUsed}/{MONTHLY_LIMIT_FREE} this month
                    </p>
                    <p className="text-sm text-orange-700">
                      {monthlyTestsUsed >= MONTHLY_LIMIT_FREE ? (
                        <span className="font-semibold">⚠️ Limit reached! Upgrade for unlimited tests.</span>
                      ) : (
                        <span>Upgrade to Pro for unlimited mock tests + AI features!</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}
                
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-6">
              <UsageLimitBanner
                type="questions"
                used={15} // Replace with actual user stats
                limit={50}
                onUpgrade={() => navigate('/subscription-plans')}
              />
            </div>
            <div className="mb-12 text-center">
              <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white border border-gray-200 shadow-lg">
                <div className="flex justify-center gap-3">
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-1.5">
                    <Star className="w-4 h-4 mr-1" />
                    Strong: {userStats.strongSubject}
                  </Badge>
                  <Badge className="bg-red-50 text-red-700 border-red-200 px-4 py-1.5">
                    <Target className="w-4 h-4 mr-1" />
                    Focus: {userStats.weakSubject}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setTestMode("chapter")}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    Chapter-wise Test
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Select multiple chapters for laser-focused practice and rapid improvement
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">25</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">60</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Select Chapters
                  </Button>
                  
                  <Badge className="mt-4 bg-green-50 text-green-700 border-green-200">
                    Beginner Friendly
                  </Badge>
                </div>
              </div>

              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setTestMode("subject")}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    Subject-wise Test
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Master entire subjects with comprehensive question coverage
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">25</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">60</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/90 hover:to-indigo-600/90 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300">
                    <Brain className="w-4 h-4 mr-2" />
                    Select Subjects
                  </Button>
                  
                  <Badge className="mt-4 bg-yellow-50 text-yellow-700 border-yellow-200">
                    Intermediate Level
                  </Badge>
                </div>
              </div>

              <div 
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-orange-200 hover:border-orange-400 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={startTest}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
                    <Award className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    Full Syllabus Mock
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Complete JEE pattern mock test for real exam simulation
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">75</div>
                        <div className="text-gray-500 text-xs">Questions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-bold">180</div>
                        <div className="text-gray-500 text-xs">Minutes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-600/90 hover:to-red-600/90 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300">
                    <Play className="w-4 h-4 mr-2" />
                    Start Mock Test
                  </Button>
                  
                  <Badge className="mt-4 bg-orange-50 text-orange-700 border-orange-200">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <Button 
              variant="outline"
              className="mb-8 border-2 border-primary"
              onClick={() => {
                setTestMode("");
                setSelectedSubjects([]);
                setSelectedChapters([]);
                setAvailableChapters([]);
              }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Test Selection
            </Button>

            <Card className="border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-50 border-b border-primary/20 p-6">
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  Chapter-wise Test Setup
                </CardTitle>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Select subjects first, then choose specific chapters to master
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    Select Subjects
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <div 
                        key={subject}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedSubjects.includes(subject)
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary/50'
                        }`}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            className="w-5 h-5"
                          />
                          <label className="cursor-pointer flex-1">
                            <div className="font-bold text-gray-900">{subject}</div>
                            <div className="text-sm text-gray-500">{chapters[subject]?.length || 0} chapters</div>
                          </label>
                          {selectedSubjects.includes(subject) && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      Select Chapters
                      <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">
                        {selectedChapters.length} selected
                      </Badge>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableChapters.map(({ subject, chapter }) => (
                        <div 
                          key={`${subject}-${chapter}`}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedChapters.some(ch => ch.subject === subject && ch.chapter === chapter)
                              ? 'border-purple-500 bg-purple-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                          onClick={() => handleChapterToggle(subject, chapter)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              checked={selectedChapters.some(ch => ch.subject === subject && ch.chapter === chapter)}
                              className="w-5 h-5"
                            />
                            <label className="cursor-pointer flex-1">
                              <span className="font-semibold text-gray-900 block">{chapter}</span>
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
                  <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/10 to-purple-50 border-2 border-primary/20 shadow-md">
                    <div>
                      <p className="font-bold text-2xl text-gray-900 mb-2">
                        {selectedChapters.length} Chapter{selectedChapters.length > 1 ? 's' : ''} Selected
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">25 Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">60 Minutes</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={startTest}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
                    >
                      <Play className="w-5 h-5 mr-2" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            <Button 
              variant="outline"
              className="mb-8 border-2 border-primary"
              onClick={() => {
                setTestMode("");
                setSelectedSubjects([]);
              }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Test Selection
            </Button>

            <Card className="border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-6">
                <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  Subject-wise Test Setup
                </CardTitle>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  Choose subjects to test your comprehensive understanding
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {subjects.map((subject, index) => {
                    const icons = ['⚛️', '🧪', '📐'];
                    
                    return (
                      <div 
                        key={subject}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedSubjects.includes(subject)
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary/50'
                        }`}
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            className="w-5 h-5"
                          />
                          {selectedSubjects.includes(subject) && (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        
                        <div className="text-4xl mb-3 text-center">{icons[index % 3]}</div>
                        <div className="font-bold text-xl text-gray-900 mb-2 text-center">{subject}</div>
                        <div className="text-sm text-gray-500 text-center">
                          {chapters[subject]?.length || 0} chapters
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md">
                    <div>
                      <p className="font-bold text-2xl text-gray-900 mb-2">
                        {selectedSubjects.length} Subject{selectedSubjects.length > 1 ? 's' : ''} Selected
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">25 Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">60 Minutes</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={startTest}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-600/90 hover:to-pink-600/90 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
                    >
                      <Play className="w-5 h-5 mr-2" />
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

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out;
  }

  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }
`;
if (!document.head.querySelector('style[data-test-page]')) {
  style.setAttribute('data-test-page', 'true');
  document.head.appendChild(style);
}

export default TestPage;
