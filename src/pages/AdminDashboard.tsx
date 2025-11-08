import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import Header from '@/components/Header';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagement } from '@/components/admin/UserManagement';
import ChapterManager from '@/components/admin/ChapterManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
            <p className="text-slate-600">Manage platform and monitor performance</p>
          </div>
          <Badge className="bg-purple-600 text-white px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        import { useLocation } from 'react-router-dom';

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
                    <p className="text-slate-600">
                      {location.pathname === '/admin/analytics' && 'Platform Analytics & Insights'}
                      {location.pathname === '/admin/users' && 'User Management'}
                      {location.pathname === '/admin/content' && 'Content Management'}
                      {location.pathname === '/admin' && 'Manage platform and monitor performance'}
                    </p>
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
      </div>
    </div>
  );
};

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

      const userGrowth = lastWeekUsers ? ((lastWeekUsers / (totalUsers || 1)) * 100).toFixed(1) : 0;

      setStats([
        {
          title: 'Total Users',
          value: totalUsers?.toLocaleString() || '0',
          icon: Users,
          color: 'blue',
          change: `+${userGrowth}%`
        },
        {
          title: 'Active Today',
          value: uniqueActiveToday.toString(),
          icon: TrendingUp,
          color: 'green',
          change: `${uniqueActiveToday} users`
        },
        {
          title: 'Total Questions',
          value: totalQuestions?.toLocaleString() || '0',
          icon: BookOpen,
          color: 'purple',
          change: 'All time'
        },
        {
          title: 'Premium Users',
          value: premiumUsers?.toLocaleString() || '0',
          icon: Award,
          color: 'amber',
          change: `${((premiumUsers || 0) / (totalUsers || 1) * 100).toFixed(1)}%`
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="text-green-600 font-semibold">{stat.change}</span> from last week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboard;
