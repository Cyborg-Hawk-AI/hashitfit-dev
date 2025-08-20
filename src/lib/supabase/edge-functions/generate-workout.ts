
import supabase from '@/lib/supabase';

interface WorkoutGenerateRequest {
  goal?: string;
  equipment?: string;
  duration?: string;
  focus?: string;
  experience_level?: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds?: number;
  notes?: string;
}

interface WorkoutGenerateResponse {
  workout: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    difficulty: number;
    estimated_duration: string;
    ai_generated: boolean;
    created_at: string;
    exercises: Exercise[];
  }
}

export async function generateWorkout(params: WorkoutGenerateRequest): Promise<WorkoutGenerateResponse['workout']> {
  try {
    const { data, error } = await supabase.functions.invoke<WorkoutGenerateResponse>('generate-workout', {
      body: params,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No response from workout generation function');
    
    return data.workout;
  } catch (error) {
    console.error('Error calling workout generation function:', error);
    throw error;
  }
}
