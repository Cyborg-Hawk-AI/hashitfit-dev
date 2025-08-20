
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

      // First, update the user profile to mark assessment as completed
      console.log('PlanGenerationService: Updating user profile...')
      const fitnessGoalMapping = {
        'muscle_gain': 'muscle_gain',
        'weight_loss': 'weight_loss', 
        'endurance': 'endurance',
        'sport_specific': 'sports_performance',
        'general_fitness': 'general_fitness'
      }

      const equipmentMapping = {
        'full_gym': 'full_gym',
        'home_gym': 'home_gym',
        'minimal': 'minimal',
        'bodyweight_only': 'bodyweight',
        'none': 'none'
      }

      const mappedFitnessGoal = fitnessGoalMapping[assessmentData.fitnessGoal] || 'general_fitness'
      const mappedEquipment = equipmentMapping[assessmentData.equipment] || 'minimal'

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          has_completed_assessment: true,
          name: assessmentData.name,
          fitness_goal: mappedFitnessGoal,
          workout_frequency: assessmentData.workoutFrequency,
          diet: assessmentData.diet,
          equipment: mappedEquipment,
          sports_played: assessmentData.sportsPlayed,
          allergies: assessmentData.allergies,
          age: assessmentData.age,
          gender: assessmentData.gender,
          height: assessmentData.height,
          weight: assessmentData.weight
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      } else {
        console.log('Profile updated successfully')
      }

      // Store assessment data
      console.log('PlanGenerationService: Storing assessment data...')
      const { error: assessmentError } = await supabase
        .from('assessment_data')
        .insert({
          user_id: user.id,
          age: assessmentData.age,
          gender: assessmentData.gender,
          height: assessmentData.height,
          weight: assessmentData.weight,
          fitness_goal: assessmentData.fitnessGoal,
          workout_frequency: assessmentData.workoutFrequency,
          diet: assessmentData.diet,
          equipment: assessmentData.equipment,
          sports_played: assessmentData.sportsPlayed,
          allergies: assessmentData.allergies
        })

      if (assessmentError) {
        console.error('Error storing assessment data:', assessmentError)
      } else {
        console.log('Assessment data stored successfully')
      }

      // Call all three Edge Functions in parallel
      console.log('PlanGenerationService: Calling all three assistants in parallel...')
      
      const [workoutResponse, nutritionResponse, recommendationsResponse] = await Promise.allSettled([
        supabase.functions.invoke('workout-assistant', {
          body: {
            user_id: user.id,
            assessment: assessmentData
          }
        }),
        supabase.functions.invoke('nutrition-assistant', {
          body: {
            user_id: user.id,
            assessment: assessmentData
          }
        }),
        supabase.functions.invoke('recommendations-assistant', {
          body: {
            user_id: user.id,
            assessment: assessmentData
          }
        })
      ])

      console.log('PlanGenerationService: All Edge Functions completed')

      // Process results
      let workoutPlans = 0
      let nutritionPlan = null
      let recommendations = null
      let successCount = 0
      let warning = ''

      // Process workout response
      if (workoutResponse.status === 'fulfilled' && workoutResponse.value.data?.success) {
        workoutPlans = workoutResponse.value.data.data?.workout_plans || 0
        successCount++
        console.log('Workout assistant completed successfully')
      } else {
        console.error('Workout assistant failed:', workoutResponse.status === 'rejected' ? workoutResponse.reason : workoutResponse.value?.error)
      }

      // Process nutrition response
      if (nutritionResponse.status === 'fulfilled' && nutritionResponse.value.data?.success) {
        nutritionPlan = nutritionResponse.value.data.data?.nutrition_plan || null
        successCount++
        console.log('Nutrition assistant completed successfully')
      } else {
        console.error('Nutrition assistant failed:', nutritionResponse.status === 'rejected' ? nutritionResponse.reason : nutritionResponse.value?.error)
      }

      // Process recommendations response
      if (recommendationsResponse.status === 'fulfilled' && recommendationsResponse.value.data?.success) {
        recommendations = recommendationsResponse.value.data.data?.recommendations || null
        successCount++
        console.log('Recommendations assistant completed successfully')
      } else {
        console.error('Recommendations assistant failed:', recommendationsResponse.status === 'rejected' ? recommendationsResponse.reason : recommendationsResponse.value?.error)
      }

      // Generate warning if not all assistants succeeded
      if (successCount < 3) {
        warning = `Some components may be incomplete. ${successCount}/3 assistants completed successfully.`
      }

      console.log('PlanGenerationService: Final results -', {
        workoutPlans,
        nutritionPlan,
        recommendations,
        successCount,
        warning
      })

      return {
        success: true,
        message: 'HashimFit fitness plan generated and stored successfully',
        warning: warning || undefined,
        data: {
          workout_plans: workoutPlans,
          nutrition_plan: nutritionPlan ? 'Generated' : null,
          recommendations: recommendations ? 'Generated' : null
        }
      }

    } catch (error) {
      console.error('PlanGenerationService: Error generating fitness plan:', error)
      throw error
    }
  }
}
