// Supabase Edge Function to analyze fitness assessment using multi-assistant architecture
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Response interfaces for each assistant
interface WorkoutResponse {
  workout_schedule: Array<{
    week: number
    day: string
    workout_title: string
    description: string
    category: string
    difficulty: number
    estimated_duration: string
    exercises: Array<{
      name: string
      sets: number
      reps: string
      weight: string
      rest_seconds: number
      notes?: string
    }>
  }>
}

interface NutritionResponse {
  nutrition_plan: {
    daily_calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    diet_type: string
    meals: Array<{
      meal_type: string
      meal_title: string
      description: string
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
      day: string
    }>
  }
}

interface RecommendationsResponse {
  recommendations: {
    workout_tips: string
    nutrition_tips: string
    weekly_goals: string
  }
}

// Helper function to call OpenAI Assistant API
async function callAssistant(
  assistantId: string,
  openaiApiKey: string,
  assessmentData: any,
  assistantType: 'workout' | 'nutrition' | 'recommendations' | 'single'
): Promise<any> {
  console.log(`Calling ${assistantType} assistant with ID: ${assistantId?.substring(0, 10)}...`)
  
  try {
    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    if (!threadResponse.ok) {
      throw new Error(`Failed to create thread: ${threadResponse.status}`)
    }

    const thread = await threadResponse.json()
    console.log(`Created thread: ${thread.id}`)

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: `Please generate a personalized ${assistantType} plan based on this assessment data: ${JSON.stringify(assessmentData)}`
      })
    })

    if (!messageResponse.ok) {
      throw new Error(`Failed to add message: ${messageResponse.status}`)
    }

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        response_format: { type: "json_object" }
      })
    })

    if (!runResponse.ok) {
      throw new Error(`Failed to start run: ${runResponse.status}`)
    }

    const run = await runResponse.json()
    console.log(`Started run: ${run.id}`)

    // Poll for completion
    let attempts = 0
    const maxAttempts = 45 // 45 seconds timeout
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      attempts++

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`)
      }

      const runStatus = await statusResponse.json()
      console.log(`Run status: ${runStatus.status}`)

      if (runStatus.status === 'completed') {
        // Get the messages
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        })

        if (!messagesResponse.ok) {
          throw new Error(`Failed to get messages: ${messagesResponse.status}`)
        }

        const messages = await messagesResponse.json()
        const assistantMessage = messages.data[0] // Most recent message

        if (assistantMessage.content && assistantMessage.content[0]?.text?.value) {
          const content = assistantMessage.content[0].text.value
          console.log(`${assistantType} assistant response:`, content)
          
          // Clean and parse JSON
          const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim()
          return JSON.parse(cleanedContent)
        } else {
          throw new Error('No response content from assistant')
        }
      } else if (runStatus.status === 'failed') {
        throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`)
      } else if (runStatus.status === 'expired') {
        throw new Error('Assistant run timed out')
      }
    }

    throw new Error('Assistant run timeout')
  } catch (error) {
    console.error(`Error calling ${assistantType} assistant:`, error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received assessment data:", JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { user_id, assessment } = requestData;
    
    if (!user_id || !assessment) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id or assessment data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get API key and assistant IDs
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const workoutAssistantId = Deno.env.get('OPENAI_ASSISTANT_WORKOUT_ID')
    const nutritionAssistantId = Deno.env.get('OPENAI_ASSISTANT_NUTRITION_ID')
    const recommendationsAssistantId = Deno.env.get('OPENAI_ASSISTANT_RECOMMENDATIONS_ID')
    const singleAssistantId = Deno.env.get('OPENAI_ASSISTANT_ASSESSMENT_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    // Check if we have all three multi-assistant IDs
    const useMultiAssistant = workoutAssistantId && nutritionAssistantId && recommendationsAssistantId
    
    if (useMultiAssistant) {
      console.log('Using multi-assistant architecture')
      console.log('Workout Assistant ID:', workoutAssistantId?.substring(0, 10) + '...')
      console.log('Nutrition Assistant ID:', nutritionAssistantId?.substring(0, 10) + '...')
      console.log('Recommendations Assistant ID:', recommendationsAssistantId?.substring(0, 10) + '...')
    } else {
      console.log('Using single assistant architecture (fallback)')
      if (!singleAssistantId) {
        console.error('Missing Single Assistant ID')
        throw new Error('Missing Assistant ID')
      }
      console.log('Single Assistant ID:', singleAssistantId?.substring(0, 10) + '...')
    }

    // Format the raw assessment data for the assistants
    const rawAssessmentData = {
      age: parseInt(assessment.age),
      gender: assessment.gender,
      height: parseFloat(assessment.height),
      weight: parseFloat(assessment.weight),
      fitness_goal: assessment.fitnessGoal,
      workout_frequency: parseInt(assessment.workoutFrequency),
      equipment: assessment.equipment,
      diet_type: assessment.diet,
      sports_played: assessment.sportsPlayed || [],
      allergies: assessment.allergies || []
    }

    console.log('Sending raw assessment data to assistants:', JSON.stringify(rawAssessmentData))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Update user profile to mark assessment as completed IMMEDIATELY
    // This ensures the user can access the dashboard even if AI processing fails
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

    const mappedFitnessGoal = fitnessGoalMapping[assessment.fitnessGoal] || 'general_fitness'
    const mappedEquipment = equipmentMapping[assessment.equipment] || 'minimal'

    console.log('Updating profile to mark assessment as completed...')
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        has_completed_assessment: true,
        name: assessment.name,
        fitness_goal: mappedFitnessGoal,
        workout_frequency: assessment.workoutFrequency,
        diet: assessment.diet,
        equipment: mappedEquipment,
        sports_played: assessment.sportsPlayed,
        allergies: assessment.allergies,
        age: parseInt(assessment.age),
        gender: assessment.gender,
        height: parseFloat(assessment.height),
        weight: parseFloat(assessment.weight)
      })
      .eq('id', user_id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    } else {
      console.log('Profile updated successfully')
    }

    // Store assessment data
    console.log('Storing assessment data...')
    const { error: assessmentError } = await supabaseClient
      .from('assessment_data')
      .insert({
        user_id: user_id,
        age: parseInt(assessment.age),
        gender: assessment.gender,
        height: parseFloat(assessment.height),
        weight: parseFloat(assessment.weight),
        fitness_goal: assessment.fitnessGoal,
        workout_frequency: parseInt(assessment.workoutFrequency),
        diet: assessment.diet,
        equipment: assessment.equipment,
        sports_played: assessment.sportsPlayed,
        allergies: assessment.allergies
      })

    if (assessmentError) {
      console.error('Error storing assessment data:', assessmentError)
    } else {
      console.log('Assessment data stored successfully')
    }

    let workoutData: WorkoutResponse | null = null
    let nutritionData: NutritionResponse | null = null
    let recommendationsData: RecommendationsResponse | null = null
    let warning = ''

    try {
      if (useMultiAssistant) {
        // Call all three assistants in parallel
        console.log('Calling all three assistants in parallel...')
        const results = await Promise.allSettled([
          callAssistant(workoutAssistantId!, openaiApiKey, rawAssessmentData, 'workout'),
          callAssistant(nutritionAssistantId!, openaiApiKey, rawAssessmentData, 'nutrition'),
          callAssistant(recommendationsAssistantId!, openaiApiKey, rawAssessmentData, 'recommendations')
        ])

        // Process results
        if (results[0].status === 'fulfilled') {
          workoutData = results[0].value as WorkoutResponse
          console.log('Workout assistant completed successfully')
        } else {
          console.error('Workout assistant failed:', results[0].reason)
        }

        if (results[1].status === 'fulfilled') {
          nutritionData = results[1].value as NutritionResponse
          console.log('Nutrition assistant completed successfully')
        } else {
          console.error('Nutrition assistant failed:', results[1].reason)
        }

        if (results[2].status === 'fulfilled') {
          recommendationsData = results[2].value as RecommendationsResponse
          console.log('Recommendations assistant completed successfully')
        } else {
          console.error('Recommendations assistant failed:', results[2].reason)
        }

        const successCount = [results[0], results[1], results[2]].filter(r => r.status === 'fulfilled').length
        warning = `Some components may be incomplete. ${successCount}/3 assistants completed successfully.`
      } else {
        // Fallback to single assistant
        console.log('Using single assistant fallback...')
        const singleResult = await callAssistant(singleAssistantId!, openaiApiKey, rawAssessmentData, 'single')
        
        // Parse the single assistant response
        if (singleResult.workout_plans) {
          workoutData = { workout_schedule: singleResult.workout_plans }
        }
        if (singleResult.nutrition_plan) {
          nutritionData = { nutrition_plan: singleResult.nutrition_plan }
        }
        if (singleResult.recommendations) {
          recommendationsData = { recommendations: { 
            workout_tips: singleResult.recommendations[0] || '',
            nutrition_tips: singleResult.recommendations[1] || '',
            weekly_goals: singleResult.recommendations[2] || ''
          }}
        }
        warning = 'Single assistant used for all components.'
      }

      // Store workout plans
      if (workoutData?.workout_schedule) {
        console.log('Storing workout plans...')
        for (const workout of workoutData.workout_schedule) {
          const { error: workoutError } = await supabaseClient
            .from('workout_plans')
            .insert({
              user_id: user_id,
              day: workout.day,
              title: workout.workout_title,
              description: workout.description,
              category: workout.category,
              difficulty: workout.difficulty,
              estimated_duration: workout.estimated_duration,
              exercises: workout.exercises
            })

          if (workoutError) {
            console.error('Error storing workout plan:', workoutError)
          }
        }
        console.log('Workout plans stored successfully')
      }

      // Store nutrition plan
      if (nutritionData?.nutrition_plan) {
        console.log('Storing nutrition plan...')
        const { error: nutritionError } = await supabaseClient
          .from('nutrition_plans')
          .insert({
            user_id: user_id,
            daily_calories: nutritionData.nutrition_plan.daily_calories,
            protein_g: nutritionData.nutrition_plan.protein_g,
            carbs_g: nutritionData.nutrition_plan.carbs_g,
            fat_g: nutritionData.nutrition_plan.fat_g,
            diet_type: nutritionData.nutrition_plan.diet_type,
            meals: nutritionData.nutrition_plan.meals
          })

        if (nutritionError) {
          console.error('Error storing nutrition plan:', nutritionError)
        } else {
          console.log('Nutrition plan stored successfully')
        }
      }

      // Store recommendations
      if (recommendationsData?.recommendations) {
        console.log('Storing recommendations...')
        const { error: recommendationsError } = await supabaseClient
          .from('user_recommendations')
          .insert({
            user_id: user_id,
            workout_tips: recommendationsData.recommendations.workout_tips,
            nutrition_tips: recommendationsData.recommendations.nutrition_tips,
            weekly_goals: recommendationsData.recommendations.weekly_goals
          })

        if (recommendationsError) {
          console.error('Error storing recommendations:', recommendationsError)
        } else {
          console.log('Recommendations stored successfully')
        }
      }

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'HashimFit fitness plan generated and stored successfully',
          warning: warning,
          data: {
            workout_plans: workoutData?.workout_schedule?.length || 0,
            nutrition_plan: nutritionData?.nutrition_plan ? 'Generated' : null,
            recommendations: recommendationsData?.recommendations ? 'Generated' : null
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )

    } catch (error) {
      console.error('Error in AI processing:', error)
      
      // Return fallback response if profile was already updated
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Assessment completed successfully (AI processing failed)',
          warning: 'AI processing failed, but assessment data was saved',
          data: {
            workout_plans: 0,
            nutrition_plan: null,
            recommendations: null
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

  } catch (error) {
    console.error('General error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: 'An unexpected error occurred while processing the fitness assessment'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
