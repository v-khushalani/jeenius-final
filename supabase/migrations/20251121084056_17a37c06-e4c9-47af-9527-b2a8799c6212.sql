-- Fix search_path for initialize_user_gamification function

CREATE OR REPLACE FUNCTION public.initialize_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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