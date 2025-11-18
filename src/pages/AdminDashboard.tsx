import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagement } from '@/components/admin/UserManagement';
import ChapterManager from '@/components/admin/ChapterManager';

const AdminDashboard = () => {
  const location = useLocation();
  
  // Determine which content to show based on URL
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
        {/* Admin Header */}
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

        {/* Content based on route */}
        {getActiveContent()}
      </div>
    </div>
  );
};

// Quick Stats Component with Real Data
const QuickStatsOverview = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: activeToday } = await supabase
        .from('question_attempts')
        .select('user_id')
        .gte('created_at', today.toISOString());

      const uniqueActiveToday = new Set(activeToday?.map(a => a.user_id)).size;

      // Total questions attempted
      const { count: totalQuestions } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true });

      // Premium users
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      // Previous week data for comparison
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count: lastWeekUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString());

      const userGrowth = lastWeekUsers && totalUsers 
        ? ((lastWeekUsers / totalUsers) * 100).toFixed(1) 
        : '0';

      setStats([
        {
          title: 'Total Users',
          value: totalUsers?.toLocaleString() || '0',
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
          value: totalQuestions?.toLocaleString() || '0',
          icon: BookOpen,
          color: 'purple',
          change: 'All time',
          subtext: 'attempts'
        },
        {
          title: 'Premium Users',
          value: premiumUsers?.toLocaleString() || '0',
          icon: Award,
          color: 'amber',
          change: totalUsers ? `${((premiumUsers || 0) / totalUsers * 100).toFixed(1)}%` : '0%',
          subtext: 'of total'
        }
      ]);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Manage Users</h3>
              <p className="text-sm text-slate-600">View and edit user accounts</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
              <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Add Content</h3>
              <p className="text-sm text-slate-600">Upload new questions</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left">
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
