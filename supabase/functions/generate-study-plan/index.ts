import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, studyHours, targetExam, daysRemaining, strengths, weaknesses, avgAccuracy } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Prepare data for AI
    const weaknessDetails = weaknesses.map((w: any) => 
      `${w.subject} - ${w.topic}: ${w.accuracy}% accuracy, ${w.questions_attempted} questions`
    ).join('\n');

    const strengthDetails = strengths.map((s: any) => 
      `${s.subject} - ${s.topic}: ${s.accuracy}% accuracy, ${s.questions_attempted} questions`
    ).join('\n');

    const prompt = `You are JEEnius, an expert AI study planner for ${targetExam} aspirants. Create a highly personalized, motivating study plan analysis.

**Student Profile:**
- Target Exam: ${targetExam}
- Days Remaining: ${daysRemaining} days
- Daily Study Commitment: ${studyHours} hours
- Overall Accuracy: ${avgAccuracy}%

**Strengths (Strong Topics):**
${strengthDetails || 'No strong topics identified yet'}

**Focus Areas (Weak Topics):**
${weaknessDetails || 'No weak topics identified yet'}

Generate a personalized response in JSON format with these fields:

{
  "personalizedGreeting": "A warm, motivating greeting addressing the student's current performance (2-3 sentences)",
  "strengthAnalysis": "Encouraging analysis of their strengths with specific praise (2-3 sentences)",
  "weaknessStrategy": "Empathetic but motivating strategy for tackling weak areas (2-3 sentences)",
  "timeAllocation": {
    "weakTopics": "X hours/day",
    "mediumTopics": "Y hours/day", 
    "revision": "Z hours/day",
    "mockTests": "W hours/week"
  },
  "keyRecommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "motivationalMessage": "Powerful, personalized motivational message based on their data (2-3 sentences)",
  "rankPrediction": {
    "currentProjection": "Estimated rank range based on ${avgAccuracy}% accuracy",
    "targetProjection": "What rank they could achieve with improvements",
    "improvementPath": "Brief path to reach target"
  }
}

Make it feel personal, data-driven, and motivating. Use their actual numbers and subjects. Be encouraging but honest.`;

    // Call Gemini API with retry logic
    let retries = 0;
    const maxRetries = 2;
    let response: Response | undefined;

    while (retries <= maxRetries) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              }
            })
          }
        );

        if (response.ok) break;
        
        if (response.status === 429 || response.status === 503) {
          retries++;
          if (retries > maxRetries) throw new Error('Rate limit exceeded');
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          continue;
        }

        throw new Error(`Gemini API error: ${response.status}`);
      } catch (error) {
        if (retries >= maxRetries) throw error;
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }

    if (!response) {
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No content in Gemini response');
    }

    let aiResponse = data.candidates[0].content.parts[0].text.trim();
    
    // Extract JSON from response - handle multiple formats
    // Remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the first { and last }
    const firstBrace = aiResponse.indexOf('{');
    const lastBrace = aiResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiResponse = aiResponse.substring(firstBrace, lastBrace + 1);
    }

    const aiInsights = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        insights: aiInsights,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating study plan:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate study plan',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
