import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Target, Calendar, Clock, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle2 
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
        const goodTopics = masteryData.filter(t => t.accuracy >= 70 && t.questions_attempted >= 5);
        const weakTopics = masteryData.filter(t => t.accuracy < 70 && t.questions_attempted >= 3);
        
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your personalized study plan...</p>
        </div>
      </div>
    );
  }

  if (isSettingTime) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            How much time can you dedicate to study daily?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Tell us your daily study capacity so we can create a personalized plan that fits your schedule.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Daily Study Hours</label>
              <Input
                type="number"
                min="1"
                max="16"
                value={studyHours}
                onChange={(e) => setStudyHours(parseInt(e.target.value) || 1)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: 6-8 hours for competitive exams
              </p>
            </div>
            <Button onClick={saveStudyHours} className="w-full" size="lg">
              Generate My Study Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todaysPlan = weeklyPlan.find(p => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return p.day === today;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Study Plan</h1>
          <p className="text-muted-foreground mt-1">
            {studyHours} hours/day • Personalized for you
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsSettingTime(true)}>
          <Clock className="w-4 h-4 mr-2" />
          Change Time
        </Button>
      </div>

      {/* Strengths & Focus Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.length === 0 ? (
              <p className="text-muted-foreground text-sm">Complete more questions to identify your strengths</p>
            ) : (
              strengths.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{topic.topic}</p>
                    <p className="text-xs text-muted-foreground">{topic.subject} • {topic.chapter}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {Math.round(topic.accuracy)}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Target className="w-5 h-5" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weaknesses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Complete more questions to identify areas to focus on</p>
            ) : (
              weaknesses.slice(0, 5).map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{topic.topic}</p>
                    <p className="text-xs text-muted-foreground">{topic.subject} • {topic.chapter}</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {Math.round(topic.accuracy)}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Plan */}
      {todaysPlan && todaysPlan.tasks.length > 0 && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Today's Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysPlan.tasks.map((task, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${getPriorityColor(task.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <p className="font-semibold">{task.topic}</p>
                    <p className="text-sm opacity-80">{task.subject} • {task.chapter}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{task.timeMinutes}</p>
                    <p className="text-xs">minutes</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {weeklyPlan.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Complete more questions to generate a weekly plan
            </p>
          ) : (
            weeklyPlan.map((dayPlan) => {
              const isToday = dayPlan.day === new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const isExpanded = expandedDay === dayPlan.day;
              const totalMinutes = dayPlan.tasks.reduce((sum, task) => sum + task.timeMinutes, 0);
              
              return (
                <div key={dayPlan.day} className={`border rounded-lg ${isToday ? 'border-primary bg-primary/5' : ''}`}>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dayPlan.day)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isToday && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      <div className="text-left">
                        <p className="font-semibold">{dayPlan.day}</p>
                        <p className="text-sm text-muted-foreground">
                          {dayPlan.tasks.length} topics • {totalMinutes} min
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 border-t">
                      {dayPlan.tasks.map((task, idx) => (
                        <div key={idx} className={`mt-2 p-3 rounded border ${getPriorityColor(task.priority)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs mb-1">
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              <p className="font-medium text-sm">{task.topic}</p>
                              <p className="text-xs opacity-70">{task.subject} • {task.chapter}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{task.timeMinutes} min</p>
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
