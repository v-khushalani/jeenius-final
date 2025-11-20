// Adaptive Level Service - Progressive difficulty system
import { supabase } from '@/integrations/supabase/client';

interface TopicLevel {
  userId: string;
  subject: string;
  chapter: string;
  topic: string;
  currentLevel: number; // 1 = easy, 2 = medium, 3 = hard
  accuracy: number;
  consecutiveCorrect: number;
  totalAttempts: number;
  lastAttemptAt: string;
}

class AdaptiveLevelService {
  
  // Get user's current level for a topic
  async getTopicLevel(userId: string, subject: string, chapter: string, topic: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('topic_mastery')
        .select('current_level, accuracy, questions_attempted')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('chapter', chapter)
        .eq('topic', topic)
        .single();

      if (error || !data) {
        // New topic - start with easy (level 1)
        return 1;
      }

      // Return current level (default to 1 if not set)
      return data.current_level || 1;
    } catch (error) {
      console.error('Error getting topic level:', error);
      return 1; // Default to easy
    }
  }

  // Update level based on performance
  async updateTopicLevel(
    userId: string, 
    subject: string, 
    chapter: string, 
    topic: string, 
    isCorrect: boolean
  ): Promise<{ newLevel: number; leveledUp: boolean; message?: string }> {
    try {
      // Get current mastery data
      const { data: mastery, error } = await supabase
        .from('topic_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('chapter', chapter)
        .eq('topic', topic)
        .single();

      let currentLevel = mastery?.current_level || 1;
      let accuracy = mastery?.accuracy || 0;
      let questionsAttempted = mastery?.questions_attempted || 0;

      // Calculate new accuracy
      const totalCorrect = Math.round((accuracy / 100) * questionsAttempted);
      const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
      const newQuestionsAttempted = questionsAttempted + 1;
      const newAccuracy = (newTotalCorrect / newQuestionsAttempted) * 100;

      // Determine if level should change
      let newLevel = currentLevel;
      let leveledUp = false;
      let message = '';

      // Level up criteria (5+ questions minimum)
      if (newQuestionsAttempted >= 5) {
        if (currentLevel === 1 && newAccuracy >= 80 && newQuestionsAttempted >= 5) {
          newLevel = 2;
          leveledUp = true;
          message = '🎉 Leveled up to Medium difficulty!';
        } else if (currentLevel === 2 && newAccuracy >= 85 && newQuestionsAttempted >= 10) {
          newLevel = 3;
          leveledUp = true;
          message = '🚀 Leveled up to Hard difficulty! You\'re crushing it!';
        }
      }

      // Level down criteria (accuracy drops, stay at same level for practice)
      if (newQuestionsAttempted >= 10) {
        if (currentLevel === 3 && newAccuracy < 60) {
          newLevel = 2;
          message = '📚 Moved to Medium for more practice';
        } else if (currentLevel === 2 && newAccuracy < 50) {
          newLevel = 1;
          message = '💪 Building foundation with Easy questions';
        }
      }

      // Update mastery record
      const { error: updateError } = await supabase
        .from('topic_mastery')
        .upsert({
          user_id: userId,
          subject,
          chapter,
          topic,
          current_level: newLevel,
          accuracy: newAccuracy,
          questions_attempted: newQuestionsAttempted,
          last_practiced: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating topic mastery:', updateError);
      }

      return { newLevel, leveledUp, message };
    } catch (error) {
      console.error('Error updating topic level:', error);
      return { newLevel: 1, leveledUp: false };
    }
  }

  // Get difficulty-appropriate questions
  async getQuestionsForLevel(
    subject: string, 
    chapter: string, 
    topic: string, 
    level: number, 
    limit: number = 1
  ): Promise<any[]> {
    try {
      const difficultyMap = {
        1: '1',
        2: '2',
        3: '3'
      };

      const difficulty = difficultyMap[level as keyof typeof difficultyMap] || '1';

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', subject)
        .eq('chapter', chapter)
        .eq('topic', topic)
        .eq('difficulty', difficulty)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching level-appropriate questions:', error);
      return [];
    }
  }
}

export default new AdaptiveLevelService();
