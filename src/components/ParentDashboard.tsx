import React from 'react';
import { BarChart3, TrendingUp, Clock, Target, Star, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { stats, profile, loading } = useUserStats();

  // ✅ Convert subjectStats to array format (useUserData format)
  const subjectProgress = React.useMemo(() => {
    if (!stats?.subjectStats) return [];
    
    return Object.entries(stats.subjectStats).map(([subject, data]: [string, any]) => ({
      subject,
      progress: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
  }, [stats]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard insights...</p>
        </div>
      </section>
    );
  }

  // ✅ Mock recent activity (would come from detailed attempts data)
  const recentActivity = [
    { date: '2024-01-15', subject: 'Physics', problems: stats?.totalQuestions || 0, time: '45 min' },
    { date: '2024-01-14', subject: 'Chemistry', problems: stats?.correctAnswers || 0, time: '60 min' },
    { date: '2024-01-13', subject: 'Mathematics', problems: Math.floor((stats?.totalQuestions || 0) * 0.6), time: '50 min' },
  ];

  return (
    <section id="dashboard" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Parent Dashboard
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Insights
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Stay connected with your child's learning journey through comprehensive analytics, 
            progress tracking, and actionable insights to support their JEE preparation.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Overview Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Overall Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.accuracy || 0}%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Study Streak</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.streak || 0} days</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Problems Solved</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.correctAnswers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalQuestions || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Progress */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Subject-wise Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subjectProgress.length > 0 ? subjectProgress.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{subject.subject}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{subject.progress}%</span>
                        {subject.progress < 50 && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-4">
                    No subject progress data available yet. Start practicing to see insights!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Streak */}
            <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{stats?.streak || 0}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Day Streak</h3>
                <p className="text-white/80 text-sm">
                  {stats?.streak > 0 ? 'Amazing consistency! Keep up the great work.' : 'Start your learning journey today!'}
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.subject}</p>
                      <p className="text-sm text-gray-600">{activity.problems} problems</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                      <p className="text-xs text-gray-500">{activity.date.split('-').slice(1).join('/')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.accuracy < 70 ? (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Focus needed:</strong> Overall accuracy is {stats.accuracy}%. Recommend more practice in weak areas.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Great progress!</strong> Maintaining {stats?.accuracy}% accuracy. Keep it up!
                    </p>
                  </div>
                )}
                
                {stats?.streak >= 7 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Excellent consistency!</strong> {stats.streak}-day streak shows strong dedication.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentDashboard;
