-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
  END IF;

  -- Add is_premium column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'is_premium') THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;

  -- Add subscription_end_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'subscription_end_date') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add comment to role column
COMMENT ON COLUMN public.profiles.role IS 'User role: admin or student';