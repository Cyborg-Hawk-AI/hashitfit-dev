
import supabase from '../../supabase'

export interface AssessmentData {
  name: string
  age: number
  gender: string
  height: number
  weight: number
  fitnessGoal: string
  workoutFrequency: number
  diet: string
  equipment: string
  sportsPlayed: string[]
  allergies: string[]
}

export interface PlanGenerationResponse {
  success: boolean
  message: string
  warning?: string
  data: {
    workout_plans: number
    nutrition_plan: string | null
    recommendations: string | null
  }
}

export class PlanGenerationService {
  static async checkUserPlanStatus(userId: string): Promise<boolean> {
    try {
      console.log('PlanGenerationService: Starting checkUserPlanStatus for userId:', userId)
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('has_completed_assessment')
        .eq('id', userId)

      console.log('PlanGenerationService: Supabase query result - profiles:', profiles)
      console.log('PlanGenerationService: Supabase query result - error:', error)

      if (error) {
        console.error('Error checking profile status:', error)
        return false
      }

      if (!profiles || profiles.length === 0) {
        console.log('PlanGenerationService: No profiles found for userId:', userId)
        // Auto-create a default profile if none exists
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            has_completed_assessment: false
          })
        
        if (createError) {
          console.error('Error creating default profile:', createError)
        } else {
          console.log('PlanGenerationService: Created default profile for userId:', userId)
        }
        return false
      }

      console.log('PlanGenerationService: Found', profiles.length, 'profile(s) for userId:', userId)
      
      // Use the first profile if multiple exist
      const profile = profiles[0]
      console.log('PlanGenerationService: Using first profile:', profile)
      
      const hasCompleted = profile.has_completed_assessment
      console.log('PlanGenerationService: has_completed_assessment value:', hasCompleted)
      
      return hasCompleted
    } catch (error) {
      console.error('Error checking profile status:', error)
      return false
    }
  }

  static async generateFitnessPlan(assessmentData: AssessmentData): Promise<PlanGenerationResponse> {
    try {
      console.log('PlanGenerationService: Starting generateFitnessPlan with data:', assessmentData)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const response = await supabase.functions.invoke('analyze-fitness-assessment', {
        body: {
          user_id: user.id,
          assessment: assessmentData
        }
      })

      console.log('PlanGenerationService: Edge Function response:', response)

      if (response.error) {
        console.error('PlanGenerationService: Edge Function error:', response.error)
        throw new Error(`Edge Function error: ${response.error.message}`)
      }

      if (!response.data) {
        throw new Error('No data received from Edge Function')
      }

      // The analyze-fitness-assessment function returns the data directly
      const result = response.data as PlanGenerationResponse
      
      console.log('PlanGenerationService: Parsed result:', result)
      
      return result
    } catch (error) {
      console.error('PlanGenerationService: Error generating fitness plan:', error)
      throw error
    }
  }
}
