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

interface DatabaseChapter {
  id: string;
  chapter_name: string;
  subject: string;
}

interface DatabaseTopic {
  id: string;
  topic_name: string;
  chapter_id: string;
}

// Smart matching function to find best chapter from database
function findBestChapterMatch(
  extractedChapter: string, 
  subject: string, 
  dbChapters: DatabaseChapter[]
): DatabaseChapter | null {
  if (!extractedChapter || !subject) return null;
  
  const relevantChapters = dbChapters.filter(ch => ch.subject === subject);
  const normalized = extractedChapter.toLowerCase().trim();
  
  // Exact match
  for (const chapter of relevantChapters) {
    if (chapter.chapter_name.toLowerCase() === normalized) {
      return chapter;
    }
  }
  
  // Partial match - chapter name contains extracted text or vice versa
  for (const chapter of relevantChapters) {
    const chName = chapter.chapter_name.toLowerCase();
    if (chName.includes(normalized) || normalized.includes(chName)) {
      return chapter;
    }
  }
  
  // Word overlap match - find best scoring match
  const extractedWords = normalized.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = { chapter: null as DatabaseChapter | null, score: 0 };
  
  for (const chapter of relevantChapters) {
    const chapterWords = chapter.chapter_name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = extractedWords.filter(w => 
      chapterWords.some(cw => cw.includes(w) || w.includes(cw))
    ).length;
    
    if (overlap > bestMatch.score) {
      bestMatch = { chapter, score: overlap };
    }
  }
  
  // Only return if we have at least 1 word match
  return bestMatch.score >= 1 ? bestMatch.chapter : null;
}

// Smart matching function to find best topic from database
function findBestTopicMatch(
  extractedTopic: string, 
  chapterId: string, 
  dbTopics: DatabaseTopic[]
): DatabaseTopic | null {
  if (!extractedTopic || !chapterId) return null;
  
  const relevantTopics = dbTopics.filter(t => t.chapter_id === chapterId);
  const normalized = extractedTopic.toLowerCase().trim();
  
  // Exact match
  for (const topic of relevantTopics) {
    if (topic.topic_name.toLowerCase() === normalized) {
      return topic;
    }
  }
  
  // Partial match
  for (const topic of relevantTopics) {
    const tName = topic.topic_name.toLowerCase();
    if (tName.includes(normalized) || normalized.includes(tName)) {
      return topic;
    }
  }
  
  // Word overlap match
  const extractedWords = normalized.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = { topic: null as DatabaseTopic | null, score: 0 };
  
  for (const topic of relevantTopics) {
    const topicWords = topic.topic_name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = extractedWords.filter(w => 
      topicWords.some(tw => tw.includes(w) || w.includes(tw))
    ).length;
    
    if (overlap > bestMatch.score) {
      bestMatch = { topic, score: overlap };
    }
  }
  
  return bestMatch.score >= 1 ? bestMatch.topic : null;
}

