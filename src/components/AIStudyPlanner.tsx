import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, Target, Calendar, Clock, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle2,
  Brain, Zap, Trophy, Star, Play, BookOpen, AlertCircle, 
  Timer, TrendingDown, Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TopicMastery {
  subject: string;
  chapter: string;
  topic: string;
  accuracy: number;
  questions_attempted: number;
}

interface DailyTask {
  subject: string;
  chapter: string;
  topic: string;
  timeMinutes: number;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed';
}

interface WeeklyPlan {
  day: string;
  tasks: DailyTask[];
  totalMinutes: number;
}

interface AIInsights {
  personalizedGreeting: string;
  strengthAnalysis: string;
  weaknessStrategy: string;
  timeAllocation: {
    weakTopics: string;
    mediumTopics: string;
    revision: string;
    mockTests: string;
  };
  keyRecommendations: string[];
  motivationalMessage: string;
  rankPrediction: {
    currentProjection: string;
    targetProjection: string;
    improvementPath: string;
  };
}

export default function AIStudyPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [studyHours, setStudyHours] = useState(6);
  const [strengths, setStrengths] = useState<TopicMastery[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicMastery[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [targetExam, setTargetExam] = useState<'JEE' | 'NEET'>('JEE');
  const [targetExamDate, setTargetExamDate] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [predictedRank, setPredictedRank] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  useEffect(() => {
    loadStudyData();
  }, []);

  const loadStudyData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to continue');
        return;
      }

      // Load profile preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_study_hours, target_exam, target_exam_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.daily_study_hours) setStudyHours(profile.daily_study_hours);
        if (profile.target_exam) setTargetExam(profile.target_exam as 'JEE' | 'NEET');
        if (profile.target_exam_date) {
          setTargetExamDate(profile.target_exam_date);
          const days = Math.ceil((new Date(profile.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setDaysRemaining(days);
        }
      }

      // Load topic mastery data
      const { data: masteryData } = await supabase
        .from('topic_mastery')
        .select('subject, chapter, topic, accuracy, questions_attempted')
        .eq('user_id', user.id)
        .order('accuracy', { ascending: false });

      if (masteryData && masteryData.length > 0) {
        const total = masteryData.reduce((sum, t) => sum + t.questions_attempted, 0);
        setTotalQuestions(total);
        
        if (total >= 10) {
          setHasData(true);
          const goodTopics = masteryData.filter(t => t.accuracy >= 70 && t.questions_attempted >= 5);
          const weakTopics = masteryData.filter(t => t.accuracy < 70 && t.questions_attempted >= 5);
          
          setStrengths(goodTopics.slice(0, 5));
          setWeaknesses(weakTopics.slice(0, 10));

          // Calculate predicted rank based on performance
          const calculatedAvgAccuracy = masteryData.reduce((sum, t) => sum + t.accuracy, 0) / masteryData.length;
          setAvgAccuracy(calculatedAvgAccuracy);
          const estimatedRank = Math.round(500000 * (1 - calculatedAvgAccuracy / 100));
          setPredictedRank(estimatedRank);

          if (profile?.daily_study_hours) {
            generateWeeklyPlan(profile.daily_study_hours, masteryData);
          }

          // Generate AI insights
          await generateAIInsights(
            user.id,
            profile?.daily_study_hours || 6,
            profile?.target_exam || 'JEE',
            daysRemaining,
            goodTopics,
            weakTopics,
            calculatedAvgAccuracy
          );
        } else {
          setHasData(false);
        }
      } else {
        setHasData(false);
        setTotalQuestions(0);
      }
    } catch (error) {
      console.error('Error loading study data:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPlan = (hours: number, masteryData: TopicMastery[]) => {
    const dailyMinutes = hours * 60;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const weakTopics = masteryData.filter(t => t.accuracy < 70 && t.questions_attempted >= 5);
    const mediumTopics = masteryData.filter(t => t.accuracy >= 70 && t.accuracy < 85 && t.questions_attempted >= 5);
    const strongTopics = masteryData.filter(t => t.accuracy >= 85 && t.questions_attempted >= 5);

    const plan: WeeklyPlan[] = daysOfWeek.map((day, idx) => {
      const tasks: DailyTask[] = [];
      let remainingMinutes = dailyMinutes;

      // 60% time to weak topics
      const weakTime = Math.floor(dailyMinutes * 0.6);
      if (weakTopics.length > 0) {
        const topicsToday = weakTopics.slice(idx % weakTopics.length, (idx % weakTopics.length) + 2);
        topicsToday.forEach(topic => {
          if (remainingMinutes > 0) {
            const time = Math.min(weakTime / topicsToday.length, remainingMinutes);
            tasks.push({ ...topic, timeMinutes: Math.floor(time), priority: 'high' });
            remainingMinutes -= time;
          }
        });
      }

      // 30% time to medium topics
      const mediumTime = Math.floor(dailyMinutes * 0.3);
      if (mediumTopics.length > 0 && remainingMinutes > 0) {
        const topic = mediumTopics[idx % mediumTopics.length];
        const time = Math.min(mediumTime, remainingMinutes);
        tasks.push({ ...topic, timeMinutes: Math.floor(time), priority: 'medium' });
        remainingMinutes -= time;
      }

      // 10% time to strong topics (revision)
      if (strongTopics.length > 0 && remainingMinutes > 0) {
        const topic = strongTopics[idx % strongTopics.length];
        tasks.push({ ...topic, timeMinutes: Math.floor(remainingMinutes), priority: 'low' });
      }

      return { 
        day, 
        tasks,
        totalMinutes: dailyMinutes 
      };
    });

    setWeeklyPlan(plan);
  };

  const generateAIInsights = async (
    userId: string,
    hours: number,
    exam: string,
    days: number,
    strengthsList: TopicMastery[],
    weaknessList: TopicMastery[],
    accuracy: number
  ) => {
    try {
      setGeneratingPlan(true);
      
      const { data, error } = await supabase.functions.invoke('generate-study-plan', {
        body: {
          userId,
          studyHours: hours,
          targetExam: exam,
          daysRemaining: days,
          strengths: strengthsList,
          weaknesses: weaknessList,
          avgAccuracy: accuracy
        }
      });

      if (error) throw error;

      if (data?.success && data?.insights) {
        setAiInsights(data.insights);
        toast.success('AI Study Plan Generated! 🎯');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Could not generate AI insights. Using standard plan.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const updateSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          daily_study_hours: studyHours,
          target_exam: targetExam,
          target_exam_date: targetExamDate
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Settings updated!');
      setShowSettings(false);
      loadStudyData();
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
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-30 blur-2xl animate-pulse"></div>
            </div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">Analyzing your performance...</p>
            <p className="text-sm text-slate-600">JEEnius AI is creating your personalized plan</p>
          </div>
        </div>
      </div>
    );
  }

  if (generatingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            </div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg animate-bounce">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-900">✨ AI Magic in Progress...</p>
            <p className="text-sm text-slate-600">
              JEEnius is analyzing your strengths, weaknesses, and creating a personalized strategy just for you
            </p>
          </div>
          <div className="flex justify-center gap-1 pt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 blur-2xl"></div>
              </div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900">
                Start Your JEEnius Journey! 🎯
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Your AI Study Planner needs at least <span className="font-bold text-purple-600">10 questions</span> to analyze your performance and create a personalized study plan.
              </p>
              
              <div className="pt-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
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
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Practicing Now
                </Button>
                <Button
                  onClick={() => loadStudyData()}
                  variant="outline"
                  size="lg"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  🔄 Refresh Data
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">📊</div>
                <p className="text-xs text-slate-600 mt-1">Personalized Analysis</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">🎯</div>
                <p className="text-xs text-slate-600 mt-1">Smart Recommendations</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">⚡</div>
                <p className="text-xs text-slate-600 mt-1">Weekly Schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* AI Personalized Greeting */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Your Personalized AI Insights</h3>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">AI Generated</Badge>
                </div>
                <p className="text-slate-700 leading-relaxed">{aiInsights.personalizedGreeting}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Stats - No overlap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs opacity-90">Focus Areas</p>
                <p className="text-2xl font-bold">{weaknesses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs opacity-90">Strengths</p>
                <p className="text-2xl font-bold">{strengths.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs opacity-90">Days to {targetExam}</p>
                <p className="text-2xl font-bold">{daysRemaining > 0 ? daysRemaining : 'Set Date'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs opacity-90">Predicted Rank</p>
                <p className="text-2xl font-bold">{predictedRank > 0 ? predictedRank.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Timer className="h-5 w-5" />
              Study Settings
            </CardTitle>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
            >
              {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Daily Study Hours</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Target Exam</Label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as 'JEE' | 'NEET')}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                </select>
              </div>
              <div>
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => {
                    setTargetExamDate(e.target.value);
                    const days = Math.ceil((new Date(e.target.value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    setDaysRemaining(days);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={updateSettings} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
              Save Settings
            </Button>
          </CardContent>
        )}
      </Card>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Strength Analysis */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-lg">
                  <Trophy className="h-5 w-5" />
                </div>
                <span>Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">{aiInsights.strengthAnalysis}</p>
              <div className="space-y-2">
                {strengths.slice(0, 3).map((topic, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-emerald-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{topic.topic}</p>
                        <p className="text-xs text-slate-500">{topic.subject}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                        {topic.accuracy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weakness Strategy */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <span>Focus Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">{aiInsights.weaknessStrategy}</p>
              <div className="space-y-2">
                {weaknesses.slice(0, 3).map((topic, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{topic.topic}</p>
                        <p className="text-xs text-slate-500">{topic.subject}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        {topic.accuracy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Allocation */}
      {aiInsights && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Clock className="h-5 w-5" />
              AI-Recommended Time Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-xs text-slate-600 mb-1">Focus Topics</p>
                <p className="text-xl font-bold text-slate-900">{aiInsights.timeAllocation.weakTopics}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-xs text-slate-600 mb-1">Medium Topics</p>
                <p className="text-xl font-bold text-slate-900">{aiInsights.timeAllocation.mediumTopics}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500">
                <p className="text-xs text-slate-600 mb-1">Revision</p>
                <p className="text-xl font-bold text-slate-900">{aiInsights.timeAllocation.revision}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-xs text-slate-600 mb-1">Mock Tests</p>
                <p className="text-xl font-bold text-slate-900">{aiInsights.timeAllocation.mockTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Recommendations */}
      {aiInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Zap className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.keyRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rank Prediction */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Award className="h-5 w-5" />
              Your Rank Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-xs text-slate-600 mb-1">Current Projection</p>
                <p className="text-sm font-semibold text-slate-900">{aiInsights.rankPrediction.currentProjection}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500">
                <p className="text-xs text-slate-600 mb-1">Target Potential</p>
                <p className="text-sm font-semibold text-slate-900">{aiInsights.rankPrediction.targetProjection}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-xs text-slate-600 mb-1">Improvement Path</p>
                <p className="text-sm font-semibold text-slate-900">{aiInsights.rankPrediction.improvementPath}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      {aiInsights && (
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg flex-shrink-0">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Keep Going! 🚀</h3>
                <p className="text-slate-700 leading-relaxed">{aiInsights.motivationalMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Focus Areas */}
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span>Priority Focus Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weaknesses.length > 0 ? (
              weaknesses.map((topic, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-orange-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{topic.topic}</p>
                      <p className="text-xs text-slate-500">{topic.subject} • {topic.chapter}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={topic.accuracy} className="flex-1 h-2" />
                    <span className="text-xs text-slate-500">{topic.questions_attempted}Q</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No weak areas identified yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg">
                <Star className="h-5 w-5" />
              </div>
              <span>Your Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((topic, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-green-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{topic.topic}</p>
                      <p className="text-xs text-slate-500">{topic.subject} • {topic.chapter}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={topic.accuracy} className="flex-1 h-2" />
                    <span className="text-xs text-slate-500">{topic.questions_attempted}Q</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keep practicing to build strengths!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Plan */}
      {weeklyPlan.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <span>Weekly Study Plan ({studyHours}h/day)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyPlan.map((dayPlan, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedDay(expandedDay === dayPlan.day ? null : dayPlan.day)}
                  className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{dayPlan.day}</p>
                      <p className="text-xs text-slate-500">{dayPlan.tasks.length} topics • {dayPlan.totalMinutes} min</p>
                    </div>
                  </div>
                  {expandedDay === dayPlan.day ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedDay === dayPlan.day && (
                  <div className="px-4 pb-4 space-y-2">
                    {dayPlan.tasks.map((task, taskIdx) => (
                      <div
                        key={taskIdx}
                        className={`p-3 rounded-lg border ${
                          task.priority === 'high'
                            ? 'bg-orange-50 border-orange-200'
                            : task.priority === 'medium'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm text-slate-900">{task.topic}</p>
                          <Badge
                            className={`text-xs ${
                              task.priority === 'high'
                                ? 'bg-orange-500'
                                : task.priority === 'medium'
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          {task.subject} • {task.chapter}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="h-3 w-3" />
                          <span>{task.timeMinutes} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
