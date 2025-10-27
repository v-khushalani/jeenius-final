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
  Activity
} from 'lucide-react';

export default function EnhancedAIStudyPlanner() {
  const [examDate, setExamDate] = useState('2026-05-24');
  const [dailyHours, setDailyHours] = useState(4);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const daysRemaining = Math.ceil(
    (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Mock data for demo
  const mockWeakAreas = [
    { subject: 'Physics', chapter: 'Mechanics', topic: 'Friction', weakness: 85, accuracy: 45 },
    { subject: 'Chemistry', chapter: 'Organic', topic: 'Aldehydes', weakness: 78, accuracy: 52 },
    { subject: 'Math', chapter: 'Calculus', topic: 'Integration', weakness: 72, accuracy: 58 }
  ];

  const mockTodaySchedule = [
    {
      time: '09:00 - 10:30',
      type: 'study',
      subject: 'Physics',
      topic: 'Friction - Force Analysis',
      duration: 90,
      reason: 'Weak area (45% accuracy)'
    },
    {
      time: '10:45 - 12:00',
      type: 'study',
      subject: 'Chemistry',
      topic: 'Aldehydes - Reactions',
      duration: 75,
      reason: 'Medium priority'
    },
    {
      time: '14:00 - 15:00',
      type: 'revision',
      subject: 'Math',
      topic: 'Previous week topics',
      duration: 60,
      reason: 'Scheduled revision'
    },
    {
      time: '15:15 - 16:00',
      type: 'practice',
      subject: 'Mixed',
      topic: 'Daily practice questions',
      duration: 45,
      reason: 'Daily goal'
    }
  ];

  const timeAllocation = {
    study: 60,
    revision: 25,
    mockTests: 15
  };

  const syllabusProgress = {
    total: 850,
    completed: 340,
    inProgress: 120,
    pending: 390,
    percentage: 40
  };

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
          </CardContent>
        </Card>
      </div>

      {/* Syllabus Progress */}
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
                <p className="text-2xl font-bold text-green-700">{syllabusProgress.completed}</p>
                <p className="text-xs text-green-600">✅ Completed</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{syllabusProgress.inProgress}</p>
                <p className="text-xs text-blue-600">📚 In Progress</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{syllabusProgress.pending}</p>
                <p className="text-xs text-orange-600">⏳ Pending</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Daily target: {(syllabusProgress.pending / daysRemaining).toFixed(1)} topics/day to complete on time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas Alert */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <TrendingDown className="w-5 h-5" />
            Priority Weak Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockWeakAreas.map((area, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{area.topic}</p>
                    <p className="text-sm text-slate-600">{area.subject} • {area.chapter}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700">
                    {area.accuracy}% accuracy
                  </Badge>
                </div>
                <Progress value={100 - area.weakness} className="h-2" />
                <p className="text-xs text-slate-600 mt-2">
                  Weakness Score: {area.weakness}/100 - Scheduled for today
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700">
              {mockTodaySchedule.length} activities
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTodaySchedule.map((activity, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  activity.type === 'study'
                    ? 'bg-blue-50 border-blue-500'
                    : activity.type === 'revision'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-purple-50 border-purple-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          activity.type === 'study'
                            ? 'bg-blue-200 text-blue-800'
                            : activity.type === 'revision'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-purple-200 text-purple-800'
                        }
                      >
                        {activity.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-700">
                        {activity.time}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 mb-1">{activity.topic}</p>
                    <p className="text-sm text-slate-600">{activity.subject}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      <Brain className="w-3 h-3 inline mr-1" />
                      {activity.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-700">{activity.duration}</p>
                    <p className="text-xs text-slate-500">minutes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Study Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Daily Study Hours
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
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Regenerate Plan with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
