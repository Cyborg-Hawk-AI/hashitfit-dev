export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      assessment_data: {
        Row: {
          age: number
          allergies: string[] | null
          created_at: string | null
          diet: string
          equipment: string
          existing_conditions: string[] | null
          fitness_goal: string
          fitness_level: string | null
          gender: string
          height: number
          id: string
          notes: string | null
          previous_experience: string | null
          sports_played: string[] | null
          updated_at: string | null
          user_id: string
          weight: number
          workout_frequency: number
        }
        Insert: {
          age: number
          allergies?: string[] | null
          created_at?: string | null
          diet: string
          equipment: string
          existing_conditions?: string[] | null
          fitness_goal: string
          fitness_level?: string | null
          gender: string
          height: number
          id?: string
          notes?: string | null
          previous_experience?: string | null
          sports_played?: string[] | null
          updated_at?: string | null
          user_id: string
          weight: number
          workout_frequency: number
        }
        Update: {
          age?: number
          allergies?: string[] | null
          created_at?: string | null
          diet?: string
          equipment?: string
          existing_conditions?: string[] | null
          fitness_goal?: string
          fitness_level?: string | null
          gender?: string
          height?: number
          id?: string
          notes?: string | null
          previous_experience?: string | null
          sports_played?: string[] | null
          updated_at?: string | null
          user_id?: string
          weight?: number
          workout_frequency?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          ai_completion_tokens: number | null
          ai_prompt_tokens: number | null
          ai_response_id: string | null
          content: string
          created_at: string | null
          id: string
          referenced_assessment_id: string | null
          referenced_metric_id: string | null
          referenced_nutrition_id: string | null
          referenced_workout_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          ai_completion_tokens?: number | null
          ai_prompt_tokens?: number | null
          ai_response_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          referenced_assessment_id?: string | null
          referenced_metric_id?: string | null
          referenced_nutrition_id?: string | null
          referenced_workout_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          ai_completion_tokens?: number | null
          ai_prompt_tokens?: number | null
          ai_response_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          referenced_assessment_id?: string | null
          referenced_metric_id?: string | null
          referenced_nutrition_id?: string | null
          referenced_workout_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_referenced_assessment_id_fkey"
            columns: ["referenced_assessment_id"]
            isOneToOne: false
            referencedRelation: "fitness_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_referenced_metric_id_fkey"
            columns: ["referenced_metric_id"]
            isOneToOne: false
            referencedRelation: "progress_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_referenced_nutrition_id_fkey"
            columns: ["referenced_nutrition_id"]
            isOneToOne: false
            referencedRelation: "nutrition_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_referenced_workout_id_fkey"
            columns: ["referenced_workout_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          notes: string | null
          order_index: number
          position_in_workout: number | null
          reps_completed: string
          rest_seconds: number | null
          rest_time: unknown | null
          sets_completed: number
          superset_group_id: string | null
          updated_at: string | null
          weight_used: string | null
          workout_log_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          order_index: number
          position_in_workout?: number | null
          reps_completed: string
          rest_seconds?: number | null
          rest_time?: unknown | null
          sets_completed: number
          superset_group_id?: string | null
          updated_at?: string | null
          weight_used?: string | null
          workout_log_id: string
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number
          position_in_workout?: number | null
          reps_completed?: string
          rest_seconds?: number | null
          rest_time?: unknown | null
          sets_completed?: number
          superset_group_id?: string | null
          updated_at?: string | null
          weight_used?: string | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_assessments: {
        Row: {
          assessment_date: string | null
          bench_press_max: number | null
          created_at: string | null
          deadlift_max: number | null
          flexibility_score: number | null
          id: string
          mile_time: unknown | null
          notes: string | null
          pullups: number | null
          pushups: number | null
          squat_max: number | null
          squats: number | null
          updated_at: string | null
          user_id: string
          vo2_max: number | null
        }
        Insert: {
          assessment_date?: string | null
          bench_press_max?: number | null
          created_at?: string | null
          deadlift_max?: number | null
          flexibility_score?: number | null
          id?: string
          mile_time?: unknown | null
          notes?: string | null
          pullups?: number | null
          pushups?: number | null
          squat_max?: number | null
          squats?: number | null
          updated_at?: string | null
          user_id: string
          vo2_max?: number | null
        }
        Update: {
          assessment_date?: string | null
          bench_press_max?: number | null
          created_at?: string | null
          deadlift_max?: number | null
          flexibility_score?: number | null
          id?: string
          mile_time?: unknown | null
          notes?: string | null
          pullups?: number | null
          pushups?: number | null
          squat_max?: number | null
          squats?: number | null
          updated_at?: string | null
          user_id?: string
          vo2_max?: number | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs_g: number
          consumed_at: string
          created_at: string | null
          fat_g: number
          food_items: Json | null
          id: string
          meal_description: string | null
          meal_image_url: string | null
          meal_title: string
          meal_type: string | null
          notes: string | null
          nutrition_log_id: string
          protein_g: number
          updated_at: string | null
        }
        Insert: {
          calories: number
          carbs_g: number
          consumed_at: string
          created_at?: string | null
          fat_g: number
          food_items?: Json | null
          id?: string
          meal_description?: string | null
          meal_image_url?: string | null
          meal_title: string
          meal_type?: string | null
          notes?: string | null
          nutrition_log_id: string
          protein_g: number
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs_g?: number
          consumed_at?: string
          created_at?: string | null
          fat_g?: number
          food_items?: Json | null
          id?: string
          meal_description?: string | null
          meal_image_url?: string | null
          meal_title?: string
          meal_type?: string | null
          notes?: string | null
          nutrition_log_id?: string
          protein_g?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_nutrition_log_id_fkey"
            columns: ["nutrition_log_id"]
            isOneToOne: false
            referencedRelation: "nutrition_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string | null
          description: string | null
          fat_g: number
          id: string
          meal_title: string
          meal_type: string | null
          nutrition_plan_id: string
          order_index: number
          protein_g: number
          updated_at: string | null
        }
        Insert: {
          calories: number
          carbs_g: number
          created_at?: string | null
          description?: string | null
          fat_g: number
          id?: string
          meal_title: string
          meal_type?: string | null
          nutrition_plan_id: string
          order_index: number
          protein_g: number
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string | null
          description?: string | null
          fat_g?: number
          id?: string
          meal_title?: string
          meal_type?: string | null
          nutrition_plan_id?: string
          order_index?: number
          protein_g?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          notes: string | null
          total_calories: number | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_protein_g: number | null
          updated_at: string | null
          user_id: string
          water_intake_ml: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date: string
          notes?: string | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_protein_g?: number | null
          updated_at?: string | null
          user_id: string
          water_intake_ml?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_protein_g?: number | null
          updated_at?: string | null
          user_id?: string
          water_intake_ml?: number | null
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          ai_generated: boolean | null
          carbs_g: number
          created_at: string | null
          daily_calories: number
          description: string | null
          diet_type: string | null
          fat_g: number
          id: string
          protein_g: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          carbs_g: number
          created_at?: string | null
          daily_calories: number
          description?: string | null
          diet_type?: string | null
          fat_g: number
          id?: string
          protein_g: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          carbs_g?: number
          created_at?: string | null
          daily_calories?: number
          description?: string | null
          diet_type?: string | null
          fat_g?: number
          id?: string
          protein_g?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          allergies: string[] | null
          created_at: string | null
          diet: string | null
          dietary_restrictions: string[] | null
          equipment: string | null
          fitness_goal: string | null
          gender: string | null
          has_completed_assessment: boolean | null
          height: number | null
          id: string
          name: string | null
          profile_image_url: string | null
          sports_played: string[] | null
          target_weight: number | null
          updated_at: string | null
          weight: number | null
          workout_frequency: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          created_at?: string | null
          diet?: string | null
          dietary_restrictions?: string[] | null
          equipment?: string | null
          fitness_goal?: string | null
          gender?: string | null
          has_completed_assessment?: boolean | null
          height?: number | null
          id: string
          name?: string | null
          profile_image_url?: string | null
          sports_played?: string[] | null
          target_weight?: number | null
          updated_at?: string | null
          weight?: number | null
          workout_frequency?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          created_at?: string | null
          diet?: string | null
          dietary_restrictions?: string[] | null
          equipment?: string | null
          fitness_goal?: string | null
          gender?: string | null
          has_completed_assessment?: boolean | null
          height?: number | null
          id?: string
          name?: string | null
          profile_image_url?: string | null
          sports_played?: string[] | null
          target_weight?: number | null
          updated_at?: string | null
          weight?: number | null
          workout_frequency?: number | null
        }
        Relationships: []
      }
      progress_metrics: {
        Row: {
          arm_measurement: number | null
          body_fat_percentage: number | null
          calf_measurement: number | null
          chest_measurement: number | null
          created_at: string | null
          hip_measurement: number | null
          id: string
          measurement_date: string | null
          notes: string | null
          shoulder_measurement: number | null
          thigh_measurement: number | null
          updated_at: string | null
          user_id: string
          waist_measurement: number | null
          weight: number | null
        }
        Insert: {
          arm_measurement?: number | null
          body_fat_percentage?: number | null
          calf_measurement?: number | null
          chest_measurement?: number | null
          created_at?: string | null
          hip_measurement?: number | null
          id?: string
          measurement_date?: string | null
          notes?: string | null
          shoulder_measurement?: number | null
          thigh_measurement?: number | null
          updated_at?: string | null
          user_id: string
          waist_measurement?: number | null
          weight?: number | null
        }
        Update: {
          arm_measurement?: number | null
          body_fat_percentage?: number | null
          calf_measurement?: number | null
          chest_measurement?: number | null
          created_at?: string | null
          hip_measurement?: number | null
          id?: string
          measurement_date?: string | null
          notes?: string | null
          shoulder_measurement?: number | null
          thigh_measurement?: number | null
          updated_at?: string | null
          user_id?: string
          waist_measurement?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications_enabled: boolean | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          units_system: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          units_system?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          units_system?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          reps: string
          rest_time: unknown | null
          sets: number
          updated_at: string | null
          weight: string | null
          workout_plan_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index: number
          reps: string
          rest_time?: unknown | null
          sets: number
          updated_at?: string | null
          weight?: string | null
          workout_plan_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_time?: unknown | null
          sets?: number
          updated_at?: string | null
          weight?: string | null
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          duration: unknown | null
          end_time: string | null
          id: string
          notes: string | null
          rating: number | null
          start_time: string
          updated_at: string | null
          user_id: string
          workout_plan_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          duration?: unknown | null
          end_time?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_time: string
          updated_at?: string | null
          user_id: string
          workout_plan_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          duration?: unknown | null
          end_time?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          ai_generated: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          estimated_duration: unknown | null
          id: string
          target_muscles: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_duration?: unknown | null
          id?: string
          target_muscles?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_duration?: unknown | null
          id?: string
          target_muscles?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_schedule: {
        Row: {
          completion_date: string | null
          created_at: string | null
          duration: unknown | null
          id: string
          is_completed: boolean | null
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          updated_at: string | null
          user_id: string
          workout_log_id: string | null
          workout_plan_id: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          duration?: unknown | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          updated_at?: string | null
          user_id: string
          workout_log_id?: string | null
          workout_plan_id: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          duration?: unknown | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          updated_at?: string | null
          user_id?: string
          workout_log_id?: string | null
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_schedule_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_schedule_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      manage_superset: {
        Args: {
          p_workout_log_id: string
          p_exercise_ids: string[]
          p_superset_group_id?: string
        }
        Returns: string
      }
      remove_from_superset: {
        Args: { p_exercise_id: string }
        Returns: boolean
      }
      reorder_workout_exercises: {
        Args: { p_workout_log_id: string; p_exercise_positions: Json }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
