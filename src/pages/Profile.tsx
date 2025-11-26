import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Target, 
  Calendar,
  Trophy,
  BookOpen,
  Clock,
  Edit,
  Save,
  Loader2,
  Flame,
  Star,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PointsService from '@/services/pointsService';

const Profile = () => {
  const { user, isAuthenticated, isPremium } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(15);
  const [savingGoal, setSavingGoal] = useState(false);
  const [pointsLevel, setPointsLevel] = useState({ name: 'BEGINNER', points: 0, pointsToNext: 100 });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadProfileData();
  }, [isAuthenticated, user]);

  const loadProfileData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      setProfile(profileData);
      setDailyGoal(profileData.daily_goal || 15);

      // Load points and level
      const pointsData = await PointsService.getUserPoints(user.id);
      setPointsLevel({
        name: pointsData.level,
        points: pointsData.totalPoints,
        pointsToNext: pointsData.levelInfo.pointsToNext
      });

      // Stats from profiles table
      setStats({
        total_questions: profileData.total_questions_answered || 0,
        correct_answers: profileData.correct_answers || 0,
        accuracy: profileData.overall_accuracy || 0,
        streak: profileData.current_streak || 0,
        total_points: profileData.total_points || 0,
        longest_streak: profileData.longest_streak || 0
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDailyGoal = async () => {
    if (!user?.id) return;
    
    setSavingGoal(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_goal: dailyGoal, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, daily_goal: dailyGoal });
      setEditingGoal(false);
      toast({
        title: "Success!",
        description: `Daily goal updated to ${dailyGoal} questions`,
      });
    } catch (error) {
      console.error('Error saving daily goal:', error);
      toast({
        title: "Error",
        description: "Failed to save daily goal",
        variant: "destructive"
      });
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#e9e9e9' }}>
        <Header />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#013062' }}></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradeDisplay = (grade: number) => {
    if (grade === 11) return '11th Grade';
    if (grade === 12) return '12th Grade';
    if (grade >= 6 && grade <= 10) return `${grade}th Grade`;
    return '12th Pass';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#e9e9e9' }}>
      <Header />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          {/* Profile Header */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="text-xl font-bold" style={{ backgroundColor: '#013062', color: 'white' }}>
                      {getInitials(profile?.full_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold" style={{ color: '#013062' }}>
                      {profile?.full_name || 'Student'}
                    </h1>
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{profile?.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: '#e6eeff', color: '#013062' }}>
                      <GraduationCap className="w-3 h-3" />
                      {getGradeDisplay(profile?.grade)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: '#e6eeff', color: '#013062' }}>
                      <Target className="w-3 h-3" />
                      {profile?.target_exam || 'Not Set'}
                    </Badge>
                    {profile?.city && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/settings')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                  <Button 
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2"
                    style={{ backgroundColor: '#013062' }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#013062' }}>
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile?.email}</span>
                </div>
                
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                
                {profile?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {profile.city}{profile?.state && `, ${profile.state}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information with Daily Goal */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#013062' }}>
                  <BookOpen className="w-5 h-5" />
                  Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Grade: {getGradeDisplay(profile?.grade)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Target: {profile?.target_exam || 'Not Set'}</span>
                </div>
                
                {profile?.subjects && profile.subjects.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.subjects.map((subject: string) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Editable Daily Goal */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <Label className="text-sm">Daily Goal:</Label>
                    </div>
                    {!editingGoal ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: '#013062' }}>{dailyGoal} questions</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingGoal(true)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={5}
                          max={100}
                          value={dailyGoal}
                          onChange={(e) => setDailyGoal(Math.max(5, Math.min(100, parseInt(e.target.value) || 15)))}
                          className="w-20 h-8"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSaveDailyGoal}
                          disabled={savingGoal}
                          className="h-8"
                          style={{ backgroundColor: '#013062' }}
                        >
                          {savingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingGoal(false);
                            setDailyGoal(profile?.daily_goal || 15);
                          }}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Set between 5-100 questions per day</p>
                </div>
              </CardContent>
            </Card>

            {/* JEEnius Points & Level */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#013062' }}>
                  <Star className="w-5 h-5" />
                  JEEnius Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#e6eeff' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#013062' }}>
                    {pointsLevel.points.toLocaleString()}
                  </div>
                  <Badge className="mb-2" style={{ backgroundColor: '#013062' }}>
                    {pointsLevel.name}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {pointsLevel.pointsToNext > 0 
                      ? `${pointsLevel.pointsToNext} points to next level`
                      : 'Maximum level reached!'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Streak Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#013062' }}>
                  <Flame className="w-5 h-5" />
                  Streak Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">{stats?.streak || 0}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{stats?.longest_streak || 0}</div>
                    <div className="text-sm text-gray-600">Best Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            {stats && (
              <Card className="md:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#013062' }}>
                    <Trophy className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#e6eeff' }}>
                      <div className="text-2xl font-bold" style={{ color: '#013062' }}>{stats.total_questions || 0}</div>
                      <div className="text-sm text-gray-600">Questions Solved</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.correct_answers || 0}</div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.accuracy || 0}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.total_points || 0}</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;