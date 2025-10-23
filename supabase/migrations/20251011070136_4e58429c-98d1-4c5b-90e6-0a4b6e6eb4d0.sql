-- ============================================
-- SECURITY FIX: Comprehensive RLS and RBAC Implementation
-- ============================================

-- 1. Create role enum and user_roles table for proper RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checks (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix daily_challenges table - Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active challenges"
ON public.daily_challenges FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage challenges"
ON public.daily_challenges FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update challenges"
ON public.daily_challenges FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete challenges"
ON public.daily_challenges FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix user_energy_logs table - Enable RLS
ALTER TABLE public.user_energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own energy logs"
ON public.user_energy_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own energy logs"
ON public.user_energy_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own energy logs"
ON public.user_energy_logs FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Fix user_challenge_progress table - Enable RLS
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge progress"
ON public.user_challenge_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own challenge progress"
ON public.user_challenge_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenge progress"
ON public.user_challenge_progress FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Fix user_rankings table - Enable RLS
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all rankings"
ON public.user_rankings FOR SELECT
USING (true);

CREATE POLICY "Users can insert own rankings"
ON public.user_rankings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rankings"
ON public.user_rankings FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Fix revision_queue table - Enable RLS
ALTER TABLE public.revision_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revision queue"
ON public.revision_queue FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage revision queue"
ON public.revision_queue FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Fix topic_mastery table - Enable RLS
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own topic mastery"
ON public.topic_mastery FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own topic mastery"
ON public.topic_mastery FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Fix topic_dependencies table - Enable RLS (read-only for all users)
ALTER TABLE public.topic_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view topic dependencies"
ON public.topic_dependencies FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage topic dependencies"
ON public.topic_dependencies FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Fix questions table - Ensure RLS is enabled
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;