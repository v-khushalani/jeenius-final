import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Question {
  id: string;
  question_text: string;
  options: any;
  correct_option: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty_level: number;
  chapter: string;
}

export interface QuestionAttempt {
  id: string;
  question_id: string;
  user_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
  attempted_at: string;
}


export const useQuestions = (filters?: {
  subject?: string;
  topic?: string;
  difficulty?: number;
  limit?: number;
}) => {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('questions')
        .select('*');

      // Apply filters
      if (filters?.subject) {
        query = query.eq('subject', filters.subject);
      }

      if (filters?.topic) {
        query = query.eq('topic', filters.topic);
      }

      if (filters?.difficulty) {
        const difficultyMap = { 1: '1', 2: '2', 3: '3' };
        query = query.eq('difficulty', difficultyMap[filters.difficulty as keyof typeof difficultyMap]);
      }

      // Apply limit
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Map database columns to expected format
      const mappedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question_text: q.question,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d
        },
        correct_option: '', // Hidden by RLS
        explanation: '', // Hidden by RLS
        subject: q.subject,
        topic: q.topic,
        difficulty_level: q.difficulty === '1' ? 1 : q.difficulty === '2' ? 2 : 3,
        chapter: q.chapter
      }));

      setQuestions(mappedQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };
// Replace the getRandomQuestions function in useQuestions.tsx with this:

const getRandomQuestions = async (
  subject?: string | null, 
  topic?: string | null, 
  difficulty?: number | null, 
  count: number = 10
) => {
  try {
    setLoading(true);
    setError(null);

    const { supabase } = await import('@/integrations/supabase/client');
    
    // For adaptive learning, only exclude questions attempted at THIS difficulty level
    if (isAuthenticated && user) {
      let query = supabase
        .from('questions')
        .select('*');

      // Apply filters
      if (subject) {
        query = query.eq('subject', subject);
      }

      if (topic) {
        query = query.eq('topic', topic);
      }

      if (difficulty) {
        const difficultyMap = { 1: '1', 2: '2', 3: '3' };
        const targetDifficulty = difficultyMap[difficulty as keyof typeof difficultyMap];
        query = query.eq('difficulty', targetDifficulty);
        
        // Only exclude questions attempted at THIS difficulty level
        const { data: attemptedAtLevel } = await supabase
          .from('question_attempts')
          .select('question_id, questions!inner(difficulty)')
          .eq('user_id', user.id)
          .eq('questions.difficulty', targetDifficulty);
        
        const attemptedIds = attemptedAtLevel?.map(a => a.question_id) || [];
        
        if (attemptedIds.length > 0) {
          query = query.not('id', 'in', `(${attemptedIds.join(',')})`);
        }
      }

      // Fetch more than needed for random selection
      query = query.limit(count * 3);

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      if (!data || data.length === 0) {
        setError('No new questions available at this level!');
        return [];
      }

      // Map and shuffle
      const mappedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question_text: q.question,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d
        },
        correct_option: '', // Hidden by RLS
        explanation: '', // Hidden by RLS
        subject: q.subject,
        topic: q.topic,
        difficulty_level: q.difficulty === '1' ? 1 : q.difficulty === '2' ? 2 : 3,
        chapter: q.chapter
      }));

      // Shuffle and take count
      const shuffled = mappedQuestions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      setQuestions(selected);
      return selected;
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching random questions:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    return [];
  } finally {
    setLoading(false);
  }
};
  
  const submitAnswer = async (
    questionId: string,
    selectedAnswer: string,
    timeSpent?: number
  ): Promise<{ isCorrect: boolean; correctAnswer: string; explanation?: string }> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    try {
      // Use secure server-side validation function
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.rpc('validate_question_answer', {
        _question_id: questionId,
        _user_answer: selectedAnswer
      });

      if (error) {
        console.error('Error validating answer:', error);
        throw new Error('Failed to validate answer');
      }

      // Type cast the response data - RPC returns array
      const result = (data as any)?.[0] || data;
      const typedResult = result as {
        attempt_id: string;
        is_correct: boolean;
        correct_option: string;
        explanation: string;
      };

      return { 
        isCorrect: result.is_correct,
        correctAnswer: result.correct_option,
        explanation: result.explanation
      };
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (filters) {
      fetchQuestions();
    }
  }, [filters?.subject, filters?.topic, filters?.difficulty, filters?.limit]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    getRandomQuestions,
    submitAnswer,
    refetch: fetchQuestions
  };
};
