-- ============================================
-- COMPREHENSIVE DATABASE FIX (CORRECTED)
-- ============================================

-- 1. Add new columns to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_text TEXT,
ADD COLUMN IF NOT EXISTS options JSONB,
ADD COLUMN IF NOT EXISTS correct_answer TEXT,
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id);

-- 2. Migrate existing data from old schema to new schema
UPDATE public.questions
SET 
  question_text = COALESCE(question, ''),
  options = jsonb_build_object(
    'A', COALESCE(option_a, ''),
    'B', COALESCE(option_b, ''),
    'C', COALESCE(option_c, ''),
    'D', COALESCE(option_d, '')
  ),
  correct_answer = COALESCE(correct_option, 'A')
WHERE question_text IS NULL;

-- 3. Make new columns NOT NULL after migration
ALTER TABLE public.questions 
ALTER COLUMN question_text SET NOT NULL,
ALTER COLUMN options SET NOT NULL,
ALTER COLUMN correct_answer SET NOT NULL;

-- 4. Add RLS to questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read questions
CREATE POLICY "Everyone can view questions"
ON public.questions
FOR SELECT
USING (true);

-- Only admins can manage questions
CREATE POLICY "Admins can manage questions"
ON public.questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix profiles daily_goal column (missing from schema)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 30;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON public.questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);

-- 7. Ensure question_attempts has proper foreign key
ALTER TABLE public.question_attempts
DROP CONSTRAINT IF EXISTS question_attempts_question_id_fkey,
ADD CONSTRAINT question_attempts_question_id_fkey 
  FOREIGN KEY (question_id) 
  REFERENCES public.questions(id) 
  ON DELETE CASCADE;