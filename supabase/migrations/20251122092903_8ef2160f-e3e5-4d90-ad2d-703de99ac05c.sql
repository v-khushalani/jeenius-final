-- Create admin_notifications table for announcements
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'free', 'premium', 'specific'
  target_user_ids UUID[] DEFAULT NULL,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft' -- 'draft', 'scheduled', 'sent'
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notifications
CREATE POLICY "Only admins can manage notifications"
  ON public.admin_notifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create user_notifications table to track what users have seen
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
  ON public.user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users update own notifications"
  ON public.user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);