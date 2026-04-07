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
      content_types: {
        Row: {
          id: number
          label: string
          slug: string
        }
        Insert: {
          id?: number
          label: string
          slug: string
        }
        Update: {
          id?: number
          label?: string
          slug?: string
        }
        Relationships: []
      }
      designations: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          author_id: string
          created_at: string
          description: string
          end_time: string
          id: string
          image_alt: string | null
          image_url: string | null
          is_archived: boolean
          is_featured: boolean
          is_published: boolean
          location: string
          posted_by: number
          slug: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string
          description: string
          end_time: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          location: string
          posted_by: number
          slug: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string
          end_time?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          location?: string
          posted_by?: number
          slug?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string
          content: string | null
          created_at: string
          date: string
          description: string
          id: string
          image_alt: string
          image_url: string
          is_archived: boolean
          is_featured: boolean
          is_published: boolean
          posted_by: number
          slug: string
          title: string
          types_id: number
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          image_alt: string
          image_url: string
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          posted_by: number
          slug: string
          title: string
          types_id: number
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_alt?: string
          image_url?: string
          is_archived?: boolean
          is_featured?: boolean
          is_published?: boolean
          posted_by?: number
          slug?: string
          title?: string
          types_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_types_id_fkey"
            columns: ["types_id"]
            isOneToOne: false
            referencedRelation: "content_types"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          contact_number: string
          created_at: string
          designation_id: number | null
          education: Json
          email: string
          employee_id: string
          id: string
          is_active: boolean
          must_change_password: boolean
          name: string
          office: string
          profile_picture_url: string | null
          rank_id: number
          social_media: Json
          updated_at: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          designation_id?: number | null
          education?: Json
          email: string
          employee_id: string
          id: string
          is_active?: boolean
          must_change_password?: boolean
          name: string
          office: string
          profile_picture_url?: string | null
          rank_id: number
          social_media?: Json
          updated_at?: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          designation_id?: number | null
          education?: Json
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          name?: string
          office?: string
          profile_picture_url?: string | null
          rank_id?: number
          social_media?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personnel_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: number
          role_name: string
        }
        Insert: {
          id: number
          role_name: string
        }
        Update: {
          id?: number
          role_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_or_faculty: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
