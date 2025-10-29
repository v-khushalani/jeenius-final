import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EnhancedAIStudyPlanner() {
  const [examDate, setExamDate] = useState('2026-05-24');
  const [dailyHours, setDailyHours] = useState(4);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data states
  const [weakAreas, setWeakAreas] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [syllabusProgress, setSyllabusProgress] = useState(null);
  const [expandedDay, setExpandedDay] = useState(0);
  const [timeAllocation, setTimeAllocation] = useState({
    study: 60,
    revision: 25,
    mockTests: 15
  });

  const daysRemaining = Math.ceil(
    (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to view study plan');
        return;
      }

      // Fetch user profile for exam date and study hours
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_exam_date, daily_study_hours')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setExamDate(profile.target_exam_date || '2026-05-24');
        setDailyHours(profile.daily_study_hours || 4);
      }

      // Fetch weak areas
      await fetchWeakAreas(user.id);

      // Fetch syllabus progress
      await fetchSyllabusProgress(user.id);

      // Fetch 7-day schedule
      await fetchWeekSchedule(user.id);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeakAreas = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('weakness_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('weakness_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      console.log('📊 Weak areas fetched:', data);
      setWeakAreas(data || []);
    } catch (error) {
      console.error('Error fetching weak areas:', error);
    }
  };

  const fetchSyllabusProgress = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('study_plan_metadata')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('📈 Syllabus progress:', data);
        setSyllabusProgress({
          total: data.total_topics,
          completed: data.completed_topics,
          inProgress: data.in_progress_topics,
          pending: data.pending_topics,
          percentage: Math.round((data.completed_topics / data.total_topics) * 100)
        });
      }
    } catch (error) {
      console.error('Error fetching syllabus progress:', error);
    }
  };

  const fetchWeekSchedule = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { data, error } = await supabase
        .from('study_schedule')
        .select('*')
        .eq('user_id', userId)
        .gte('date', today)
        .lte('date', weekLater)
        .order('date', { ascending: true });

      if (error) throw error;

      console.log('📅 Schedule fetched:', data);

      // Group by date
      const grouped = {};
      data?.forEach((activity) => {
        if (!grouped[activity.date]) {
          grouped[activity.date] = [];
        }
        grouped[activity.date].push(activity);
      });

      const weekData = Object.keys(grouped).map((date, idx) => ({
        day: idx,
        date: new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        rawDate: date,
        activities: grouped[date],
      }));

      setWeekSchedule(weekData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleRegeneratePlan = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please login first');
        return;
      }

      // Update profile with new settings
      await supabase
        .from('profiles')
        .update({
          target_exam_date: examDate,
          daily_study_hours: dailyHours,
        })
        .eq('user_id', user.id);

      // Call edge function to regenerate plan
      const { data, error } = await supabase.functions.invoke('generate-dynamic-plan', {
        body: { regenerate: true },
      });

      if (error) throw error;

      console.log('✅ Plan regenerated:', data);
      toast.success('Study plan regenerated successfully!');

      // Refresh all data
      await fetchAllData();
    } catch (error) {
      console.error('Error regenerating plan:', error);
      toast.error('Failed to regenerate plan');
    } finally {
      setRefreshing(false);
    }
  };

  const markActivityComplete = async (activity) => {
    try {
      const { error } = await supabase
        .from('study_schedule')
        .update({
          status: 'completed',
          completed_minutes: activity.allocated_minutes,
        })
        .eq('id', activity.id);

      if (error) throw error;

      toast.success('Activity marked as complete!');
      
      // Refresh schedule
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchWeekSchedule(user.id);
        await fetchSyllabusProgress(user.id);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to update activity');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading your personalized study plan...</p>
        </div>
      </div>
    );
  }

  const topicsPerDay = syllabusProgress
    ? (syllabusProgress.pending + syllabusProgress.inProgress) / Math.max(daysRemaining, 1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          AI Study Planner
          <Badge className="ml-3 bg-green-500 text-white">
            <Activity className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </h1>
        <p className="text-slate-600">Your personalized path to JEE success</p>
      </div>

      {/* Exam Countdown Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">JEE 2026 Countdown</p>
              <p className="text-5xl font-bold">{daysRemaining}</p>
              <p className="text-white/90">days remaining</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Target Date</p>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-white/20 text-white px-4 py-2 rounded-lg border-2 border-white/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">Study</Badge>
            </div>
            <p className="text-2xl font-bold">{timeAllocation.study}%</p>
            <p className="text-sm text-slate-600">New Topics</p>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((dailyHours * 60 * timeAllocation.study) / 100)} min/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Revision</Badge>
            </div>
            <p className="text-2xl font-bold">{timeAllocation.revision}%</p>
            <p className="text-sm text-slate-600">Consolidation</p>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((dailyHours * 60 * timeAllocation.revision) / 100)} min/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">Tests</Badge>
            </div>
            <p className="text-2xl font-bold">{timeAllocation.mockTests}%</p>
            <p className="text-sm text-slate-600">Mock Tests</p>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((dailyHours * 60 * timeAllocation.mockTests) / 100)} min/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">Daily</Badge>
            </div>
            <p className="text-2xl font-bold">{dailyHours}h</p>
            <p className="text-sm text-slate-600">Study Time</p>
            <p className="text-xs text-slate-500 mt-1">{dailyHours * 60} minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Syllabus Progress */}
      {syllabusProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Syllabus Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-bold">{syllabusProgress.percentage}%</span>
                </div>
                <Progress value={syllabusProgress.percentage} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">
                    {syllabusProgress.completed}
                  </p>
                  <p className="text-xs text-green-600">✅ Completed</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">
                    {syllabusProgress.inProgress}
                  </p>
                  <p className="text-xs text-blue-600">📚 In Progress</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">
                    {syllabusProgress.pending}
                  </p>
                  <p className="text-xs text-orange-600">⏳ Pending</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Daily target: {topicsPerDay.toFixed(1)} topics/day to complete on time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak Areas Alert - REAL DATA */}
      {weakAreas.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-5 h-5" />
              Priority Weak Areas - Focus Now! 🎯
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakAreas.map((area, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{area.topic}</p>
                      <p className="text-sm text-slate-600">
                        {area.subject} • {area.chapter}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {area.attempts_count} attempts • Avg time: {area.avg_time_seconds}s
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">
                      {area.accuracy_percentage?.toFixed(0)}% accuracy
                    </Badge>
                  </div>
                  <Progress value={area.accuracy_percentage || 0} className="h-2" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-600">
                      Weakness Score: {area.weakness_score?.toFixed(0)}/100
                    </p>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Practice Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Rolling Schedule - REAL DATA */}
      {weekSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                7-Day Rolling Schedule
              </CardTitle>
              <Button onClick={handleRegeneratePlan} size="sm" variant="outline" disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekSchedule.map((day, dayIdx) => (
                <div key={dayIdx} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === dayIdx ? -1 : dayIdx)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={dayIdx === 0 ? 'bg-blue-600' : 'bg-slate-600'}>
                        {dayIdx === 0 ? 'TODAY' : `Day ${dayIdx + 1}`}
                      </Badge>
                      <span className="font-semibold">{day.date}</span>
                      <span className="text-sm text-slate-600">
                        {day.activities.length} activities
                      </span>
                    </div>
                    {expandedDay === dayIdx ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {expandedDay === dayIdx && (
                    <div className="p-4 space-y-3 bg-white">
                      {day.activities.map((activity, actIdx) => (
                        <div
                          key={actIdx}
                          className={`p-4 rounded-lg border-l-4 ${
                            activity.status === 'completed'
                              ? 'bg-green-50 border-green-500 opacity-60'
                              : activity.activity_type === 'study'
                              ? 'bg-blue-50 border-blue-500'
                              : activity.activity_type === 'revision'
                              ? 'bg-green-50 border-green-500'
                              : activity.activity_type === 'mock_test'
                              ? 'bg-red-50 border-red-500'
                              : 'bg-purple-50 border-purple-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  className={
                                    activity.activity_type === 'study'
                                      ? 'bg-blue-200 text-blue-800'
                                      : activity.activity_type === 'revision'
                                      ? 'bg-green-200 text-green-800'
                                      : activity.activity_type === 'mock_test'
                                      ? 'bg-red-200 text-red-800'
                                      : 'bg-purple-200 text-purple-800'
                                  }
                                >
                                  {activity.activity_type.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {activity.priority === 'high' && (
                                  <Badge className="bg-orange-200 text-orange-800">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Priority
                                  </Badge>
                                )}
                              </div>
                              <p className="font-bold text-sm text-slate-900">{activity.topic}</p>
                              <p className="text-xs text-slate-600">{activity.subject}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                <Brain className="w-3 h-3 inline mr-1" />
                                {activity.reason}
                              </p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-xl font-bold text-slate-700">
                                {activity.allocated_minutes}
                              </p>
                              <p className="text-xs text-slate-500">min</p>
                              {dayIdx === 0 && activity.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  onClick={() => markActivityComplete(activity)}
                                  className="mt-2 bg-green-600 hover:bg-green-700 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </Button>
                              )}
                              {activity.status === 'completed' && (
                                <Badge className="mt-2 bg-green-600 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {weekSchedule.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Study Plan Yet
            </h3>
            <p className="text-slate-600 mb-4">
              Generate your personalized AI study plan to get started
            </p>
            <Button
              onClick={handleRegeneratePlan}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={refreshing}
            >
              <Brain className="w-4 h-4 mr-2" />
              {refreshing ? 'Generating...' : 'Generate Study Plan'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Study Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Daily Study Hours: {dailyHours}h
              </label>
              <input
                type="range"
                min="2"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600 mt-1">
                <span>2 hours</span>
                <span className="font-bold text-blue-600">{dailyHours} hours</span>
                <span>12 hours</span>
              </div>
            </div>
            <Button
              onClick={handleRegeneratePlan}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={refreshing}
            >
              <Brain className="w-4 h-4 mr-2" />
              {refreshing ? 'Regenerating...' : 'Regenerate Plan with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-xs text-slate-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
