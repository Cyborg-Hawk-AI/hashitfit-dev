import supabase from '@/lib/supabase';

export interface UserRecommendations {
  id?: string;
  user_id: string;
  workout_tips?: string;
  nutrition_tips?: string;
  weekly_goals?: string;
  created_at?: string;
  updated_at?: string;
}

export class RecommendationsService {
  // Get user recommendations
  static async getUserRecommendations(userId: string): Promise<UserRecommendations | null> {
    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Object not found
          return null;
        }
        throw error;
      }
      return data as UserRecommendations;
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      return null;
    }
  }

  // Create or update user recommendations
  static async createOrUpdateRecommendations(recommendations: UserRecommendations): Promise<string | null> {
    try {
      // Check if recommendations already exist for this user
      const existingRecommendations = await this.getUserRecommendations(recommendations.user_id);
      
      if (existingRecommendations) {
        // Update existing recommendations
        const { error } = await supabase
          .from('user_recommendations')
          .update({
            workout_tips: recommendations.workout_tips,
            nutrition_tips: recommendations.nutrition_tips,
            weekly_goals: recommendations.weekly_goals
          })
          .eq('id', existingRecommendations.id);
          
        if (error) throw error;
        return existingRecommendations.id;
      } else {
        // Create new recommendations
        const { data, error } = await supabase
          .from('user_recommendations')
          .insert([recommendations])
          .select()
          .single();
          
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error('Error creating/updating recommendations:', error);
      return null;
    }
  }

  // Get all recommendations history for a user
  static async getRecommendationsHistory(userId: string): Promise<UserRecommendations[]> {
    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as UserRecommendations[];
    } catch (error) {
      console.error('Error fetching recommendations history:', error);
      return [];
    }
  }

  // Delete recommendations
  static async deleteRecommendations(recommendationsId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_recommendations')
        .delete()
        .eq('id', recommendationsId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recommendations:', error);
      return false;
    }
  }
}
