// Easy Plan Function - Creates easier workout plans
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ASSISTANT_ID = Deno.env.get('WEEK_OPTIMIZATION_ASSISTANT_ID')

async function callEasyPlanAssistant(optimizationData: any): Promise<any> {
  console.log('Calling easy plan assistant...')
  
  try {
    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    if (!threadResponse.ok) {
      const errorText = await threadResponse.text()
      throw new Error(`Failed to create thread: ${threadResponse.status} - ${errorText}`)
    }

    const thread = await threadResponse.json()
    console.log(`Created thread: ${thread.id}`)

    // Add message to thread with easy plan instructions
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: `Create an EASIER workout plan for this user. Focus on beginner-friendly exercises, lower intensity, and more recovery time. Make the workouts more accessible and less challenging while still being effective. Analyze this user data: ${JSON.stringify(optimizationData)}`
      })
    })

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text()
      throw new Error(`Failed to add message: ${messageResponse.status} - ${errorText}`)
    }

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        response_format: { type: "json_object" }
      })
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      throw new Error(`Failed to start run: ${runResponse.status} - ${errorText}`)
    }

    const run = await runResponse.json()
    console.log(`Started run: ${run.id}`)

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`)
      }

      const runStatus = await statusResponse.json()
      console.log(`Run status: ${runStatus.status} (attempt ${attempts}/${maxAttempts})`)

      if (runStatus.status === 'completed') {
        // Get the messages
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        })

        if (!messagesResponse.ok) {
          throw new Error(`Failed to get messages: ${messagesResponse.status}`)
        }

        const messages = await messagesResponse.json()
        const assistantMessage = messages.data[0]

        if (assistantMessage.content && assistantMessage.content[0]?.text?.value) {
          const content = assistantMessage.content[0].text.value
          console.log('Easy plan assistant response:', content)
          
          try {
            return JSON.parse(content)
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError)
            // Return fallback easy plan response
            return {
              optimization_analysis: {
                fatigue_level: "low",
                recovery_status: "excellent",
                muscle_balance: {
                  upper_body: "beginner_friendly",
                  lower_body: "beginner_friendly",
                  core: "beginner_friendly"
                },
                performance_trend: "building_foundation",
                key_insights: ["Easy plan created for better accessibility"]
              },
              optimized_plan: {
                monday: {
                  focus: "strength",
                  intensity: "low",
                  exercises: [
                    {
                      name: "Wall Push-ups",
                      sets: 2,
                      reps: "5-8",
                      notes: "Start with wall push-ups, progress to knee push-ups"
                    },
                    {
                      name: "Bodyweight Squats",
                      sets: 2,
                      reps: "8-10",
                      notes: "Focus on form, go as deep as comfortable"
                    }
                  ],
                  rationale: "Easy introduction to strength training"
                },
                wednesday: {
                  focus: "cardio",
                  intensity: "low",
                  exercises: [
                    {
                      name: "Walking",
                      sets: 1,
                      reps: "20 minutes",
                      notes: "Brisk walking, can be done outdoors or on treadmill"
                    },
                    {
                      name: "Light Stretching",
                      sets: 1,
                      reps: "10 minutes",
                      notes: "Gentle stretching for flexibility"
                    }
                  ],
                  rationale: "Low-impact cardio and recovery"
                },
                friday: {
                  focus: "strength",
                  intensity: "low",
                  exercises: [
                    {
                      name: "Standing Core Twists",
                      sets: 2,
                      reps: "10 each side",
                      notes: "Gentle twisting motion while standing"
                    },
                    {
                      name: "Heel-to-Toe Walk",
                      sets: 2,
                      reps: "10 steps",
                      notes: "Balance exercise, hold onto wall if needed"
                    }
                  ],
                  rationale: "Core stability and balance work"
                }
              },
              nutrition_recommendations: {
                calorie_adjustment: "+100",
                protein_target: "120g"
              },
              recovery_strategies: {
                sleep_target: "8-9 hours"
              },
              weekly_goals: [
                "Complete 3 easy workouts",
                "Focus on form over intensity",
                "Build consistent habits"
              ]
            }
          }
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
    console.error('Error calling easy plan assistant:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log("Received easy plan request")
    
    const { user_id, optimization_data } = requestData
    
    if (!user_id || !optimization_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id or optimization_data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing OpenAI API Key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!ASSISTANT_ID) {
      return new Response(
        JSON.stringify({ error: 'Missing Week Optimization Assistant ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Calling easy plan assistant...')
    const easyPlanResult = await callEasyPlanAssistant(optimization_data)
    console.log('Easy plan completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        easy_plan: easyPlanResult.optimized_plan || {},
        analysis: easyPlanResult.optimization_analysis || {},
        nutrition: easyPlanResult.nutrition_recommendations || {},
        recovery: easyPlanResult.recovery_strategies || {},
        goals: easyPlanResult.weekly_goals || [],
        reasoning: 'Easy plan created for better accessibility and consistency'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in easy-plan function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'An unexpected error occurred while creating the easy plan'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
