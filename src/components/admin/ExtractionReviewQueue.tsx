import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  CheckCircle2, XCircle, Edit2, Loader2, 
  ChevronLeft, ChevronRight, RefreshCw,
  FileText, BookOpen, AlertTriangle, Copy,
  SkipForward, Replace
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MathDisplay } from "./MathDisplay";

interface ExtractedQuestion {
  id: string;
  source_file: string;
  page_number: number;
  parsed_question: {
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
    exam: string;
    has_image?: boolean;
  };
  status: string;
  created_at: string;
}

interface Chapter {
  id: string;
  chapter_name: string;
  subject: string;
}

interface Topic {
  id: string;
  topic_name: string;
  chapter_id: string;
}

interface DuplicateResult {
  isDuplicate: boolean;
  similarity: number;
  existingQuestion?: {
    id: string;
    question: string;
    subject: string;
    chapter: string;
  };
}

// Normalize text for comparison (remove extra spaces, lowercase, remove special chars)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
};

// Calculate similarity between two strings (Jaccard similarity on words)
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = new Set(normalizeText(text1).split(' '));
  const words2 = new Set(normalizeText(text2).split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

export function ExtractionReviewQueue() {
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<ExtractedQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateResult | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, skipped: 0, approved: 0, overwritten: 0 });

  useEffect(() => {
    fetchQuestions();
    fetchChapters();
    fetchStats();
  }, [statusFilter]);

  // Check for duplicates when current question changes
  useEffect(() => {
    if (currentQuestion && statusFilter === "pending") {
      checkForDuplicate(currentQuestion.parsed_question.question);
    } else {
      setDuplicateCheck(null);
    }
  }, [currentIndex, questions, statusFilter]);

  const checkForDuplicate = async (questionText: string) => {
    if (!questionText || questionText.length < 20) {
      setDuplicateCheck(null);
      return;
    }

    setCheckingDuplicate(true);
    try {
      // Get first 50 chars normalized for initial filter
      const normalizedQuestion = normalizeText(questionText);
      const searchWords = normalizedQuestion.split(' ').slice(0, 5).join(' ');
      
      // Search for similar questions in the database
      const { data: existingQuestions, error } = await supabase
        .from("questions")
        .select("id, question, subject, chapter")
        .ilike("question", `%${searchWords.slice(0, 30)}%`)
        .limit(20);

      if (error) throw error;

      // Check similarity with each result
      let bestMatch: DuplicateResult = { isDuplicate: false, similarity: 0 };
      
      for (const existing of existingQuestions || []) {
        const similarity = calculateSimilarity(questionText, existing.question);
        
        if (similarity > bestMatch.similarity) {
          bestMatch = {
            isDuplicate: similarity >= 0.85, // 85% similarity threshold
            similarity,
            existingQuestion: similarity >= 0.6 ? existing : undefined
          };
        }
      }

      setDuplicateCheck(bestMatch);
    } catch (error) {
      console.error("Error checking duplicate:", error);
      setDuplicateCheck(null);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("extracted_questions_queue")
        .select("*")
        .eq("status", statusFilter)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      // Cast the data to our expected type
      const typedData = (data || []).map(item => ({
        ...item,
        parsed_question: item.parsed_question as ExtractedQuestion['parsed_question']
      }));
      setQuestions(typedData);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "approved"),
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "rejected"),
      ]);
      
      setStats({
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChapters = async () => {
    const { data } = await supabase.from("chapters").select("id, chapter_name, subject");
    setChapters(data || []);
  };

  const fetchTopics = async (chapterId: string) => {
    const { data } = await supabase.from("topics").select("id, topic_name, chapter_id").eq("chapter_id", chapterId);
    setTopics(data || []);
  };

  // Find best matching chapter from existing chapters - more lenient matching
  const findMatchingChapter = (subject: string, chapterName: string): Chapter | undefined => {
    if (!subject || !chapterName || chapters.length === 0) {
      console.log("findMatchingChapter: Missing data", { subject, chapterName, chaptersCount: chapters.length });
      return undefined;
    }

    const normalizedSubject = subject.toLowerCase().trim();
    const normalizedChapter = chapterName.toLowerCase().trim();

    // First try exact match
    let match = chapters.find(c => 
      c.subject.toLowerCase().trim() === normalizedSubject && 
      c.chapter_name.toLowerCase().trim() === normalizedChapter
    );
    
    if (match) {
      console.log("findMatchingChapter: Exact match found", match.chapter_name);
      return match;
    }

    // Try partial match - chapter name contains or is contained
    match = chapters.find(c => 
      c.subject.toLowerCase().trim() === normalizedSubject && 
      (c.chapter_name.toLowerCase().includes(normalizedChapter) || 
       normalizedChapter.includes(c.chapter_name.toLowerCase()))
    );
    
    if (match) {
      console.log("findMatchingChapter: Partial match found", match.chapter_name);
      return match;
    }

    // Try word-based matching - at least 2 words match
    const chapterWords = normalizedChapter.split(/\s+/).filter(w => w.length > 2);
    match = chapters.find(c => {
      if (c.subject.toLowerCase().trim() !== normalizedSubject) return false;
      const existingWords = c.chapter_name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const matchingWords = chapterWords.filter(w => existingWords.some(ew => ew.includes(w) || w.includes(ew)));
      return matchingWords.length >= 2 || (matchingWords.length >= 1 && chapterWords.length <= 2);
    });

    if (match) {
      console.log("findMatchingChapter: Word match found", match.chapter_name);
      return match;
    }

    // Fallback: return first chapter of the subject
    const subjectChapters = chapters.filter(c => c.subject.toLowerCase().trim() === normalizedSubject);
    if (subjectChapters.length > 0) {
      console.log("findMatchingChapter: Using fallback chapter", subjectChapters[0].chapter_name);
      return subjectChapters[0];
    }

    console.log("findMatchingChapter: No match found for", { subject, chapterName });
    return undefined;
  };

  const currentQuestion = questions[currentIndex];

  const handleApprove = async (forceApprove: boolean = false, overwrite: boolean = false) => {
    if (!currentQuestion) {
      console.log("handleApprove: No current question");
      toast.error("No question selected");
      return;
    }
    
    console.log("handleApprove called:", { forceApprove, overwrite, questionId: currentQuestion.id });
    
    // Block if duplicate detected (unless force approve)
    if (!forceApprove && duplicateCheck?.isDuplicate) {
      toast.error("Duplicate question detected! Use 'Approve Anyway' to override.");
      return;
    }
    
    setSaving(true);
    
    try {
      const q = editedQuestion?.parsed_question || currentQuestion.parsed_question;
      console.log("Processing question:", q.question?.slice(0, 50));
      
      // Validate required fields
      if (!q.question || !q.option_a || !q.correct_option || !q.subject) {
        toast.error("Missing required fields (question, options, subject)");
        setSaving(false);
        return;
      }
      
      // Find matching chapter from existing chapters
      const matchingChapter = findMatchingChapter(q.subject, q.chapter || "General");
      
      // Prepare chapter data - use match or fallback to extracted values
      const chapterName = matchingChapter?.chapter_name || q.chapter || "General";
      const chapterId = matchingChapter?.id || null;
      
      console.log("Using chapter:", { chapterName, chapterId, hasMatch: !!matchingChapter });

      // If overwriting duplicate, delete the existing question first
      if (overwrite && duplicateCheck?.existingQuestion?.id) {
        console.log("Deleting existing duplicate:", duplicateCheck.existingQuestion.id);
        const { error: deleteError } = await supabase.from("questions").delete().eq("id", duplicateCheck.existingQuestion.id);
        if (deleteError) {
          console.error("Delete error:", deleteError);
        }
      }
      
      // Insert into questions table
      console.log("Inserting question with data:", { subject: q.subject, chapter: chapterName, topic: q.topic });
      const { error: insertError } = await supabase.from("questions").insert({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        correct_option: q.correct_option,
        explanation: q.explanation || "",
        subject: q.subject,
        chapter: chapterName,
        topic: q.topic || chapterName,
        difficulty: q.difficulty || "Medium",
        exam: q.exam || "JEE",
        question_type: "single_correct",
        chapter_id: chapterId
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Question inserted successfully");

      // Update status to approved
      const { error: updateError } = await supabase
        .from("extracted_questions_queue")
        .update({ status: "approved" })
        .eq("id", currentQuestion.id);

      if (updateError) {
        console.error("Update status error:", updateError);
        throw updateError;
      }

      console.log("Question status updated to approved");
      toast.success(overwrite ? "Question overwritten!" : "Question approved and added to database!");
      
      // Move to next question
      setQuestions(prev => prev.filter(q => q.id !== currentQuestion.id));
      setEditMode(false);
      setEditedQuestion(null);
      setDuplicateCheck(null);
      fetchStats();
      
    } catch (error: any) {
      console.error("Error approving:", error);
      toast.error(`Failed to approve: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!currentQuestion) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("extracted_questions_queue")
        .update({ status: "rejected" })
        .eq("id", currentQuestion.id);

      if (error) throw error;

      toast.info("Question rejected");
      setQuestions(prev => prev.filter(q => q.id !== currentQuestion.id));
      setEditMode(false);
      setEditedQuestion(null);
      fetchStats();
      
    } catch (error) {
      console.error("Error rejecting:", error);
      toast.error("Failed to reject question");
    } finally {
      setSaving(false);
    }
  };

  // Check if a question is duplicate
  const checkDuplicateForQuestion = async (questionText: string): Promise<{ isDuplicate: boolean; existingId?: string }> => {
    if (!questionText || questionText.length < 20) {
      return { isDuplicate: false };
    }

    try {
      const normalizedQuestion = normalizeText(questionText);
      const searchWords = normalizedQuestion.split(' ').slice(0, 5).join(' ');
      
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("id, question")
        .ilike("question", `%${searchWords.slice(0, 30)}%`)
        .limit(10);

      for (const existing of existingQuestions || []) {
        const similarity = calculateSimilarity(questionText, existing.question);
        if (similarity >= 0.85) {
          return { isDuplicate: true, existingId: existing.id };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return { isDuplicate: false };
    }
  };

  // Bulk approve ALL (ignores duplicates, approves everything with valid chapters)
  const handleBulkApproveAll = async () => {
    if (questions.length === 0) {
      toast.error("No questions to approve");
      return;
    }
    
    console.log("Starting bulk approve all for", questions.length, "questions");
    setBulkProcessing(true);
    setBulkProgress({ current: 0, total: questions.length, skipped: 0, approved: 0, overwritten: 0 });
    
    try {
      let approved = 0;
      let skipped = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const q = question.parsed_question;
        
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        
        // Skip if missing required fields
        if (!q.question || !q.option_a || !q.correct_option || !q.subject) {
          console.log("Skipping question - missing fields:", question.id);
          skipped++;
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "rejected", review_notes: "Skipped - Missing required fields" })
            .eq("id", question.id);
          continue;
        }

        // Find matching chapter - now with fallback
        const matchingChapter = findMatchingChapter(q.subject, q.chapter || "General");
        const chapterName = matchingChapter?.chapter_name || q.chapter || "General";
        const chapterId = matchingChapter?.id || null;

        // Insert question (no duplicate check)
        const { error: insertError } = await supabase.from("questions").insert({
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          correct_option: q.correct_option,
          explanation: q.explanation || "",
          subject: q.subject,
          chapter: chapterName,
          topic: q.topic || chapterName,
          difficulty: q.difficulty || "Medium",
          exam: q.exam || "JEE",
          question_type: "single_correct",
          chapter_id: chapterId
        });

        if (!insertError) {
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "approved" })
            .eq("id", question.id);
          approved++;
          console.log("Approved question:", question.id);
        } else {
          console.error("Insert error for question:", question.id, insertError);
          skipped++;
        }

        setBulkProgress(prev => ({ ...prev, approved, skipped }));
      }

      toast.success(`Bulk complete: ${approved} approved, ${skipped} skipped`);
      await fetchQuestions();
      await fetchStats();
      
    } catch (error: any) {
      console.error("Bulk approve all error:", error);
      toast.error(`Bulk approval failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Bulk approve with skip duplicates
  const handleBulkApproveSkipDuplicates = async () => {
    if (questions.length === 0) {
      toast.error("No questions to process");
      return;
    }
    
    console.log("Starting bulk approve (skip duplicates) for", questions.length, "questions");
    setBulkProcessing(true);
    setBulkProgress({ current: 0, total: questions.length, skipped: 0, approved: 0, overwritten: 0 });
    
    try {
      let approved = 0;
      let skipped = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const q = question.parsed_question;
        
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        
        // Skip if missing required fields
        if (!q.question || !q.option_a || !q.correct_option || !q.subject) {
          console.log("Skipping question - missing fields:", question.id);
          skipped++;
          continue;
        }

        // Find matching chapter - with fallback
        const matchingChapter = findMatchingChapter(q.subject, q.chapter || "General");
        const chapterName = matchingChapter?.chapter_name || q.chapter || "General";
        const chapterId = matchingChapter?.id || null;

        // Check for duplicate - SKIP if found
        const duplicateResult = await checkDuplicateForQuestion(q.question);
        if (duplicateResult.isDuplicate) {
          console.log("Skipping duplicate:", question.id);
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "rejected", review_notes: "Skipped - Duplicate" })
            .eq("id", question.id);
          skipped++;
          continue;
        }

        // Insert question
        const { error: insertError } = await supabase.from("questions").insert({
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          correct_option: q.correct_option,
          explanation: q.explanation || "",
          subject: q.subject,
          chapter: chapterName,
          topic: q.topic || chapterName,
          difficulty: q.difficulty || "Medium",
          exam: q.exam || "JEE",
          question_type: "single_correct",
          chapter_id: chapterId
        });

        if (!insertError) {
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "approved" })
            .eq("id", question.id);
          approved++;
          console.log("Approved question:", question.id);
        } else {
          console.error("Insert error:", insertError);
          skipped++;
        }

        setBulkProgress(prev => ({ ...prev, approved, skipped }));
      }

      toast.success(`Bulk complete: ${approved} approved, ${skipped} skipped (duplicates)`);
      await fetchQuestions();
      await fetchStats();
      
    } catch (error: any) {
      console.error("Bulk approve error:", error);
      toast.error(`Bulk approval failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Bulk approve with overwrite duplicates
  const handleBulkApproveOverwriteDuplicates = async () => {
    if (questions.length === 0) {
      toast.error("No questions to process");
      return;
    }
    
    console.log("Starting bulk approve (overwrite duplicates) for", questions.length, "questions");
    setBulkProcessing(true);
    setBulkProgress({ current: 0, total: questions.length, skipped: 0, approved: 0, overwritten: 0 });
    
    try {
      let approved = 0;
      let skipped = 0;
      let overwritten = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const q = question.parsed_question;
        
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        
        // Skip if missing required fields
        if (!q.question || !q.option_a || !q.correct_option || !q.subject) {
          console.log("Skipping question - missing fields:", question.id);
          skipped++;
          continue;
        }

        // Find matching chapter - with fallback
        const matchingChapter = findMatchingChapter(q.subject, q.chapter || "General");
        const chapterName = matchingChapter?.chapter_name || q.chapter || "General";
        const chapterId = matchingChapter?.id || null;

        // Check for duplicate - OVERWRITE if found
        const duplicateResult = await checkDuplicateForQuestion(q.question);
        if (duplicateResult.isDuplicate && duplicateResult.existingId) {
          console.log("Overwriting duplicate:", duplicateResult.existingId);
          await supabase.from("questions").delete().eq("id", duplicateResult.existingId);
          overwritten++;
        }

        // Insert question
        const { error: insertError } = await supabase.from("questions").insert({
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          correct_option: q.correct_option,
          explanation: q.explanation || "",
          subject: q.subject,
          chapter: chapterName,
          topic: q.topic || chapterName,
          difficulty: q.difficulty || "Medium",
          exam: q.exam || "JEE",
          question_type: "single_correct",
          chapter_id: chapterId
        });

        if (!insertError) {
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "approved" })
            .eq("id", question.id);
          approved++;
          console.log("Approved question:", question.id);
        } else {
          console.error("Insert error:", insertError);
          skipped++;
        }

        setBulkProgress(prev => ({ ...prev, approved, skipped, overwritten }));
      }

      toast.success(`Bulk complete: ${approved} approved, ${overwritten} overwritten, ${skipped} skipped`);
      await fetchQuestions();
      await fetchStats();
      
    } catch (error: any) {
      console.error("Bulk approve error:", error);
      toast.error(`Bulk approval failed: ${error?.message || "Unknown error"}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleEdit = () => {
    setEditedQuestion({ ...currentQuestion });
    setEditMode(true);
    // Load topics for current chapter
    const matchingChapter = findMatchingChapter(
      currentQuestion.parsed_question.subject, 
      currentQuestion.parsed_question.chapter
    );
    if (matchingChapter) {
      fetchTopics(matchingChapter.id);
    }
  };

  const updateEditedField = (field: string, value: string) => {
    if (!editedQuestion) return;
    setEditedQuestion({
      ...editedQuestion,
      parsed_question: {
        ...editedQuestion.parsed_question,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter("pending")}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter("approved")}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter("rejected")}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Progress */}
      {bulkProcessing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="ml-2">
            Processing {bulkProgress.current} of {bulkProgress.total}...
            <span className="ml-2 text-green-500">{bulkProgress.approved} approved</span>
            {bulkProgress.overwritten > 0 && <span className="ml-2 text-yellow-500">{bulkProgress.overwritten} overwritten</span>}
            <span className="ml-2 text-muted-foreground">{bulkProgress.skipped} skipped</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Review Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Review Queue - {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </CardTitle>
              <CardDescription>
                {questions.length} questions to review
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchQuestions} disabled={bulkProcessing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {statusFilter === "pending" && questions.length > 0 && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      console.log("Approve All clicked");
                      handleBulkApproveAll();
                    }} 
                    disabled={bulkProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve All ({questions.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      console.log("Skip All Duplicates clicked");
                      handleBulkApproveSkipDuplicates();
                    }} 
                    disabled={bulkProcessing}
                    className="border-blue-500 text-blue-600 hover:bg-blue-500/10"
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip Duplicates
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      console.log("Overwrite All Duplicates clicked");
                      handleBulkApproveOverwriteDuplicates();
                    }} 
                    disabled={bulkProcessing}
                    className="border-orange-500 text-orange-600 hover:bg-orange-500/10"
                  >
                    <Replace className="h-4 w-4 mr-2" />
                    Overwrite Duplicates
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {statusFilter} questions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {questions.length}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentIndex >= questions.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Question Display */}
              {currentQuestion && (
                <div className="space-y-4">
                  {/* Source Info */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      {currentQuestion.source_file}
                    </Badge>
                    <Badge variant="outline">Page {currentQuestion.page_number}</Badge>
                    <Badge>{currentQuestion.parsed_question.subject || "Unknown"}</Badge>
                    <Badge variant="secondary">{currentQuestion.parsed_question.difficulty || "Medium"}</Badge>
                    {checkingDuplicate && (
                      <Badge variant="outline">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Checking...
                      </Badge>
                    )}
                    {duplicateCheck?.isDuplicate && (
                      <Badge variant="destructive">
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate ({Math.round(duplicateCheck.similarity * 100)}% match)
                      </Badge>
                    )}
                    {duplicateCheck && !duplicateCheck.isDuplicate && duplicateCheck.similarity >= 0.6 && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Similar ({Math.round(duplicateCheck.similarity * 100)}%)
                      </Badge>
                    )}
                  </div>

                  {/* Duplicate Warning Alert with Options */}
                  {duplicateCheck?.existingQuestion && (
                    <Alert variant={duplicateCheck.isDuplicate ? "destructive" : "default"} className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="ml-2">
                        <strong>{duplicateCheck.isDuplicate ? "Duplicate Detected!" : "Similar Question Found"}</strong>
                        <p className="text-sm mt-1 opacity-80">
                          {duplicateCheck.existingQuestion.question.slice(0, 150)}...
                        </p>
                        <p className="text-xs mt-1 opacity-60">
                          {duplicateCheck.existingQuestion.subject} → {duplicateCheck.existingQuestion.chapter}
                        </p>
                        {duplicateCheck.isDuplicate && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleReject}
                              disabled={saving}
                            >
                              <SkipForward className="h-3 w-3 mr-1" />
                              Skip (Keep Existing)
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApprove(true, true)}
                              disabled={saving}
                              className="border-orange-500 text-orange-600 hover:bg-orange-500/10"
                            >
                              <Replace className="h-3 w-3 mr-1" />
                              Overwrite Existing
                            </Button>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {editMode && editedQuestion ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea 
                          value={editedQuestion.parsed_question.question}
                          onChange={(e) => updateEditedField("question", e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Option A</Label>
                          <Input 
                            value={editedQuestion.parsed_question.option_a}
                            onChange={(e) => updateEditedField("option_a", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option B</Label>
                          <Input 
                            value={editedQuestion.parsed_question.option_b}
                            onChange={(e) => updateEditedField("option_b", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option C</Label>
                          <Input 
                            value={editedQuestion.parsed_question.option_c}
                            onChange={(e) => updateEditedField("option_c", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Option D</Label>
                          <Input 
                            value={editedQuestion.parsed_question.option_d}
                            onChange={(e) => updateEditedField("option_d", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select 
                            value={editedQuestion.parsed_question.correct_option}
                            onValueChange={(v) => updateEditedField("correct_option", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Select 
                            value={editedQuestion.parsed_question.subject}
                            onValueChange={(v) => {
                              updateEditedField("subject", v);
                              updateEditedField("chapter", ""); // Reset chapter when subject changes
                              setTopics([]);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select 
                            value={editedQuestion.parsed_question.difficulty}
                            onValueChange={(v) => updateEditedField("difficulty", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chapter (from existing only)</Label>
                        <Select 
                          value={editedQuestion.parsed_question.chapter}
                          onValueChange={(v) => {
                            updateEditedField("chapter", v);
                            // Find chapter and load its topics
                            const selectedChapter = chapters.find(c => c.chapter_name === v);
                            if (selectedChapter) {
                              fetchTopics(selectedChapter.id);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select chapter" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-60">
                              {chapters
                                .filter(c => c.subject === editedQuestion.parsed_question.subject)
                                .map(c => (
                                  <SelectItem key={c.id} value={c.chapter_name}>
                                    {c.chapter_name}
                                  </SelectItem>
                                ))
                              }
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        {chapters.filter(c => c.subject === editedQuestion.parsed_question.subject).length === 0 && (
                          <p className="text-xs text-destructive">No chapters found for {editedQuestion.parsed_question.subject}. Add chapters first.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Topic (from existing only)</Label>
                        <Select 
                          value={editedQuestion.parsed_question.topic}
                          onValueChange={(v) => updateEditedField("topic", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select topic or use chapter name" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-60">
                              {/* Default: use chapter name as topic */}
                              <SelectItem value={editedQuestion.parsed_question.chapter || "General"}>
                                {editedQuestion.parsed_question.chapter || "General"} (Chapter)
                              </SelectItem>
                              {topics.map(t => (
                                <SelectItem key={t.id} value={t.topic_name}>
                                  {t.topic_name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Explanation</Label>
                        <Textarea 
                          value={editedQuestion.parsed_question.explanation}
                          onChange={(e) => updateEditedField("explanation", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="font-medium whitespace-pre-wrap">
                          <MathDisplay text={currentQuestion.parsed_question.question} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {["A", "B", "C", "D"].map((opt) => {
                          const optionKey = `option_${opt.toLowerCase()}` as keyof typeof currentQuestion.parsed_question;
                          const isCorrect = currentQuestion.parsed_question.correct_option === opt;
                          const optionText = currentQuestion.parsed_question[optionKey] as string;
                          return (
                            <div 
                              key={opt}
                              className={`p-3 rounded-lg border ${
                                isCorrect ? "bg-green-500/10 border-green-500" : "bg-card"
                              }`}
                            >
                              <span className="font-semibold mr-2">({opt})</span>
                              <MathDisplay text={optionText || ''} />
                              {isCorrect && <CheckCircle2 className="h-4 w-4 inline ml-2 text-green-500" />}
                            </div>
                          );
                        })}
                      </div>

                      {currentQuestion.parsed_question.explanation && (
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <p className="text-sm font-medium mb-1">Explanation:</p>
                          <div className="text-sm">
                            <MathDisplay text={currentQuestion.parsed_question.explanation} />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">Chapter: {currentQuestion.parsed_question.chapter || "Not set"}</Badge>
                        <Badge variant="outline">Topic: {currentQuestion.parsed_question.topic || "Not set"}</Badge>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  {statusFilter === "pending" && (
                    <div className="flex gap-2 justify-end flex-wrap">
                      {editMode ? (
                        <Button variant="outline" onClick={() => { setEditMode(false); setEditedQuestion(null); }}>
                          Cancel
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={handleEdit}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      <Button variant="destructive" onClick={handleReject} disabled={saving}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      {duplicateCheck?.isDuplicate ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              console.log("Add Anyway clicked");
                              handleApprove(true, false);
                            }} 
                            disabled={saving}
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 mr-2" />
                            )}
                            Add Anyway
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => {
                            console.log("Approve clicked");
                            handleApprove(false);
                          }} 
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
