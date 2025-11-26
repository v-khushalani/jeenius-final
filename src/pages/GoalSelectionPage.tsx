import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ChevronRight, Calendar, BookOpen, Stethoscope, Calculator, Clock, Rocket, Trophy, Target, Sparkles } from 'lucide-react';

const GoalSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [examDate, setExamDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isStartingJourney, setIsStartingJourney] = useState(false);

  // Calculate exam dates and days remaining
  const examDates = {
    'JEE Main': '2025-04-10',
    'JEE Advanced': '2025-05-25',
    'NEET': '2025-05-05',
    'Foundation': null
  };

  // Check if user has already completed goal selection
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
  
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, target_exam, grade, goals_set')
          .eq('id', user.id)
          .single();
  
        if (error && error.code !== 'PGRST116') {
          console.error('Profile check error:', error);
          setIsLoading(false);
          return;
        }
  
        // If profile is complete (has grade and exam), redirect to dashboard
        if (profile?.goals_set && profile?.target_exam && profile?.grade) {
          console.log('✅ Profile already complete, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
  
        // Profile exists but incomplete - let them continue with goal selection
        console.log('📝 User needs to complete goal selection');
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user profile:', error);
        setIsLoading(false);
      }
    };
  
    checkUserProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedGoal && examDates[selectedGoal]) {
      const today = new Date();
      const exam = new Date(examDates[selectedGoal]);
      const timeDiff = exam.getTime() - today.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysRemaining(days > 0 ? days : 0);
      setExamDate(examDates[selectedGoal]);
    }
  }, [selectedGoal]);

  const grades = [
    { id: '6', name: 'Class 6', icon: '🌱', desc: 'Foundation Building' },
    { id: '7', name: 'Class 7', icon: '🌿', desc: 'Concept Development' },
    { id: '8', name: 'Class 8', icon: '🌳', desc: 'Skill Enhancement' },
    { id: '9', name: 'Class 9', icon: '🏗️', desc: 'Pre-Foundation' },
    { id: '10', name: 'Class 10', icon: '📚', desc: 'Foundation Mastery' },
    { id: '11', name: 'Class 11', icon: '🎯', desc: 'Competitive Edge' },
    { id: '12', name: 'Class 12', icon: '🚀', desc: 'Final Sprint' }
  ];

  const goals = {
    '6': [{ id: 'Foundation', name: 'Foundation Building', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-600' }],
    '7': [{ id: 'Foundation', name: 'Foundation Building', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-600' }],
    '8': [{ id: 'Foundation', name: 'Foundation Building', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-600' }],
    '9': [{ id: 'Foundation', name: 'Foundation Building', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-600' }],
    '10': [{ id: 'Foundation', name: 'Foundation Building', icon: <BookOpen className="w-6 h-6" />, color: 'bg-slate-600' }],
    '11': [
      { id: 'JEE', name: 'JEE Preparation', icon: <Calculator className="w-6 h-6" />, color: 'bg-red-500' },
      { id: 'NEET', name: 'NEET Preparation', icon: <Stethoscope className="w-6 h-6" />, color: 'bg-green-500' }
    ],
    '12': [
      { id: 'JEE', name: 'JEE Preparation', icon: <Calculator className="w-6 h-6" />, color: 'bg-red-500' },
      { id: 'NEET', name: 'NEET Preparation', icon: <Stethoscope className="w-6 h-6" />, color: 'bg-green-500' }
    ]
  };
  
  // Auto-select all subjects based on goal
  const subjects = {
    'JEE': ['Physics', 'Chemistry', 'Mathematics'],
    'NEET': ['Physics', 'Chemistry', 'Biology'],
    'Foundation': ['Mathematics', 'Science', 'English']
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle Start Journey button click
  const handleStartJourney = () => {
    if (!selectedGoal || !selectedGrade) {
      console.error('Missing required selections');
      return;
    }
    setShowWelcomeDialog(true);
  };

  const confirmStartJourney = async () => {
    setIsStartingJourney(true);
    
    // Auto-select all subjects for the chosen goal
    const selectedSubjects = subjects[selectedGoal] || [];
    
    try {
      if (!user?.id) {
        console.error('No user found');
        alert('Please login again');
        navigate('/login');
        return;
      }
  
      // Get user's name from Google auth (already stored in profile)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
  
      console.log('👤 User name from profile:', profile?.full_name);
  
      // Update profile with grade, exam, and subjects
      const gradeNumber = parseInt(selectedGrade, 10) || 11;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          target_exam: selectedGoal,
          grade: gradeNumber,
          subjects: selectedSubjects,
          daily_goal: selectedSubjects.length * 10,
          goals_set: true, // Mark profile as complete
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
  
      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        alert('Error saving profile. Please try again.');
        setIsStartingJourney(false);
        return;
      }
  
      console.log('✅ Profile updated successfully');
  
      // Optional: Save to localStorage as backup
      const userGoals = {
        grade: selectedGrade,
        goal: selectedGoal,
        subjects: selectedSubjects,
        name: profile?.full_name,
        daysRemaining: daysRemaining,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userGoals', JSON.stringify(userGoals));
      
      // Wait a bit for the animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to dashboard
    console.log('🚀 Navigating to dashboard...');
    navigate('/dashboard', { replace: true });
    
    } catch (error) {
    console.error('Error saving goals:', error);
    // Still navigate even if save fails
    navigate('/dashboard', { replace: true });
    } finally {
    // Always reset loading state
    setIsStartingJourney(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedGrade;
    if (currentStep === 2) return selectedGoal;
    return false;
  };

  // Show loading while checking user profile
  if (isLoading) {
    return <LoadingScreen message="Setting up your learning journey..." />;
  }

  return (
    <>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50" style={{backgroundColor: '#e9e9e9'}}>
        <div className="h-full flex flex-col">
          {/* Header - Fixed height */}
          <div className="flex-shrink-0 text-center pt-8 pb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{color: '#013062'}}>
              Welcome to JEEnius! 🎯
            </h1>
            <p className="text-lg md:text-xl text-gray-600">Let's customize your learning journey</p>
            
            {/* Progress Bar - Only 2 steps */}
            <div className="flex justify-center mt-6 mb-4">
              <div className="flex space-x-4">
                {[1, 2].map((step) => (
                  <div key={step} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    step <= currentStep ? 'text-white shadow-lg' : 'bg-gray-400 text-gray-600'
                  }`} style={{
                    backgroundColor: step <= currentStep ? '#013062' : undefined
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep}: {currentStep === 1 ? 'Select Grade' : 'Choose Course'}
            </div>
          </div>

          {/* Content - Scrollable if needed but constrained */}
          <div className="flex-1 overflow-auto px-6">
            {/* Step 1: Grade Selection */}
            {currentStep === 1 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-6" style={{color: '#013062'}}>Which grade are you in? 📚</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {grades.map((grade) => (
                    <div
                      key={grade.id}
                      onClick={() => setSelectedGrade(grade.id)}
                      className={`p-3 md:p-4 lg:p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 bg-white shadow-lg hover:shadow-xl ${
                        selectedGrade === grade.id
                          ? 'shadow-2xl transform scale-105'
                          : 'hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: selectedGrade === grade.id ? '#013062' : '#e5e7eb',
                        boxShadow: selectedGrade === grade.id ? '0 0 0 3px rgba(1, 48, 98, 0.1)' : undefined
                      }}
                    >
                      <div className="text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-3 text-center">{grade.icon}</div>
                      <h3 className="text-sm md:text-lg lg:text-xl font-bold text-center mb-1 md:mb-2" style={{color: '#013062'}}>{grade.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500 text-center">{grade.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Course Selection */}
            {currentStep === 2 && selectedGrade && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-6" style={{color: '#013062'}}>What's your target? 🎯</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {goals[selectedGrade]?.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-4 md:p-6 lg:p-8 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 bg-white shadow-lg hover:shadow-xl ${
                        selectedGoal === goal.id
                          ? 'shadow-2xl transform scale-105'
                          : 'hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: selectedGoal === goal.id ? '#013062' : '#e5e7eb',
                        boxShadow: selectedGoal === goal.id ? '0 0 0 3px rgba(1, 48, 98, 0.1)' : undefined
                      }}
                    >
                      <div className={`inline-flex p-3 rounded-full ${goal.color} mb-4`}>
                        {goal.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{color: '#013062'}}>{goal.name}</h3>
                      
                      {examDates[goal.id] && selectedGoal === goal.id && (
                        <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" style={{color: '#013062'}} />
                              <span style={{color: '#013062'}}>Exam Date: {new Date(examDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center font-bold" style={{color: '#dc2626'}}>
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{daysRemaining} days left</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 text-center py-8">
            {currentStep === 1 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-lg transition-all duration-300 transform text-white shadow-lg hover:shadow-xl ${
                  canProceed()
                    ? 'hover:scale-105'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: canProceed() ? '#013062' : '#9ca3af'
                }}
              >
                Continue
                <ChevronRight className="inline ml-2 w-5 h-5" />
              </button>
            )}

            {currentStep === 2 && (
              <div className="space-x-4">
                <button
                  onClick={handleStartJourney}
                  disabled={!selectedGoal}
                  className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-lg transition-all duration-300 transform text-white shadow-lg hover:shadow-xl ${
                    selectedGoal
                      ? 'hover:scale-105'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: selectedGoal ? '#013062' : '#9ca3af'
                  }}
                >
                  Start My Journey! 🚀
                </button>
                
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 md:px-6 py-3 md:py-4 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Dialog */}
      {showWelcomeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center transform transition-all duration-300 scale-100">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#013062'}}>
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{color: '#013062'}}>
                Welcome Aboard! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                You're about to embark on an incredible learning journey!
              </p>
            </div>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Personalized study plans</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Smart progress tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">AI-powered recommendations</span>
              </div>
            </div>

            <button
              onClick={confirmStartJourney}
              disabled={isStartingJourney}
              className={`w-full py-3 md:py-4 rounded-full font-bold text-lg transition-all duration-300 text-white shadow-lg ${
                isStartingJourney 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-xl transform hover:scale-105'
              }`}
              style={{backgroundColor: '#013062'}}
            >
              {isStartingJourney ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Preparing your journey...</span>
                </div>
              ) : (
                "Let's Begin! 🚀"
              )}
            </button>

            {!isStartingJourney && (
              <button
                onClick={() => setShowWelcomeDialog(false)}
                className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GoalSelectionPage;
