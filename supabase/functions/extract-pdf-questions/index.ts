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

// List of valid chapters from database for better mapping
const VALID_CHAPTERS: Record<string, string[]> = {
  "Physics": [
    "Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", 
    "Laws of Motion", "Work, Energy and Power", "System of Particles", 
    "Gravitation", "Mechanical Properties", "Thermodynamics", "Kinetic Theory",
    "Oscillations", "Waves", "Electric Charges and Fields", "Electrostatic Potential",
    "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter",
    "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves",
    "Ray Optics", "Wave Optics", "Dual Nature of Radiation", "Atoms", "Nuclei",
    "Semiconductor Electronics", "Communication Systems", "Kinematics", "Rotational Motion"
  ],
  "Chemistry": [
    "Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity",
    "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics",
    "Equilibrium", "Redox Reactions", "Hydrogen", "The s-Block Elements", 
    "The p-Block Elements", "Organic Chemistry - Basic Principles", "Hydrocarbons",
    "Environmental Chemistry", "Solid State", "Solutions", "Electrochemistry",
    "Chemical Kinetics", "Surface Chemistry", "General Principles of Metallurgy",
    "The d and f Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes",
    "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids",
    "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"
  ],
  "Mathematics": [
    "Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers",
    "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem",
    "Sequences and Series", "Straight Lines", "Conic Sections", "Limits and Continuity",
    "Differentiation", "Application of Derivatives", "Indefinite Integration",
    "Definite Integration", "Application of Integrals", "Differential Equations",
    "Vectors", "Three Dimensional Geometry", "Probability", "Statistics",
    "Matrices and Determinants", "Mathematical Reasoning", "Circles", "Area Under Curves"
  ],
  "Biology": [
    "The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom",
    "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Cell: The Unit of Life",
    "Biomolecules", "Cell Cycle and Cell Division", "Transport in Plants",
    "Mineral Nutrition", "Photosynthesis in Higher Plants", "Respiration in Plants",
    "Plant Growth and Development", "Digestion and Absorption", "Breathing and Exchange of Gases",
    "Body Fluids and Circulation", "Excretory Products and their Elimination",
    "Locomotion and Movement", "Neural Control and Coordination",
    "Chemical Coordination and Integration", "Reproduction in Organisms",
    "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health",
    "Principles of Inheritance and Variation", "Molecular Basis of Inheritance",
    "Evolution", "Human Health and Disease", "Strategies for Enhancement in Food Production",
    "Microbes in Human Welfare", "Biotechnology: Principles and Processes",
    "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem",
    "Biodiversity and Conservation", "Environmental Issues"
  ]
};

// Find best matching chapter
function findBestChapter(extractedChapter: string, subject: string): string {
  if (!extractedChapter || !subject) return extractedChapter;
  
  const chapters = VALID_CHAPTERS[subject] || [];
  const normalized = extractedChapter.toLowerCase().trim();
  
  // Exact match
  for (const chapter of chapters) {
    if (chapter.toLowerCase() === normalized) return chapter;
  }
  
  // Partial match
  for (const chapter of chapters) {
    if (chapter.toLowerCase().includes(normalized) || normalized.includes(chapter.toLowerCase())) {
      return chapter;
    }
  }
  
  // Word overlap match
  const extractedWords = normalized.split(/\s+/);
  let bestMatch = { chapter: extractedChapter, score: 0 };
  
  for (const chapter of chapters) {
    const chapterWords = chapter.toLowerCase().split(/\s+/);
    const overlap = extractedWords.filter(w => chapterWords.some(cw => cw.includes(w) || w.includes(cw))).length;
    if (overlap > bestMatch.score) {
      bestMatch = { chapter, score: overlap };
    }
  }
  
  return bestMatch.score >= 1 ? bestMatch.chapter : extractedChapter;
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

MATHEMATICAL NOTATION - CRITICAL:
- Use LaTeX format: wrap inline math in $...$ and display math in $$...$$
- Subscripts: H$_2$O, CO$_2$, x$_1$, v$_0$
- Superscripts: x$^2$, 10$^{-3}$, m/s$^2$
- Fractions: $\\frac{a}{b}$
- Greek: $\\alpha$, $\\beta$, $\\theta$, $\\omega$, $\\lambda$, $\\mu$
- Square root: $\\sqrt{x}$
- Integrals: $\\int$, $\\oint$
- Summation: $\\sum$
- Vectors: $\\vec{v}$
- Special: $\\times$, $\\div$, $\\pm$, $\\infty$, $\\rightarrow$

SUBJECT DETECTION:
${subject ? `Confirmed subject: ${subject}` : `Detect from content:
- Physics: motion, force, energy, waves, electricity, magnetism, optics
- Chemistry: elements, reactions, bonds, organic, inorganic, physical chemistry
- Mathematics: algebra, calculus, geometry, trigonometry, statistics
- Biology: cells, organisms, genetics, physiology, ecology`}

CHAPTER MAPPING - Map to these standard chapters ONLY:
${subject ? `For ${subject}: ${(VALID_CHAPTERS[subject] || []).join(', ')}` : `Physics: Units, Motion, Laws of Motion, Work Energy Power, Gravitation, Thermodynamics, Waves, Electrostatics, Current Electricity, Magnetism, Optics, Modern Physics
Chemistry: Basic Concepts, Atomic Structure, Periodic Table, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Electrochemistry, Kinetics, Organic Chemistry
Mathematics: Sets, Functions, Trigonometry, Complex Numbers, Sequences, Calculus, Vectors, Probability, Matrices
Biology: Cell Biology, Genetics, Human Physiology, Plant Biology, Ecology, Evolution`}

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

    // Post-process questions: validate and enhance
    const processedQuestions = extractedQuestions.map((q, idx) => {
      // Validate required fields
      if (!q.question || !q.option_a || !q.option_b) {
        console.warn(`Question ${idx + 1} missing required fields`);
        return null;
      }
      
      // Map chapter to valid chapter
      const finalSubject = q.subject || subject || "Physics";
      const finalChapter = findBestChapter(q.chapter || chapter || "", finalSubject);
      
      // Determine difficulty if not set or seems wrong
      const finalDifficulty = q.difficulty && ["Easy", "Medium", "Hard"].includes(q.difficulty) 
        ? q.difficulty 
        : determineDifficulty(q.question, [q.option_a, q.option_b, q.option_c || '', q.option_d || '']);
      
      return {
        ...q,
        subject: finalSubject,
        chapter: finalChapter,
        difficulty: finalDifficulty,
        exam: exam || "JEE"
      };
    }).filter(Boolean) as ExtractedQuestion[];

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
