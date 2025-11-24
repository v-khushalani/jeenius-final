-- Add foreign key columns to questions table to reference chapters and topics
ALTER TABLE questions 
ADD COLUMN chapter_id UUID REFERENCES chapters(id),
ADD COLUMN topic_id UUID REFERENCES topics(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);

-- Add constraint to ensure questions have proper references
-- Making them nullable for now to allow gradual migration of existing data
COMMENT ON COLUMN questions.chapter_id IS 'Foreign key reference to chapters table - preferred over chapter text field';
COMMENT ON COLUMN questions.topic_id IS 'Foreign key reference to topics table - preferred over topic text field';

-- Update RLS policy for admin management
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
CREATE POLICY "Admins can manage questions"
ON questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));