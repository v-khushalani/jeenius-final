import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MasteryUpdate {
  subject: string;
  chapter: string;
  topic: string;
  currentLevel: number;
  accuracy: number;
  questionsAttempted: number;
  stuckDays: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { subject, chapter, topic } = await req.json();

    // Get all attempts for this topic
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('is_correct, created_at')
      .eq('user_id', user.id)
      .eq('questions.subject', subject)
      .eq('questions.chapter', chapter)
      .eq('questions.topic', topic)
      .order('created_at', { ascending: false });

    if (!attempts || attempts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No attempts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate accuracy
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const accuracy = (correctAttempts / attempts.length) * 100;
    const questionsAttempted = attempts.length;

    // Determine mastery level
    let currentLevel = 1;
    if (accuracy >= 90 && questionsAttempted >= 60) currentLevel = 4;
    else if (accuracy >= 85 && questionsAttempted >= 40) currentLevel = 3;
    else if (accuracy >= 70 && questionsAttempted >= 25) currentLevel = 2;

    // Check if stuck
    const { data: existingMastery } = await supabase
      .from('topic_mastery')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('chapter', chapter)
      .eq('topic', topic)
      .single();

    let stuckDays = 0;
    if (existingMastery) {
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(existingMastery.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (accuracy < 60 && existingMastery.accuracy < 60) {
        stuckDays = existingMastery.stuck_days + daysSinceUpdate;
      }
    }

    // Upsert mastery record
    const masteryData: MasteryUpdate = {
      subject,
      chapter,
      topic,
      currentLevel,
      accuracy: parseFloat(accuracy.toFixed(2)),
      questionsAttempted,
      stuckDays
    };

    const { error } = await supabase
      .from('topic_mastery')
      .upsert({
        user_id: user.id,
        ...masteryData,
        last_practiced: new Date().toISOString(),
        mastery_date: currentLevel === 4 ? new Date().toISOString() : null
      });

    if (error) throw error;

    // Schedule spaced repetition if level 3 or 4
    if (currentLevel >= 3) {
      const intervals = [1, 3, 7, 15, 30, 60];
      const durations = [10, 8, 5, 5, 3, 3];

      for (let i = 0; i < intervals.length; i++) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + intervals[i]);

        await supabase
          .from('revision_queue')
          .upsert({
            user_id: user.id,
            subject,
            chapter,
            topic,
            scheduled_date: scheduledDate.toISOString().split('T')[0],
            review_number: i + 1,
            duration_minutes: durations[i],
            completed: false
          }, {
            onConflict: 'user_id,subject,chapter,topic,review_number'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mastery: masteryData,
        message: currentLevel === 4 ? '🎉 Topic Mastered!' : `Level ${currentLevel} achieved!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in calculate-topic-mastery:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
