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
    const { contextPrompt, conversationHistory } = await req.json();
    console.log("📥 Prompt length:", contextPrompt?.length || 0);
    console.log("📜 Conversation history:", conversationHistory ? "Yes" : "No");
    
    if (!contextPrompt) {
      console.error("❌ No contextPrompt provided");
      return new Response(
        JSON.stringify({ error: "MISSING_PROMPT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate prompt length (prevent token overflow)
    if (!contextPrompt || contextPrompt.length > 4000) {
      console.error("❌ Prompt too long or empty:", contextPrompt?.length || 0);
      return new Response(
        JSON.stringify({ 
          error: "INVALID_PROMPT",
          message: "Please ask a shorter question (max 4000 characters)"
        }),
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
    const systemPrompt = `Tu "JEEnie" hai - JEE/NEET students ka AI mentor. 

GREETING: Always start with "**Hello Puttar!** 🧞‍♂️"

RULES:
1. Be DIRECT and ON-POINT - no unnecessary fluff
2. Use Hinglish naturally
3. Keep answers SHORT (3-5 lines max for simple doubts, elaborate ONLY if truly needed)
4. Use emojis smartly: 🎯 💡 ✨ ⚡ 🔥 📌 ✅
5. Make text visually appealing with **bold** for key terms
6. For formulas, write Greek letters properly: α (alpha), β (beta), γ (gamma), δ (delta), θ (theta), λ (lambda), μ (mu), σ (sigma), π (pi), ω (omega), Δ (Delta), Σ (Sigma), ∞ (infinity)
7. Use symbols: → (arrow), ≈ (approximately), ≠ (not equal), ≥ ≤ (greater/less equal), ² ³ (superscripts)

FORMAT for explanations:
**Hello Puttar!** 🧞‍♂️

💡 **[Direct Answer/Concept]**
• Key point 1
• Key point 2 (if needed)

✨ **Pro Tip:** [Quick trick if relevant]

🎯 Ab samjha na? Kar de solve!

NEVER give long paragraphs. Be the cool mentor who gets to the point fast.`;

    // Include conversation history for context memory
    const historyContext = conversationHistory 
      ? `\n\nPrevious conversation (for context, remember what was discussed):\n${conversationHistory}\n\n`
      : "";
    
    const fullPrompt = `${systemPrompt}${historyContext}\n\nCurrent question/doubt:\n${contextPrompt}\n\nAb answer do (remember previous context if any):`;

    // Call Gemini API with retry logic - using Gemini 2.5 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    console.log("🌐 API URL:", apiUrl.replace(GEMINI_API_KEY, "***"));

    let geminiResponse: Response | null = null;
    let retryCount = 0;
    const maxRetries = 2;

    // Retry logic for transient failures
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        geminiResponse = await fetch(apiUrl, {
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
              maxOutputTokens: 2000,
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
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        // Check if response is retriable error (503 service unavailable, 429 rate limit)
        if (geminiResponse.status === 503 || geminiResponse.status === 429) {
          retryCount++;
          const errorText = await geminiResponse.text();
          console.warn(`⚠️ Retriable error (${geminiResponse.status}) on attempt ${retryCount}:`, errorText);
          
          if (retryCount > maxRetries) {
            console.error("❌ All retry attempts exhausted");
            return new Response(
              JSON.stringify({ 
                error: "SERVICE_UNAVAILABLE",
                message: "JEEnie is temporarily overloaded. Please try again in a moment."
              }),
              { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Exponential backoff: 2s, 4s, 8s
          const backoffMs = 2000 * Math.pow(2, retryCount - 1);
          console.log(`⏳ Waiting ${backoffMs}ms before retry ${retryCount}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue; // Retry
        }
        
        // Success or non-retriable error, exit retry loop
        break;
        
      } catch (fetchError) {
        retryCount++;
        console.warn(`⚠️ Network error on attempt ${retryCount}:`, fetchError);
        
        if (retryCount > maxRetries) {
          console.error("❌ All retry attempts failed due to network errors");
          return new Response(
            JSON.stringify({ 
              error: "SERVICE_TIMEOUT",
              message: "JEEnie is taking too long to respond. Please try again."
            }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = 1000 * Math.pow(2, retryCount - 1);
        console.log(`⏳ Waiting ${backoffMs}ms before retry ${retryCount}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    // Safety check
    if (!geminiResponse) {
      console.error("❌ No response received after retries");
      return new Response(
        JSON.stringify({ 
          error: "SERVICE_ERROR",
          message: "JEEnie is temporarily unavailable. Please try again."
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          message: "JEEnie couldn't generate a response. Please try asking in a different way."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log success metrics for monitoring
    console.log("✅ Success - Content length:", content.length);
    console.log("📊 Tokens used:", data.usageMetadata?.totalTokenCount || 'N/A');

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
