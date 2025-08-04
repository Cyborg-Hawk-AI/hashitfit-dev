
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

export async function sendChatMessage(message: string): Promise<string> {
  try {
    console.log('Sending message to AI chat service');
    
    // Simplified approach - direct fetch to edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ message } as ChatRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from chat function:", errorText);
      throw new Error(`Edge function error (${response.status})`);
    }
    
    const data = await response.json() as ChatResponseBody;
    
    if (!data || !data.message) {
      console.error('No valid response from AI chat function');
      throw new Error('No valid response from AI chat function');
    }
    
    console.log('Received response from AI chat service');
    return data.message;
  } catch (error) {
    console.error('Error calling AI chat function:', error);
    // Return a fallback response
    return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
  }
}
