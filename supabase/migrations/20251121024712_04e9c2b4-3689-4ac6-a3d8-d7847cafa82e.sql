-- Ensure unique constraint on user_roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- Migrate roles: 'student' -> 'user', 'admin' -> 'admin'
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'student' THEN 'user'::app_role
    WHEN role = 'admin' THEN 'admin'::app_role
    ELSE 'user'::app_role
  END as role
FROM public.profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Drop role column from profiles (CRITICAL SECURITY FIX: roles MUST be in separate table)
ALTER TABLE public.profiles DROP COLUMN role;

-- Remove default values so users properly set these during onboarding
ALTER TABLE public.profiles 
  ALTER COLUMN grade DROP DEFAULT,
  ALTER COLUMN daily_goal DROP DEFAULT;