import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

// Types for the AI Chat Service
export interface UserMemory {
  id: string;
  kind: 'fact' | 'preference' | 'summary' | 'note';
  content: string;
  importance: number;
  embedding_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: 'workout' | 'nutrition' | 'recovery' | 'general' | 'safety';
  embedding_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  key: string;
  name: string;
  description: string;
  user_scoped: boolean;
  config: {
    table: string;
    columns: string[];
    filters?: Array<{ col: string; op: string; val: string }>;
    order_by?: string;
  };
  is_active: boolean;
}

export interface Embedding {
  id: string;
  collection: 'memories' | 'documents';
  embedding: number[];
  metadata?: any;
  created_at: string;
}

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

class AIChatService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Set auth token for user-specific operations
  setAuthToken(token: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  // 3.1 search_memory - Retrieve top-K durable memories for the user
  async searchMemory(query: string, k: number = 5): Promise<{ items: Array<{ id: string; kind: string; content: string; score?: number }> }> {
    try {
      // For now, use simple text search. In production, this would use embeddings
      const { data, error } = await this.supabase
        .from('user_memories')
        .select('id, kind, content, importance')
        .or(`content.ilike.%${query}%,content.ilike.%${query.split(' ').join('%')}%`)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(k);

      if (error) throw error;

      return {
        items: data.map((memory: UserMemory) => ({
          id: memory.id,
          kind: memory.kind,
          content: memory.content,
          score: memory.importance / 5 // Normalize importance to 0-1
        }))
      };
    } catch (error) {
      console.error('Error searching memory:', error);
      return { items: [] };
    }
  }

  // 3.2 write_memory - Persist durable user memory
  async writeMemory(kind: 'fact' | 'preference' | 'summary' | 'note', content: string, importance: number = 1): Promise<{ id: string; created_at: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_memories')
        .insert({
          kind,
          content,
          importance: Math.max(1, Math.min(5, importance))
        })
        .select('id, created_at')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error writing memory:', error);
      throw error;
    }
  }

  // 3.3 get_user_data - Fetch relevant rows from data sources
  async getUserData(query: string, timeRange?: { from?: string; to?: string }, sourceKeys?: string[], limit: number = 50): Promise<{ sources: Array<{ key: string; rows: any[] }> }> {
    try {
      // Get available data sources
      const { data: sources, error: sourcesError } = await this.supabase
        .from('data_source_registry')
        .select('*')
        .eq('is_active', true)
        .in('key', sourceKeys || ['profiles', 'progress_metrics', 'workout_logs', 'exercise_logs', 'nutrition_logs', 'meal_logs', 'fitness_assessments']);

      if (sourcesError) throw sourcesError;

      const results: Array<{ key: string; rows: any[] }> = [];

      for (const source of sources) {
        try {
          let queryBuilder = this.supabase
            .from(source.config.table)
            .select(source.config.columns.join(', '))
            .limit(limit);

          // Apply time range filters if specified
          if (timeRange?.from) {
            const dateColumns = source.config.columns.filter(col => 
              col.includes('date') || col.includes('time') || col.includes('created_at')
            );
            if (dateColumns.length > 0) {
              queryBuilder = queryBuilder.gte(dateColumns[0], timeRange.from);
            }
          }
          if (timeRange?.to) {
            const dateColumns = source.config.columns.filter(col => 
              col.includes('date') || col.includes('time') || col.includes('created_at')
            );
            if (dateColumns.length > 0) {
              queryBuilder = queryBuilder.lte(dateColumns[0], timeRange.to);
            }
          }

          // Apply default filters
          if (source.config.filters) {
            for (const filter of source.config.filters) {
              switch (filter.op) {
                case '=':
                  queryBuilder = queryBuilder.eq(filter.col, filter.val);
                  break;
                case '>':
                  queryBuilder = queryBuilder.gt(filter.col, filter.val);
                  break;
                case '>=':
                  queryBuilder = queryBuilder.gte(filter.col, filter.val);
                  break;
                case '<':
                  queryBuilder = queryBuilder.lt(filter.col, filter.val);
                  break;
                case '<=':
                  queryBuilder = queryBuilder.lte(filter.col, filter.val);
                  break;
                case 'like':
                  queryBuilder = queryBuilder.ilike(filter.col, `%${filter.val}%`);
                  break;
              }
            }
          }

          // Apply ordering
          if (source.config.order_by) {
            const [column, direction] = source.config.order_by.split(' ');
            queryBuilder = queryBuilder.order(column, { ascending: direction !== 'desc' });
          }

          const { data, error } = await queryBuilder;

          if (error) {
            console.error(`Error fetching data from ${source.key}:`, error);
            continue;
          }

          results.push({
            key: source.key,
            rows: data || []
          });
        } catch (error) {
          console.error(`Error processing source ${source.key}:`, error);
        }
      }

      return { sources: results };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { sources: [] };
    }
  }

  // 3.4 search_documents - Semantic retrieval from documents
  async searchDocuments(query: string, k: number = 5): Promise<{ chunks: Array<{ id: string; title: string; excerpt: string; score?: number }> }> {
    try {
      // For now, use simple text search. In production, this would use embeddings
      const { data, error } = await this.supabase
        .from('documents')
        .select('id, title, content, category')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,content.ilike.%${query.split(' ').join('%')}%`)
        .order('created_at', { ascending: false })
        .limit(k);

      if (error) throw error;

      return {
        chunks: data.map((doc: Document) => ({
          id: doc.id,
          title: doc.title,
          excerpt: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
          score: 0.8 // Placeholder score
        }))
      };
    } catch (error) {
      console.error('Error searching documents:', error);
      return { chunks: [] };
    }
  }

  // 3.5 upsert_embeddings - Create/update embeddings (internal)
  async upsertEmbeddings(items: Array<{ id: string; text: string; collection: 'memories' | 'documents' }>): Promise<{ updated: string[] }> {
    try {
      // In production, this would call OpenAI's embedding API
      // For now, we'll just return the IDs as if they were updated
      const updatedIds = items.map(item => item.id);
      
      // Update the embedding_id in the respective tables
      for (const item of items) {
        if (item.collection === 'memories') {
          await this.supabase
            .from('user_memories')
            .update({ embedding_id: item.id })
            .eq('id', item.id);
        } else if (item.collection === 'documents') {
          await this.supabase
            .from('documents')
            .update({ embedding_id: item.id })
            .eq('id', item.id);
        }
      }

      return { updated: updatedIds };
    } catch (error) {
      console.error('Error upserting embeddings:', error);
      return { updated: [] };
    }
  }

  // Chat message management
  async saveChatMessage(message: ChatMessage): Promise<ChatMessage> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Thread management
  async getOrCreateThread(userId: string): Promise<string> {
    try {
      // Check if user has an existing thread
      const { data: existingThread } = await this.supabase
        .from('user_assistant_threads')
        .select('thread_id')
        .eq('user_id', userId)
        .single();

      if (existingThread?.thread_id) {
        return existingThread.thread_id;
      }

      // Create a new thread (this would be done by the edge function)
      // For now, return a placeholder
      return 'new-thread-id';
    } catch (error) {
      console.error('Error getting or creating thread:', error);
      return 'new-thread-id';
    }
  }

  // Real-time subscription for new messages
  subscribeToNewMessages(userId: string, callback: (message: ChatMessage) => void) {
    return this.supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }
}

export const aiChatService = new AIChatService();
