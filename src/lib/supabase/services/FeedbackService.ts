import supabase from '@/lib/supabase';

export interface UserFeedback {
  id?: string;
  user_id: string;
  feedback_text: string;
  feedback_type?: 'bug' | 'feature' | 'general' | 'improvement';
  page_location?: string;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
}

export class FeedbackService {
  static async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: feedback.user_id,
          feedback_text: feedback.feedback_text,
          feedback_type: feedback.feedback_type || 'general',
          page_location: feedback.page_location || window.location.pathname,
          user_agent: feedback.user_agent || navigator.userAgent
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: 'Failed to submit feedback' };
    }
  }

  static async getUserFeedback(userId: string): Promise<UserFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }
  }

  static async deleteFeedback(feedbackId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) {
        console.error('Error deleting feedback:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return { success: false, error: 'Failed to delete feedback' };
    }
  }
}
