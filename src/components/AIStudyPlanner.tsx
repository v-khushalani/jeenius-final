import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Target,
  TrendingDown,
  Brain,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  ChevronRight,
  TrendingUp,
  Award,
  BarChart3,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EnhancedAIStudyPlanner() {
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('JEE_MAINS');
  const [examDate, setExamDate] = useState('2026-01-24');
  const [dailyHours, setDailyHours] = useState(4);
  
  // Real data states
  const [weakAreas, setWeakAreas] = useState([]);
  const [syllabusProgress, setSyllabusProgress] = useState(null);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [dailySchedule, setDailySchedule] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  const examDates = {
    'JEE_MAINS': '2026-01-24',
    'JEE_ADVANCED': '2026-05-24',
    'NEET': '2026-05-03',
    'BITSAT': '2026-05-15'
  };

  const examNames = {
    'JEE_MAINS': 'JEE Mains 2026',
    'JEE_ADVANCED': 'JEE Advanced 2026',
    'NEET': 'NEET 2026',
    'BITSAT': 'BITSAT 2026'
  };

  const daysRemaining = Math.ceil(
    (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to view study plan');
        setLoading(false);
        return;
      }

      // Fetch user profile for exam and hours
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_exam, target_exam_date, daily_study_hours')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setSelectedExam(profile.target_exam || 'JEE_MAINS');
        setExamDate(examDates[profile.target_exam] || examDates['JEE_MAINS']);
        setDailyHours(profile.daily_study_hours || 4);
      }

      // Fetch overall accuracy and progress
      await fetchUserStats(user.id);
      await fetchWeakAreas(user.id);
      await fetchSyllabusProgress(user.id);
      
      // Generate dynamic schedule
      generateDynamicSchedule();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      // Get overall accuracy from question_attempts
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('is_correct')
        .eq('user_id', userId);

      if (attempts && attempts.length > 0) {
        const correct = attempts.filter(a => a.is_correct).length;
        const accuracy = Math.round((correct / attempts.length) * 100);
        setOverallAccuracy(accuracy);
      }

      // Get current streak
      const { data: streakData } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('user_id', userId)
        .maybeSingle();

      if (streakData) {
        setCurrentStreak(streakData.current_streak || 0);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchWeakAreas = async (userId) => {
    try {
      const { data } = await supabase
        .from('weakness_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('weakness_score', { ascending: false })
        .limit(5);

      setWeakAreas(data || []);
    } catch (error) {
      console.error('Error fetching weak areas:', error);
    }
  };

  const fetchSyllabusProgress = async (userId) => {
    try {
      const { data: priorities } = await supabase
        .from('topic_priorities')
        .select('status')
        .eq('user_id', userId);

      if (priorities && priorities.length > 0) {
        const total = priorities.length;
        const completed = priorities.filter(p => p.status === 'completed').length;
        const inProgress = priorities.filter(p => p.status === 'in_progress').length;
        const pending = priorities.filter(p => p.status === 'pending').length;

        setSyllabusProgress({
          total,
          completed,
          inProgress,
          pending,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });
      } else {
        setSyllabusProgress({
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          percentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching syllabus progress:', error);
    }
  };

  const generateDynamicSchedule = () => {
    const progress = syllabusProgress?.percentage || 0;
    const accuracy = overallAccuracy;

    let schedule = [];

    if (progress < 30) {
      // Early stage - focus on new topics
      schedule = [
        { time: '06:00 AM', activity: 'New Topics', duration: '2h', priority: 'high', color: 'blue' },
        { time: '08:30 AM', activity: 'Practice Problems', duration: '1h', priority: 'medium', color: 'green' },
        { time: '04:00 PM', activity: 'Revision', duration: '1h', priority: 'low', color: 'purple' }
      ];
    } else if (progress < 60) {
      // Mid stage - balanced approach
      if (accuracy < 60) {
        schedule = [
          { time: '06:00 AM', activity: 'Weak Areas Focus', duration: '1.5h', priority: 'high', color: 'red' },
          { time: '08:00 AM', activity: 'New Topics', duration: '1.5h', priority: 'high', color: 'blue' },
          { time: '04:00 PM', activity: 'Practice + Revision', duration: '1h', priority: 'medium', color: 'green' }
        ];
      } else {
        schedule = [
          { time: '06:00 AM', activity: 'New Topics', duration: '1.5h', priority: 'high', color: 'blue' },
          { time: '08:00 AM', activity: 'Practice Problems', duration: '1.5h', priority: 'high', color: 'green' },
          { time: '04:00 PM', activity: 'Quick Revision', duration: '1h', priority: 'medium', color: 'purple' }
        ];
      }
    } else {
      // Final stage - revision heavy
      schedule = [
        { time: '06:00 AM', activity: 'Weak Topics Drill', duration: '1h', priority: 'high', color: 'red' },
        { time: '08:00 AM', activity: 'Full Revision', duration: '2h', priority: 'high', color: 'purple' },
        { time: '04:00 PM', activity: 'Mock Test Practice', duration: '1h', priority: 'high', color: 'orange' }
      ];
    }

    setDailySchedule(schedule);
  };

  const handleExamChange = async (newExam) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          target_exam: newExam,
          target_exam_date: examDates[newExam]
        })
        .eq('user_id', user.id);

      setSelectedExam(newExam);
      setExamDate(examDates[newExam]);
      toast.success(`Exam updated to ${examNames[newExam]}`);
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    }
  };

  const handleHoursChange = async (newHours) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ daily_study_hours: newHours })
        .eq('user_id', user.id);

      setDailyHours(newHours);
      generateDynamicSchedule();
      toast.success('Study hours updated');
    } catch (error) {
      console.error('Error updating hours:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-slate-600">Analyzing your study data...</p>
        </div>
      </div>
    );
  }

  const topicsPerDay = syllabusProgress && syllabusProgress.total > 0
    ? ((syllabusProgress.pending + syllabusProgress.inProgress) / Math.max(daysRemaining, 1))
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          AI Study Planner
          <Badge className="ml-3 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <Activity className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </h1>
        <p className="text-slate-600">Personalized, dynamic study plan based on your performance</p>
      </div>

      {/* Exam Selection */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">Target Exam</p>
              <select
                value={selectedExam}
                onChange={(e) => handleExamChange(e.target.value)}
                className="bg-white/20 text-white text-2xl font-bold px-4 py-2 rounded-lg border-2 border-white/30 cursor-pointer"
              >
                {Object.keys(examNames).map(key => (
                  <option key={key} value={key} className="text-slate-900">
                    {examNames[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Exam Date</p>
              <p className="text-3xl font-bold">{new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-5xl font-bold mt-2">{daysRemaining}</p>
              <p className="text-white/90">days remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Progress</Badge>
            </div>
            <p className="text-3xl font-bold text-green-600">{syllabusProgress?.percentage || 0}%</p>
            <p className="text-sm text-slate-600">Syllabus Complete</p>
            <Progress value={syllabusProgress?.percentage || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Accuracy</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-600">{overallAccuracy}%</p>
            <p className="text-sm text-slate-600">Overall Success Rate</p>
            <Progress value={overallAccuracy} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">Streak</Badge>
            </div>
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-sm text-slate-600">Days Consistent</p>
            <p className="text-xs text-slate-500 mt-2">Keep it up! 🔥</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Daily</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-600">{dailyHours}h</p>
            <p className="text-sm text-slate-600">Study Time</p>
            <input
              type="range"
              min="2"
              max="12"
              value={dailyHours}
              onChange={(e) => handleHoursChange(parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Today's Dynamic Schedule */}
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's AI-Generated Schedule
            <Badge className="ml-auto bg-blue-100 text-blue-700">
              Optimized for {overallAccuracy < 60 ? 'Accuracy' : syllabusProgress?.percentage < 50 ? 'Coverage' : 'Revision'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {dailySchedule.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 border-${item.color}-200 bg-${item.color}-50 hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-${item.color}-100 flex items-center justify-center`}>
                      <Clock className={`w-6 h-6 text-${item.color}-600`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.activity}</p>
                      <p className="text-sm text-slate-600">{item.time} • {item.duration}</p>
                    </div>
                  </div>
                  <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>
                    {item.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => window.location.href = '/study-now'}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Studying Now
          </Button>
        </CardContent>
      </Card>

      {/* Syllabus Progress */}
      {syllabusProgress && syllabusProgress.total > 0 ? (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Syllabus Completion Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-700">{syllabusProgress.completed}</p>
                <p className="text-xs text-green-600">Completed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-700">{syllabusProgress.inProgress}</p>
                <p className="text-xs text-blue-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-orange-700">{syllabusProgress.pending}</p>
                <p className="text-xs text-orange-600">Pending</p>
              </div>
            </div>
            {topicsPerDay > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-700" />
                  <p className="text-sm font-semibold text-yellow-800">
                    Daily Target: {topicsPerDay.toFixed(1)} topics/day to finish on time
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No Progress Data Yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Start solving questions to unlock AI-powered insights
            </p>
            <Button 
              onClick={() => window.location.href = '/study-now'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Begin Your Journey
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weak Areas - Priority Focus */}
      {weakAreas.length > 0 && (
        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-5 h-5" />
              Priority Weak Areas - Immediate Action Required! 🎯
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {weakAreas.map((area, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-red-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{area.topic}</p>
                      <p className="text-sm text-slate-600">{area.subject} • {area.chapter}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 text-lg px-3 py-1">
                      {area.accuracy_percentage?.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={area.accuracy_percentage || 0} className="h-3 mb-3" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {area.attempts_count} attempts • Avg: {area.avg_time_seconds}s • Weakness: {area.weakness_score?.toFixed(0)}/100
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-red-600 to-pink-600 text-white"
                      onClick={() => window.location.href = '/study-now'}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Fix Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                🚀 AI-Powered Dynamic Planning
              </p>
              <p className="text-xs text-blue-700">
                Your schedule adapts automatically based on progress ({syllabusProgress?.percentage || 0}%) 
                and accuracy ({overallAccuracy}%). Keep practicing to optimize your study plan!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
