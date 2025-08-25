
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

// Send a message to the AI chat service with streaming support
export const sendChatMessage = async (
  message: string, 
  onChunk?: (chunk: string) => void,
  onComplete?: (fullMessage: string) => void,
  onError?: (error: string) => void
): Promise<string> => {
  console.log('Sending message to AI chat service')
  
  try {
    // Get user session for authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No active session found')
    }

    // Call the edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error from deployed edge function:', errorText)
      
      // Check for specific error types
      if (response.status === 400 && errorText.includes('No user found')) {
        const errorMessage = 'Authentication error. Please try logging in again.'
        onError?.(errorMessage)
        return errorMessage
      }
      
      if (response.status === 404) {
        const errorMessage = 'AI service is currently being deployed. Please try again in a few minutes.'
        onError?.(errorMessage)
        return errorMessage
      }
      
      const errorMessage = `Edge function error (${response.status}): ${errorText}`
      onError?.(errorMessage)
      return errorMessage
    }

    // Check if response is streaming (SSE)
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/event-stream')) {
      console.log('Received streaming response from edge function')
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body available')
      }

      const decoder = new TextDecoder()
      let fullMessage = ''
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          
          // Process complete lines
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // Remove 'data: ' prefix
              
              if (data === '[DONE]') {
                console.log('Stream completed')
                onComplete?.(fullMessage)
                return fullMessage
              }
              
              try {
                const parsed = JSON.parse(data)
                console.log('Parsed SSE data:', parsed) // Debug log
                
                // Handle OpenAI Responses API format
                if (parsed.type === 'response.output_text.delta' && parsed.delta) {
                  const chunk = parsed.delta
                  console.log('Processing delta chunk:', chunk) // Debug log
                  fullMessage += chunk
                  onChunk?.(chunk)
                }
                
                // Handle response completion
                if (parsed.type === 'response.output_text.done' && parsed.text) {
                  console.log('Response completed, full text:', parsed.text) // Debug log
                  fullMessage = parsed.text
                  onComplete?.(fullMessage)
                  return fullMessage
                }
                
                // Fallback: Handle old Chat Completions API format
                if (parsed.choices?.[0]?.delta?.content) {
                  const chunk = parsed.choices[0].delta.content
                  console.log('Processing legacy chunk:', chunk) // Debug log
                  fullMessage += chunk
                  onChunk?.(chunk)
                }
              } catch (e) {
                console.log('Failed to parse SSE line:', line, e) // Debug log
                // Ignore parsing errors for non-JSON lines
              }
            }
          }
        }
        
        onComplete?.(fullMessage)
        return fullMessage
        
      } finally {
        reader.releaseLock()
      }
    } else {
      // Fallback to JSON response (for non-streaming responses)
      console.log('Received JSON response from edge function')
      const data = await response.json()
      
      if (data.error) {
        const errorMessage = `Error: ${data.error}`
        onError?.(errorMessage)
        return errorMessage
      }
      
      const message = data.message || 'No response received'
      onComplete?.(message)
      return message
    }

  } catch (error) {
    console.error('Error calling AI chat function:', error)
    
    // Fallback to temporary AI response
    console.log('Authentication error, using temporary AI response')
    const fallbackResponse = await getTemporaryAIResponse(message, 'fallback-user-id')
    onComplete?.(fallbackResponse)
    return fallbackResponse
  }
}
