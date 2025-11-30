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
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          scheduled_at: string | null
          sent_by: string | null
          status: string | null
          target_audience: string
          target_user_ids: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          scheduled_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_audience?: string
          target_user_ids?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_audience?: string
          target_user_ids?: string[] | null
          title?: string
        }
        Relationships: []
      }
      ai_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          last_reset_date: string | null
          requests_today: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          requests_today?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          requests_today?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          count: number | null
          created_at: string | null
          date: string
          id: string
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          date: string
          id?: string
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          color: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          points_required: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_name: string
          chapter_number: number
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_time: number | null
          id: string
          is_free: boolean | null
          is_premium: boolean | null
          subject: string
        }
        Insert: {
          chapter_name: string
          chapter_number: number
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          subject: string
        }
        Update: {
          chapter_name?: string
          chapter_number?: number
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      conversion_prompts: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          prompt_type: string | null
          shown_at: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          prompt_type?: string | null
          shown_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          prompt_type?: string | null
          shown_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          active: boolean | null
          challenge_type: string | null
          created_at: string | null
          date: string
          id: string
          reward_points: number | null
          subject: string | null
          target_value: number | null
        }
        Insert: {
          active?: boolean | null
          challenge_type?: string | null
          created_at?: string | null
          date: string
          id?: string
          reward_points?: number | null
          subject?: string | null
          target_value?: number | null
        }
        Update: {
          active?: boolean | null
          challenge_type?: string | null
          created_at?: string | null
          date?: string
          id?: string
          reward_points?: number | null
          subject?: string | null
          target_value?: number | null
        }
        Relationships: []
      }
      daily_performance: {
        Row: {
          accuracy: number | null
          created_at: string | null
          date: string
          energy_level: number | null
          id: string
          questions_attempted: number | null
          questions_correct: number | null
          study_time_minutes: number | null
          subjects_covered: string[] | null
          topics_completed: string[] | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          date: string
          energy_level?: number | null
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          study_time_minutes?: number | null
          subjects_covered?: string[] | null
          topics_completed?: string[] | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          study_time_minutes?: number | null
          subjects_covered?: string[] | null
          topics_completed?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          accuracy_7day: number | null
          created_at: string | null
          daily_target: number | null
          date: string | null
          id: string
          questions_completed: number | null
          target_met: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy_7day?: number | null
          created_at?: string | null
          daily_target?: number | null
          date?: string | null
          id?: string
          questions_completed?: number | null
          target_met?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy_7day?: number | null
          created_at?: string | null
          daily_target?: number | null
          date?: string | null
          id?: string
          questions_completed?: number | null
          target_met?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_progress_log: {
        Row: {
          actual_minutes: number | null
          adherence_percentage: number | null
          created_at: string | null
          date: string
          id: string
          planned_minutes: number | null
          topics_completed: number | null
          topics_planned: number | null
          user_id: string | null
        }
        Insert: {
          actual_minutes?: number | null
          adherence_percentage?: number | null
          created_at?: string | null
          date: string
          id?: string
          planned_minutes?: number | null
          topics_completed?: number | null
          topics_planned?: number | null
          user_id?: string | null
        }
        Update: {
          actual_minutes?: number | null
          adherence_percentage?: number | null
          created_at?: string | null
          date?: string
          id?: string
          planned_minutes?: number | null
          topics_completed?: number | null
          topics_planned?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          ai_queries_used: number | null
          chapters_accessed: string[] | null
          created_at: string | null
          date: string
          id: string
          questions_attempted: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_queries_used?: number | null
          chapters_accessed?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          questions_attempted?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_queries_used?: number | null
          chapters_accessed?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          questions_attempted?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exam_config: {
        Row: {
          exam_date: string
          exam_name: string
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          exam_date: string
          exam_name: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          exam_date?: string
          exam_name?: string
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      extracted_questions_queue: {
        Row: {
          created_at: string | null
          id: string
          page_number: number | null
          parsed_question: Json
          raw_text: string | null
          review_notes: string | null
          reviewed_by: string | null
          source_file: string
          source_file_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_number?: number | null
          parsed_question?: Json
          raw_text?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          source_file: string
          source_file_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_number?: number | null
          parsed_question?: Json
          raw_text?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          source_file?: string
          source_file_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      free_content_limits: {
        Row: {
          description: string | null
          id: string
          limit_type: string
          limit_value: number
        }
        Insert: {
          description?: string | null
          id?: string
          limit_type: string
          limit_value: number
        }
        Update: {
          description?: string | null
          id?: string
          limit_type?: string
          limit_value?: number
        }
        Relationships: []
      }
      mock_test_schedule: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          scheduled_date: string
          score: number | null
          subjects: string[] | null
          test_type: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          scheduled_date: string
          score?: number | null
          subjects?: string[] | null
          test_type?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          scheduled_date?: string
          score?: number | null
          subjects?: string[] | null
          test_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          payment_method: string | null
          plan_duration: number
          plan_id: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          payment_method?: string | null
          plan_duration: number
          plan_id: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          payment_method?: string | null
          plan_duration?: number
          plan_id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_patterns: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          identified_date: string | null
          pattern_type: string
          resolved: boolean | null
          severity: string | null
          subject: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          identified_date?: string | null
          pattern_type: string
          resolved?: boolean | null
          severity?: string | null
          subject?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          identified_date?: string | null
          pattern_type?: string
          resolved?: boolean | null
          severity?: string | null
          subject?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      points_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          answer_streak: number | null
          avatar_url: string | null
          badges: Json | null
          city: string | null
          correct_answers: number | null
          created_at: string | null
          current_streak: number | null
          daily_goal: number | null
          daily_question_limit: number | null
          daily_streak: number | null
          daily_study_hours: number | null
          days_completed: number | null
          email: string
          exam_mode: boolean | null
          full_name: string | null
          goals_set: boolean | null
          grade: number | null
          id: string
          is_eligible: boolean | null
          is_premium: boolean | null
          is_pro: boolean | null
          last_activity_date: string | null
          level: string | null
          level_progress: number | null
          longest_answer_streak: number | null
          longest_streak: number | null
          onboarding_completed: boolean | null
          overall_accuracy: number | null
          phone: string | null
          premium_until: string | null
          rank_position: number | null
          state: string | null
          streak_freeze_available: boolean | null
          study_planner_enabled: boolean | null
          subjects: string[] | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          target_exam: string | null
          target_exam_date: string | null
          total_points: number | null
          total_questions_answered: number | null
          total_questions_solved: number | null
          total_streak_days: number | null
          total_study_time: number | null
          updated_at: string | null
        }
        Insert: {
          answer_streak?: number | null
          avatar_url?: string | null
          badges?: Json | null
          city?: string | null
          correct_answers?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal?: number | null
          daily_question_limit?: number | null
          daily_streak?: number | null
          daily_study_hours?: number | null
          days_completed?: number | null
          email: string
          exam_mode?: boolean | null
          full_name?: string | null
          goals_set?: boolean | null
          grade?: number | null
          id: string
          is_eligible?: boolean | null
          is_premium?: boolean | null
          is_pro?: boolean | null
          last_activity_date?: string | null
          level?: string | null
          level_progress?: number | null
          longest_answer_streak?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          overall_accuracy?: number | null
          phone?: string | null
          premium_until?: string | null
          rank_position?: number | null
          state?: string | null
          streak_freeze_available?: boolean | null
          study_planner_enabled?: boolean | null
          subjects?: string[] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          target_exam?: string | null
          target_exam_date?: string | null
          total_points?: number | null
          total_questions_answered?: number | null
          total_questions_solved?: number | null
          total_streak_days?: number | null
          total_study_time?: number | null
          updated_at?: string | null
        }
        Update: {
          answer_streak?: number | null
          avatar_url?: string | null
          badges?: Json | null
          city?: string | null
          correct_answers?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal?: number | null
          daily_question_limit?: number | null
          daily_streak?: number | null
          daily_study_hours?: number | null
          days_completed?: number | null
          email?: string
          exam_mode?: boolean | null
          full_name?: string | null
          goals_set?: boolean | null
          grade?: number | null
          id?: string
          is_eligible?: boolean | null
          is_premium?: boolean | null
          is_pro?: boolean | null
          last_activity_date?: string | null
          level?: string | null
          level_progress?: number | null
          longest_answer_streak?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          overall_accuracy?: number | null
          phone?: string | null
          premium_until?: string | null
          rank_position?: number | null
          state?: string | null
          streak_freeze_available?: boolean | null
          study_planner_enabled?: boolean | null
          subjects?: string[] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          target_exam?: string | null
          target_exam_date?: string | null
          total_points?: number | null
          total_questions_answered?: number | null
          total_questions_solved?: number | null
          total_streak_days?: number | null
          total_study_time?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempted_at: string | null
          created_at: string | null
          difficulty_level: number | null
          energy_state: string | null
          id: string
          is_correct: boolean
          last_attempt_at: string | null
          mode: string | null
          question_id: string
          selected_option: string
          time_spent: number | null
          time_taken: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          energy_state?: string | null
          id?: string
          is_correct: boolean
          last_attempt_at?: string | null
          mode?: string | null
          question_id: string
          selected_option: string
          time_spent?: number | null
          time_taken?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          energy_state?: string | null
          id?: string
          is_correct?: boolean
          last_attempt_at?: string | null
          mode?: string | null
          question_id?: string
          selected_option?: string
          time_spent?: number | null
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
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          chapter: string
          chapter_id: string | null
          correct_option: string
          created_at: string | null
          difficulty: string
          exam: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_type: string
          subject: string
          subtopic: string | null
          topic: string
          topic_id: string | null
          year: number | null
        }
        Insert: {
          chapter: string
          chapter_id?: string | null
          correct_option: string
          created_at?: string | null
          difficulty: string
          exam?: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_type?: string
          subject: string
          subtopic?: string | null
          topic: string
          topic_id?: string | null
          year?: number | null
        }
        Update: {
          chapter?: string
          chapter_id?: string | null
          correct_option?: string
          created_at?: string | null
          difficulty?: string
          exam?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          question_type?: string
          subject?: string
          subtopic?: string | null
          topic?: string
          topic_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string | null
          reward_granted: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      revision_queue: {
        Row: {
          chapter: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          review_number: number | null
          scheduled_date: string
          subject: string
          topic: string
          user_id: string | null
        }
        Insert: {
          chapter: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          review_number?: number | null
          scheduled_date: string
          subject: string
          topic: string
          user_id?: string | null
        }
        Update: {
          chapter?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          review_number?: number | null
          scheduled_date?: string
          subject?: string
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      revision_schedule: {
        Row: {
          chapter: string | null
          created_at: string | null
          id: string
          last_studied_at: string
          next_revision_at: string
          retention_score: number | null
          revision_count: number | null
          subject: string
          topic: string | null
          user_id: string | null
        }
        Insert: {
          chapter?: string | null
          created_at?: string | null
          id?: string
          last_studied_at: string
          next_revision_at: string
          retention_score?: number | null
          revision_count?: number | null
          subject: string
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          chapter?: string | null
          created_at?: string | null
          id?: string
          last_studied_at?: string
          next_revision_at?: string
          retention_score?: number | null
          revision_count?: number | null
          subject?: string
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_profile: {
        Row: {
          average_study_time: number | null
          created_at: string | null
          id: string
          learning_style: string | null
          peak_performance_hours: string | null
          target_exam_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_study_time?: number | null
          created_at?: string | null
          id?: string
          learning_style?: string | null
          peak_performance_hours?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_study_time?: number | null
          created_at?: string | null
          id?: string
          learning_style?: string | null
          peak_performance_hours?: string | null
          target_exam_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_plan_metadata: {
        Row: {
          completed_topics: number | null
          daily_target_topics: number | null
          id: string
          in_progress_topics: number | null
          last_generated_at: string | null
          next_update_at: string | null
          pending_topics: number | null
          plan_adherence_percentage: number | null
          total_topics: number | null
          user_id: string | null
        }
        Insert: {
          completed_topics?: number | null
          daily_target_topics?: number | null
          id?: string
          in_progress_topics?: number | null
          last_generated_at?: string | null
          next_update_at?: string | null
          pending_topics?: number | null
          plan_adherence_percentage?: number | null
          total_topics?: number | null
          user_id?: string | null
        }
        Update: {
          completed_topics?: number | null
          daily_target_topics?: number | null
          id?: string
          in_progress_topics?: number | null
          last_generated_at?: string | null
          next_update_at?: string | null
          pending_topics?: number | null
          plan_adherence_percentage?: number | null
          total_topics?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          ai_metrics: Json | null
          completion_status: number | null
          created_at: string | null
          date: string | null
          id: string
          last_updated: string | null
          next_refresh_time: string | null
          performance: Json | null
          plan_type: string | null
          recommendations: Json | null
          study_goals: Json | null
          subjects: Json | null
          total_study_time: number | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          ai_metrics?: Json | null
          completion_status?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          last_updated?: string | null
          next_refresh_time?: string | null
          performance?: Json | null
          plan_type?: string | null
          recommendations?: Json | null
          study_goals?: Json | null
          subjects?: Json | null
          total_study_time?: number | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          ai_metrics?: Json | null
          completion_status?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          last_updated?: string | null
          next_refresh_time?: string | null
          performance?: Json | null
          plan_type?: string | null
          recommendations?: Json | null
          study_goals?: Json | null
          subjects?: Json | null
          total_study_time?: number | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      study_schedule: {
        Row: {
          activity_type: string | null
          allocated_minutes: number | null
          chapter: string | null
          completed_minutes: number | null
          created_at: string | null
          date: string
          id: string
          status: string | null
          subject: string
          topic: string | null
          user_id: string | null
        }
        Insert: {
          activity_type?: string | null
          allocated_minutes?: number | null
          chapter?: string | null
          completed_minutes?: number | null
          created_at?: string | null
          date: string
          id?: string
          status?: string | null
          subject: string
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string | null
          allocated_minutes?: number | null
          chapter?: string | null
          completed_minutes?: number | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          subject?: string
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      syllabus_master: {
        Row: {
          average_time_hours: number | null
          chapter: string
          created_at: string | null
          difficulty: string | null
          id: string
          prerequisites: string | null
          subject: string
          topic: string
          weightage: number | null
        }
        Insert: {
          average_time_hours?: number | null
          chapter: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          prerequisites?: string | null
          subject: string
          topic: string
          weightage?: number | null
        }
        Update: {
          average_time_hours?: number | null
          chapter?: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          prerequisites?: string | null
          subject?: string
          topic?: string
          weightage?: number | null
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          created_at: string | null
          id: string
          score: number | null
          started_at: string | null
          subject: string
          total_questions: number
          total_time: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers: number
          created_at?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          subject: string
          total_questions: number
          total_time?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          subject?: string
          total_questions?: number
          total_time?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_dependencies: {
        Row: {
          difficulty_multiplier: number | null
          id: string
          requires_topics: string[] | null
          subject: string
          topic: string
        }
        Insert: {
          difficulty_multiplier?: number | null
          id?: string
          requires_topics?: string[] | null
          subject: string
          topic: string
        }
        Update: {
          difficulty_multiplier?: number | null
          id?: string
          requires_topics?: string[] | null
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      topic_mastery: {
        Row: {
          accuracy: number | null
          chapter: string
          created_at: string | null
          current_level: number | null
          id: string
          last_practiced: string | null
          mastery_date: string | null
          questions_attempted: number | null
          stuck_days: number | null
          subject: string
          topic: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          chapter: string
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_practiced?: string | null
          mastery_date?: string | null
          questions_attempted?: number | null
          stuck_days?: number | null
          subject: string
          topic: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          chapter?: string
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_practiced?: string | null
          mastery_date?: string | null
          questions_attempted?: number | null
          stuck_days?: number | null
          subject?: string
          topic?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      topic_priorities: {
        Row: {
          chapter: string | null
          id: string
          last_updated: string | null
          priority_score: number | null
          questions_completed: number | null
          questions_required: number | null
          reason: string | null
          status: string | null
          subject: string
          target_date: string | null
          topic: string
          user_id: string | null
        }
        Insert: {
          chapter?: string | null
          id?: string
          last_updated?: string | null
          priority_score?: number | null
          questions_completed?: number | null
          questions_required?: number | null
          reason?: string | null
          status?: string | null
          subject: string
          target_date?: string | null
          topic: string
          user_id?: string | null
        }
        Update: {
          chapter?: string | null
          id?: string
          last_updated?: string | null
          priority_score?: number | null
          questions_completed?: number | null
          questions_required?: number | null
          reason?: string | null
          status?: string | null
          subject?: string
          target_date?: string | null
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          chapter_id: string | null
          concepts: string[] | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_time: number | null
          id: string
          important_points: string[] | null
          is_free: boolean | null
          is_premium: boolean | null
          key_formulas: string[] | null
          order_index: number | null
          topic_name: string
          topic_number: number | null
        }
        Insert: {
          chapter_id?: string | null
          concepts?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          id?: string
          important_points?: string[] | null
          is_free?: boolean | null
          is_premium?: boolean | null
          key_formulas?: string[] | null
          order_index?: number | null
          topic_name: string
          topic_number?: number | null
        }
        Update: {
          chapter_id?: string | null
          concepts?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          id?: string
          important_points?: string[] | null
          is_free?: boolean | null
          is_premium?: boolean | null
          key_formulas?: string[] | null
          order_index?: number | null
          topic_name?: string
          topic_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          id: string
          last_reset_date: string | null
          mock_tests_this_month: number | null
          questions_today: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_reset_date?: string | null
          mock_tests_this_month?: number | null
          questions_today?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_reset_date?: string | null
          mock_tests_this_month?: number | null
          questions_today?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_access: {
        Row: {
          accessed_at: string | null
          content_identifier: string
          content_type: string
          id: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          content_identifier: string
          content_type: string
          id?: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          content_identifier?: string
          content_type?: string
          id?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_energy_logs: {
        Row: {
          accuracy: number | null
          auto_rest_suggested: boolean | null
          burnout_signals: string[] | null
          created_at: string | null
          date: string
          energy_score: number | null
          id: string
          questions_attempted: number | null
          study_hours: number | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          auto_rest_suggested?: boolean | null
          burnout_signals?: string[] | null
          created_at?: string | null
          date: string
          energy_score?: number | null
          id?: string
          questions_attempted?: number | null
          study_hours?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          auto_rest_suggested?: boolean | null
          burnout_signals?: string[] | null
          created_at?: string | null
          date?: string
          energy_score?: number | null
          id?: string
          questions_attempted?: number | null
          study_hours?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          accuracy_at_current_level: number
          created_at: string | null
          current_level: number
          id: string
          level_upgraded_at: string | null
          questions_at_current_level: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_at_current_level?: number
          created_at?: string | null
          current_level?: number
          id?: string
          level_upgraded_at?: string | null
          questions_at_current_level?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_at_current_level?: number
          created_at?: string | null
          current_level?: number
          id?: string
          level_upgraded_at?: string | null
          questions_at_current_level?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          notification_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "admin_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rankings: {
        Row: {
          accuracy: number | null
          cohort: string | null
          created_at: string | null
          date: string
          percentile: number | null
          questions_solved: number | null
          rank: number | null
          study_time_minutes: number | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          cohort?: string | null
          created_at?: string | null
          date: string
          percentile?: number | null
          questions_solved?: number | null
          rank?: number | null
          study_time_minutes?: number | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          cohort?: string | null
          created_at?: string | null
          date?: string
          percentile?: number | null
          questions_solved?: number | null
          rank?: number | null
          study_time_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          eligibility_criteria: Json
          id: string
          is_claimed: boolean | null
          is_eligible: boolean | null
          reward_name: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          eligibility_criteria: Json
          id?: string
          is_claimed?: boolean | null
          is_eligible?: boolean | null
          reward_name: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          eligibility_criteria?: Json
          id?: string
          is_claimed?: boolean | null
          is_eligible?: boolean | null
          reward_name?: string
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          payment_id: string | null
          plan_id: string | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          payment_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          payment_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_topic_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      weakness_analysis: {
        Row: {
          accuracy_percentage: number | null
          attempts_count: number | null
          avg_time_seconds: number | null
          chapter: string | null
          id: string
          last_attempt_at: string | null
          last_calculated: string | null
          subject: string
          topic: string | null
          user_id: string | null
          weakness_score: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          attempts_count?: number | null
          avg_time_seconds?: number | null
          chapter?: string | null
          id?: string
          last_attempt_at?: string | null
          last_calculated?: string | null
          subject: string
          topic?: string | null
          user_id?: string | null
          weakness_score?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          attempts_count?: number | null
          avg_time_seconds?: number | null
          chapter?: string | null
          id?: string
          last_attempt_at?: string | null
          last_calculated?: string | null
          subject?: string
          topic?: string | null
          user_id?: string | null
          weakness_score?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      questions_safe: {
        Row: {
          chapter: string | null
          created_at: string | null
          difficulty: string | null
          exam: string | null
          id: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question: string | null
          subject: string | null
          topic: string | null
          year: number | null
        }
        Insert: {
          chapter?: string | null
          created_at?: string | null
          difficulty?: string | null
          exam?: string | null
          id?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          subject?: string | null
          topic?: string | null
          year?: number | null
        }
        Update: {
          chapter?: string | null
          created_at?: string | null
          difficulty?: string | null
          exam?: string | null
          id?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          subject?: string | null
          topic?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_points: {
        Args: {
          p_action: string
          p_description?: string
          p_points: number
          p_user_id: string
        }
        Returns: undefined
      }
      check_ai_rate_limit: { Args: { p_user_id: string }; Returns: boolean }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ai_usage: { Args: { p_user_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_user_premium: { Args: { p_user_id: string }; Returns: boolean }
      validate_question_answer: {
        Args: { _question_id: string; _user_answer: string }
        Returns: {
          attempt_id: string
          correct_option: string
          explanation: string
          is_correct: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_role: "admin" | "user" | "premium"
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
      user_role: ["admin", "user", "premium"],
    },
  },
} as const
