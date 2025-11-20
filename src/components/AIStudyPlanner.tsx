import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Target, Calendar, Clock, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle2,
  Brain, Zap, Trophy, Star, Play, BookOpen, AlertCircle
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

export default function AIStudyPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyHours, setStudyHours] = useState(6);
  const [strengths, setStrengths] = useState<TopicMastery[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicMastery[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    loadStudyData();
  }, [refresh]);

  const loadStudyData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to continue');
        return;
      }

      // Load study hours preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_study_hours')
        .eq('id', user.id)
        .single();

      if (profile?.daily_study_hours) {
        setStudyHours(profile.daily_study_hours);
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

          if (profile?.daily_study_hours) {
            generateWeeklyPlan(profile.daily_study_hours, masteryData);
          }
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

      // Allocate 60% time to weak topics
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

      // Allocate 30% time to medium topics
      const mediumTime = Math.floor(dailyMinutes * 0.3);
      if (mediumTopics.length > 0 && remainingMinutes > 0) {
        const topic = mediumTopics[idx % mediumTopics.length];
        const time = Math.min(mediumTime, remainingMinutes);
        tasks.push({ ...topic, timeMinutes: Math.floor(time), priority: 'medium' });
        remainingMinutes -= time;
      }

      // Allocate 10% time to strong topics (revision)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-sm text-slate-600 font-medium">Loading your personalized study plan...</p>
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
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">AI Study Planner</h1>
                <p className="text-sm text-white/80 mt-1">Your personalized path to JEE success</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => loadStudyData()}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
              >
                🔄 Refresh
              </Button>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                {studyHours}h daily
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium text-white/80">Focus Areas</span>
              </div>
              <p className="text-2xl font-bold">{weaknesses.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium text-white/80">Strengths</span>
              </div>
              <p className="text-2xl font-bold">{strengths.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium text-white/80">This Week</span>
              </div>
              <p className="text-2xl font-bold">{weeklyPlan.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Focus Areas (Weaknesses) */}
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
                <div key={idx} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-orange-100">
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
                <div key={idx} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-green-100">
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
              <span>Weekly Study Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyPlan.map((dayPlan, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
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
                  <div className="border-t border-blue-100 p-4 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50">
                    {dayPlan.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{task.topic}</p>
                            <p className="text-xs text-slate-500">{task.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">{task.timeMinutes}m</span>
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
