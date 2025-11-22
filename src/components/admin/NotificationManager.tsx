import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Send, Plus, Bell, Users, Crown, UserCircle, Calendar, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  target_user_ids?: string[];
  created_at: string;
  scheduled_at: string;
  status: string;
  sent_by?: string;
}

export const NotificationManager: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      // Insert notification
      const { data: notificationData, error: insertError } = await supabase
        .from('admin_notifications')
        .insert({
          title,
          message,
          target_audience: targetAudience,
          sent_by: user?.id,
          scheduled_at: scheduleDate || new Date().toISOString(),
          status: scheduleDate ? 'scheduled' : 'sent'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get target users based on audience
      let targetUserIds: string[] = [];
      
      if (targetAudience === 'all') {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id');
        targetUserIds = allUsers?.map(u => u.id) || [];
      } else if (targetAudience === 'free') {
        const { data: freeUsers } = await supabase
          .from('profiles')
          .select('id')
          .or('is_premium.eq.false,is_premium.is.null');
        targetUserIds = freeUsers?.map(u => u.id) || [];
      } else if (targetAudience === 'premium') {
        const { data: premiumUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_premium', true);
        targetUserIds = premiumUsers?.map(u => u.id) || [];
      }

      // Create user notification records
      if (targetUserIds.length > 0) {
        const userNotifications = targetUserIds.map(userId => ({
          user_id: userId,
          notification_id: notificationData.id
        }));

        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert(userNotifications);

        if (userNotifError) throw userNotifError;
      }

      toast.success(`Notification ${scheduleDate ? 'scheduled' : 'sent'} successfully to ${targetUserIds.length} users!`);
      
      // Reset form
      setTitle('');
      setMessage('');
      setTargetAudience('all');
      setScheduleDate('');
      setIsDialogOpen(false);
      
      loadNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Users className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      case 'free':
        return <UserCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-600">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-600">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Manager
              </CardTitle>
              <CardDescription>
                Send announcements, updates, or motivational messages to users
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                  <DialogDescription>
                    Send announcements or motivational messages to your users
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., JEE Mains 2025 Registration Open"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your announcement or message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            All Users
                          </div>
                        </SelectItem>
                        <SelectItem value="free">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4" />
                            Free Users Only
                          </div>
                        </SelectItem>
                        <SelectItem value="premium">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Premium Users Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule (Optional)</Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to send immediately
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendNotification} disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : scheduleDate ? 'Schedule' : 'Send Now'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No notifications sent yet. Create your first notification!
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAudienceIcon(notification.target_audience)}
                          <span className="capitalize">{notification.target_audience}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};