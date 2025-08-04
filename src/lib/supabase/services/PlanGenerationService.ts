
import supabase from '@/lib/supabase';

export interface AssessmentData {
  name: string;
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
      console.log('Calling analyze-fitness-assessment Edge Function with data:', assessmentData);
      
      // Get the current user ID from the session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const { data, error } = await supabase.functions.invoke<PlanGenerationResponse>('analyze-fitness-assessment', {
        body: {
          user_id: user.id,
          assessment: assessmentData
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to generate fitness plan');
      }

      if (!data) {
        throw new Error('No response from plan generation function');
      }

      console.log('Plan generation response:', data);
      
      // The analyze-fitness-assessment function returns the data directly
      // We need to wrap it in a success format for the frontend
      const rawData = data as any; // Type assertion for the raw response
      return {
        success: true,
        message: 'Fitness plan generated successfully',
        data: {
          workout_plans: rawData.workout_plans?.length || 0,
          nutrition_plan: rawData.nutrition_plan ? 'Generated' : 'Not generated',
          recommendations: {
            workout_tips: rawData.recommendations?.[0] || '',
            nutrition_tips: rawData.recommendations?.[1] || '',
            weekly_goals: rawData.recommendations?.[2] || ''
          }
        }
      };
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
        
        // Try to create a profile automatically
        console.log('🔍 PlanGenerationService: Attempting to create missing profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: '',
            age: 30,
            gender: 'male',
            height: 175,
            weight: 75,
            fitness_goal: 'muscle_gain',
            workout_frequency: 3,
            diet: 'standard',
            equipment: 'full_gym',
            has_completed_assessment: false
          })
          .select('has_completed_assessment')
          .single();

        if (createError) {
          console.error('🔍 PlanGenerationService: Error creating profile:', createError);
          return false;
        }

        console.log('🔍 PlanGenerationService: Profile created successfully:', newProfile);
        return newProfile?.has_completed_assessment || false;
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
