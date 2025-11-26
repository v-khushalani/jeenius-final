-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.questions_safe;
CREATE VIEW public.questions_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  subject,
  chapter,
  topic,
  difficulty,
  year,
  exam,
  created_at
FROM public.questions;