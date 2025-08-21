import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { RecommendationsService, UserRecommendations } from '@/lib/supabase/services/RecommendationsService';
import { DynamicRecommendationsService } from '@/lib/supabase/services/DynamicRecommendationsService';
import supabase, { supabaseUrl } from '@/lib/supabase';

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useAICoach() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
    // Initialize with a welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your AI fitness coach. I'm here to help you with personalized workout advice, nutrition tips, and motivation. What would you like to know?",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to chat with your AI coach",
        variant: "destructive"
      });
      return;
    }

    const userMessage: AICoachMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGeneratingResponse(true);

    try {
      // TODO: Implement actual AI coach chat functionality
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand your question about fitness. Let me provide you with personalized advice based on your current progress and goals. This feature is coming soon!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to AI coach:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResponse(false);
    }
  }, [userId, toast]);

  const generateNewRecommendations = useCallback(async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to generate recommendations",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Generating Recommendations",
        description: "Analyzing your recent progress and generating personalized insights...",
      });

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get user profile data for context
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile, using default values:', profileError);
      }

      // Get historical workout data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: workoutLogs, error: workoutError } = await supabase
        .from('workout_logs')
        .select(`
          *,
          workout_plans(title, description, category)
        `)
        .eq('user_id', userId)
        .gte('start_time', thirtyDaysAgo.toISOString())
        .order('start_time', { ascending: false });

      if (workoutError) {
        console.warn('Could not fetch workout logs:', workoutError);
      }

      // Get nutrition data (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: nutritionLogs, error: nutritionError } = await supabase
        .from('nutrition_logs')
        .select(`
          *,
          meal_logs(*)
        `)
        .eq('user_id', userId)
        .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (nutritionError) {
        console.warn('Could not fetch nutrition logs:', nutritionError);
      }

      // Get today's completed meals specifically
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMeals, error: todayMealsError } = await supabase
        .from('nutrition_logs')
        .select(`
          *,
          meal_logs(*)
        `)
        .eq('user_id', userId)
        .eq('log_date', today)
        .single();

      if (todayMealsError) {
        console.warn('Could not fetch today\'s meals:', todayMealsError);
      }

      // Get current workout plan and schedule
      const { data: workoutSchedules, error: scheduleError } = await supabase
        .from('workout_schedules')
        .select(`
          *,
          workout_plans!inner(title, description, exercises)
        `)
        .eq('user_id', userId)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (scheduleError) {
        console.warn('Could not fetch workout schedules:', scheduleError);
      }

      // Get nutrition plan
      const { data: nutritionPlan, error: nutritionPlanError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (nutritionPlanError) {
        console.warn('Could not fetch nutrition plan:', nutritionPlanError);
      }

      // Calculate progress metrics
      const workoutProgress = {
        totalWorkouts: workoutLogs?.length || 0,
        completedThisWeek: workoutLogs?.filter(log => {
          const logDate = new Date(log.start_time);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo;
        }).length || 0,
        averageRating: workoutLogs?.length > 0 
          ? workoutLogs.reduce((sum, log) => sum + (log.rating || 0), 0) / workoutLogs.length 
          : 0,
        missedWorkouts: workoutSchedules?.filter(schedule => {
          const scheduleDate = new Date(schedule.scheduled_date);
          const today = new Date();
          return scheduleDate < today && !workoutLogs?.some(log => 
            new Date(log.start_time).toDateString() === scheduleDate.toDateString()
          );
        }).length || 0,
        recentWorkoutTypes: workoutLogs?.slice(0, 5).map(log => log.workout_plans?.category || 'unknown') || []
      };

      // Calculate nutrition progress including meal counts
      const totalMealsLogged = nutritionLogs?.reduce((total, log) => 
        total + (log.meal_logs?.length || 0), 0) || 0;
      
      const todayMealsLogged = todayMeals?.meal_logs?.length || 0;
      
      const nutritionProgress = {
        totalMeals: totalMealsLogged,
        mealsToday: todayMealsLogged,
        averageCalories: nutritionLogs?.length > 0
          ? nutritionLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0) / nutritionLogs.length
          : 0,
        averageProtein: nutritionLogs?.length > 0
          ? nutritionLogs.reduce((sum, log) => sum + (log.total_protein_g || 0), 0) / nutritionLogs.length
          : 0,
        targetCalories: nutritionPlan?.daily_calories || 2000,
        targetProtein: nutritionPlan?.daily_protein || 150,
        recentMealTypes: nutritionLogs?.slice(0, 3).flatMap(log => 
          log.meal_logs?.map(meal => meal.meal_type) || []
        ) || []
      };

      // Call the recommendations-assistant edge function
      const requestBody = {
        user_id: userId,
        assessment: {
          // Use actual profile data or fallback to defaults
          age: profile?.age || 30,
          gender: profile?.gender || 'male',
          height: profile?.height || 175,
          weight: profile?.weight || 75,
          fitnessGoal: profile?.fitness_goal || 'general_fitness',
          workoutFrequency: profile?.workout_frequency || 3,
          equipment: profile?.equipment || 'minimal',
          diet: profile?.diet || 'standard',
          sportsPlayed: profile?.sports_played || [],
          allergies: profile?.allergies || []
        },
        historicalData: {
          workoutProgress,
          nutritionProgress,
          recentWorkouts: workoutLogs?.slice(0, 5) || [], // Last 5 workouts
          recentMeals: nutritionLogs?.slice(0, 10) || [], // Last 10 meals
          todayMeals: todayMeals?.meal_logs || [], // Today's completed meals
          upcomingWorkouts: workoutSchedules?.slice(0, 7) || [], // Next 7 days
          currentNutritionPlan: nutritionPlan || null,
          // Add detailed progress metrics
          progressSummary: {
            workoutsThisWeek: workoutProgress.completedThisWeek,
            mealsToday: nutritionProgress.mealsToday,
            totalMealsThisWeek: totalMealsLogged,
            averageWorkoutRating: workoutProgress.averageRating,
            missedWorkouts: workoutProgress.missedWorkouts,
            recentWorkoutTypes: workoutProgress.recentWorkoutTypes,
            recentMealTypes: nutritionProgress.recentMealTypes
          }
        }
      };

      console.log('Calling recommendations-assistant with:', requestBody);
      console.log('🔍 Progress Summary:', {
        workoutsThisWeek: workoutProgress.completedThisWeek,
        mealsToday: nutritionProgress.mealsToday,
        totalMealsThisWeek: totalMealsLogged,
        todayMeals: todayMeals?.meal_logs?.length || 0,
        recentWorkouts: workoutLogs?.slice(0, 3).map(log => ({
          date: log.start_time,
          title: log.workout_plans?.title,
          category: log.workout_plans?.category
        }))
      });
      
      const response = await fetch(`${supabaseUrl}/functions/v1/recommendations-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to generate recommendations: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Edge function response:', result);
      
      if (result.success) {
        toast({
          title: "Recommendations Updated",
          description: "Your personalized recommendations have been updated based on your recent progress!",
        });
      } else {
        toast({
          title: "No New Recommendations",
          description: "Your current recommendations are still relevant. Keep up the great work!",
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  return {
    isChatOpen,
    messages,
    isGeneratingResponse,
    openChat,
    closeChat,
    sendMessage,
    generateNewRecommendations
  };
}
