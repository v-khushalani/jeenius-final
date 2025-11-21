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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagement } from '@/components/admin/UserManagement';
import ChapterManager from '@/components/admin/ChapterManager';

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
  
  const getActiveContent = () => {
    if (location.pathname === '/admin/analytics') {
      return <AdminAnalytics />;
    } else if (location.pathname === '/admin/users') {
      return <UserManagement />;
    } else if (location.pathname === '/admin/content') {
      return <ChapterManager />;
    } else {
      return <QuickStatsOverview />;
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin/analytics') return 'Platform Analytics & Insights';
    if (location.pathname === '/admin/users') return 'User Management';
    if (location.pathname === '/admin/content') return 'Content Management';
    return 'Manage platform and monitor performance';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 pt-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <p className="text-slate-600">{getPageTitle()}</p>
          </div>
          <Badge className="bg-purple-600 text-white px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        {getActiveContent()}
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                  <span className="text-xs text-slate-500">{stat.subtext}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Manage Users</h3>
              <p className="text-sm text-slate-600">View and edit user accounts</p>
            </button>
            
            <button 
              onClick={() => navigate('/admin/content')}
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Add Content</h3>
              <p className="text-sm text-slate-600">Upload new questions</p>
            </button>
            
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-slate-900">View Reports</h3>
              <p className="text-sm text-slate-600">Detailed analytics</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
