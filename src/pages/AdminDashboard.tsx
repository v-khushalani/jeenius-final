import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Shield,
  AlertCircle,
  FileText,
  Bell,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  ChevronRight,
  Sparkles,
  Upload,
  ClipboardCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagement } from '@/components/admin/UserManagement';
import ChapterManager from '@/components/admin/ChapterManager';
import ExamDateManager from '@/components/admin/ExamDateManager';
import { QuestionManager } from '@/components/admin/QuestionManager';
import { NotificationManager } from '@/components/admin/NotificationManager';
import { UserReports } from '@/components/admin/UserReports';
import { PDFQuestionExtractor } from '@/components/admin/PDFQuestionExtractor';
import { ExtractionReviewQueue } from '@/components/admin/ExtractionReviewQueue';
import { cn } from '@/lib/utils';

interface QuickStat {
  title: string;
  value: string;
  icon: any;
  color: string;
  change: string;
  subtext: string;
}

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const getActiveContent = () => {
    if (location.pathname === '/admin/analytics') {
      return <AdminAnalytics />;
    } else if (location.pathname === '/admin/users') {
      return <UserManagement />;
    } else if (location.pathname === '/admin/reports') {
      return <UserReports />;
    } else if (location.pathname === '/admin/notifications') {
      return <NotificationManager />;
    } else if (location.pathname === '/admin/content') {
      return <ChapterManager />;
    } else if (location.pathname === '/admin/exam-config') {
      return <ExamDateManager />;
    } else if (location.pathname === '/admin/questions') {
      return <QuestionManager />;
    } else if (location.pathname === '/admin/pdf-extract') {
      return <PDFQuestionExtractor />;
    } else if (location.pathname === '/admin/review-queue') {
      return <ExtractionReviewQueue />;
    } else {
      return <QuickStatsOverview />;
    }
  };

  const getPageInfo = () => {
    const routes = {
      '/admin': { title: 'Dashboard', subtitle: 'Overview & Quick Stats' },
      '/admin/analytics': { title: 'Analytics', subtitle: 'Platform Insights & Metrics' },
      '/admin/users': { title: 'Users', subtitle: 'Manage User Accounts' },
      '/admin/reports': { title: 'Reports', subtitle: 'Export & Analysis' },
      '/admin/notifications': { title: 'Notifications', subtitle: 'Send Announcements' },
      '/admin/content': { title: 'Chapters', subtitle: 'Content Management' },
      '/admin/exam-config': { title: 'Exam Dates', subtitle: 'Configure Exam Schedule' },
      '/admin/questions': { title: 'Questions', subtitle: 'Question Bank Management' },
      '/admin/pdf-extract': { title: 'PDF Extractor', subtitle: 'Extract Questions from PDFs' },
      '/admin/review-queue': { title: 'Review Queue', subtitle: 'Review Extracted Questions' },
    };
    return routes[location.pathname as keyof typeof routes] || routes['/admin'];
  };

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { path: '/admin/users', label: 'Users', icon: Users, color: 'text-purple-600' },
    { path: '/admin/questions', label: 'Questions', icon: HelpCircle, color: 'text-green-600' },
    { path: '/admin/pdf-extract', label: 'PDF Extractor', icon: Upload, color: 'text-emerald-600' },
    { path: '/admin/review-queue', label: 'Review Queue', icon: ClipboardCheck, color: 'text-teal-600' },
    { path: '/admin/content', label: 'Chapters', icon: BookOpen, color: 'text-orange-600' },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp, color: 'text-cyan-600' },
    { path: '/admin/reports', label: 'Reports', icon: FileText, color: 'text-indigo-600' },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell, color: 'text-pink-600' },
    { path: '/admin/exam-config', label: 'Exam Dates', icon: Calendar, color: 'text-red-600' },
  ];

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Shield className="h-6 w-6 text-primary mr-3" />
          <div>
            <h2 className="font-bold text-foreground text-lg">JEEnius Admin</h2>
            <p className="text-xs text-muted-foreground">Control Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Badge */}
        <div className="p-4 border-t border-border">
          <div className="bg-accent rounded-lg p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">Admin Mode</p>
              <p className="text-xs text-muted-foreground">Full Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pageInfo.title}</h1>
            <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit Admin →
          </button>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {getActiveContent()}
        </div>
      </main>
    </div>
  );
};

const QuickStatsOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        usersResult,
        activeTodayResult,
        questionsResult,
        premiumResult,
        lastWeekResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('question_attempts')
          .select('user_id')
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabase.from('question_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Handle errors
      if (usersResult.error) throw usersResult.error;
      if (activeTodayResult.error) throw activeTodayResult.error;
      if (questionsResult.error) throw questionsResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (lastWeekResult.error) throw lastWeekResult.error;

      const totalUsers = usersResult.count || 0;
      const uniqueActiveToday = new Set(activeTodayResult.data?.map(a => a.user_id) || []).size;
      const totalQuestions = questionsResult.count || 0;
      const premiumUsers = premiumResult.count || 0;
      const lastWeekUsers = lastWeekResult.count || 0;

      const userGrowth = totalUsers > 0 
        ? ((lastWeekUsers / totalUsers) * 100).toFixed(1) 
        : '0';

      setStats([
        {
          title: 'Total Users',
          value: totalUsers.toLocaleString(),
          icon: Users,
          color: 'blue',
          change: `+${userGrowth}%`,
          subtext: 'from last week'
        },
        {
          title: 'Active Today',
          value: uniqueActiveToday.toString(),
          icon: TrendingUp,
          color: 'green',
          change: `${uniqueActiveToday} users`,
          subtext: 'active now'
        },
        {
          title: 'Total Questions',
          value: totalQuestions.toLocaleString(),
          icon: BookOpen,
          color: 'purple',
          change: 'All time',
          subtext: 'attempts'
        },
        {
          title: 'Premium Users',
          value: premiumUsers.toLocaleString(),
          icon: Award,
          color: 'amber',
          change: totalUsers > 0 ? `${((premiumUsers / totalUsers) * 100).toFixed(1)}%` : '0%',
          subtext: 'of total'
        }
      ]);
    } catch (error: any) {
      console.error('Error fetching quick stats:', error);
      setError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === 'blue' && "bg-blue-50",
                  stat.color === 'green' && "bg-green-50",
                  stat.color === 'purple' && "bg-purple-50",
                  stat.color === 'amber' && "bg-amber-50"
                )}>
                  <stat.icon className={cn(
                    "h-6 w-6",
                    stat.color === 'blue' && "text-blue-600",
                    stat.color === 'green' && "text-green-600",
                    stat.color === 'purple' && "text-purple-600",
                    stat.color === 'amber' && "text-amber-600"
                  )} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                  <span className="text-sm text-muted-foreground">{stat.subtext}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { path: '/admin/users', label: 'Manage Users', icon: Users, desc: 'View and edit accounts', color: 'purple' },
              { path: '/admin/notifications', label: 'Notifications', icon: Bell, desc: 'Send announcements', color: 'blue' },
              { path: '/admin/questions', label: 'Questions', icon: HelpCircle, desc: 'Manage question bank', color: 'green' },
              { path: '/admin/reports', label: 'Export Data', icon: FileText, desc: 'Download reports', color: 'orange' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-left group bg-card"
                >
                  <Icon className={cn(
                    "h-8 w-8 mb-3 transition-transform group-hover:scale-110",
                    action.color === 'purple' && "text-purple-600",
                    action.color === 'blue' && "text-blue-600",
                    action.color === 'green' && "text-green-600",
                    action.color === 'orange' && "text-orange-600"
                  )} />
                  <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
