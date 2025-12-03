import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  User, Bell, Shield, Palette, LogOut, Save, Loader2, AlertCircle, CheckCircle,
  Heart, Sparkles, Download, Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    grade: '',
    target_exam: '',
    daily_goal: 15,
    daily_study_hours: 4
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    studyReminders: true,
    achievements: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<any>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showFarewellDialog, setShowFarewellDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [theme, setTheme] = useState('light');

  const { signOut, isPremium } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('Authentication error:', authError);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      setUser(currentUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Profile loading error:', profileError);
        const userMeta = currentUser.user_metadata || {};
        setProfile({
          firstName: userMeta.firstName || currentUser.email?.split('@')[0] || '',
          lastName: userMeta.lastName || '',
          email: currentUser.email || '',
          phone: userMeta.phone || '',
          city: userMeta.city || '',
          state: userMeta.state || '',
          grade: userMeta.grade || '12th',
          target_exam: userMeta.target_exam || 'JEE',
          daily_goal: 15,
          daily_study_hours: 4
        });
      } else {
        const nameParts = profileData.full_name?.split(' ') || ['', ''];
        setProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: profileData.email || currentUser.email || '',
          phone: profileData.phone || '',
          city: profileData.city || '',
          state: profileData.state || '',
          grade: profileData.grade === 11 ? '11th' : 
                 profileData.grade === 12 ? '12th' : 
                 profileData.grade >= 6 && profileData.grade <= 10 ? `${profileData.grade}th` :
                 '12th-pass',
          target_exam: profileData.target_exam || 'JEE',
          daily_goal: profileData.daily_goal || 15,
          daily_study_hours: profileData.daily_study_hours || 4
        });
      }

      console.log('✅ Profile loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!profile.firstName.trim() || !profile.email.trim()) {
        toast({
          title: "Validation Error",
          description: "First name and email are required",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      const gradeNumber = profile.grade === '11th' ? 11 : 
                          profile.grade === '12th' ? 12 : 
                          profile.grade === '12th-pass' ? 13 :
                          parseInt(profile.grade) || 12;

      const updateData = {
        full_name: `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        grade: gradeNumber,
        target_exam: profile.target_exam || 'JEE',
        daily_goal: profile.daily_goal,
        daily_study_hours: profile.daily_study_hours,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setSaveStatus('success');
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      
      setTimeout(() => setSaveStatus('idle'), 3000);

    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      setSaveStatus('error');
      toast({
        title: "Save Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
      
      navigate('/login');
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateAccount = async () => {
    setDeactivating(true);
    
    try {
      // Mark the account as deactivated in the profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_eligible: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setShowDeactivateDialog(false);
      setShowFarewellDialog(true);
      
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeactivating(false);
    }
  };

  const handleFarewellClose = async () => {
    setShowFarewellDialog(false);
    await signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Preparing your data...",
        description: "This may take a moment",
      });

      // Fetch all user data
      const [profileRes, attemptsRes, sessionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('question_attempts').select('*').eq('user_id', user.id),
        supabase.from('test_sessions').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data,
        question_attempts: attemptsRes.data,
        test_sessions: sessionsRes.data
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jeenius-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started!",
        description: "Your data export has been downloaded",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof typeof profile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#e6eeff] rounded-full -translate-y-1/2 translate-x-1/3 opacity-40" />
        </div>
        <Header />
        <div className="pt-24 pb-8 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#013062] mx-auto"></div>
              <p className="mt-4 text-[#013062]/60">Loading your settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#e6eeff] rounded-full -translate-y-1/2 translate-x-1/3 opacity-40" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#e6eeff] rounded-full translate-y-1/2 -translate-x-1/3 opacity-30" />
      </div>
      <Header />
      <div className="pt-20 pb-6 md:pt-24 md:pb-8 relative z-10">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-4xl">
          <div className="mb-4 md:mb-8">
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-[#013062]">Settings</h1>
            <p className="text-[#013062]/60 text-sm md:text-base">
              Welcome {profile.firstName || 'Student'} • Manage your account
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {/* Profile Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2 md:pb-4 px-3 md:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-sm md:text-base" style={{ color: '#013062' }}>
                    <User className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {saveStatus === 'success' && (
                    <div className="flex items-center text-green-600 text-xs md:text-sm">
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Saved!
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center text-red-600 text-xs md:text-sm">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Failed
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Current Grade *</Label>
                    <select
                      id="grade"
                      value={profile.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select Grade</option>
                      <option value="6th">6th Grade</option>
                      <option value="7th">7th Grade</option>
                      <option value="8th">8th Grade</option>
                      <option value="9th">9th Grade</option>
                      <option value="10th">10th Grade</option>
                      <option value="11th">11th Grade</option>
                      <option value="12th">12th Grade</option>
                      <option value="12th-pass">12th Pass (Dropper)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_exam">Target Exam</Label>
                    <select
                      id="target_exam"
                      value={profile.target_exam}
                      onChange={(e) => handleInputChange('target_exam', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="JEE">JEE (PCM)</option>
                      <option value="NEET">NEET (PCB)</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      {profile.target_exam === 'JEE' ? 'Physics, Chemistry, Mathematics' : 
                       profile.target_exam === 'NEET' ? 'Physics, Chemistry, Biology' : 
                       'All subjects'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily_goal">Daily Question Goal</Label>
                    <Input
                      id="daily_goal"
                      type="number"
                      min={5}
                      max={100}
                      value={profile.daily_goal}
                      onChange={(e) => handleInputChange('daily_goal', parseInt(e.target.value) || 15)}
                    />
                    <p className="text-xs text-gray-500">Questions to solve daily (5-100)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_study_hours">Daily Study Hours</Label>
                  <Input
                    id="daily_study_hours"
                    type="number"
                    min={1}
                    max={12}
                    value={profile.daily_study_hours}
                    onChange={(e) => handleInputChange('daily_study_hours', parseInt(e.target.value) || 4)}
                  />
                  <p className="text-xs text-gray-500">Hours you can dedicate daily (1-12)</p>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving || !profile.firstName || !profile.email}
                    className="flex items-center gap-2"
                    style={{ backgroundColor: '#013062' }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadUserProfile}
                    disabled={loading || saving}
                  >
                    Reset Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#013062' }}>
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive study updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Study Reminders</Label>
                    <p className="text-sm text-gray-600">Daily study session reminders</p>
                  </div>
                  <Switch
                    checked={notifications.studyReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, studyReminders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Achievement Notifications</Label>
                    <p className="text-sm text-gray-600">Badge and milestone notifications</p>
                  </div>
                  <Switch
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#013062' }}>
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#e6eeff' }}>
                  <p className="text-sm mb-2" style={{ color: '#013062' }}>
                    <strong>Account Security:</strong> Your account is secured with Google authentication.
                  </p>
                  <p className="text-xs text-gray-600">
                    Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: '#013062' }}>
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Theme Preference</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <LogOut className="w-5 h-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeactivateDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Deactivate Account
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Deactivating your account will pause your progress. You can reactivate anytime by logging back in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Deactivate Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                We're sad to see you go! 😢
              </p>
              <p>
                Your account will be deactivated, but don't worry - your progress will be saved. 
                You can come back anytime and pick up right where you left off!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay with us 💪</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivateAccount}
              disabled={deactivating}
              className="bg-red-500 hover:bg-red-600"
            >
              {deactivating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Farewell Dialog */}
      <AlertDialog open={showFarewellDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6eeff' }}>
                <Heart className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl" style={{ color: '#013062' }}>
              See You Soon! 💙
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-center">
              <p className="text-lg">
                Your JEEnius journey has been paused, but never forgotten.
              </p>
              <p className="text-gray-600">
                Every question you solved, every streak you maintained, 
                every late-night study session - they all shaped a brilliant mind.
              </p>
              <p className="font-medium" style={{ color: '#013062' }}>
                Remember: Great achievers take breaks, but they always come back stronger! 
              </p>
              <div className="pt-4">
                <Sparkles className="w-6 h-6 mx-auto text-yellow-500" />
                <p className="text-sm text-gray-500 mt-2">
                  Your progress is safely stored. Come back whenever you're ready! 🚀
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction 
              onClick={handleFarewellClose}
              style={{ backgroundColor: '#013062' }}
              className="px-8"
            >
              Goodbye for now 👋
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;