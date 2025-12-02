import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("🔊 Text-to-speech request received");
    
    const { text, voice } = await req.json();

    if (!text) {
      console.error("❌ No text provided");
      throw new Error('Text is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not set");
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Clean text - remove HTML tags and limit length
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/\*\*/g, '')    // Remove markdown bold
      .replace(/\*/g, '')      // Remove markdown italic
      .substring(0, 4000);     // Limit length
    
    console.log("📝 Text length:", cleanText.length);

    // Generate speech using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: cleanText,
        voice: voice || 'nova', // Nova is friendly and warm
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI TTS error:", response.status, errorText);
      throw new Error(`OpenAI TTS error: ${errorText}`);
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log("✅ Audio generated successfully");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
    
  } catch (error) {
    console.error("❌ Error in text-to-speech:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
