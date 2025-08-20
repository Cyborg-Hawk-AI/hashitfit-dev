
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: number;
  rpe?: number;
  rest_seconds?: number;
  superset_group_id?: string;
  position_in_workout?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { prompt, currentExercises, workoutLogId } = await req.json();

    if (!prompt || !currentExercises) {
      throw new Error('Missing required fields: prompt and currentExercises');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing AI coach request:', { prompt, exerciseCount: currentExercises.length });

    // Prepare the system prompt
    const systemPrompt = `You are an expert AI fitness coach specialized in real-time workout modifications. 
    
Your role:
- Analyze the user's request and current workout exercises
- Provide intelligent modifications to exercise parameters (sets, reps, weight, rest_seconds)
- Suggest exercise substitutions when needed
- Maintain workout balance and progression
- Consider user's current state (fatigue, injury, equipment availability)

Current workout exercises:
${JSON.stringify(currentExercises, null, 2)}

Response format:
Return a JSON object with:
{
  "message": "Brief explanation of changes made",
  "updatedExercises": [...] // Modified exercise array with same structure
}

Guidelines:
- Keep the same exercise IDs
- Only modify necessary parameters
- Ensure sets/reps are realistic numbers
- Rest times should be 15-180 seconds
- If substituting exercises, keep the same muscle groups targeted
- Consider workout flow and superset groupings
- Be conservative with weight adjustments unless specifically requested`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received:', aiResponse);

    // Parse the AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Validate the response structure
    if (!parsedResponse.updatedExercises || !Array.isArray(parsedResponse.updatedExercises)) {
      throw new Error('Invalid AI response: missing updatedExercises array');
    }

    // If we have a workout log ID, update the exercise logs in the database
    if (workoutLogId && parsedResponse.updatedExercises) {
      console.log('Updating exercise logs in database');
      
      for (const exercise of parsedResponse.updatedExercises) {
        const updateData: any = {};
        
        if (exercise.sets !== undefined) updateData.sets_completed = exercise.sets;
        if (exercise.reps !== undefined) updateData.reps_completed = exercise.reps;
        if (exercise.weight !== undefined) updateData.weight_used = exercise.weight;
        if (exercise.rest_seconds !== undefined) updateData.rest_seconds = exercise.rest_seconds;
        if (exercise.position_in_workout !== undefined) updateData.position_in_workout = exercise.position_in_workout;
        
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('exercise_logs')
            .update(updateData)
            .eq('id', exercise.id);
            
          if (error) {
            console.error('Error updating exercise log:', error);
          }
        }
      }
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-workout-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Failed to process AI coach request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
