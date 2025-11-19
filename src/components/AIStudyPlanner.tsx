import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Target, Calendar, Clock, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle2,
  Brain, Zap, Trophy, Star, Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface WeeklyPlan {
  day: string;
  tasks: DailyTask[];
}

export default function AIStudyPlanner() {
  const [loading, setLoading] = useState(true);
  const [studyHours, setStudyHours] = useState(6);
  const [isSettingTime, setIsSettingTime] = useState(false);
  const [strengths, setStrengths] = useState<TopicMastery[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicMastery[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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

      // Load study hours preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_study_hours')
        .eq('id', user.id)
        .single();

      if (profile?.daily_study_hours) {
        setStudyHours(profile.daily_study_hours);
      } else {
        setIsSettingTime(true);
      }

      // Load topic mastery data
      const { data: masteryData } = await supabase
        .from('topic_mastery')
        .select('subject, chapter, topic, accuracy, questions_attempted')
        .eq('user_id', user.id)
        .order('accuracy', { ascending: false });

      if (masteryData) {
        const goodTopics = masteryData.filter(t => t.accuracy >= 70 && t.questions_attempted >= 10);
        const weakTopics = masteryData.filter(t => t.accuracy < 70 && t.questions_attempted >= 5);
        
        setStrengths(goodTopics.slice(0, 5));
        setWeaknesses(weakTopics.slice(0, 10));
      }

      // Generate weekly plan if study hours is set
      if (profile?.daily_study_hours) {
        generateWeeklyPlan(profile.daily_study_hours, masteryData || []);
      }
    } catch (error) {
      console.error('Error loading study data:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const saveStudyHours = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ daily_study_hours: studyHours })
        .eq('id', user.id);

      toast.success('Study hours saved! Generating your plan...');
      setIsSettingTime(false);
      loadStudyData();
    } catch (error) {
      console.error('Error saving study hours:', error);
      toast.error('Failed to save study hours');
    }
  };

  const generateWeeklyPlan = (hours: number, masteryData: TopicMastery[]) => {
    const dailyMinutes = hours * 60;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort topics by priority (weakest first)
    const sortedTopics = [...masteryData].sort((a, b) => a.accuracy - b.accuracy);
    
    const plan: WeeklyPlan[] = daysOfWeek.map((day, index) => {
      const tasks: DailyTask[] = [];
      let remainingMinutes = dailyMinutes;
      
      // Allocate time to weak topics (60% of time)
      const weakTopicsForDay = sortedTopics
        .filter(t => t.accuracy < 70)
        .slice(index * 2, index * 2 + 2);
      
      weakTopicsForDay.forEach(topic => {
        if (remainingMinutes > 0) {
          const timeToAllocate = Math.min(45, remainingMinutes * 0.6);
          tasks.push({
            subject: topic.subject,
            chapter: topic.chapter,
            topic: topic.topic,
            timeMinutes: Math.round(timeToAllocate),
            priority: 'high'
          });
          remainingMinutes -= timeToAllocate;
        }
      });
      
      // Allocate time to medium topics (30% of time)
      const mediumTopicsForDay = sortedTopics
        .filter(t => t.accuracy >= 70 && t.accuracy < 85)
        .slice(index, index + 1);
      
      mediumTopicsForDay.forEach(topic => {
        if (remainingMinutes > 0) {
          const timeToAllocate = Math.min(30, remainingMinutes * 0.3);
          tasks.push({
            subject: topic.subject,
            chapter: topic.chapter,
            topic: topic.topic,
            timeMinutes: Math.round(timeToAllocate),
            priority: 'medium'
          });
          remainingMinutes -= timeToAllocate;
        }
      });
      
      // Allocate time to strong topics for revision (10% of time)
      const strongTopicsForDay = sortedTopics
        .filter(t => t.accuracy >= 85)
        .slice(index, index + 1);
      
      strongTopicsForDay.forEach(topic => {
        if (remainingMinutes > 0) {
          const timeToAllocate = Math.min(20, remainingMinutes);
          tasks.push({
            subject: topic.subject,
            chapter: topic.chapter,
            topic: topic.topic,
            timeMinutes: Math.round(timeToAllocate),
            priority: 'low'
          });
          remainingMinutes -= timeToAllocate;
        }
      });
      
      return { day, tasks };
    });
    
    setWeeklyPlan(plan);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Focus Area';
      case 'medium': return 'Practice';
      case 'low': return 'Revision';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div>
            <p className="text-lg font-semibold">Analyzing your performance...</p>
            <p className="text-sm text-muted-foreground">Creating your personalized study plan</p>
          </div>
          <Progress value={66} className="w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (isSettingTime) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Let's Build Your Perfect Study Schedule</CardTitle>
            <p className="text-muted-foreground">
              Every great achiever starts with a plan. Let's create yours!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">Why this matters?</p>
                  <p className="text-sm text-muted-foreground">
                    Your personalized AI will optimize your study time, focus on weak areas, and ensure consistent progress towards your JEE goals.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-3 block">How many hours can you study daily?</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="16"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value) || 1)}
                    className="text-2xl font-bold text-center h-16 border-2"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    hours
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[4, 6, 8].map((hours) => (
                    <Button
                      key={hours}
                      variant={studyHours === hours ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStudyHours(hours)}
                      className="transition-all hover:scale-105"
                    >
                      {hours}h
                    </Button>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">
                    Recommended: <span className="font-semibold text-foreground">6-8 hours</span> for JEE success
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={saveStudyHours} 
                className="w-full h-12 text-lg group" 
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Generate My AI Study Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todaysPlan = weeklyPlan.find(p => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return p.day === today;
  });

  const totalTopicsAnalyzed = strengths.length + weaknesses.length;
  const masteryPercentage = totalTopicsAnalyzed > 0 
    ? Math.round((strengths.length / totalTopicsAnalyzed) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Your AI Study Plan</h1>
                  <p className="text-muted-foreground">
                    Powered by performance analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {studyHours} hours/day
                </Badge>
                <Badge variant="outline" className="text-base px-4 py-2">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {masteryPercentage}% Mastery
                </Badge>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => setIsSettingTime(true)} className="hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 mr-2" />
              Adjust Time
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Strong Topics</p>
                  <p className="text-3xl font-bold text-green-600">{strengths.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Focus Areas</p>
                  <p className="text-3xl font-bold text-red-600">{weaknesses.length}</p>
                </div>
                <Target className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Topics Analyzed</p>
                  <p className="text-3xl font-bold text-primary">{totalTopicsAnalyzed}</p>
                </div>
                <Brain className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strengths & Focus Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-2 border-green-200 hover:shadow-xl transition-all group">
          <CardHeader className="bg-gradient-to-br from-green-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-green-600">Your Strengths</div>
                <div className="text-xs text-muted-foreground font-normal">Keep crushing it! 💪</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {strengths.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Solve <span className="font-bold text-foreground">10+ questions per topic</span></p>
                <p className="text-xs text-muted-foreground">We'll identify your strengths!</p>
              </div>
            ) : (
              strengths.map((topic, idx) => (
                <div 
                  key={idx} 
                  className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-all border border-transparent hover:border-green-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground truncate">{topic.subject} • {topic.chapter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 font-bold">
                      {Math.round(topic.accuracy)}%
                    </Badge>
                    <Progress value={topic.accuracy} className="w-16 h-2" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card className="border-2 border-red-200 hover:shadow-xl transition-all group">
          <CardHeader className="bg-gradient-to-br from-red-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-red-600">Focus Areas</div>
                <div className="text-xs text-muted-foreground font-normal">Your growth opportunities 🎯</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {weaknesses.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Solve <span className="font-bold text-foreground">5+ questions per topic</span></p>
                <p className="text-xs text-muted-foreground">We'll find areas to improve!</p>
              </div>
            ) : (
              weaknesses.slice(0, 5).map((topic, idx) => (
                <div 
                  key={idx} 
                  className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground truncate">{topic.subject} • {topic.chapter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 font-bold">
                      {Math.round(topic.accuracy)}%
                    </Badge>
                    <Progress value={topic.accuracy} className="w-16 h-2" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Plan */}
      {todaysPlan && todaysPlan.tasks.length > 0 && (
        <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl">Today's Study Plan</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {todaysPlan.tasks.reduce((sum, t) => sum + t.timeMinutes, 0)} minutes planned
                  </div>
                </div>
              </CardTitle>
              <Badge className="text-base px-4 py-2">
                {todaysPlan.tasks.length} topics
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {todaysPlan.tasks.map((task, idx) => (
              <div 
                key={idx} 
                className={`group/task p-5 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Badge variant="secondary" className="font-semibold">
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <div>
                      <p className="font-bold text-lg">{task.topic}</p>
                      <p className="text-sm text-muted-foreground">{task.subject} • {task.chapter}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-16 h-16 bg-background/50 rounded-2xl flex flex-col items-center justify-center border-2">
                      <p className="text-2xl font-bold leading-none">{task.timeMinutes}</p>
                      <p className="text-[10px] text-muted-foreground">min</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly Plan */}
      <Card className="border-2 hover:shadow-xl transition-all">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div>7-Day Roadmap</div>
                <div className="text-sm text-muted-foreground font-normal">Your week ahead, optimized</div>
              </div>
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {weeklyPlan.filter(d => d.tasks.length > 0).length} days planned
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-6">
          {weeklyPlan.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30" />
              <div>
                <p className="font-semibold">Start solving to unlock your weekly plan!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Solve questions across topics and we'll create a personalized 7-day schedule
                </p>
              </div>
            </div>
          ) : (
            weeklyPlan.map((dayPlan) => {
              const isToday = dayPlan.day === new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const isExpanded = expandedDay === dayPlan.day;
              const totalMinutes = dayPlan.tasks.reduce((sum, task) => sum + task.timeMinutes, 0);
              
              return (
                <div 
                  key={dayPlan.day} 
                  className={`border-2 rounded-xl transition-all hover:shadow-md ${
                    isToday 
                      ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dayPlan.day)}
                    className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-all rounded-xl group"
                  >
                    <div className="flex items-center gap-4">
                      {isToday ? (
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
                          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Calendar className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className={`font-bold text-lg ${isToday ? 'text-primary' : ''}`}>
                          {dayPlan.day}
                          {isToday && <Badge className="ml-2 text-xs">Today</Badge>}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {dayPlan.tasks.length} topics
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {totalMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dayPlan.tasks.length > 0 && (
                        <Progress value={(totalMinutes / (studyHours * 60)) * 100} className="w-20 h-2" />
                      )}
                      {isExpanded ? 
                        <ChevronUp className="w-5 h-5 text-primary" /> : 
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      }
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3 border-t pt-3 bg-muted/20 rounded-b-xl">
                      {dayPlan.tasks.map((task, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg border-2 hover:scale-[1.01] transition-all ${getPriorityColor(task.priority)}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <Badge variant="secondary" className="text-xs font-semibold">
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              <p className="font-bold">{task.topic}</p>
                              <p className="text-xs text-muted-foreground">{task.subject} • {task.chapter}</p>
                            </div>
                            <div className="w-14 h-14 bg-background rounded-xl flex flex-col items-center justify-center border-2">
                              <p className="text-xl font-bold leading-none">{task.timeMinutes}</p>
                              <p className="text-[9px] text-muted-foreground">min</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
