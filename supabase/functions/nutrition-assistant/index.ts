// Supabase Edge Function for Nutrition Assistant
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Helper function to call OpenAI Assistant API
async function callNutritionAssistant(assistantId: string, openaiApiKey: string, assessmentData: any): Promise<any> {
  console.log(`Calling nutrition assistant with ID: ${assistantId?.substring(0, 10)}...`)
  
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
        content: `Please generate a personalized nutrition plan based on this assessment data: ${JSON.stringify(assessmentData)}`
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
          console.log(`Nutrition assistant response:`, content)
          
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
    console.error(`Error calling nutrition assistant:`, error)
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
    const nutritionAssistantId = Deno.env.get('OPENAI_ASSISTANT_NUTRITION_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI API Key')
      throw new Error('Missing OpenAI API Key')
    }
    
    if (!nutritionAssistantId) {
      console.error('Missing Nutrition Assistant ID')
      throw new Error('Missing Nutrition Assistant ID')
    }

    console.log('Nutrition Assistant ID:', nutritionAssistantId?.substring(0, 10) + '...')

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

    console.log('Sending raw assessment data to nutrition assistant:', JSON.stringify(rawAssessmentData))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Call the nutrition assistant
    console.log('Calling nutrition assistant...')
    const nutritionData = await callNutritionAssistant(nutritionAssistantId, openaiApiKey, rawAssessmentData)
    console.log('Nutrition assistant completed successfully')

    // Store nutrition plan in the database
    let nutritionPlan = null
    if (nutritionData?.nutrition_plan) {
      console.log('Storing nutrition plan...')
      try {
        const { data: nutritionPlanData, error: nutritionError } = await supabaseClient
          .from('nutrition_plans')
          .insert({
            user_id: user_id,
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
            const mealPlansToInsert = nutritionData.nutrition_plan.meals.map((meal, index) => ({
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

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Nutrition plan generated and stored successfully',
        data: {
          nutrition_plan: nutritionPlan?.id || null,
          nutrition_data: nutritionData?.nutrition_plan || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in nutrition-assistant function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'An unexpected error occurred while processing the nutrition plan'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 