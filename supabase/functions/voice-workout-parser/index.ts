
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, transcriptText } = await req.json();
    
    let transcript = transcriptText;
    
    // If audio is provided, transcribe it first
    if (audio && !transcript) {
      console.log("Transcribing audio...");
      
      // Convert base64 to binary
      const binaryString = atob(audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Prepare form data for OpenAI Whisper
      const formData = new FormData();
      const blob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
      }
      
      const transcriptionResult = await transcriptionResponse.json();
      transcript = transcriptionResult.text;
      console.log("Transcribed text:", transcript);
    }
    
    if (!transcript) {
      throw new Error("No transcript available");
    }
    
    // Parse workout data using OpenAI
    console.log("Parsing workout data...");
    
    const parseResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an assistant that parses natural language workout logs into structured data. Extract:
- number of sets
- number of reps (can be a range like "8-12" or single number)
- exercise name (normalize to common names)
- weight in lbs (if given, convert from kg if needed)
- duration in minutes (for cardio exercises)

Return output as valid JSON only, like:
{ "sets": 3, "reps": "10", "exercise": "bench press", "weight_lbs": 215 }
or for cardio:
{ "sets": 1, "reps": "1", "exercise": "running", "duration_min": 20 }

If weight is not mentioned, omit weight_lbs field. Always include sets, reps, and exercise.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.1,
      }),
    });
    
    if (!parseResponse.ok) {
      throw new Error(`Parsing failed: ${await parseResponse.text()}`);
    }
    
    const parseResult = await parseResponse.json();
    const parsedContent = parseResult.choices[0].message.content;
    
    console.log("Parsed content:", parsedContent);
    
    // Parse the JSON response
    let workoutData;
    try {
      workoutData = JSON.parse(parsedContent);
    } catch (e) {
      throw new Error(`Failed to parse workout data: ${parsedContent}`);
    }
    
    return new Response(JSON.stringify({
      transcript,
      workoutData,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in voice-workout-parser:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
