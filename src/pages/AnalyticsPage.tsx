import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Flame,
  Brain,
  Zap,
  BookOpen,
  ArrowRight,
  Filter
} from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('*, questions(subject, chapter, topic, difficulty)')
        .eq('user_id', user?.id);

      const stats = calculateAnalytics(attempts || []);
      setAnalytics(stats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (attempts: any[]) => {
    const subjectStats: any = {};
    const topicStats: any = {};

    // STEP 1: First pass - collect basic stats
    attempts.forEach(attempt => {
      const { subject, chapter, topic, difficulty } = attempt.questions || {};
      if (!subject) return;

      // Initialize subject if not exists
      if (!subjectStats[subject]) {
        subjectStats[subject] = { 
          total: 0, 
          correct: 0, 
          easy: { total: 0, correct: 0 },
          medium: { total: 0, correct: 0 },
          hard: { total: 0, correct: 0 },
          chaptersSet: new Set(),
          topicsSet: new Set(),
          chapters: {}
        };
      }
      
      subjectStats[subject].total++;
      if (attempt.is_correct) subjectStats[subject].correct++;
      subjectStats[subject].chaptersSet.add(chapter);
      subjectStats[subject].topicsSet.add(topic);

      // Difficulty stats
      const diff = difficulty?.toLowerCase() || 'medium';
      if (subjectStats[subject][diff]) {
        subjectStats[subject][diff].total++;
        if (attempt.is_correct) subjectStats[subject][diff].correct++;
      }

      // Old topic stats (for backward compatibility)
      const topicKey = `${subject}-${topic}`;
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { 
          subject, 
          topic, 
          chapter,
          total: 0, 
          correct: 0,
          lastPracticed: attempt.created_at
        };
      }
      topicStats[topicKey].total++;
      if (attempt.is_correct) topicStats[topicKey].correct++;
      if (new Date(attempt.created_at) > new Date(topicStats[topicKey].lastPracticed)) {
        topicStats[topicKey].lastPracticed = attempt.created_at;
      }
    });

    // STEP 2: Calculate hierarchical structure (Subject -> Chapter -> Topic)
    Object.keys(subjectStats).forEach(subject => {
      const subjectAttempts = attempts.filter(a => a.questions?.subject === subject);
      
      subjectAttempts.forEach(attempt => {
        const chapter = attempt.questions?.chapter;
        const topic = attempt.questions?.topic;
        
        if (chapter) {
          // Initialize chapter if not exists
          if (!subjectStats[subject].chapters[chapter]) {
            subjectStats[subject].chapters[chapter] = {
              total: 0,
              correct: 0,
              topics: {}
            };
          }
          
          subjectStats[subject].chapters[chapter].total++;
          if (attempt.is_correct) subjectStats[subject].chapters[chapter].correct++;
          
          // Topic stats within chapter
          if (topic) {
            if (!subjectStats[subject].chapters[chapter].topics[topic]) {
              subjectStats[subject].chapters[chapter].topics[topic] = {
                total: 0,
                correct: 0,
                lastPracticed: attempt.created_at
              };
            }
            
            subjectStats[subject].chapters[chapter].topics[topic].total++;
            if (attempt.is_correct) {
              subjectStats[subject].chapters[chapter].topics[topic].correct++;
            }
            
            // Update last practiced date
            const currentDate = new Date(attempt.created_at);
            const lastDate = new Date(subjectStats[subject].chapters[chapter].topics[topic].lastPracticed);
            if (currentDate > lastDate) {
              subjectStats[subject].chapters[chapter].topics[topic].lastPracticed = attempt.created_at;
            }
          }
        }
      });
      
      // STEP 3: Calculate accuracy for chapters and topics
      Object.keys(subjectStats[subject].chapters).forEach(chapter => {
        const chapterData = subjectStats[subject].chapters[chapter];
        chapterData.accuracy = (chapterData.correct / chapterData.total) * 100;
        
        Object.keys(chapterData.topics).forEach(topic => {
          const topicData = chapterData.topics[topic];
          topicData.accuracy = (topicData.correct / topicData.total) * 100;
          topicData.daysSince = Math.floor(
            (Date.now() - new Date(topicData.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Determine topic status
          if (topicData.total === 0) {
            topicData.status = 'not_started';
          } else if (topicData.accuracy >= 85 && topicData.total >= 20) {
            topicData.status = 'mastered';
          } else if (topicData.accuracy < 60 && topicData.total >= 10) {
            topicData.status = 'weak';
          } else {
            topicData.status = 'in_progress';
          }
        });
      });
    });

    // STEP 4: Calculate overall stats
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.is_correct).length;
    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].accuracy = 
        (subjectStats[subject].correct / subjectStats[subject].total) * 100;
      subjectStats[subject].chaptersCount = subjectStats[subject].chaptersSet.size;
      subjectStats[subject].topicsCount = subjectStats[subject].topicsSet.size;
    });

    // Old topic list (for backward compatibility)
    const topicList = Object.values(topicStats).map((topic: any) => {
      const accuracy = (topic.correct / topic.total) * 100;
      const daysSince = Math.floor(
        (Date.now() - new Date(topic.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let status = 'not_started';
      if (topic.total === 0) status = 'not_started';
      else if (accuracy >= 85 && topic.total >= 20) status = 'mastered';
      else if (accuracy < 60 && topic.total >= 10) status = 'weak';
      else status = 'in_progress';

      return { ...topic, accuracy, daysSince, status };
    });

    return {
      overview: {
        totalQuestions,
        correctAnswers,
        overallAccuracy,
        totalTime: Math.floor(attempts.length * 2.5),
        topicsAttempted: Object.keys(topicStats).length
      },
      subjects: subjectStats,
      topics: topicList
    };
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      mastered: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Mastered' },
      in_progress: { icon: Circle, color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
      weak: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Weak' },
      not_started: { icon: Circle, color: 'bg-gray-100 text-gray-700', label: 'Not Started' }
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 pt-20 sm:pt-24 pb-6 sm:pb-12 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 h-full flex flex-col">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track your progress and identify areas for improvement</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-2 w-full max-w-md shrink-0 mb-3 sm:mb-4 md:mb-6 h-9 sm:h-10">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">📊 Overview</TabsTrigger>
              <TabsTrigger value="detailed" className="text-xs sm:text-sm">📚 Detailed</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-auto mt-0 sm:mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] sm:text-xs text-blue-700 mb-0.5 sm:mb-1">Questions Solved</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-900">{analytics.overview.totalQuestions}</p>
                      </div>
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 mb-1">Overall Accuracy</p>
                        <p className="text-3xl font-bold text-green-900">
                          {analytics.overview.overallAccuracy.toFixed(0)}%
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-700 mb-1">Topics Attempted</p>
                        <p className="text-3xl font-bold text-purple-900">{analytics.overview.topicsAttempted}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-700 mb-1">Study Time</p>
                        <p className="text-3xl font-bold text-orange-900">
                          {Math.floor(analytics.overview.totalTime / 60)}h
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(analytics.subjects).map(([subject, data]: [string, any]) => (
                  <Card key={subject} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{subject}</CardTitle>
                        <div className={`text-2xl font-bold ${
                          data.accuracy >= 80 ? 'text-green-600' : 
                          data.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {data.accuracy.toFixed(0)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Questions Solved</span>
                        <span className="font-semibold">{data.total}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Topics Covered</span>
                        <span className="font-semibold">{data.topicsCount}</span>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-600 mb-2">Difficulty Breakdown:</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Easy
                            </span>
                            <span className="font-semibold">
                              {data.easy.total > 0 ? ((data.easy.correct / data.easy.total) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                              Medium
                            </span>
                            <span className="font-semibold">
                              {data.medium.total > 0 ? ((data.medium.correct / data.medium.total) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Hard
                            </span>
                            <span className="font-semibold">
                              {data.hard.total > 0 ? ((data.hard.correct / data.hard.total) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        Practice {subject}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Detailed Analysis Tab */}
            <TabsContent value="detailed" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {Object.entries(analytics.subjects).map(([subject, data]: [string, any]) => (
                  <Card key={subject} className="border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-primary/20 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {subject[0]}
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{subject}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              {Object.keys(data.chapters || {}).length} chapters • {data.topicsCount} topics
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-4xl font-bold ${
                            data.accuracy >= 80 ? 'text-green-600' : 
                            data.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {data.accuracy.toFixed(0)}%
                          </div>
                          <p className="text-sm text-gray-600">Overall Accuracy</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Chapters */}
                      <div className="space-y-4">
                        {Object.entries(data.chapters || {}).map(([chapter, chapterData]: [string, any]) => (
                          <div key={chapter} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                                  📖
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{chapter}</h4>
                                  <p className="text-xs text-gray-600">
                                    {chapterData.total} questions • {Object.keys(chapterData.topics).length} topics
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${
                                  chapterData.accuracy >= 80 ? 'text-green-600' : 
                                  chapterData.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {chapterData.accuracy.toFixed(0)}%
                                </div>
                                <p className="text-xs text-gray-600">Accuracy</p>
                              </div>
                            </div>
                            
                            {/* Topics within Chapter */}
                            <div className="mt-4 space-y-2 pl-4 border-l-2 border-purple-300">
                              {Object.entries(chapterData.topics).map(([topic, topicData]: [string, any]) => (
                                <div key={topic} className={`p-3 rounded-lg border-2 ${
                                  topicData.status === 'mastered' ? 'border-green-300 bg-green-50' :
                                  topicData.status === 'weak' ? 'border-red-300 bg-red-50' :
                                  topicData.status === 'in_progress' ? 'border-yellow-300 bg-yellow-50' :
                                  'border-gray-300 bg-white'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-semibold text-sm text-gray-900">{topic}</h5>
                                        {getStatusBadge(topicData.status)}
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <span>{topicData.total} questions</span>
                                        <span>Last: {topicData.daysSince}d ago</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <div className={`text-xl font-bold ${
                                          topicData.accuracy >= 80 ? 'text-green-600' : 
                                          topicData.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          {topicData.accuracy.toFixed(0)}%
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        className={`${
                                          topicData.status === 'weak' ? 'bg-red-600 hover:bg-red-700' : 
                                          'bg-blue-600 hover:bg-blue-700'
                                        } text-white`}
                                      >
                                        {topicData.status === 'weak' ? '🎯 Focus' : '📚 Practice'}
                                      </Button>
                                    </div>
                                  </div>
                                  <Progress value={topicData.accuracy} className="h-1.5 mt-2" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
