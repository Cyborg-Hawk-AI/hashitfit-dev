// Supabase Edge Function for Workout Assistant
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Helper function to call OpenAI Assistant API
async function callWorkoutAssistant(assistantId: string, openaiApiKey: string, assessmentData: any): Promise<any> {
  console.log(`Calling workout assistant with ID: ${assistantId?.substring(0, 10)}...`)
  
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
        content: `Please generate a personalized workout plan based on this assessment data: ${JSON.stringify(assessmentData)}`
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
          console.log(`Workout assistant response:`, content)
          
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

    console.error('Assistant run timeout - using fallback workout plan')
    // Return a fallback workout plan if the assistant times out
    return {
      workout_schedule: [
        {
          week: 1,
          day: "Monday",
          workout_title: "Full Body Strength",
          description: "Basic full body workout focusing on compound movements.",
          category: "strength",
          difficulty: 2,
          estimated_duration: "45 minutes",
          exercises: [
            {
              name: "Bodyweight Squats",
              sets: 3,
              reps: "10-15",
              weight: "bodyweight",
              rest_seconds: 60,
              notes: "Keep your chest up and go low on the squat."
            },
            {
              name: "Push-ups",
              sets: 3,
              reps: "8-12",
              weight: "bodyweight",
              rest_seconds: 60,
              notes: "Maintain a straight line from head to heels."
            },
            {
              name: "Plank",
              sets: 3,
              reps: "30 seconds",
              weight: "bodyweight",
              rest_seconds: 30,
              notes: "Engage your core and hold your body in a straight line."
            }
          ]
        },
        {
          week: 1,
          day: "Wednesday",
          workout_title: "Cardio & Core",
          description: "Cardiovascular fitness and core strength workout.",
          category: "cardio",
          difficulty: 2,
          estimated_duration: "30 minutes",
          exercises: [
            {
              name: "High Knees",
              sets: 4,
              reps: "30 seconds",
              weight: "bodyweight",
              rest_seconds: 15,
              notes: "Drive your knees high, use your arms for momentum."
            },
            {
              name: "Mountain Climbers",
              sets: 4,
              reps: "30 seconds",
              weight: "bodyweight",
              rest_seconds: 15,
              notes: "Maintain a steady pace and engage your core."
            },
            {
              name: "Russian Twists",
              sets: 3,
              reps: "10-15 each side",
              weight: "bodyweight",
              rest_seconds: 60,
              notes: "Keep your feet off the floor for more challenge."
            }
          ]
        },
        {
          week: 1,
          day: "Friday",
          workout_title: "Upper Body Strength",
          description: "Upper body strength training with various movements.",
          category: "strength",
          difficulty: 2,
          estimated_duration: "45 minutes",
          exercises: [
            {
              name: "Incline Push-ups",
              sets: 3,
              reps: "10-15",
              weight: "bodyweight",
              rest_seconds: 60,
              notes: "Adjust the incline to increase or decrease difficulty."
            },
            {
              name: "Dumbbell Shoulder Press",
              sets: 3,
              reps: "8-12",
              weight: "10kg",
              rest_seconds: 60,
              notes: "Keep your back straight and avoid arching."
            },
            {
              name: "Bent-over Dumbbell Rows",
              sets: 3,
              reps: "10-12",
              weight: "10kg",
              rest_seconds: 60,
              notes: "Focus on squeezing your shoulder blades together."
            }
          ]
        }
      ]
    }
  } catch (error) {
    console.error(`Error calling workout assistant:`, error)
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
    let requestData
    try {
      requestData = await req.json()
      console.log("Received assessment data:", JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    const { user_id, assessment } = requestData
    
    if (!user_id || !assessment) {
      console.error("Missing required fields in request")
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id or assessment data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get API key and assistant ID
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const workoutAssistantId = Deno.env.get('OPENAI_ASSISTANT_WORKOUT_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    if (!workoutAssistantId) {
      console.error('Missing Workout Assistant ID')
      throw new Error('Missing Workout Assistant ID')
    }

    console.log('Workout Assistant ID:', workoutAssistantId?.substring(0, 10) + '...')

    // Format the raw assessment data for the assistant
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

    console.log('Sending raw assessment data to workout assistant:', JSON.stringify(rawAssessmentData))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Call the workout assistant
    console.log('Calling workout assistant...')
    const workoutData = await callWorkoutAssistant(workoutAssistantId, openaiApiKey, rawAssessmentData)
    console.log('Workout assistant completed successfully')

    // Store workout plans in the database
    const workoutPlans = []
    if (workoutData?.workout_schedule && workoutData.workout_schedule.length > 0) {
      console.log('Storing workout plans...')
      
      // Group exercises by week and workout
      const workoutsByWeekAndDay = {}
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
        console.log(`Creating workout plan: ${workout.title}`)
        
        // Create workout plan
        const { data: workoutPlan, error: workoutPlanError } = await supabaseClient
          .from('workout_plans')
          .insert({
            user_id: user_id,
            title: workout.title,
            description: workout.description,
            category: workout.category,
            difficulty: workout.difficulty,
            estimated_duration: workout.estimated_duration,
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
          const exercisesToInsert = workout.exercises.map((exercise, index) => ({
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
          const dayOfWeek = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
          ].indexOf(workout.day)

          if (dayOfWeek !== -1) {
            for (let weekOffset = workout.week - 1; weekOffset < 4; weekOffset += 4) {
              const targetDate = new Date(startDate)
              targetDate.setDate(startDate.getDate() + weekOffset * 7 + (dayOfWeek - startDate.getDay()))
              
              const { error: scheduleError } = await supabaseClient
                .from('workout_schedule')
                .insert({
                  user_id: user_id,
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

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workout plan generated and stored successfully',
        data: {
          workout_plans: workoutPlans.length,
          workout_schedule: workoutData?.workout_schedule || []
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in workout-assistant function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'An unexpected error occurred while processing the workout plan'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 