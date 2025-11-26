-- Add exam column to questions table for different exam types (JEE, NEET, MHT-CET)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS exam text NOT NULL DEFAULT 'JEE';

-- Add index for exam filtering
CREATE INDEX IF NOT EXISTS idx_questions_exam ON public.questions(exam);

-- Update the questions_safe view to include exam
DROP VIEW IF EXISTS public.questions_safe;
CREATE VIEW public.questions_safe AS
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