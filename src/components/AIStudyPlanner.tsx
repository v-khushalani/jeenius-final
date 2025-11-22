import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Clock,
  Trophy,
  Flame,
  BookOpen,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculatePhaseAllocation, 
  categorizeTopics, 
  allocateDailyTime, 
  generateWeeklyPlan,
  predictRank,
  generateSWOTAnalysis,
  type TopicPriority,
  type TimeAllocation,
  type DailyPlan
} from '@/lib/studyPlanAlgorithm';
import { 
  calculateEnergyScore, 
  generateMotivationMessage 
} from '@/lib/psychologyEngine';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AIStudyPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyStudyHours, setDailyStudyHours] = useState(4);
  const [targetExam, setTargetExam] = useState('JEE');
  const [examDate, setExamDate] = useState('2026-05-24');
  const [daysToExam, setDaysToExam] = useState(0);
  
  const [weakTopics, setWeakTopics] = useState<TopicPriority[]>([]);
  const [mediumTopics, setMediumTopics] = useState<TopicPriority[]>([]);
  const [strongTopics, setStrongTopics] = useState<TopicPriority[]>([]);
  const [timeAllocation, setTimeAllocation] = useState<TimeAllocation | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[]>([]);
  const [rankPrediction, setRankPrediction] = useState<any>(null);
  const [swotAnalysis, setSWOTAnalysis] = useState<any>(null);
  const [energyScore, setEnergyScore] = useState<any>(null);
  const [motivationMessage, setMotivationMessage] = useState<any>(null);

  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weekPlanOpen, setWeekPlanOpen] = useState(true);
  const [swotOpen, setSWOTOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudyData();
    }
  }, [user]);

  const loadStudyData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_study_hours, target_exam, target_exam_date, current_streak, overall_accuracy')
        .eq('id', user?.id)
        .single();

      // Fetch actual question count from question_attempts (source of truth)
      const { count } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const actualQuestionCount = count || 0;

      if (profile) {
        setDailyStudyHours(profile.daily_study_hours || 4);
        setTargetExam(profile.target_exam || 'JEE');
        setExamDate(profile.target_exam_date || '2026-05-24');
        setStreak(profile.current_streak || 0);
        setAvgAccuracy(profile.overall_accuracy || 0);
        setTotalQuestions(actualQuestionCount);
      }

      // Calculate days to exam
      const examDateObj = new Date(profile?.target_exam_date || '2026-05-24');
      const today = new Date();
      const days = Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setDaysToExam(days);

      // Fetch topic mastery data
      const { data: topicData } = await supabase
        .from('topic_mastery')
        .select('*')
        .eq('user_id', user?.id);

      if (!topicData || topicData.length < 5) {
        setLoading(false);
        return;
      }

      // Run algorithm - INSTANT
      const categorized = categorizeTopics(topicData);
      const phaseAlloc = calculatePhaseAllocation(days);
      const allocated = allocateDailyTime(profile?.daily_study_hours || 4, phaseAlloc, categorized);
      const weekly = generateWeeklyPlan(profile?.daily_study_hours || 4, allocated, phaseAlloc);
      const rank = predictRank(profile?.overall_accuracy || 0, actualQuestionCount, profile?.target_exam || 'JEE');
      const swot = generateSWOTAnalysis(categorized);

      // Psychology engine
      const energy = calculateEnergyScore([], profile?.overall_accuracy || 0, [], profile?.daily_study_hours || 4, 0, 0);
      const motivation = generateMotivationMessage(profile?.current_streak || 0, profile?.overall_accuracy || 0, 0);

      setWeakTopics(allocated.weak);
      setMediumTopics(allocated.medium);
      setStrongTopics(allocated.strong);
      setTimeAllocation(phaseAlloc);
      setWeeklyPlan(weekly);
      setRankPrediction(rank);
      setSWOTAnalysis(swot);
      setEnergyScore(energy);
      setMotivationMessage(motivation);

      setLoading(false);
      toast.success('Study plan generated instantly! ⚡');
    } catch (error) {
      console.error('Error loading study data:', error);
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      await supabase
        .from('profiles')
        .update({
          daily_study_hours: dailyStudyHours,
          target_exam: targetExam,
          target_exam_date: examDate
        })
        .eq('id', user?.id);

      toast.success('Settings updated!');
      await loadStudyData();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-30 blur-2xl animate-pulse"></div>
            </div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">Analyzing your performance...</p>
            <p className="text-sm text-slate-600">Algorithm processing in under 50ms</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions < 10) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 blur-2xl"></div>
              </div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900">
                Build Your Foundation First 🎯
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Your AI Study Planner needs at least <span className="font-bold text-blue-600">10 questions</span> to analyze your performance and create a personalized study plan.
              </p>
              
              <div className="pt-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{totalQuestions}/10 questions</span>
                  </div>
                  <Progress value={(totalQuestions / 10) * 100} className="w-32 h-2" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <Button 
                  onClick={() => navigate('/study-now')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Practicing Now
                </Button>
                <Button
                  onClick={() => loadStudyData()}
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <Card className="rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  {motivationMessage?.emoji} Your Smart Study Plan
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">Algorithm-Powered</Badge>
                </h2>
                <p className="text-slate-200 text-sm">{motivationMessage?.message}</p>
              </div>
            </div>
            <Button 
              onClick={loadStudyData}
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-slate-300 mb-1">Target Exam</p>
              <p className="text-lg font-bold">{targetExam}</p>
              <p className="text-xs text-slate-400">{new Date(examDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-slate-300 mb-1">Days Remaining</p>
              <p className="text-lg font-bold">{daysToExam}</p>
              <p className="text-xs text-slate-400">Focus time left</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-slate-300 mb-1">Current Accuracy</p>
              <p className="text-lg font-bold">{avgAccuracy.toFixed(0)}%</p>
              <p className="text-xs text-slate-400">All-time average</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <p className="text-xs text-slate-300 mb-1">Predicted Rank</p>
              <p className="text-lg font-bold">{rankPrediction?.currentRank.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Based on current</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-red-500 bg-red-50/80">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-700">Focus Areas</p>
            </div>
            <h3 className="text-3xl font-bold text-red-700 mb-1">{weakTopics.length}</h3>
            <p className="text-xs text-slate-600 mb-2">Topics need attention</p>
            <Badge className="bg-red-500 text-white text-xs">60% time allocation</Badge>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-green-500 bg-green-50/80">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-700">Strengths</p>
            </div>
            <h3 className="text-3xl font-bold text-green-700 mb-1">{strongTopics.length}</h3>
            <p className="text-xs text-slate-600 mb-2">Mastered topics</p>
            <Badge className="bg-green-500 text-white text-xs">10% maintenance</Badge>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500 bg-blue-50/80">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-700">Days to Exam</p>
            </div>
            <h3 className="text-3xl font-bold text-blue-700 mb-1">{daysToExam}</h3>
            <p className="text-xs text-slate-600 mb-2">Time remaining</p>
            <Badge className="bg-blue-500 text-white text-xs">
              {daysToExam > 90 ? 'Foundation' : (daysToExam > 30 ? 'Revision' : 'Mock Tests')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 bg-purple-50/80">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-700">Target Rank</p>
            </div>
            <h3 className="text-3xl font-bold text-purple-700 mb-1">{rankPrediction?.targetRank.toLocaleString()}</h3>
            <p className="text-xs text-slate-600 mb-2">At 90% accuracy</p>
            <Badge className="bg-purple-500 text-white text-xs">{rankPrediction?.improvementWeeks} weeks to goal</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Study Settings */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Study Settings
                </CardTitle>
                {settingsOpen ? <ChevronUp className="h-5 w-5 text-slate-600" /> : <ChevronDown className="h-5 w-5 text-slate-600" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Daily Study Hours</label>
                  <input
                    type="number"
                    value={dailyStudyHours}
                    onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                    min="1"
                    max="12"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Target Exam</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="JEE">JEE Main & Advanced</option>
                    <option value="NEET">NEET</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Button onClick={updateSettings} className="bg-blue-600 hover:bg-blue-700 w-full">
                <Zap className="h-4 w-4 mr-2" />
                Save & Regenerate Plan
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Time Allocation */}
      {timeAllocation && (
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Daily Time Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-xs text-slate-600 mb-1">Study Time</p>
                <p className="text-2xl font-bold text-blue-700">
                  {(dailyStudyHours * timeAllocation.studyTime).toFixed(1)}h
                </p>
                <Badge className="mt-2 bg-blue-500 text-white text-xs">
                  {(timeAllocation.studyTime * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                <p className="text-xs text-slate-600 mb-1">Revision Time</p>
                <p className="text-2xl font-bold text-green-700">
                  {(dailyStudyHours * timeAllocation.revisionTime).toFixed(1)}h
                </p>
                <Badge className="mt-2 bg-green-500 text-white text-xs">
                  {(timeAllocation.revisionTime * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                <p className="text-xs text-slate-600 mb-1">Mock Tests</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(dailyStudyHours * timeAllocation.mockTestTime).toFixed(1)}h
                </p>
                <Badge className="mt-2 bg-purple-500 text-white text-xs">
                  {(timeAllocation.mockTestTime * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-500">
                <p className="text-xs text-slate-600 mb-1">Rest Time</p>
                <p className="text-2xl font-bold text-orange-700">
                  {(dailyStudyHours * timeAllocation.restTime).toFixed(1)}h
                </p>
                <Badge className="mt-2 bg-orange-500 text-white text-xs">
                  {(timeAllocation.restTime * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Plan */}
      <Collapsible open={weekPlanOpen} onOpenChange={setWeekPlanOpen}>
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  7-Day Study Schedule
                </CardTitle>
                {weekPlanOpen ? <ChevronUp className="h-5 w-5 text-slate-600" /> : <ChevronDown className="h-5 w-5 text-slate-600" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {weeklyPlan.map((day, index) => {
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`rounded-lg p-4 transition-all ${isToday ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-slate-800">{dayName}</h4>
                      {isToday && <Badge className="bg-blue-500 text-white">Today</Badge>}
                    </div>
                    <div className="space-y-2">
                      {day.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-3 text-sm">
                          <Badge className={
                            task.type === 'study' ? 'bg-blue-500 text-white' :
                            task.type === 'revision' ? 'bg-green-500 text-white' :
                            'bg-purple-500 text-white'
                          }>
                            {task.duration}m
                          </Badge>
                          <span className="text-slate-600 text-xs">{task.timeSlot}</span>
                          <span className="font-medium text-slate-800 flex-1">{task.subject} - {task.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* SWOT Analysis */}
      {swotAnalysis && (
        <Collapsible open={swotOpen} onOpenChange={setSWOTOpen}>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-all">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    SWOT Analysis
                  </CardTitle>
                  {swotOpen ? <ChevronUp className="h-5 w-5 text-slate-600" /> : <ChevronDown className="h-5 w-5 text-slate-600" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {swotAnalysis.strengths.slice(0, 3).map((s: string, i: number) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {swotAnalysis.weaknesses.slice(0, 3).map((w: string, i: number) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Opportunities
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {swotAnalysis.opportunities.slice(0, 3).map((o: string, i: number) => (
                        <li key={i}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Threats
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {swotAnalysis.threats.slice(0, 3).map((t: string, i: number) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};

export default AIStudyPlanner;
