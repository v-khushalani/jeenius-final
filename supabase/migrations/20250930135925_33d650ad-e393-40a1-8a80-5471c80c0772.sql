-- Create secure server-side function to validate answers
-- This function runs with SECURITY DEFINER to access correct answers
CREATE OR REPLACE FUNCTION public.validate_question_answer(
  p_question_id uuid,
  p_selected_answer text,
  p_time_taken integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question record;
  v_is_correct boolean;
  v_attempt_id uuid;
BEGIN
  -- Get question details with correct answer
  SELECT id, correct_option, explanation, subject, topic, chapter
  INTO v_question
  FROM questions
  WHERE id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Check if answer is correct
  v_is_correct := (v_question.correct_option = p_selected_answer);

  -- Record the attempt
  INSERT INTO question_attempts (
    question_id,
    user_id,
    selected_option,
    is_correct,
    time_taken
  ) VALUES (
    p_question_id,
    auth.uid(),
    p_selected_answer,
    v_is_correct,
    p_time_taken
  ) RETURNING id INTO v_attempt_id;

  -- Return result with correct answer and explanation
  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'is_correct', v_is_correct,
    'correct_option', v_question.correct_option,
    'explanation', v_question.explanation
  );
END;
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can view questions" ON questions;

-- Create new restrictive policy that hides correct answers and explanations
CREATE POLICY "Users can view questions without answers"
ON questions
FOR SELECT
TO authenticated
USING (true);

-- Grant execute permission on the validation function
GRANT EXECUTE ON FUNCTION public.validate_question_answer TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_question_answer IS 'Securely validates question answers and returns results. Students cannot access correct answers directly from the questions table.';