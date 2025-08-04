// Supabase Edge Function for Recommendations Assistant
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Helper function to call OpenAI Assistant API
async function callRecommendationsAssistant(assistantId: string, openaiApiKey: string, assessmentData: any): Promise<any> {
  console.log(`Calling recommendations assistant with ID: ${assistantId?.substring(0, 10)}...`)
  
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
        content: `Please generate personalized recommendations based on this assessment data: ${JSON.stringify(assessmentData)}`
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
          console.log(`Recommendations assistant response:`, content)
          
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
    console.error(`Error calling recommendations assistant:`, error)
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
    const recommendationsAssistantId = Deno.env.get('OPENAI_ASSISTANT_RECOMMENDATIONS_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    if (!recommendationsAssistantId) {
      console.error('Missing Recommendations Assistant ID')
      throw new Error('Missing Recommendations Assistant ID')
    }

    console.log('Recommendations Assistant ID:', recommendationsAssistantId?.substring(0, 10) + '...')

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

    console.log('Sending raw assessment data to recommendations assistant:', JSON.stringify(rawAssessmentData))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Call the recommendations assistant
    console.log('Calling recommendations assistant...')
    const recommendationsData = await callRecommendationsAssistant(recommendationsAssistantId, openaiApiKey, rawAssessmentData)
    console.log('Recommendations assistant completed successfully')

    // Store recommendations in the database
    let recommendations = null
    if (recommendationsData?.recommendations) {
      console.log('Storing recommendations...')
      try {
        const { data: recommendationsRecord, error: recommendationsError } = await supabaseClient
          .from('user_recommendations')
          .insert({
            user_id: user_id,
            workout_tips: recommendationsData.recommendations.workout_tips,
            nutrition_tips: recommendationsData.recommendations.nutrition_tips,
            weekly_goals: recommendationsData.recommendations.weekly_goals
          })
          .select()
          .single()

        if (recommendationsError) {
          console.error('Error creating recommendations:', recommendationsError)
        } else {
          recommendations = recommendationsRecord
        }
        console.log('Created recommendations successfully')
      } catch (error) {
        console.error('Error processing recommendations:', error)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Recommendations generated and stored successfully',
        data: {
          recommendations: recommendations?.id || null,
          recommendations_data: recommendationsData?.recommendations || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in recommendations-assistant function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'An unexpected error occurred while processing the recommendations'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 