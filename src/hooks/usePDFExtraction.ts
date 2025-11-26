import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExtractionStatus {
  isExtracting: boolean;
  progress: number;
  currentPage: number;
  totalPages: number;
  questionsExtracted: number;
  errors: string[];
}

interface ExtractedQuestionFromQueue {
  id: string;
  source_file: string;
  page_number: number;
  parsed_question: Record<string, unknown>;
  status: string;
  created_at: string;
}

export function usePDFExtraction() {
  const [status, setStatus] = useState<ExtractionStatus>({
    isExtracting: false,
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    questionsExtracted: 0,
    errors: []
  });

  const [queuedQuestions, setQueuedQuestions] = useState<ExtractedQuestionFromQueue[]>([]);

  const fetchQueuedQuestions = useCallback(async (statusFilter: string = "pending") => {
    try {
      const { data, error } = await supabase
        .from("extracted_questions_queue")
        .select("*")
        .eq("status", statusFilter)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Cast parsed_question to Record<string, unknown>
      const typedData = (data || []).map(item => ({
        ...item,
        parsed_question: item.parsed_question as Record<string, unknown>
      }));
      setQueuedQuestions(typedData);
      return typedData;
    } catch (error) {
      console.error("Error fetching queued questions:", error);
      toast.error("Failed to fetch queued questions");
      return [];
    }
  }, []);

  const getQueueStats = useCallback(async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "approved"),
        supabase.from("extracted_questions_queue").select("id", { count: "exact" }).eq("status", "rejected"),
      ]);

      return {
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0,
        total: (pending.count || 0) + (approved.count || 0) + (rejected.count || 0)
      };
    } catch (error) {
      console.error("Error fetching queue stats:", error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }, []);

  const approveQuestion = useCallback(async (questionId: string, questionData: Record<string, unknown>) => {
    try {
      // Insert into questions table
      const { error: insertError } = await supabase.from("questions").insert({
        question: questionData.question as string,
        option_a: questionData.option_a as string,
        option_b: questionData.option_b as string,
        option_c: questionData.option_c as string,
        option_d: questionData.option_d as string,
        correct_option: questionData.correct_option as string,
        explanation: (questionData.explanation as string) || "",
        subject: questionData.subject as string,
        chapter: questionData.chapter as string,
        topic: (questionData.topic as string) || (questionData.chapter as string),
        difficulty: (questionData.difficulty as string) || "Medium",
        exam: (questionData.exam as string) || "JEE",
        question_type: "single_correct"
      });

      if (insertError) throw insertError;

      // Update status
      const { error: updateError } = await supabase
        .from("extracted_questions_queue")
        .update({ status: "approved" })
        .eq("id", questionId);

      if (updateError) throw updateError;

      toast.success("Question approved!");
      return true;
    } catch (error) {
      console.error("Error approving question:", error);
      toast.error("Failed to approve question");
      return false;
    }
  }, []);

  const rejectQuestion = useCallback(async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("extracted_questions_queue")
        .update({ status: "rejected" })
        .eq("id", questionId);

      if (error) throw error;

      toast.info("Question rejected");
      return true;
    } catch (error) {
      console.error("Error rejecting question:", error);
      toast.error("Failed to reject question");
      return false;
    }
  }, []);

  const deleteFromQueue = useCallback(async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("extracted_questions_queue")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast.success("Question removed from queue");
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
      return false;
    }
  }, []);

  const clearRejected = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("extracted_questions_queue")
        .delete()
        .eq("status", "rejected");

      if (error) throw error;

      toast.success("Cleared rejected questions");
      return true;
    } catch (error) {
      console.error("Error clearing rejected:", error);
      toast.error("Failed to clear rejected questions");
      return false;
    }
  }, []);

  return {
    status,
    queuedQuestions,
    fetchQueuedQuestions,
    getQueueStats,
    approveQuestion,
    rejectQuestion,
    deleteFromQueue,
    clearRejected
  };
}
