export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage_log: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: string
          id?: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          description: string | null
          id: string
          is_free: boolean | null
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      free_content_limits: {
        Row: {
          chapters_accessed: number | null
          created_at: string
          id: string
          last_reset_date: string | null
          limit_type: string | null
          limit_value: number | null
          questions_attempted: number | null
          tests_taken: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapters_accessed?: number | null
          created_at?: string
          id?: string
          last_reset_date?: string | null
          limit_type?: string | null
          limit_value?: number | null
          questions_attempted?: number | null
          tests_taken?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapters_accessed?: number | null
          created_at?: string
          id?: string
          last_reset_date?: string | null
          limit_type?: string | null
          limit_value?: number | null
          questions_attempted?: number | null
          tests_taken?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          plan_duration: number
          plan_id: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          plan_duration: number
          plan_id: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          plan_duration?: number
          plan_id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          goals_set: boolean | null
          grade: string | null
          id: string
          is_premium: boolean | null
          phone: string | null
          premium_until: string | null
          state: string | null
          subjects: Json | null
          subscription_end_date: string | null
          subscription_plan: string | null
          target_exam: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          goals_set?: boolean | null
          grade?: string | null
          id: string
          is_premium?: boolean | null
          phone?: string | null
          premium_until?: string | null
          state?: string | null
          subjects?: Json | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          target_exam?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          goals_set?: boolean | null
          grade?: string | null
          id?: string
          is_premium?: boolean | null
          phone?: string | null
          premium_until?: string | null
          state?: string | null
          subjects?: Json | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          target_exam?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          id: string
          is_correct: boolean
          mode: string | null
          question_id: string | null
          time_taken: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          id?: string
          is_correct: boolean
          mode?: string | null
          question_id?: string | null
          time_taken?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          mode?: string | null
          question_id?: string | null
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          chapter: number | null
          chapter_id: string | null
          correct_answer: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          options: Json
          question: string | null
          question_text: string
          subject: string | null
          topic: string | null
        }
        Insert: {
          chapter?: number | null
          chapter_id?: string | null
          correct_answer: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          options: Json
          question?: string | null
          question_text: string
          subject?: string | null
          topic?: string | null
        }
        Update: {
          chapter?: number | null
          chapter_id?: string | null
          correct_answer?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          options?: Json
          question?: string | null
          question_text?: string
          subject?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          test_type: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          test_type: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          test_type?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          test_type: string
          time_taken: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          test_type: string
          time_taken?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          test_type?: string
          time_taken?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      topic_priorities: {
        Row: {
          created_at: string
          id: string
          priority: number | null
          status: string
          subject: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: number | null
          status?: string
          subject: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: number | null
          status?: string
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_limits: {
        Row: {
          created_at: string
          id: string
          last_reset_date: string | null
          questions_today: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_date?: string | null
          questions_today?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_date?: string | null
          questions_today?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_content_access: {
        Row: {
          access_type: string
          accessed_at: string
          content_identifier: string
          created_at: string
          id: string
          subject: string
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          content_identifier: string
          created_at?: string
          id?: string
          subject: string
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          content_identifier?: string
          created_at?: string
          id?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          correct_answers: number | null
          created_at: string
          id: string
          study_streak: number | null
          total_questions: number | null
          total_time_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string
          id?: string
          study_streak?: number | null
          total_questions?: number | null
          total_time_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_answers?: number | null
          created_at?: string
          id?: string
          study_streak?: number | null
          total_questions?: number | null
          total_time_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean | null
          plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_question_answer: {
        Args: { _question_id: string; _user_answer: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
