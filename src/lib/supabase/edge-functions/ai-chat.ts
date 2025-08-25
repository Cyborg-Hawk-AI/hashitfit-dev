
import supabase from '@/lib/supabase';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export interface ChatMessage {
  id?: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  thread_id?: string;
  run_id?: string;
  ai_prompt_tokens?: number;
  ai_completion_tokens?: number;
}

interface ChatRequestBody {
  message: string;
}

interface ChatResponseBody {
  message: string;
}

// Temporary AI responses as fallback while edge function is being deployed
const getTemporaryAIResponse = async (message: string, userId: string): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  
  // Get user data for personalized responses
  let userData = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      // Fetch some basic user data for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Fix: Use correct column name - 'created_at' instead of 'completion_date'
      const { data: recentWorkouts } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      userData = { profile, recentWorkouts };
    }
  } catch (error) {
    console.log('Could not fetch user data for context:', error);
    // Continue without user data - the AI will still provide helpful responses
  }

  // Fitness-related responses
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('training')) {
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return `Based on your fitness profile, I'd recommend focusing on compound movements. Here are some great exercises to try:

**Upper Body:**
• Push-ups: 3 sets of 10-15 reps
• Pull-ups: 3 sets of 5-10 reps
• Dumbbell rows: 3 sets of 12 reps

**Lower Body:**
• Squats: 3 sets of 15-20 reps
• Lunges: 3 sets of 10 reps per leg
• Glute bridges: 3 sets of 15 reps

**Core:**
• Planks: 3 sets of 30-60 seconds
• Dead bugs: 3 sets of 10 reps per side

Start with 3-4 workouts per week and gradually increase intensity. Remember to warm up properly and listen to your body!`;
    }
    
    if (lowerMessage.includes('routine') || lowerMessage.includes('plan')) {
      return `Here's a balanced weekly workout routine for you:

**Monday: Upper Body Push**
• Push-ups: 3x10-15
• Shoulder press: 3x12
• Tricep dips: 3x10

**Tuesday: Lower Body**
• Squats: 3x15-20
• Lunges: 3x10 each leg
• Calf raises: 3x20

**Wednesday: Rest/Cardio**
• Light walking or stretching

**Thursday: Upper Body Pull**
• Pull-ups: 3x5-10
• Rows: 3x12
• Bicep curls: 3x12

**Friday: Full Body**
• Deadlifts: 3x10
• Burpees: 3x10
• Mountain climbers: 3x30 seconds

**Weekend: Active Recovery**
• Yoga or light cardio

This routine provides good balance and allows for proper recovery!`;
    }
    
    return `Great question about workouts! I can help you with exercise recommendations, form tips, and creating workout routines. 

What specific aspect of working out would you like to know more about? For example:
• Exercise recommendations
• Workout routines
• Form and technique
• Recovery strategies
• Progress tracking`;
  }
  
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('meal')) {
    return `Nutrition is crucial for fitness success! Here are some key principles:

**Macronutrients:**
• Protein: 0.8-1.2g per pound of body weight
• Carbs: 2-4g per pound (adjust based on activity)
• Fats: 0.3-0.5g per pound

**Meal Timing:**
• Eat protein with every meal
• Pre-workout: Carbs + protein 1-2 hours before
• Post-workout: Protein + carbs within 30 minutes

**Hydration:**
• Aim for 8-10 glasses of water daily
• More if you're active or in hot weather

**Sample Meal Plan:**
Breakfast: Oatmeal with berries and protein
Snack: Greek yogurt with nuts
Lunch: Grilled chicken with quinoa and vegetables
Snack: Apple with almond butter
Dinner: Salmon with sweet potato and greens

Would you like specific meal ideas or help with meal planning?`;
  }
  
  if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('results')) {
    return `Tracking your progress is essential for staying motivated! Here's how to do it effectively:

**What to Track:**
• Workout frequency and duration
• Weight and reps for strength exercises
• Body measurements (waist, arms, etc.)
• Progress photos
• Energy levels and mood

**Measurement Tips:**
• Weigh yourself at the same time each week
• Take measurements monthly
• Progress photos every 2-4 weeks
• Keep a workout journal

**Progress Indicators:**
• Increased strength (heavier weights)
• Better endurance (more reps/duration)
• Improved body composition
• Better sleep and energy
• Clothes fitting differently

Remember: Progress isn't always linear. Focus on consistency and celebrate small wins!`;
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated') || lowerMessage.includes('stuck')) {
    return `Staying motivated is a common challenge! Here are some strategies:

**Set SMART Goals:**
• Specific: "I want to do 20 push-ups"
• Measurable: Track your progress
• Achievable: Start with realistic targets
• Relevant: Align with your values
• Time-bound: Set deadlines

**Build Habits:**
• Start small (5 minutes daily)
• Stack habits (workout after coffee)
• Make it enjoyable (music, podcasts)
• Track your streak

**Find Your Why:**
• Health and longevity
• Confidence and self-esteem
• Setting an example for others
• Stress relief and mental health

**Overcome Plateaus:**
• Change up your routine
• Increase intensity gradually
• Focus on form improvement
• Celebrate non-scale victories

Remember: Every workout counts, even the short ones!`;
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI fitness assistant. I can help you with:

• **Workout planning** and exercise recommendations
• **Nutrition guidance** and meal planning
• **Progress tracking** and goal setting
• **Motivation** and habit building
• **Form tips** and injury prevention

I can access your fitness data to provide personalized advice. What would you like to work on today?`;
  }
  
  // Default response
  return `I'm here to help with your fitness journey! I can assist with:

• **Workouts**: Exercise recommendations, routines, form tips
• **Nutrition**: Meal planning, macro guidance, healthy eating
• **Progress**: Tracking, goal setting, motivation
• **Recovery**: Rest strategies, injury prevention
• **General fitness**: Questions about health and wellness

What specific area would you like to focus on? I'm ready to provide personalized advice based on your goals!`;
};

