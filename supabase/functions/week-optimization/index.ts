// Supabase Edge Function for Week Optimization
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Helper function to call OpenAI Assistant API
async function callWeekOptimizationAssistant(assistantId: string, openaiApiKey: string, optimizationData: any): Promise<any> {
  console.log(`Calling week optimization assistant with ID: ${assistantId?.substring(0, 10)}...`)
  
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
        content: `Please analyze this user's recent workout performance and create an optimized plan for the remaining week: ${JSON.stringify(optimizationData)}`
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
    const maxAttempts = 60 // 60 seconds timeout
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds between checks
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
      console.log(`Run status: ${runStatus.status} (attempt ${attempts}/${maxAttempts})`)

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
          console.log(`Week optimization assistant response:`, content)
          
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
    console.error(`Error calling week optimization assistant:`, error)
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
      console.log("Received optimization data:", JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    const { user_id, optimization_data } = requestData
    
    if (!user_id || !optimization_data) {
      console.error("Missing required fields in request")
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id or optimization_data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get API key and assistant ID
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const weekOptimizationAssistantId = Deno.env.get('OPENAI_ASSISTANT_WEEK_OPTIMIZATION_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    if (!weekOptimizationAssistantId) {
      console.error('Missing Week Optimization Assistant ID')
      throw new Error('Missing Week Optimization Assistant ID')
    }

    console.log('Week Optimization Assistant ID:', weekOptimizationAssistantId?.substring(0, 10) + '...')

    // Call the week optimization assistant
    console.log('Calling week optimization assistant...')
    const optimizationResult = await callWeekOptimizationAssistant(
      weekOptimizationAssistantId, 
      openaiApiKey, 
      optimization_data
    )
    console.log('Week optimization assistant completed successfully')

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        suggestions: optimizationResult.suggestions || [],
        reasoning: optimizationResult.reasoning || 'Week optimized based on recent performance',
        fatigue_analysis: optimizationResult.fatigue_analysis || {}
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
