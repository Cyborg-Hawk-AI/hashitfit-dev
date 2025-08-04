import supabase from '@/lib/supabase';

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

export class ChatService {
  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }

      return data as ChatMessage[];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  }

  static subscribeToNewMessages(userId: string, callback: (newMessage: ChatMessage) => void): () => void {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          //console.log('Change received!', payload)
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    // Return the unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  static async saveChatMessage(message: ChatMessage): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([message]);

      if (error) {
        console.error('Error saving chat message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveChatMessage:', error);
      return false;
    }
  }

  static async getUserThread(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_assistant_threads')
        .select('thread_id')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user thread:', error);
        return null;
      }
      
      // If no thread found, return null
      if (!data || data.length === 0) {
        return null;
      }
      
      // If multiple threads found, use the first one (most recent)
      // This handles the duplicate thread issue
      return data[0]?.thread_id || null;
    } catch (error) {
      console.error('Error in getUserThread:', error);
      return null;
    }
  }
}
