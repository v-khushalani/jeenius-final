import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 JEEnie request received at:", new Date().toISOString());
    
    // Parse request body
    const { contextPrompt } = await req.json();
    console.log("📥 Prompt length:", contextPrompt?.length || 0);
    
    if (!contextPrompt) {
      console.error("❌ No contextPrompt provided");
      return new Response(
        JSON.stringify({ error: "MISSING_PROMPT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing in environment");
      return new Response(
        JSON.stringify({ error: "API_KEY_MISSING_BACKEND" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🤖 Calling Gemini 2.5 Flash");

    // System prompt - JEEnie personality
    const systemPrompt = 'Tu "JEEnie" naam ka AI tutor hai - ek friendly magical genie jo JEE aspirants ki help karta hai. Personality: friendly, encouraging, Hinglish (Hindi+English), short crisp answers (max 5-6 lines), occasional emojis, always motivate. Format: "\n💡 [Main concept in 1-2 lines]\n• [Key point 1]\n• [Key point 2]\n✨ [Quick tip/trick]\n🎯 [Motivational closing]". Keep steps bullet-pointed, explain formulas simply, avoid long paragraphs.';

    const fullPrompt = `${systemPrompt}\n\nContext:\n${contextPrompt}\n\nAb answer do:`;

    // Call Gemini API - using Gemini 2.5 Flash (correct model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log("🌐 API URL:", apiUrl.replace(GEMINI_API_KEY, "***"));

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          topK: 40,
          topP: 0.95,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    console.log("📡 Gemini API response status:", geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("❌ Gemini API error:", geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        console.error("🚫 Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "RATE_LIMIT", message: "Too many requests. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (geminiResponse.status === 400) {
        console.error("🚫 Bad request - check API key or model name");
        return new Response(
          JSON.stringify({ error: "INVALID_REQUEST", message: "Invalid API request. Check configuration." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "GEMINI_API_ERROR", message: "AI service temporarily unavailable", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResponse.json();
    console.log("📦 Response received, parsing...");
    
    // Check for safety blocks
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      console.warn("⚠️ Response blocked by safety filters");
      return new Response(
        JSON.stringify({ 
          error: "SAFETY_BLOCK",
          message: "Response was filtered for safety. Please rephrase your question."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for other finish reasons
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      console.warn("⚠️ Unexpected finish reason:", finishReason);
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!content || content.trim() === "") {
      console.error("❌ Empty response from Gemini. Full response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ 
          error: "EMPTY_RESPONSE",
          message: "No response generated. Please try rephrasing your question."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Success - Content length:", content.length);
    
    return new Response(
      JSON.stringify({ content: content.trim() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Unhandled error in jeenie function:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({ 
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
