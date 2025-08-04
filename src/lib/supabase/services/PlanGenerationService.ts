
import supabase from '@/lib/supabase';

export interface AssessmentData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: string;
  workoutFrequency: number;
  diet: string;
  equipment: string;
  sportsPlayed?: string[];
  allergies?: string[];
}

export interface PlanGenerationResponse {
  success: boolean;
  message: string;
  data?: {
    workout_plans: number;
    nutrition_plan: string;
    recommendations: {
      workout_tips: string;
      nutrition_tips: string;
      weekly_goals: string;
    };
  };
  error?: string;
}

export class PlanGenerationService {
  static async generateFitnessPlan(assessmentData: AssessmentData): Promise<PlanGenerationResponse> {
    try {
      console.log('Calling generate-workout-plan Edge Function with data:', assessmentData);
      
      const { data, error } = await supabase.functions.invoke<PlanGenerationResponse>('generate-workout-plan', {
        body: assessmentData,
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to generate fitness plan');
      }

      if (!data) {
        throw new Error('No response from plan generation function');
      }

      console.log('Plan generation response:', data);
      return data;
    } catch (error) {
      console.error('Error calling plan generation service:', error);
      throw error;
    }
  }

  static async checkUserPlanStatus(userId: string): Promise<boolean> {
    try {
      console.log('🔍 PlanGenerationService: Starting checkUserPlanStatus for userId:', userId);
      
      // Use maybeSingle() to handle cases where there might be multiple profile rows
      console.log('🔍 PlanGenerationService: Querying profiles table for userId:', userId);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('has_completed_assessment')
        .eq('id', userId);

      console.log('🔍 PlanGenerationService: Supabase query result - profiles:', profiles);
      console.log('🔍 PlanGenerationService: Supabase query result - error:', error);

      if (error) {
        console.error('🔍 PlanGenerationService: Error checking plan status:', error);
        return false;
      }

      // If no profiles found, user hasn't completed assessment
      if (!profiles || profiles.length === 0) {
        console.log('🔍 PlanGenerationService: No profiles found for userId:', userId);
        return false;
      }

      console.log('🔍 PlanGenerationService: Found', profiles.length, 'profile(s) for userId:', userId);
      
      // If multiple profiles found, use the first one (most recent)
      // This handles the duplicate profile issue
      const profile = profiles[0];
      console.log('🔍 PlanGenerationService: Using first profile:', profile);
      
      const hasCompleted = profile?.has_completed_assessment || false;
      console.log('🔍 PlanGenerationService: has_completed_assessment value:', hasCompleted);
      
      return hasCompleted;
    } catch (error) {
      console.error('🔍 PlanGenerationService: Error checking user plan status:', error);
      return false;
    }
  }
}
