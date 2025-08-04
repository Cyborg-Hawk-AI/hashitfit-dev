
// Example Supabase Edge Function for generating a workout plan

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      // Supabase API URL - env var exposed by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exposed by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth header of the user that called the function.
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Get logged in user data
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    // Get the request body
    const {
      goal,
      equipment,
      duration,
      focus,
      experience_level
    } = await req.json()
    
    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API Key')
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (profileError) throw profileError
    
    // Prepare prompt for OpenAI
    const prompt = `Generate a personalized workout plan with the following parameters:
    
    User Profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Fitness Goal: ${goal || profile.fitness_goal}
    - Available Equipment: ${equipment || profile.equipment}
    - Experience Level: ${experience_level || 'intermediate'}
    
    Workout Parameters:
    - Duration: ${duration || '45-60'} minutes
    - Focus Area: ${focus || 'full body'}
    
    Generate a structured workout with exercises, sets, reps, and rest periods. Return the response as a JSON object with the following structure:
    {
      "title": "Workout Title",
      "description": "Brief workout description",
      "category": "strength/cardio/hiit/recovery",
      "difficulty": 1-5,
      "duration_minutes": number,
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": number,
          "reps": "rep range or duration",
          "weight": "weight recommendation or bodyweight",
          "rest_seconds": number,
          "notes": "Optional form tips or alternatives"
        }
      ]
    }
    
    Only return the JSON object, no additional text.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional fitness coach who creates personalized workout plans.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    })

    const openAIData = await openAIResponse.json()
    
    // Parse the workout plan from AI response
    const workoutPlanString = openAIData.choices[0].message.content
    const workoutPlan = JSON.parse(workoutPlanString)
    
    // Save the workout plan to the database
    const { data: savedWorkoutPlan, error: workoutPlanError } = await supabaseClient
      .from('workout_plans')
      .insert({
        user_id: user.id,
        title: workoutPlan.title,
        description: workoutPlan.description,
        category: workoutPlan.category,
        difficulty: workoutPlan.difficulty,
        estimated_duration: `${workoutPlan.duration_minutes} minutes`,
        ai_generated: true
      })
      .select()
      .single()
    
    if (workoutPlanError) throw workoutPlanError
    
    // Save the exercises
    const exercisesToInsert = workoutPlan.exercises.map((exercise, index) => ({
      workout_plan_id: savedWorkoutPlan.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      rest_time: exercise.rest_seconds ? `${exercise.rest_seconds} seconds` : null,
      notes: exercise.notes,
      order_index: index
    }))
    
    const { data: savedExercises, error: exercisesError } = await supabaseClient
      .from('workout_exercises')
      .insert(exercisesToInsert)
      .select()
    
    if (exercisesError) throw exercisesError

    return new Response(
      JSON.stringify({
        workout: {
          ...savedWorkoutPlan,
          exercises: savedExercises
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
