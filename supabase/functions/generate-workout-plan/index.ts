import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Use the assessments-specific API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_ASSESSMENTS')
    const assistantId = Deno.env.get('OPENAI_ASSISTANT_ASSESSMENT_ID')
    
    if (!openaiApiKey) {
      console.error('Missing OpenAI Assessment API Key')
      throw new Error('Missing OpenAI Assessment API Key')
    }
    
    if (!assistantId) {
      console.error('Missing OpenAI Assistant ID')
      throw new Error('Missing OpenAI Assistant ID')
    }

    // Log the assistant ID being used (first 10 chars for security)
    console.log('Using Assistant ID:', assistantId.substring(0, 10) + '...')
    console.log('Full Assistant ID for debugging:', assistantId)
    console.log('Using API Key (first 10 chars):', openaiApiKey.substring(0, 10) + '...')

    // Format the raw assessment data for the assistant
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

    console.log('Sending raw assessment data to OpenAI Assistant:', JSON.stringify(rawAssessmentData))

    // First, let's verify the assistant exists by trying to retrieve it
    console.log('Verifying assistant exists...')
    const assistantVerifyResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    })

    if (!assistantVerifyResponse.ok) {
      const errorText = await assistantVerifyResponse.text()
      console.error('Assistant verification failed:', assistantVerifyResponse.status, errorText)
      throw new Error(`Assistant verification failed: ${assistantVerifyResponse.status} - ${errorText}`)
    }

    const assistantData = await assistantVerifyResponse.json()
    console.log('Assistant verified successfully. Name:', assistantData.name)

    // Create a thread for the assistant
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
      console.error('Thread creation error:', threadResponse.status, errorText)
      throw new Error(`Thread creation error: ${threadResponse.status} - ${errorText}`)
    }

    const threadData = await threadResponse.json()
    const threadId = threadData.id
    console.log('Created thread:', threadId)

    // Add message to thread with raw assessment data and explicit JSON instruction
    const messageContent = `${JSON.stringify(rawAssessmentData)}

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
      console.error('Message creation error:', messageResponse.status, errorText)
      throw new Error(`Message creation error: ${messageResponse.status} - ${errorText}`)
    }

    console.log('Added message to thread')

    // Run the assistant with additional parameters to enforce JSON
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
      console.error('Run creation error:', runResponse.status, errorText)
      throw new Error(`Run creation error: ${runResponse.status} - ${errorText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.id
    console.log('Started run:', runId)

    // Poll for completion
    let runStatus = 'in_progress'
    let attempts = 0
    const maxAttempts = 30 // 30 seconds timeout

    while (runStatus === 'in_progress' || runStatus === 'queued') {
      if (attempts >= maxAttempts) {
        throw new Error('Assistant run timeout')
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Status check error: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.status
      attempts++
      
      console.log(`Run status: ${runStatus} (attempt ${attempts})`)
    }

    if (runStatus !== 'completed') {
      throw new Error(`Assistant run failed with status: ${runStatus}`)
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
      console.error('Messages retrieval error:', messagesResponse.status, errorText)
      throw new Error(`Messages retrieval error: ${messagesResponse.status} - ${errorText}`)
    }

    const messagesData = await messagesResponse.json()
    console.log('Retrieved messages from thread')

    // Get the assistant's response (first message from assistant)
    const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant')
    
    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      throw new Error('No response from assistant')
    }

    const rawContent = assistantMessage.content[0].text.value
    console.log('Raw content from OpenAI Assistant:', rawContent)

    let planData
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
      
      console.log('Cleaned content for parsing:', cleanedContent.substring(0, 200) + '...')
      
      // Try to parse the cleaned JSON
      planData = JSON.parse(cleanedContent)
      console.log('Successfully parsed plan data:', planData)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Failed to parse content:', rawContent)
      
      // If parsing fails, try to extract JSON using a more aggressive approach
      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          planData = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed plan data using regex extraction:', planData);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (secondParseError) {
        console.error('Second parse attempt failed:', secondParseError);
        throw new Error(`Failed to parse Assistant response as JSON: ${parseError.message}. Raw response: ${rawContent.substring(0, 500)}...`);
      }
    }

    // Validate the required structure
    if (!planData.workout_schedule || !planData.nutrition_plan || !planData.recommendations) {
      console.error('Invalid plan data structure:', planData)
      throw new Error('Invalid plan data structure from Assistant')
    }

    console.log('Generated plan data:', planData)

    // Store workout plans in the database
    const workoutPlans = []
    
    // Group exercises by week and workout
    const workoutsByWeekAndDay = {}
    
    for (const scheduleItem of planData.workout_schedule) {
      const key = `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`
      
      if (!workoutsByWeekAndDay[key]) {
        workoutsByWeekAndDay[key] = {
          title: scheduleItem.workout_title, // Map workout_title to title
          description: scheduleItem.description || `Week ${scheduleItem.week} - ${scheduleItem.workout_title}`,
          category: scheduleItem.category || 'strength',
          difficulty: parseInt(scheduleItem.difficulty) || 3, // Ensure it's a number
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
          user_id: user.id,
          title: workout.title, // Now properly mapped from workout_title
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
        throw workoutPlanError
      }

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
        throw exercisesError
      }

      // Schedule this workout for the appropriate day in the next 4 weeks
      const startDate = new Date()
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(workout.day)
      
      if (dayOfWeek !== -1) {
        for (let weekOffset = workout.week - 1; weekOffset < 4; weekOffset += 4) {
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

    console.log('Created workout plans successfully')

    // Create nutrition plan
    const { data: nutritionPlan, error: nutritionError } = await supabaseClient
      .from('nutrition_plans')
      .insert({
        user_id: user.id,
        title: 'NEW MUSCLE! Nutrition Plan',
        description: 'Personalized nutrition plan generated by NEW MUSCLE! AI Coach',
        daily_calories: planData.nutrition_plan.daily_calories,
        protein_g: planData.nutrition_plan.protein_g,
        carbs_g: planData.nutrition_plan.carbs_g,
        fat_g: planData.nutrition_plan.fat_g,
        diet_type: planData.nutrition_plan.diet_type,
        ai_generated: true
      })
      .select()
      .single()

    if (nutritionError) {
      console.error('Error creating nutrition plan:', nutritionError)
      throw nutritionError
    }

    // Create meal plans if provided
    if (planData.nutrition_plan.meals && planData.nutrition_plan.meals.length > 0) {
      const mealPlansToInsert = planData.nutrition_plan.meals.map((meal, index) => ({
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
        throw mealPlansError
      }
    }

    console.log('Created nutrition plan successfully')

    // Map assessment data to database format
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

    // Update user profile to mark assessment as completed
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        has_completed_assessment: true,
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

    console.log('Updated profile successfully')

    // Store assessment data
    const { error: assessmentError } = await supabaseClient
      .from('assessment_data')
      .insert({
        user_id: user.id,
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

    console.log('Assessment completed successfully for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'HashimFit fitness plan generated and stored successfully',
        data: {
          workout_plans: workoutPlans.length,
          nutrition_plan: nutritionPlan.id,
          recommendations: planData.recommendations
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-workout-plan function:', error)
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
