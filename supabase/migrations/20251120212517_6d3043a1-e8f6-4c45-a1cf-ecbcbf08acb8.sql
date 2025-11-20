-- Add unique constraint to topic_mastery table for upsert operations
ALTER TABLE topic_mastery
DROP CONSTRAINT IF EXISTS topic_mastery_user_subject_chapter_topic;

ALTER TABLE topic_mastery
ADD CONSTRAINT topic_mastery_user_subject_chapter_topic 
UNIQUE (user_id, subject, chapter, topic);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_accuracy 
ON topic_mastery(user_id, accuracy);

CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_questions 
ON topic_mastery(user_id, questions_attempted);

-- Add index for lookup
CREATE INDEX IF NOT EXISTS idx_topic_mastery_lookup
ON topic_mastery(user_id, subject, chapter, topic);