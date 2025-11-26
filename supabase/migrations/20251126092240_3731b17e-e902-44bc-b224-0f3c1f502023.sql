
-- Add foreign key constraints and populate topics table

-- 1. Add foreign key constraint for questions -> chapters (if column exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'questions_chapter_id_fkey' AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions 
    ADD CONSTRAINT questions_chapter_id_fkey 
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Add foreign key constraint for topics -> chapters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'topics_chapter_id_fkey' AND table_name = 'topics'
  ) THEN
    ALTER TABLE topics 
    ADD CONSTRAINT topics_chapter_id_fkey 
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Add foreign key constraint for questions -> topics
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'questions_topic_id_fkey' AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions 
    ADD CONSTRAINT questions_topic_id_fkey 
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Add foreign key constraint for question_attempts -> questions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_attempts_question_id_fkey' AND table_name = 'question_attempts'
  ) THEN
    ALTER TABLE question_attempts 
    ADD CONSTRAINT question_attempts_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Add foreign key constraint for question_attempts -> profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_attempts_user_id_fkey' AND table_name = 'question_attempts'
  ) THEN
    ALTER TABLE question_attempts 
    ADD CONSTRAINT question_attempts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Add foreign key constraint for test_sessions -> profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'test_sessions_user_id_fkey' AND table_name = 'test_sessions'
  ) THEN
    ALTER TABLE test_sessions 
    ADD CONSTRAINT test_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Add foreign key for user_badges -> badges
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_badges_badge_id_fkey' AND table_name = 'user_badges'
  ) THEN
    ALTER TABLE user_badges 
    ADD CONSTRAINT user_badges_badge_id_fkey 
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. Add foreign key for daily_progress -> profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'daily_progress_user_id_fkey' AND table_name = 'daily_progress'
  ) THEN
    ALTER TABLE daily_progress 
    ADD CONSTRAINT daily_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 9. Add foreign key for conversion_prompts -> profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversion_prompts_user_id_fkey' AND table_name = 'conversion_prompts'
  ) THEN
    ALTER TABLE conversion_prompts 
    ADD CONSTRAINT conversion_prompts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 10. Add foreign key for user_subscriptions -> subscription_plans
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_subscriptions_plan_id_fkey' AND table_name = 'user_subscriptions'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD CONSTRAINT user_subscriptions_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 11. Add foreign key for user_notifications -> admin_notifications
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_notifications_notification_id_fkey' AND table_name = 'user_notifications'
  ) THEN
    ALTER TABLE user_notifications 
    ADD CONSTRAINT user_notifications_notification_id_fkey 
    FOREIGN KEY (notification_id) REFERENCES admin_notifications(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 12. Add foreign key for user_challenge_progress -> daily_challenges
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_challenge_progress_challenge_id_fkey' AND table_name = 'user_challenge_progress'
  ) THEN
    ALTER TABLE user_challenge_progress 
    ADD CONSTRAINT user_challenge_progress_challenge_id_fkey 
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 13. Add unique constraint on topic_mastery for upsert operations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'topic_mastery_user_subject_chapter_topic_unique'
  ) THEN
    CREATE UNIQUE INDEX topic_mastery_user_subject_chapter_topic_unique 
    ON topic_mastery(user_id, subject, chapter, topic);
  END IF;
END $$;

-- 14. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_id ON topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject);
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON topics(chapter_id);

-- 15. Populate topics table with default topics per chapter (one topic per chapter named "General")
INSERT INTO topics (chapter_id, topic_name, order_index, difficulty_level, is_free, is_premium)
SELECT 
  c.id as chapter_id,
  'General ' || c.chapter_name as topic_name,
  1 as order_index,
  c.difficulty_level,
  true as is_free,
  false as is_premium
FROM chapters c
WHERE NOT EXISTS (
  SELECT 1 FROM topics t WHERE t.chapter_id = c.id
)
ON CONFLICT DO NOTHING;

-- 16. Add unique constraint on daily_progress for user_id and date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'daily_progress_user_date_unique'
  ) THEN
    CREATE UNIQUE INDEX daily_progress_user_date_unique ON daily_progress(user_id, date);
  END IF;
END $$;
