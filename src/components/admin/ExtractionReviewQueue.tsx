import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  CheckCircle2, XCircle, Edit2, Save, Loader2, 
  ChevronLeft, ChevronRight, Trash2, RefreshCw,
  FileText, BookOpen, AlertTriangle, Copy
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
        .limit(100);

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

  const currentQuestion = questions[currentIndex];

  const handleApprove = async (forceApprove: boolean = false) => {
    if (!currentQuestion) return;
    
    // Block if duplicate detected (unless force approve)
    if (!forceApprove && duplicateCheck?.isDuplicate) {
      toast.error("Duplicate question detected! Use 'Approve Anyway' to override.");
      return;
    }
    
    setSaving(true);
    
    try {
      const q = editedQuestion?.parsed_question || currentQuestion.parsed_question;
      
      // Find chapter_id and topic_id based on names
      const matchingChapter = chapters.find(c => 
        c.chapter_name.toLowerCase() === q.chapter.toLowerCase() && 
        c.subject.toLowerCase() === q.subject.toLowerCase()
      );
      
      // Insert into questions table
      const { error: insertError } = await supabase.from("questions").insert({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation || "",
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic || q.chapter,
        difficulty: q.difficulty || "Medium",
        exam: q.exam || "JEE",
        question_type: "single_correct",
        chapter_id: matchingChapter?.id || null
      });

      if (insertError) throw insertError;

      // Update status to approved
      const { error: updateError } = await supabase
        .from("extracted_questions_queue")
        .update({ status: "approved" })
        .eq("id", currentQuestion.id);

      if (updateError) throw updateError;

      toast.success("Question approved and added to database!");
      
      // Move to next question
      setQuestions(prev => prev.filter(q => q.id !== currentQuestion.id));
      setEditMode(false);
      setEditedQuestion(null);
      setDuplicateCheck(null);
      fetchStats();
      
    } catch (error) {
      console.error("Error approving:", error);
      toast.error("Failed to approve question");
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

  const handleBulkApprove = async () => {
    if (questions.length === 0) return;
    setSaving(true);
    
    try {
      let approved = 0;
      
      for (const question of questions) {
        const q = question.parsed_question;
        
        if (!q.question || !q.option_a || !q.correct_option) continue;

        const matchingChapter = chapters.find(c => 
          c.chapter_name.toLowerCase() === q.chapter.toLowerCase() && 
          c.subject.toLowerCase() === q.subject.toLowerCase()
        );

        const { error: insertError } = await supabase.from("questions").insert({
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          explanation: q.explanation || "",
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic || q.chapter,
          difficulty: q.difficulty || "Medium",
          exam: q.exam || "JEE",
          question_type: "single_correct",
          chapter_id: matchingChapter?.id || null
        });

        if (!insertError) {
          await supabase
            .from("extracted_questions_queue")
            .update({ status: "approved" })
            .eq("id", question.id);
          approved++;
        }
      }

      toast.success(`Approved ${approved} questions!`);
      fetchQuestions();
      fetchStats();
      
    } catch (error) {
      console.error("Bulk approve error:", error);
      toast.error("Bulk approval failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditedQuestion({ ...currentQuestion });
    setEditMode(true);
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

      {/* Main Review Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Review Queue - {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </CardTitle>
              <CardDescription>
                {questions.length} questions to review
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchQuestions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {statusFilter === "pending" && questions.length > 0 && (
                <Button size="sm" onClick={handleBulkApprove} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve All ({questions.length})
                </Button>
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

                  {/* Duplicate Warning Alert */}
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
                            onValueChange={(v) => updateEditedField("subject", v)}
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
                        <Label>Chapter (from existing)</Label>
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
                            {chapters
                              .filter(c => c.subject === editedQuestion.parsed_question.subject)
                              .map(c => (
                                <SelectItem key={c.id} value={c.chapter_name}>
                                  {c.chapter_name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Topic</Label>
                        {topics.length > 0 ? (
                          <Select 
                            value={editedQuestion.parsed_question.topic}
                            onValueChange={(v) => updateEditedField("topic", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {topics.map(t => (
                                <SelectItem key={t.id} value={t.topic_name}>
                                  {t.topic_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            value={editedQuestion.parsed_question.topic}
                            onChange={(e) => updateEditedField("topic", e.target.value)}
                            placeholder="Enter topic or select chapter first"
                          />
                        )}
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
                    <div className="flex gap-2 justify-end">
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
                        <Button 
                          variant="outline" 
                          onClick={() => handleApprove(true)} 
                          disabled={saving}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          )}
                          Approve Anyway
                        </Button>
                      ) : (
                        <Button onClick={() => handleApprove(false)} disabled={saving}>
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
