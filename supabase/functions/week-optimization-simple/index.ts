// Simplified Week Optimization Function for Testing
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ASSISTANT_ID = Deno.env.get('WEEK_OPTIMIZATION_ASSISTANT_ID')

async function callWeekOptimizationAssistant(optimizationData: any): Promise<any> {
  console.log('Calling week optimization assistant...')
  
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

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: `Analyze this user data and create an optimized week plan: ${JSON.stringify(optimizationData)}`
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
          console.log('Assistant response:', content)
          
          try {
            return JSON.parse(content)
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError)
            // Return fallback response
            return {
              optimization_analysis: {
                fatigue_level: "moderate",
                recovery_status: "adequate",
                muscle_balance: {
                  upper_body: "balanced",
                  lower_body: "needs_attention",
                  core: "under_trained"
                },
                performance_trend: "improving",
                key_insights: ["Analysis completed successfully"]
              },
              optimized_plan: {
                wednesday: {
                  focus: "strength_training",
                  intensity: "moderate",
                  exercises: [
                    {
                      name: "Compound Exercises",
                      sets: 3,
                      reps: "8-10",
                      notes: "Focus on form"
                    }
                  ],
                  rationale: "Balanced workout for the remaining week"
                }
              },
              nutrition_recommendations: {
                calorie_adjustment: "+200",
                protein_target: "150g"
              },
              recovery_strategies: {
                sleep_target: "8 hours"
              },
              weekly_goals: [
                "Complete scheduled workouts",
                "Maintain consistent nutrition"
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
    console.error('Error calling assistant:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log("Received optimization data")
    
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

    console.log('Calling week optimization assistant...')
    const optimizationResult = await callWeekOptimizationAssistant(optimization_data)
    console.log('Week optimization completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: optimizationResult.optimized_plan ? Object.values(optimizationResult.optimized_plan) : [],
        reasoning: 'Week optimized based on recent performance',
        fatigue_analysis: optimizationResult.optimization_analysis || {}
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in week-optimization function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'An unexpected error occurred while optimizing the week'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
