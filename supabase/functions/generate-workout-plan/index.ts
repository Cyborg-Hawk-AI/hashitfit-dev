import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface for assistant responses
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

// Helper function to call a single assistant
async function callAssistant(
  assistantId: string,
  openaiApiKey: string,
  assessmentData: any,
  assistantType: 'workout' | 'nutrition' | 'recommendations' | 'single'
): Promise<any> {
  console.log(`Calling ${assistantType} assistant:`, assistantId.substring(0, 10) + '...')

  // Create thread
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({}),
  })

  if (!threadResponse.ok) {
    const errorText = await threadResponse.text()
    throw new Error(`Thread creation error for ${assistantType}: ${threadResponse.status} - ${errorText}`)
  }

  const threadData = await threadResponse.json()
  const threadId = threadData.id
  console.log(`Created thread for ${assistantType}:`, threadId)

  // Add message to thread
  const messageContent = `${JSON.stringify(assessmentData)}

CRITICAL: Respond with ONLY valid JSON in the exact format specified in your instructions. No markdown, no explanations, no text formatting - just pure JSON that can be parsed directly.`

  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      role: 'user',
      content: messageContent
    }),
  })

  if (!messageResponse.ok) {
    const errorText = await messageResponse.text()
    throw new Error(`Message creation error for ${assistantType}: ${messageResponse.status} - ${errorText}`)
  }

  console.log(`Added message to thread for ${assistantType}`)

  // Run the assistant
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      additional_instructions: "You must respond with ONLY valid JSON. No markdown formatting, no explanations, no additional text. Just pure JSON that can be parsed directly by JSON.parse()."
    }),
  })

  if (!runResponse.ok) {
    const errorText = await runResponse.text()
    throw new Error(`Run creation error for ${assistantType}: ${runResponse.status} - ${errorText}`)
  }

  const runData = await runResponse.json()
  const runId = runData.id
  console.log(`Started run for ${assistantType}:`, runId)

  // Poll for completion
  let runStatus = 'in_progress'
  let attempts = 0
  const maxAttempts = 30 // 30 seconds timeout per assistant

  while (runStatus === 'in_progress' || runStatus === 'queued') {
    if (attempts >= maxAttempts) {
      throw new Error(`${assistantType} assistant run timeout after ${maxAttempts} seconds`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    })

    if (!statusResponse.ok) {
      throw new Error(`Status check error for ${assistantType}: ${statusResponse.status}`)
    }

    const statusData = await statusResponse.json()
    runStatus = statusData.status
    attempts++
    
    console.log(`${assistantType} run status: ${runStatus} (attempt ${attempts})`)
  }

  if (runStatus !== 'completed') {
    throw new Error(`${assistantType} assistant run failed with status: ${runStatus}`)
  }

  // Get the messages from the thread
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'OpenAI-Beta': 'assistants=v2',
    },
  })

  if (!messagesResponse.ok) {
    const errorText = await messagesResponse.text()
    throw new Error(`Messages retrieval error for ${assistantType}: ${messagesResponse.status} - ${errorText}`)
  }

  const messagesData = await messagesResponse.json()
  console.log(`Retrieved messages from thread for ${assistantType}`)

  // Get the assistant's response (first message from assistant)
  const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant')
  
  if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
    throw new Error(`No response from ${assistantType} assistant`)
  }

  const rawContent = assistantMessage.content[0].text.value
  console.log(`Raw content from ${assistantType} assistant:`, rawContent.substring(0, 200) + '...')

  let parsedData
  try {
    // Enhanced JSON cleaning to handle various response formats
    let cleanedContent = rawContent.trim()
    
    // Remove any markdown code block indicators if present
    cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    
    // Remove any leading/trailing text that isn't JSON
    const jsonStartIndex = cleanedContent.indexOf('{')
    const jsonEndIndex = cleanedContent.lastIndexOf('}')
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      cleanedContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex + 1)
    }
    
    console.log(`Cleaned content for ${assistantType} parsing:`, cleanedContent.substring(0, 200) + '...')
    
    // Try to parse the cleaned JSON
    parsedData = JSON.parse(cleanedContent)
    console.log(`Successfully parsed ${assistantType} data:`, parsedData)
  } catch (parseError) {
    console.error(`JSON parse error for ${assistantType}:`, parseError)
    console.error(`Failed to parse ${assistantType} content:`, rawContent)
    
    // If parsing fails, try to extract JSON using a more aggressive approach
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
        console.log(`Successfully parsed ${assistantType} data using regex extraction:`, parsedData)
      } else {
        throw new Error(`No valid JSON found in ${assistantType} response`)
      }
    } catch (secondParseError) {
      console.error(`Second parse attempt failed for ${assistantType}:`, secondParseError)
      throw new Error(`Failed to parse ${assistantType} assistant response as JSON: ${parseError.message}. Raw response: ${rawContent.substring(0, 500)}...`)
    }
  }

  return parsedData
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      throw new Error('Missing Authorization header')
    }

    console.log('Auth header present:', authHeader ? 'Yes' : 'No')

    // Extract the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    )

    // Set the session using the extracted token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      console.error('Error getting user:', userError)
      throw new Error(`Authentication failed: ${userError.message}`)
    }
    
    if (!user) {
      console.error('No user found in token')
      throw new Error('No authenticated user found')
    }

    console.log('User authenticated successfully:', user.id)

    const assessmentData = await req.json()
    console.log('Received assessment data:', assessmentData)

    // Get API key and assistant IDs
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const workoutAssistantId = Deno.env.get('OPENAI_ASSISTANT_WORKOUT_ID')
    const nutritionAssistantId = Deno.env.get('OPENAI_ASSISTANT_NUTRITION_ID')
    const recommendationsAssistantId = Deno.env.get('OPENAI_ASSISTANT_RECOMMENDATIONS_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    // Check if we have the new multi-assistant setup or fall back to single assistant
    const useMultiAssistant = workoutAssistantId && nutritionAssistantId && recommendationsAssistantId
    const singleAssistantId = Deno.env.get('OPENAI_ASSISTANT_ASSESSMENT_ID')
    
    if (!useMultiAssistant && !singleAssistantId) {
      console.error('Missing Assistant IDs - neither multi-assistant nor single assistant configured')
      throw new Error('Missing Assistant IDs')
    }

    console.log('Using multi-assistant architecture:', useMultiAssistant)
    if (useMultiAssistant) {
      console.log('Workout Assistant ID:', workoutAssistantId?.substring(0, 10) + '...')
      console.log('Nutrition Assistant ID:', nutritionAssistantId?.substring(0, 10) + '...')
      console.log('Recommendations Assistant ID:', recommendationsAssistantId?.substring(0, 10) + '...')
    } else {
      console.log('Single Assistant ID:', singleAssistantId?.substring(0, 10) + '...')
    }

    // Format the raw assessment data for the assistants
    const rawAssessmentData = {
      age: parseInt(assessmentData.age),
      gender: assessmentData.gender,
      height: parseFloat(assessmentData.height),
      weight: parseFloat(assessmentData.weight),
      fitness_goal: assessmentData.fitnessGoal,
      workout_frequency: parseInt(assessmentData.workoutFrequency),
      equipment: assessmentData.equipment,
      diet_type: assessmentData.diet,
      sports_played: assessmentData.sportsPlayed || [],
      allergies: assessmentData.allergies || []
    }

    console.log('Sending raw assessment data to assistants:', JSON.stringify(rawAssessmentData))

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

    const mappedFitnessGoal = fitnessGoalMapping[assessmentData.fitnessGoal] || 'general_fitness'
    const mappedEquipment = equipmentMapping[assessmentData.equipment] || 'minimal'

    console.log('Updating profile to mark assessment as completed...')
    const { error: profileError } = await supabaseClient
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
        age: parseInt(assessmentData.age),
        gender: assessmentData.gender,
        height: parseFloat(assessmentData.height),
        weight: parseFloat(assessmentData.weight)
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    console.log('Profile updated successfully - user can now access dashboard')

    // Store assessment data
    const { error: assessmentError } = await supabaseClient
      .from('assessment_data')
      .insert({
        user_id: user.id,
        name: assessmentData.name,
        age: parseInt(assessmentData.age),
        gender: assessmentData.gender,
        height: parseFloat(assessmentData.height),
        weight: parseFloat(assessmentData.weight),
        fitness_goal: mappedFitnessGoal,
        workout_frequency: assessmentData.workoutFrequency,
        diet: assessmentData.diet,
        equipment: mappedEquipment,
        sports_played: assessmentData.sportsPlayed || [],
        allergies: assessmentData.allergies || []
      })

    if (assessmentError) {
      console.error('Error storing assessment data:', assessmentError)
      throw assessmentError
    }

    console.log('Assessment data stored successfully')

    // Initialize response data
    let workoutData: any = null
    let nutritionData: any = null
    let recommendationsData: any = null

    if (useMultiAssistant) {
      // Call all three assistants in parallel
      console.log('Calling all three assistants in parallel...')
      
      const assistantCalls = [
        callAssistant(workoutAssistantId!, openaiApiKey, rawAssessmentData, 'workout')
          .then(data => { workoutData = data; console.log('Workout assistant completed successfully'); })
          .catch(error => { console.error('Workout assistant failed:', error.message); }),
        
        callAssistant(nutritionAssistantId!, openaiApiKey, rawAssessmentData, 'nutrition')
          .then(data => { nutritionData = data; console.log('Nutrition assistant completed successfully'); })
          .catch(error => { console.error('Nutrition assistant failed:', error.message); }),
        
        callAssistant(recommendationsAssistantId!, openaiApiKey, rawAssessmentData, 'recommendations')
          .then(data => { recommendationsData = data; console.log('Recommendations assistant completed successfully'); })
          .catch(error => { console.error('Recommendations assistant failed:', error.message); })
      ]

      // Wait for all assistants to complete (or fail)
      await Promise.allSettled(assistantCalls)
      
      console.log('All assistants completed. Results:')
      console.log('- Workout data:', workoutData ? 'Success' : 'Failed')
      console.log('- Nutrition data:', nutritionData ? 'Success' : 'Failed')
      console.log('- Recommendations data:', recommendationsData ? 'Success' : 'Failed')
    } else {
      // Fallback to single assistant (backward compatibility)
      console.log('Using single assistant (backward compatibility)...')
      
      try {
        const singleAssistantResponse = await callAssistant(singleAssistantId!, openaiApiKey, rawAssessmentData, 'single')
        
        // Parse the single assistant response into the expected format
        workoutData = { workout_schedule: singleAssistantResponse.workout_schedule }
        nutritionData = { nutrition_plan: singleAssistantResponse.nutrition_plan }
        recommendationsData = { recommendations: singleAssistantResponse.recommendations }
        
        console.log('Single assistant completed successfully')
      } catch (error) {
        console.error('Single assistant failed:', error.message)
      }
    }

    // Aggregate responses into final format
    const finalResponse = {
      workout_schedule: workoutData?.workout_schedule || [],
      nutrition_plan: nutritionData?.nutrition_plan || null,
      recommendations: recommendationsData?.recommendations || null
    }

    console.log('Final aggregated response:', finalResponse)

    // Store workout plans in the database (if available)
    const workoutPlans = []
    
    if (workoutData?.workout_schedule && workoutData.workout_schedule.length > 0) {
      // Group exercises by week and workout
      const workoutsByWeekAndDay: any = {}
      
      for (const scheduleItem of workoutData.workout_schedule) {
        const key = `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`
        
        if (!workoutsByWeekAndDay[key]) {
          workoutsByWeekAndDay[key] = {
            title: scheduleItem.workout_title,
            description: scheduleItem.description || `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`,
            category: scheduleItem.category || 'strength',
            difficulty: parseInt(scheduleItem.difficulty) || 3,
            estimated_duration: scheduleItem.estimated_duration || '45 minutes',
            week: scheduleItem.week,
            day: scheduleItem.day,
            exercises: []
          }
        }
        
        if (scheduleItem.exercises) {
          workoutsByWeekAndDay[key].exercises.push(...scheduleItem.exercises)
        }
      }

      // Create workout plans and exercises
      for (const [key, workout] of Object.entries(workoutsByWeekAndDay)) {
        console.log(`Creating workout plan: ${(workout as any).title}`)
        
        // Create workout plan
        const { data: workoutPlan, error: workoutPlanError } = await supabaseClient
          .from('workout_plans')
          .insert({
            user_id: user.id,
            title: (workout as any).title,
            description: (workout as any).description,
            category: (workout as any).category,
            difficulty: (workout as any).difficulty,
            estimated_duration: (workout as any).estimated_duration,
            ai_generated: true
          })
          .select()
          .single()

        if (workoutPlanError) {
          console.error('Error creating workout plan:', workoutPlanError)
          // Continue with other workouts even if one fails
        } else {
          workoutPlans.push(workoutPlan)

          // Create exercises for this workout plan
          const exercisesToInsert = (workout as any).exercises.map((exercise: any, index: number) => ({
            workout_plan_id: workoutPlan.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight || 'bodyweight',
            rest_time: exercise.rest_seconds ? `${exercise.rest_seconds} seconds` : '60 seconds',
            notes: exercise.notes,
            order_index: index
          }))

          const { error: exercisesError } = await supabaseClient
            .from('workout_exercises')
            .insert(exercisesToInsert)

          if (exercisesError) {
            console.error('Error creating exercises:', exercisesError)
          }

          // Schedule this workout for the appropriate day in the next 4 weeks
          const startDate = new Date()
          const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf((workout as any).day)
          
          if (dayOfWeek !== -1) {
            for (let weekOffset = (workout as any).week - 1; weekOffset < 4; weekOffset += 4) {
              const targetDate = new Date(startDate)
              targetDate.setDate(startDate.getDate() + (weekOffset * 7) + (dayOfWeek - startDate.getDay()))
              
              const { error: scheduleError } = await supabaseClient
                .from('workout_schedule')
                .insert({
                  user_id: user.id,
                  workout_plan_id: workoutPlan.id,
                  scheduled_date: targetDate.toISOString().split('T')[0],
                  is_completed: false
                })

              if (scheduleError) {
                console.error('Error scheduling workout:', scheduleError)
              }
            }
          }
        }
      }

      console.log('Created workout plans successfully')
    }

    // Create nutrition plan (if available)
    let nutritionPlan = null
    if (nutritionData?.nutrition_plan) {
      try {
        const { data: nutritionPlanData, error: nutritionError } = await supabaseClient
          .from('nutrition_plans')
          .insert({
            user_id: user.id,
            title: 'NEW MUSCLE! Nutrition Plan',
            description: 'Personalized nutrition plan generated by NEW MUSCLE! AI Coach',
            daily_calories: nutritionData.nutrition_plan.daily_calories,
            protein_g: nutritionData.nutrition_plan.protein_g,
            carbs_g: nutritionData.nutrition_plan.carbs_g,
            fat_g: nutritionData.nutrition_plan.fat_g,
            diet_type: nutritionData.nutrition_plan.diet_type,
            ai_generated: true
          })
          .select()
          .single()

        if (nutritionError) {
          console.error('Error creating nutrition plan:', nutritionError)
        } else {
          nutritionPlan = nutritionPlanData

          // Create meal plans if provided
          if (nutritionData.nutrition_plan.meals && nutritionData.nutrition_plan.meals.length > 0) {
            const mealPlansToInsert = nutritionData.nutrition_plan.meals.map((meal: any, index: number) => ({
              nutrition_plan_id: nutritionPlan.id,
              meal_type: meal.meal_type,
              meal_title: meal.meal_title,
              description: meal.description,
              calories: meal.calories,
              protein_g: meal.protein_g,
              carbs_g: meal.carbs_g,
              fat_g: meal.fat_g,
              order_index: index
            }))

            const { error: mealPlansError } = await supabaseClient
              .from('meal_plans')
              .insert(mealPlansToInsert)

            if (mealPlansError) {
              console.error('Error creating meal plans:', mealPlansError)
            }
          }
        }

        console.log('Created nutrition plan successfully')
      } catch (error) {
        console.error('Error processing nutrition plan:', error)
      }
    }

    console.log('Assessment completed successfully for user:', user.id)

    // Determine success status and message
    const hasWorkoutData = workoutData && workoutData.workout_schedule && workoutData.workout_schedule.length > 0
    const hasNutritionData = nutritionData && nutritionData.nutrition_plan
    const hasRecommendationsData = recommendationsData && recommendationsData.recommendations

    const successCount = [hasWorkoutData, hasNutritionData, hasRecommendationsData].filter(Boolean).length
    const totalAssistants = useMultiAssistant ? 3 : 1

    let message = 'HashimFit fitness plan generated and stored successfully'
    let warning = null

    if (successCount < totalAssistants) {
      warning = `Some components may be incomplete. ${successCount}/${totalAssistants} assistants completed successfully.`
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
        warning,
        data: {
          workout_plans: workoutPlans.length,
          nutrition_plan: nutritionPlan?.id || null,
          recommendations: hasRecommendationsData ? 'generated' : null
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-workout-plan function:', error)
    
    // Check if the profile was already updated (assessment data stored)
    // If so, return success even if AI processing failed
    try {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('has_completed_assessment')
        .eq('id', user?.id)
        .single()
      
      if (profile?.has_completed_assessment) {
        console.log('Profile was updated successfully, returning success despite AI processing error')
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Assessment completed successfully. AI plan generation may be delayed.',
            warning: 'AI processing encountered an issue, but your assessment data has been saved.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    } catch (profileCheckError) {
      console.error('Error checking profile status:', profileCheckError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