export async function sendChatMessage(message: string): Promise<string> {
  try {
    console.log('Sending message to AI chat service');
    
    // Get the current user's session to get the JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      console.error('No authenticated session found:', sessionError);
      return "I need you to be logged in to provide personalized fitness advice. Please log in and try again.";
    }

    // Get user ID from session
    const userId = session.user.id;
    
    // Try the deployed edge function first
    try {
      console.log('Attempting to use deployed edge function');
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message } as ChatRequestBody),
      });

      if (response.ok) {
        const data = await response.json() as ChatResponseBody;
        
        if (data && data.message) {
          console.log('Successfully received response from deployed edge function');
          return data.message;
        }
      } else {
        const errorText = await response.text();
        console.error("Error from deployed edge function:", errorText);
        
        // If the function is not deployed (404), use temporary response
        if (response.status === 404) {
          console.log('Edge function not found, using temporary AI response');
          return await getTemporaryAIResponse(message, userId);
        }
        
        // Handle authentication errors
        if (response.status === 400 && errorText.includes('No user found')) {
          console.log('Authentication error, using temporary AI response');
          return await getTemporaryAIResponse(message, userId);
        }
        
        // For other errors, use temporary response
        console.log('Other error from edge function, using temporary AI response');
        return await getTemporaryAIResponse(message, userId);
      }
    } catch (edgeFunctionError) {
      console.error('Edge function error, falling back to temporary AI:', edgeFunctionError);
    }
    
    // Fallback to temporary AI response
    console.log('Using temporary AI response as fallback');
    const response = await getTemporaryAIResponse(message, userId);
    
    console.log('Received response from temporary AI service');
    return response;
    
  } catch (error) {
    console.error('Error calling AI chat function:', error);
    
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      return "I'm having trouble connecting to my AI service right now. This usually means the AI chat function needs to be deployed to Supabase. Please check the deployment status. Here's a quick fitness tip while we get this sorted: Remember to stay hydrated and get adequate sleep for optimal recovery!";
    }
    
    // Return a fallback response
    return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment. In the meantime, here's a fitness tip: Focus on compound movements like squats, deadlifts, and bench press for maximum efficiency.";
  }
}
