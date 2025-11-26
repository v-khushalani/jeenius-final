
-- Directly add foreign key constraints

-- questions -> chapters
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_chapter_id_fkey;
ALTER TABLE questions 
ADD CONSTRAINT questions_chapter_id_fkey 
FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;

-- questions -> topics
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_topic_id_fkey;
ALTER TABLE questions 
ADD CONSTRAINT questions_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;

-- topics -> chapters
ALTER TABLE topics 
DROP CONSTRAINT IF EXISTS topics_chapter_id_fkey;
ALTER TABLE topics 
ADD CONSTRAINT topics_chapter_id_fkey 
FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE;

-- question_attempts -> questions
ALTER TABLE question_attempts 
DROP CONSTRAINT IF EXISTS question_attempts_question_id_fkey;
ALTER TABLE question_attempts 
ADD CONSTRAINT question_attempts_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

-- question_attempts -> profiles
ALTER TABLE question_attempts 
DROP CONSTRAINT IF EXISTS question_attempts_user_id_fkey;
ALTER TABLE question_attempts 
ADD CONSTRAINT question_attempts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- test_sessions -> profiles
ALTER TABLE test_sessions 
DROP CONSTRAINT IF EXISTS test_sessions_user_id_fkey;
ALTER TABLE test_sessions 
ADD CONSTRAINT test_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- user_badges -> badges
ALTER TABLE user_badges 
DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

-- daily_progress -> profiles
ALTER TABLE daily_progress 
DROP CONSTRAINT IF EXISTS daily_progress_user_id_fkey;
ALTER TABLE daily_progress 
ADD CONSTRAINT daily_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- conversion_prompts -> profiles
ALTER TABLE conversion_prompts 
DROP CONSTRAINT IF EXISTS conversion_prompts_user_id_fkey;
ALTER TABLE conversion_prompts 
ADD CONSTRAINT conversion_prompts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- user_subscriptions -> subscription_plans
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- user_notifications -> admin_notifications
ALTER TABLE user_notifications 
DROP CONSTRAINT IF EXISTS user_notifications_notification_id_fkey;
ALTER TABLE user_notifications 
ADD CONSTRAINT user_notifications_notification_id_fkey 
FOREIGN KEY (notification_id) REFERENCES admin_notifications(id) ON DELETE CASCADE;

-- user_challenge_progress -> daily_challenges
ALTER TABLE user_challenge_progress 
DROP CONSTRAINT IF EXISTS user_challenge_progress_challenge_id_fkey;
ALTER TABLE user_challenge_progress 
ADD CONSTRAINT user_challenge_progress_challenge_id_fkey 
FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE;
