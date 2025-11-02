import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target,
  Zap,
  Calendar,
  BookOpen,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface StudyRecommendation {
  subject: string;
  chapter: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedTime: number;
  accuracy: number;
}

const SmartStudyPlanner = () => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayProgress: 0,
    weeklyStreak: 0,
    totalStudyTime: 0,
    targetHours: 6
  });

  useEffect(() => {
    fetchSmartRecommendations();
  }, []);

  const fetchSmartRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's performance data
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('*, questions!inner(subject, chapter, topic)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!attempts || attempts.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Analyze weak areas
      const topicStats: any = {};
      
      attempts.forEach((attempt: any) => {
        const key = `${attempt.questions.subject}-${attempt.questions.chapter}-${attempt.questions.topic}`;
        if (!topicStats[key]) {
          topicStats[key] = {
            subject: attempt.questions.subject,
            chapter: attempt.questions.chapter,
            topic: attempt.questions.topic,
            total: 0,
            correct: 0
          };
        }
        topicStats[key].total++;
        if (attempt.is_correct) topicStats[key].correct++;
      });

      // Generate smart recommendations
      const recs: StudyRecommendation[] = Object.values(topicStats)
        .filter((stat: any) => stat.total >= 3)
        .map((stat: any) => {
          const accuracy = (stat.correct / stat.total) * 100;
          let priority: 'high' | 'medium' | 'low' = 'low';
          let reason = '';
          
          if (accuracy < 40) {
            priority = 'high';
            reason = 'Critical weakness - needs immediate attention';
          } else if (accuracy < 70) {
            priority = 'medium';
            reason = 'Moderate weakness - practice recommended';
          } else {
            priority = 'low';
            reason = 'Strong area - maintain with revision';
          }

          return {
            subject: stat.subject,
            chapter: stat.chapter,
            topic: stat.topic,
            priority,
            reason,
            estimatedTime: priority === 'high' ? 60 : priority === 'medium' ? 45 : 30,
            accuracy: Math.round(accuracy)
          };
        })
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 10);

      setRecommendations(recs);

      // Fetch today's progress
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttempts } = await supabase
        .from('question_attempts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00Z`);

      setStats(prev => ({
        ...prev,
        todayProgress: Math.min(100, (todayAttempts?.length || 0) * 4),
        weeklyStreak: 3
      }));

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    high: {
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: AlertCircle
    },
    medium: {
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: TrendingUp
    },
    low: {
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: CheckCircle
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 mx-auto text-purple-600 animate-pulse" />
          <p className="text-gray-600">Analyzing your performance...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Today's Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.todayProgress}%</p>
              </div>
            </div>
            <Progress value={stats.todayProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-orange-600">{stats.weeklyStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Study Time Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudyTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Daily Target</p>
                <p className="text-2xl font-bold text-green-600">{stats.targetHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-6 h-6" />
            AI-Powered Study Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400" />
              <p className="text-gray-600">Start practicing to get personalized recommendations!</p>
              <Button onClick={() => window.location.href = '/study-now'}>
                Start Practice
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const config = priorityConfig[rec.priority];
                const PriorityIcon = config.icon;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`bg-gradient-to-r ${config.color} text-white`}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {rec.subject} • {rec.chapter}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-lg mb-1">{rec.topic}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {rec.estimatedTime} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {rec.accuracy}% accuracy
                          </span>
                        </div>

                        <p className={`text-sm ${config.textColor} flex items-center gap-2`}>
                          <PriorityIcon className="w-4 h-4" />
                          {rec.reason}
                        </p>
                      </div>

                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Practice Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartStudyPlanner;
