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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      kuppi_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          session_id: string
          student_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          session_id: string
          student_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuppi_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "kuppi_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kuppi_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kuppi_notices: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          google_form_url: string | null
          id: string
          module_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          google_form_url?: string | null
          id?: string
          module_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          google_form_url?: string | null
          id?: string
          module_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuppi_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kuppi_notices_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kuppi_recordings: {
        Row: {
          file_url: string
          id: string
          session_id: string
          title: string
          uploaded_at: string
        }
        Insert: {
          file_url: string
          id?: string
          session_id: string
          title: string
          uploaded_at?: string
        }
        Update: {
          file_url?: string
          id?: string
          session_id?: string
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuppi_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "kuppi_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      kuppi_registrations: {
        Row: {
          id: string
          notice_id: string
          registered_at: string
          student_email: string
          student_id: string | null
          student_name: string
        }
        Insert: {
          id?: string
          notice_id: string
          registered_at?: string
          student_email: string
          student_id?: string | null
          student_name: string
        }
        Update: {
          id?: string
          notice_id?: string
          registered_at?: string
          student_email?: string
          student_id?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuppi_registrations_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "kuppi_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kuppi_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kuppi_sessions: {
        Row: {
          covered_parts: string | null
          created_at: string
          id: string
          meeting_link: string
          meeting_room_name: string | null
          meeting_room_url: string | null
          notice_id: string
          organizer_id: string
          platform: string
          recording_status: string | null
          reminder_sent: boolean | null
          session_date: string
          session_time: string
        }
        Insert: {
          covered_parts?: string | null
          created_at?: string
          id?: string
          meeting_link: string
          meeting_room_name?: string | null
          meeting_room_url?: string | null
          notice_id: string
          organizer_id: string
          platform: string
          recording_status?: string | null
          reminder_sent?: boolean | null
          session_date: string
          session_time: string
        }
        Update: {
          covered_parts?: string | null
          created_at?: string
          id?: string
          meeting_link?: string
          meeting_room_name?: string | null
          meeting_room_url?: string | null
          notice_id?: string
          organizer_id?: string
          platform?: string
          recording_status?: string | null
          reminder_sent?: boolean | null
          session_date?: string
          session_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuppi_sessions_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "kuppi_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kuppi_sessions_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          module_code: string
          module_name: string
          semester: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          module_code: string
          module_name: string
          semester: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          module_code?: string
          module_name?: string
          semester?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_semester: number | null
          current_year: number | null
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_semester?: number | null
          current_year?: number | null
          id: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_semester?: number | null
          current_year?: number | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      student_modules: {
        Row: {
          created_at: string
          enrolled_semester: string | null
          id: string
          module_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          enrolled_semester?: string | null
          id?: string
          module_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          enrolled_semester?: string | null
          id?: string
          module_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_modules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "student" | "organizer"
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
      app_role: ["student", "organizer"],
    },
  },
} as const
