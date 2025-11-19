// Replace your Settings.tsx with this code

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Palette, LogOut, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    grade: '',
    target_exam: ''
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

  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
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

      // Get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Profile loading error:', profileError);
        // Use auth user metadata as fallback
        const userMeta = currentUser.user_metadata || {};
        setProfile({
          firstName: userMeta.firstName || currentUser.email?.split('@')[0] || '',
          lastName: userMeta.lastName || '',
          email: currentUser.email || '',
          phone: userMeta.phone || '',
          city: userMeta.city || '',
          state: userMeta.state || '',
          grade: userMeta.grade || '12th',
          target_exam: userMeta.target_exam || 'JEE'
        });
      } else {
        // Split full_name back to firstName/lastName
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
                 '12th-pass',
          target_exam: profileData.target_exam || 'JEE'
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

      // Validate required fields
      if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
        toast({
          title: "Validation Error",
          description: "First name, last name, and email are required",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      // Prepare update data
      const gradeNumber = profile.grade === '11th' ? 11 : profile.grade === '12th' ? 12 : 13;
      const updateData = {
        full_name: `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        grade: gradeNumber,
        target_exam: profile.target_exam || 'JEE',
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving profile data:', updateData);

      console.log('💾 Saving profile data:', updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select();

      if (error) {
        throw error;
      }

      setSaveStatus('success');
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      
      // Reset success message after 3 seconds
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
      
      // Clear any cached data
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

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    // Reset save status when user makes changes
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">
              Welcome {profile.firstName || 'Student'} • Manage your account and preferences
            </p>
            <p className="text-sm text-gray-500">
              User ID: {user?.id?.substring(0, 8)}... • 
              Email: {profile.email} • 
              Grade: {profile.grade}
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {saveStatus === 'success' && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Saved successfully!
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Save failed. Try again.
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
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
                      required
                    >
                      <option value="">Select Grade</option>
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

                <div className="space-y-2">
                  <Label htmlFor="target_exam">Target Exam</Label>
                  <select
                    id="target_exam"
                    value={profile.target_exam}
                    onChange={(e) => handleInputChange('target_exam', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="JEE">JEE Main & Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="BITSAT">BITSAT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving || !profile.firstName || !profile.lastName || !profile.email}
                    className="flex items-center gap-2"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
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
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Account Security:</strong> Your account is secured with email authentication.
                  </p>
                  <p className="text-xs text-gray-600">
                    Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Password change feature will be available soon",
                    });
                  }}>
                    Change Password
                  </Button>
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Coming Soon", 
                      description: "Data export feature will be available soon",
                    });
                  }}>
                    Download My Data
                  </Button>
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Privacy settings will be available soon",
                    });
                  }}>
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Theme Preference</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2">
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode (Coming Soon)</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <LogOut className="w-5 h-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">
                    <strong>Warning:</strong> These actions cannot be undone.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    toast({
                      title: "Account Deletion",
                      description: "Please contact support to delete your account",
                      variant: "destructive"
                    });
                  }}>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