// Determine difficulty based on question complexity
function determineDifficulty(question: string, options: string[]): string {
  const text = (question + options.join(' ')).toLowerCase();
  
  // Hard indicators
  const hardIndicators = [
    'derive', 'prove', 'integration', 'differential equation', 'complex',
    'multiple steps', 'advanced', 'jee advanced', 'assertion', 'reason',
    'match the following', 'matrix', 'determinant', 'limit', 'calculus',
    'electromagnetic', 'quantum', 'thermodynamic equilibrium', 'mechanism'
  ];
  
  // Easy indicators  
  const easyIndicators = [
    'define', 'what is', 'name the', 'identify', 'basic', 'simple',
    'which of the following', 'fill in', 'true or false', 'ncert',
    'fundamental', 'primary', 'elementary'
  ];
  
  const hardCount = hardIndicators.filter(h => text.includes(h)).length;
  const easyCount = easyIndicators.filter(e => text.includes(e)).length;
  
  // Also check question length as proxy for complexity
  const wordCount = question.split(/\s+/).length;
  
  if (hardCount >= 2 || wordCount > 80) return "Hard";
  if (easyCount >= 2 || wordCount < 20) return "Easy";
  return "Medium";
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

    // Fetch ALL chapters and topics from database for matching
    console.log("📚 Fetching database curriculum...");
    const { data: dbChapters, error: chaptersError } = await supabaseClient
      .from("chapters")
      .select("id, chapter_name, subject");
    
    const { data: dbTopics, error: topicsError } = await supabaseClient
      .from("topics")
      .select("id, topic_name, chapter_id");
    
    if (chaptersError || topicsError || !dbChapters || !dbTopics) {
      throw new Error("Failed to load curriculum from database");
    }

    console.log(`✅ Loaded ${dbChapters.length} chapters and ${dbTopics.length} topics from database`);

    const { imageBase64, sourceFile, pageNumber, subject, chapter, exam } = await req.json();

    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    console.log(`📄 Processing page ${pageNumber} from ${sourceFile}`);

    // Enhanced extraction prompt for better accuracy
    const extractionPrompt = `You are an expert JEE/NEET question extractor. Analyze this textbook/question paper page image EXTREMELY CAREFULLY and extract EVERY SINGLE question visible.

CRITICAL INSTRUCTIONS:
1. Extract EVERY question on this page - DO NOT MISS ANY. Count them carefully before responding.
2. Questions may be numbered as 1, 2, 3... or Q1, Q2... or (a), (b), (c)... or i, ii, iii... - extract ALL formats
3. Look for questions in COLUMNS - pages often have 2-3 columns of questions
4. Even if a question seems incomplete or cut off, extract what's visible
5. Pay attention to sub-questions (parts a, b, c of a main question) - each should be a separate entry

MATHEMATICAL NOTATION - CRITICAL (ALWAYS USE LATEX):
- ALWAYS wrap ALL math expressions in $...$ for inline or $$...$$ for display math
- Subscripts: H$_2$O, CO$_2$, x$_1$, v$_0$, a$_n$
- Superscripts: x$^2$, 10$^{-3}$, m/s$^2$, e$^{-x}$
- Fractions: $\\frac{numerator}{denominator}$ (NEVER use / for fractions in math)
- Square root: $\\sqrt{x}$, $\\sqrt[n]{x}$ for nth root
- Limits: $\\lim_{x \\to a}$, $\\lim_{x \\to \\infty}$, $\\lim_{n \\to 0}$ (ALWAYS use \\to for arrows)
- Integrals: $\\int$, $\\oint$, $\\int_{a}^{b}$, $\\iint$, $\\iiint$
- Summation: $\\sum$, $\\sum_{i=1}^{n}$, $\\prod_{i=1}^{n}$
- Vectors: $\\vec{v}$, $\\vec{F}$, $\\overrightarrow{AB}$
- Greek letters (ALWAYS in LaTeX): $\\alpha$, $\\beta$, $\\gamma$, $\\delta$, $\\Delta$, $\\epsilon$, $\\theta$, $\\Theta$, $\\lambda$, $\\Lambda$, $\\mu$, $\\pi$, $\\Pi$, $\\sigma$, $\\Sigma$, $\\omega$, $\\Omega$, $\\phi$, $\\Phi$, $\\psi$, $\\Psi$, $\\rho$, $\\tau$, $\\xi$, $\\zeta$, $\\eta$, $\\kappa$, $\\nu$, $\\chi$
- Operators: $\\times$, $\\div$, $\\pm$, $\\mp$, $\\cdot$, $\\ast$
- Relations: $\\leq$, $\\geq$, $\\neq$, $\\approx$, $\\equiv$, $\\propto$, $\\sim$
- Arrows: $\\rightarrow$, $\\leftarrow$, $\\leftrightarrow$, $\\Rightarrow$, $\\Leftarrow$, $\\to$ (for limits)
- Special: $\\infty$, $\\partial$, $\\nabla$, $\\angle$, $\\degree$, $\\circ$
- Trigonometry: $\\sin$, $\\cos$, $\\tan$, $\\sec$, $\\csc$, $\\cot$
- Logarithms: $\\log$, $\\ln$, $\\log_{10}$
- Chemistry: Use subscripts/superscripts: H$_2$O, CO$_2$, OH$^-$, Fe$^{3+}$
- Complex expressions: $\\frac{d}{dx}$, $\\frac{\\partial f}{\\partial x}$, $\\int_{0}^{\\infty} e^{-x} dx$

EXAMPLES OF PERFECT FORMATTING:
- "Find $\\lim_{x \\to 0} \\frac{\\sin x}{x}$" (NOT "lim x->0 sin(x)/x")
- "If $\\alpha$ and $\\beta$ are roots..." (NOT "If alpha and beta are roots...")
- "The value of $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$" (NOT "sum from n=1 to infinity of 1/n^2")
- "Calculate $\\int_{0}^{\\pi} \\sin(x) dx$" (NOT "integral from 0 to pi of sin(x) dx")

SUBJECT DETECTION:
${subject ? `Confirmed subject: ${subject}` : `Detect from content:
- Physics: motion, force, energy, waves, electricity, magnetism, optics
- Chemistry: elements, reactions, bonds, organic, inorganic, physical chemistry
- Mathematics: algebra, calculus, geometry, trigonometry, statistics
- Biology: cells, organisms, genetics, physiology, ecology`}

CHAPTER MAPPING - CRITICAL: Map ONLY to these existing chapters from database:
${subject ? `For ${subject}: ${dbChapters.filter(ch => ch.subject === subject).map(ch => ch.chapter_name).join(', ')}` : 
  `Available chapters: ${dbChapters.map(ch => `${ch.subject}: ${ch.chapter_name}`).join('; ')}`}

${chapter ? `Chapter hint: ${chapter}` : ""}
${exam ? `Exam type: ${exam}` : "Exam: JEE/NEET"}

DIFFICULTY DETERMINATION:
- Easy: Direct formula application, definition-based, single-concept
- Medium: 2-3 steps, combination of concepts, moderate calculation
- Hard: Multi-step derivation, advanced concepts, JEE Advanced level

Return ONLY valid JSON in this EXACT format (no markdown, no explanation):
{
  "questions": [
    {
      "question_number": "1",
      "question": "The question text with proper $LaTeX$ formatting",
      "option_a": "Option A with $math$ if needed",
      "option_b": "Option B",
      "option_c": "Option C",
      "option_d": "Option D",
      "correct_option": "A",
      "explanation": "Brief explanation if visible",
      "subject": "Physics",
      "chapter": "Exact chapter name from list above",
      "topic": "Specific topic within chapter",
      "difficulty": "Easy",
      "has_image": false
    }
  ],
  "total_questions_on_page": 5,
  "page_type": "question"
}

If page has no questions (cover, index, theory): {"questions": [], "page_type": "non-question", "total_questions_on_page": 0}

NOW EXTRACT ALL QUESTIONS - CHECK TWICE THAT YOU HAVEN'T MISSED ANY:`;

    // Call Gemini Vision API
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
            maxOutputTokens: 16000, // Increased for more questions
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
      console.error("Gemini API error:", geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    console.log("📝 Raw Gemini response length:", responseText.length);

    // Parse JSON from response - handle various formats
    let extractedQuestions: ExtractedQuestion[] = [];
    let pageType = "question";
    let reportedTotal = 0;

    try {
      // Clean response - remove markdown code blocks if present
      let cleanResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Find JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedQuestions = parsed.questions || [];
        pageType = parsed.page_type || "question";
        reportedTotal = parsed.total_questions_on_page || extractedQuestions.length;
        
        // Log if there's a mismatch
        if (reportedTotal > extractedQuestions.length) {
          console.warn(`⚠️ Page ${pageNumber}: AI reported ${reportedTotal} questions but only extracted ${extractedQuestions.length}`);
        }
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response was:", responseText.substring(0, 500));
      
      // Try to salvage partial data with regex
      const questionMatches = responseText.matchAll(/"question":\s*"([^"]+)"/g);
      for (const match of questionMatches) {
        if (match[1] && match[1].length > 20) {
          console.log("Salvaged question:", match[1].substring(0, 50));
        }
      }
    }

    // Post-process questions: validate, match to database, and enhance
    const processedQuestions = extractedQuestions.map((q, idx) => {
      // Validate required fields
      if (!q.question || !q.option_a || !q.option_b) {
        console.warn(`Question ${idx + 1} missing required fields`);
        return null;
      }
      
      // Determine subject
      const finalSubject = q.subject || subject || "Physics";
      
      // Match to existing chapter in database
      const matchedChapter = findBestChapterMatch(
        q.chapter || chapter || "", 
        finalSubject, 
        dbChapters
      );
      
      if (!matchedChapter) {
        console.warn(`Question ${idx + 1}: No matching chapter found for "${q.chapter}" in ${finalSubject}`);
        return null; // Skip questions that don't match any existing chapter
      }
      
      // Match to existing topic in database
      const matchedTopic = findBestTopicMatch(
        q.topic || "", 
        matchedChapter.id, 
        dbTopics
      );
      
      if (!matchedTopic) {
        console.warn(`Question ${idx + 1}: No matching topic found for "${q.topic}" in chapter "${matchedChapter.chapter_name}"`);
        // Don't skip if no topic match - we'll use chapter only
      }
      
      // Determine difficulty if not set or seems wrong
      const finalDifficulty = q.difficulty && ["Easy", "Medium", "Hard"].includes(q.difficulty) 
        ? q.difficulty 
        : determineDifficulty(q.question, [q.option_a, q.option_b, q.option_c || '', q.option_d || '']);
      
      return {
        ...q,
        subject: finalSubject,
        chapter: matchedChapter.chapter_name,
        chapter_id: matchedChapter.id,
        topic: matchedTopic?.topic_name || q.topic || matchedChapter.chapter_name,
        topic_id: matchedTopic?.id || null,
        difficulty: finalDifficulty,
        exam: exam || "JEE"
      };
    }).filter(Boolean) as any[];

    console.log(`✅ Processed ${processedQuestions.length} questions from page ${pageNumber}`);

    // Store extracted questions in the queue
    if (processedQuestions.length > 0) {
      const questionsToInsert = processedQuestions.map((q, idx) => ({
        source_file: sourceFile,
        page_number: pageNumber,
        raw_text: responseText.substring(0, 5000), // Limit raw text storage
        parsed_question: {
          ...q,
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
        questionsExtracted: processedQuestions.length,
        reportedTotal,
        pageType,
        questions: processedQuestions
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
