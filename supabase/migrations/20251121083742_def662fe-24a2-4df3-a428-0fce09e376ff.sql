-- Merge user stats tables into profiles and remove mobile verification

-- 1. Add columns from user_stats, user_streaks, jeenius_points, user_limits, prize_eligibility to profiles
ALTER TABLE public.profiles
  -- From user_stats
  ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE,
  ADD COLUMN IF NOT EXISTS rank_position INTEGER,
  ADD COLUMN IF NOT EXISTS total_questions_answered INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_study_time INTEGER DEFAULT 0,
  
  -- From user_streaks
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_freeze_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS total_streak_days INTEGER DEFAULT 0,
  
  -- From jeenius_points
  ADD COLUMN IF NOT EXISTS answer_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS level VARCHAR DEFAULT 'BEGINNER',
  ADD COLUMN IF NOT EXISTS level_progress NUMERIC DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS longest_answer_streak INTEGER DEFAULT 0,
  
  -- From user_limits
  ADD COLUMN IF NOT EXISTS daily_question_limit INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
  
  -- From prize_eligibility
  ADD COLUMN IF NOT EXISTS days_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_eligible BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_questions_solved INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overall_accuracy NUMERIC DEFAULT 0.00;

-- 2. Migrate data from user_stats
UPDATE public.profiles p
SET
  correct_answers = COALESCE(us.correct_answers, 0),
  daily_streak = COALESCE(us.daily_streak, 0),
  last_activity_date = us.last_activity_date,
  rank_position = us.rank_position,
  total_questions_answered = COALESCE(us.total_questions_answered, 0),
  total_study_time = COALESCE(us.total_study_time, 0)
FROM public.user_stats us
WHERE p.id = us.user_id;

-- 3. Migrate data from user_streaks
UPDATE public.profiles p
SET
  current_streak = COALESCE(s.current_streak, 0),
  longest_streak = COALESCE(s.longest_streak, 0),
  streak_freeze_available = COALESCE(s.streak_freeze_available, true),
  total_streak_days = COALESCE(s.total_streak_days, 0)
FROM public.user_streaks s
WHERE p.id = s.user_id;

-- 4. Migrate data from jeenius_points
UPDATE public.profiles p
SET
  answer_streak = COALESCE(jp.answer_streak, 0),
  badges = COALESCE(jp.badges, '[]'::jsonb),
  level = COALESCE(jp.level, 'BEGINNER'),
  level_progress = COALESCE(jp.level_progress, 0.00),
  longest_answer_streak = COALESCE(jp.longest_answer_streak, 0),
  total_points = COALESCE(jp.total_points, 0)
FROM public.jeenius_points jp
WHERE p.id = jp.user_id;

-- 5. Migrate data from user_limits
UPDATE public.profiles p
SET
  daily_question_limit = COALESCE(ul.daily_question_limit, 15),
  is_pro = COALESCE(ul.is_pro, false),
  subscription_start_date = ul.subscription_start_date,
  subscription_end_date = ul.subscription_end_date
FROM public.user_limits ul
WHERE p.id = ul.user_id;

-- 6. Migrate data from prize_eligibility
UPDATE public.profiles p
SET
  days_completed = COALESCE(pe.days_completed, 0),
  is_eligible = COALESCE(pe.is_eligible, false),
  total_questions_solved = COALESCE(pe.total_questions_solved, 0),
  overall_accuracy = COALESCE(pe.overall_accuracy, 0.00)
FROM public.prize_eligibility pe
WHERE p.id = pe.user_id;

-- 7. Remove mobile verification columns
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS mobile_verified,
  DROP COLUMN IF EXISTS mobile_verified_at;

-- 8. Drop old tables
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.user_streaks CASCADE;
DROP TABLE IF EXISTS public.jeenius_points CASCADE;
DROP TABLE IF EXISTS public.user_limits CASCADE;
DROP TABLE IF EXISTS public.prize_eligibility CASCADE;

-- 9. Update initialize_user_gamification function
CREATE OR REPLACE FUNCTION public.initialize_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Initialize all gamification fields in profiles directly
    UPDATE public.profiles
    SET
      current_streak = 0,
      longest_streak = 0,
      total_points = 0,
      answer_streak = 0,
      is_pro = FALSE,
      daily_question_limit = 15,
      is_eligible = FALSE
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;