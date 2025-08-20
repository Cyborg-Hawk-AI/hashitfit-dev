// Supabase Edge Function for Recommendations Assistant
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Helper function to call OpenAI Assistant API
async function callRecommendationsAssistant(assistantId: string, openaiApiKey: string, assessmentData: any): Promise<any> {
  console.log(`🔍 [DEBUG] Starting callRecommendationsAssistant`)
  console.log(`🔍 [DEBUG] Assistant ID: ${assistantId?.substring(0, 10)}...`)
  console.log(`🔍 [DEBUG] Assessment data received:`, JSON.stringify(assessmentData, null, 2))
  
  try {
    // Create a thread
    console.log(`🔍 [DEBUG] Creating OpenAI thread...`)
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    console.log(`🔍 [DEBUG] Thread creation response status: ${threadResponse.status}`)
    if (!threadResponse.ok) {
      const errorText = await threadResponse.text()
      console.error(`🔍 [DEBUG] Thread creation failed: ${errorText}`)
      throw new Error(`Failed to create thread: ${threadResponse.status} - ${errorText}`)
    }

    const thread = await threadResponse.json()
    console.log(`🔍 [DEBUG] Created thread: ${thread.id}`)

    // Add message to thread
    console.log(`🔍 [DEBUG] Adding message to thread...`)
    const messageBody = {
      role: 'user',
      content: `Please generate personalized recommendations based on this assessment data: ${JSON.stringify(assessmentData)}`
    }
    console.log(`🔍 [DEBUG] Message body:`, JSON.stringify(messageBody, null, 2))
    
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify(messageBody)
    })

    console.log(`🔍 [DEBUG] Message addition response status: ${messageResponse.status}`)
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text()
      console.error(`🔍 [DEBUG] Message addition failed: ${errorText}`)
      throw new Error(`Failed to add message: ${messageResponse.status} - ${errorText}`)
    }

    // Run the assistant
    console.log(`🔍 [DEBUG] Starting assistant run...`)
    const runBody = {
      assistant_id: assistantId,
      response_format: { type: "json_object" }
    }
    console.log(`🔍 [DEBUG] Run body:`, JSON.stringify(runBody, null, 2))
    
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify(runBody)
    })

    console.log(`🔍 [DEBUG] Run start response status: ${runResponse.status}`)
    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error(`🔍 [DEBUG] Run start failed: ${errorText}`)
      throw new Error(`Failed to start run: ${runResponse.status} - ${errorText}`)
    }

    const run = await runResponse.json()
    console.log(`🔍 [DEBUG] Started run: ${run.id}`)

    // Poll for completion
    console.log(`🔍 [DEBUG] Starting polling for run completion...`)
    let attempts = 0
    const maxAttempts = 120 // 120 seconds timeout (2 minutes)
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds between checks
      attempts++

      console.log(`🔍 [DEBUG] Polling attempt ${attempts}/${maxAttempts}...`)
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      })

      console.log(`🔍 [DEBUG] Status check response: ${statusResponse.status}`)
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error(`🔍 [DEBUG] Status check failed: ${errorText}`)
        throw new Error(`Failed to check run status: ${statusResponse.status} - ${errorText}`)
      }

      const runStatus = await statusResponse.json()
      console.log(`🔍 [DEBUG] Run status: ${runStatus.status} (attempt ${attempts}/${maxAttempts})`)

      if (runStatus.status === 'completed') {
        console.log(`🔍 [DEBUG] Run completed successfully!`)
        // Get the messages
        console.log(`🔍 [DEBUG] Fetching messages from thread...`)
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        })

        console.log(`🔍 [DEBUG] Messages response status: ${messagesResponse.status}`)
        if (!messagesResponse.ok) {
          const errorText = await messagesResponse.text()
          console.error(`🔍 [DEBUG] Failed to get messages: ${errorText}`)
          throw new Error(`Failed to get messages: ${messagesResponse.status} - ${errorText}`)
        }

        const messages = await messagesResponse.json()
        console.log(`🔍 [DEBUG] Messages response:`, JSON.stringify(messages, null, 2))
        
        const assistantMessage = messages.data[0] // Most recent message
        console.log(`🔍 [DEBUG] Assistant message:`, JSON.stringify(assistantMessage, null, 2))

        if (assistantMessage.content && assistantMessage.content[0]?.text?.value) {
          const content = assistantMessage.content[0].text.value
          console.log(`🔍 [DEBUG] Raw assistant response content:`, content)
          
          // Clean and parse JSON
          const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim()
          console.log(`🔍 [DEBUG] Cleaned content:`, cleanedContent)
          
          try {
            const parsedContent = JSON.parse(cleanedContent)
            console.log(`🔍 [DEBUG] Parsed content:`, JSON.stringify(parsedContent, null, 2))
            return parsedContent
          } catch (parseError) {
            console.error(`🔍 [DEBUG] JSON parse error:`, parseError)
            throw new Error(`Failed to parse assistant response: ${parseError.message}`)
          }
        } else {
          console.error(`🔍 [DEBUG] No valid content in assistant message:`, assistantMessage)
          throw new Error('No response content from assistant')
        }
      } else if (runStatus.status === 'failed') {
        console.error(`🔍 [DEBUG] Run failed:`, runStatus)
        throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`)
      } else if (runStatus.status === 'expired') {
        console.error(`🔍 [DEBUG] Run expired`)
        throw new Error('Assistant run timed out')
      }
    }

    console.error(`🔍 [DEBUG] Run timed out after ${maxAttempts} attempts`)
    throw new Error('Assistant run timeout')
  } catch (error) {
    console.error(`🔍 [DEBUG] Error calling recommendations assistant:`, error)
    console.error(`🔍 [DEBUG] Error stack:`, error.stack)
    throw error
  }
}

serve(async (req) => {
  console.log(`🔍 [DEBUG] ===== RECOMMENDATIONS ASSISTANT FUNCTION STARTED =====`)
  console.log(`🔍 [DEBUG] Request method: ${req.method}`)
  console.log(`🔍 [DEBUG] Request URL: ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔍 [DEBUG] Handling CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    console.log(`🔍 [DEBUG] Parsing request body...`)
    let requestData
    try {
      requestData = await req.json()
      console.log(`🔍 [DEBUG] Received assessment data:`, JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error(`🔍 [DEBUG] Failed to parse request body:`, parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    const { user_id, assessment } = requestData
    console.log(`🔍 [DEBUG] Extracted user_id: ${user_id}`)
    console.log(`🔍 [DEBUG] Assessment object keys:`, Object.keys(assessment || {}))
    
    if (!user_id || !assessment) {
      console.error(`🔍 [DEBUG] Missing required fields in request`)
      console.error(`🔍 [DEBUG] user_id: ${user_id}`)
      console.error(`🔍 [DEBUG] assessment: ${assessment}`)
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id or assessment data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get API key and assistant ID
    console.log(`🔍 [DEBUG] Getting environment variables...`)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const recommendationsAssistantId = Deno.env.get('OPENAI_ASSISTANT_RECOMMENDATIONS_ID')
    
    console.log(`🔍 [DEBUG] OpenAI API Key exists: ${!!openaiApiKey}`)
    console.log(`🔍 [DEBUG] Recommendations Assistant ID exists: ${!!recommendationsAssistantId}`)
    
    if (!openaiApiKey) {
      console.error(`🔍 [DEBUG] Missing OpenAI API Key`)
      throw new Error('Missing OpenAI API Key')
    }
    
    if (!recommendationsAssistantId) {
      console.error(`🔍 [DEBUG] Missing Recommendations Assistant ID`)
      throw new Error('Missing Recommendations Assistant ID')
    }

    console.log(`🔍 [DEBUG] Recommendations Assistant ID: ${recommendationsAssistantId?.substring(0, 10)}...`)

    // Format the raw assessment data for the assistant
    console.log(`🔍 [DEBUG] Formatting assessment data...`)
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

    console.log(`🔍 [DEBUG] Raw assessment data:`, JSON.stringify(rawAssessmentData, null, 2))

    // Initialize Supabase client
    console.log(`🔍 [DEBUG] Initializing Supabase client...`)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    console.log(`🔍 [DEBUG] Supabase URL: ${supabaseUrl}`)
    console.log(`🔍 [DEBUG] Supabase Service Key exists: ${!!supabaseServiceKey}`)
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Call the recommendations assistant
    console.log(`🔍 [DEBUG] Calling recommendations assistant...`)
    const recommendationsData = await callRecommendationsAssistant(recommendationsAssistantId, openaiApiKey, rawAssessmentData)
    console.log(`🔍 [DEBUG] Recommendations assistant completed successfully`)
    console.log(`🔍 [DEBUG] Recommendations data received:`, JSON.stringify(recommendationsData, null, 2))

    // Store recommendations in the database
    console.log(`🔍 [DEBUG] Starting database storage process...`)
    let recommendations = null
    
    console.log(`🔍 [DEBUG] Checking if recommendations data exists...`)
    console.log(`🔍 [DEBUG] workout_tips exists: ${!!recommendationsData?.workout_tips}`)
    console.log(`🔍 [DEBUG] nutrition_tips exists: ${!!recommendationsData?.nutrition_tips}`)
    console.log(`🔍 [DEBUG] weekly_goals exists: ${!!recommendationsData?.weekly_goals}`)
    
    if (recommendationsData?.workout_tips || recommendationsData?.nutrition_tips || recommendationsData?.weekly_goals) {
      console.log(`🔍 [DEBUG] Storing recommendations in database...`)
      try {
        const insertData = {
          user_id: user_id,
          workout_tips: recommendationsData.workout_tips,
          nutrition_tips: recommendationsData.nutrition_tips,
          weekly_goals: recommendationsData.weekly_goals
        }
        console.log(`🔍 [DEBUG] Insert data:`, JSON.stringify(insertData, null, 2))
        
        const { data: recommendationsRecord, error: recommendationsError } = await supabaseClient
          .from('user_recommendations')
          .insert(insertData)
          .select()
          .single()

        if (recommendationsError) {
          console.error(`🔍 [DEBUG] Error creating recommendations:`, recommendationsError)
          console.error(`🔍 [DEBUG] Error details:`, JSON.stringify(recommendationsError, null, 2))
        } else {
          recommendations = recommendationsRecord
          console.log(`🔍 [DEBUG] Created recommendations successfully:`, recommendationsRecord)
        }
      } catch (error) {
        console.error(`🔍 [DEBUG] Error processing recommendations:`, error)
        console.error(`🔍 [DEBUG] Error details:`, JSON.stringify(error, null, 2))
      }
    } else {
      console.log(`🔍 [DEBUG] No recommendations data to store:`, recommendationsData)
    }

    // Return success response
    console.log(`🔍 [DEBUG] Preparing response...`)
    const responseData = {
      success: true,
      message: 'Recommendations generated and stored successfully',
      data: {
        recommendations: recommendations?.id || null,
        recommendations_data: recommendationsData || null
      }
    }
    console.log(`🔍 [DEBUG] Response data:`, JSON.stringify(responseData, null, 2))
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(`🔍 [DEBUG] Error in recommendations-assistant function:`, error)
    console.error(`🔍 [DEBUG] Error stack:`, error.stack)
    console.error(`🔍 [DEBUG] Error message:`, error.message)
    
    const errorResponse = {
      success: false,
      error: error.message,
      details: 'An unexpected error occurred while processing the recommendations'
    }
    console.log(`🔍 [DEBUG] Error response:`, JSON.stringify(errorResponse, null, 2))
    
    return new Response(
      JSON.stringify(errorResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 