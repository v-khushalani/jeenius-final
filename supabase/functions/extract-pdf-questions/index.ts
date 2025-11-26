import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedQuestion {
  question_number: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  has_image: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { imageBase64, sourceFile, pageNumber, subject, chapter, exam } = await req.json();

    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    console.log(`📄 Processing page ${pageNumber} from ${sourceFile}`);

    // Call Gemini Vision API to extract questions
    const extractionPrompt = `You are an expert JEE/NEET question extractor. Analyze this textbook/question paper page image and extract ALL questions with their options.

IMPORTANT RULES:
1. Extract EVERY question visible on the page
2. Preserve mathematical notation using LaTeX (wrap inline math in $...$ and display math in $$...$$)
3. If a question has a diagram/figure, set has_image: true and describe it in the question text
4. Identify the correct answer if visible (from answer key or marked)
5. If answer is not visible, leave correct_option as empty string
6. Difficulty: "Easy", "Medium", or "Hard" based on complexity
7. Extract subject, chapter, topic from page headers or context

${subject ? `Subject hint: ${subject}` : ""}
${chapter ? `Chapter hint: ${chapter}` : ""}
${exam ? `Exam type: ${exam}` : ""}

Return a JSON array of questions in this EXACT format:
{
  "questions": [
    {
      "question_number": "1",
      "question": "The question text with $LaTeX$ for math",
      "option_a": "Option A text",
      "option_b": "Option B text", 
      "option_c": "Option C text",
      "option_d": "Option D text",
      "correct_option": "A" or "B" or "C" or "D" or "",
      "explanation": "Explanation if available, otherwise empty",
      "subject": "Physics" or "Chemistry" or "Mathematics" or "Biology",
      "chapter": "Chapter name from context",
      "topic": "Specific topic",
      "difficulty": "Easy" or "Medium" or "Hard",
      "has_image": false
    }
  ]
}

If no questions are found on this page (e.g., it's a cover page, index, or purely text content), return:
{"questions": [], "page_type": "non-question"}

EXTRACT ALL QUESTIONS NOW:`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: extractionPrompt },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8000,
            topP: 0.8,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    console.log("📝 Raw Gemini response length:", responseText.length);

    // Parse JSON from response
    let extractedQuestions: ExtractedQuestion[] = [];
    let pageType = "question";

    try {
      // Find JSON in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedQuestions = parsed.questions || [];
        pageType = parsed.page_type || "question";
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Try to salvage partial data
      extractedQuestions = [];
    }

    console.log(`✅ Extracted ${extractedQuestions.length} questions from page ${pageNumber}`);

    // Store extracted questions in the queue
    if (extractedQuestions.length > 0) {
      const questionsToInsert = extractedQuestions.map((q, idx) => ({
        source_file: sourceFile,
        page_number: pageNumber,
        raw_text: responseText,
        parsed_question: {
          ...q,
          subject: q.subject || subject || "",
          chapter: q.chapter || chapter || "",
          exam: exam || "JEE",
          extraction_index: idx
        },
        status: "pending"
      }));

      const { error: insertError } = await supabaseClient
        .from("extracted_questions_queue")
        .insert(questionsToInsert);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to save questions: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        pageNumber,
        questionsExtracted: extractedQuestions.length,
        pageType,
        questions: extractedQuestions
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Extraction error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
