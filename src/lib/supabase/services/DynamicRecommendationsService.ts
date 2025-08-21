import supabase from '@/lib/supabase';
import { RecommendationsService, UserRecommendations } from './RecommendationsService';

export interface WorkoutPerformance {
  workoutCount: number;
  averageRating: number;
  recentWorkouts: any[];
  missedWorkouts: number;
  streakDays: number;
}

export class DynamicRecommendationsService {
  // Analyze user's recent workout performance
  static async analyzeWorkoutPerformance(userId: string, daysBack: number = 7): Promise<WorkoutPerformance> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      // Get recent workout logs
      const { data: workoutLogs, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          workout_plan:workout_plans(title, category)
        `)
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;

      const recentWorkouts = workoutLogs || [];
      const workoutCount = recentWorkouts.length;
      const averageRating = recentWorkouts.length > 0 
        ? recentWorkouts.reduce((sum, workout) => sum + (workout.rating || 0), 0) / recentWorkouts.length 
        : 0;

      // Calculate missed workouts (simplified - assumes user should workout 3-4 times per week)
      const expectedWorkouts = Math.ceil(daysBack / 2); // Every other day
      const missedWorkouts = Math.max(0, expectedWorkouts - workoutCount);

      // Calculate streak (simplified)
      const streakDays = this.calculateStreak(recentWorkouts);

      return {
        workoutCount,
        averageRating,
        recentWorkouts,
        missedWorkouts,
        streakDays
      };
    } catch (error) {
      console.error('Error analyzing workout performance:', error);
      return {
        workoutCount: 0,
        averageRating: 0,
        recentWorkouts: [],
        missedWorkouts: 0,
        streakDays: 0
      };
    }
  }

  // Generate dynamic recommendations based on performance
  static async generateDynamicRecommendations(userId: string): Promise<UserRecommendations | null> {
    try {
      const performance = await this.analyzeWorkoutPerformance(userId);
      
      // Generate recommendations based on performance patterns
      const recommendations = this.generateRecommendationsFromPerformance(performance);
      
      // Store the new recommendations
      const recommendationId = await RecommendationsService.createOrUpdateRecommendations({
        user_id: userId,
        ...recommendations
      });

      if (recommendationId) {
        return await RecommendationsService.getUserRecommendations(userId);
      }

      return null;
    } catch (error) {
      console.error('Error generating dynamic recommendations:', error);
      return null;
    }
  }

  // Generate recommendations based on performance data
  private static generateRecommendationsFromPerformance(performance: WorkoutPerformance): Partial<UserRecommendations> {
    const { workoutCount, averageRating, missedWorkouts, streakDays } = performance;

    let workoutTips = '';
    let nutritionTips = '';
    let weeklyGoals = '';

    // Workout tips based on performance
    if (workoutCount === 0) {
      workoutTips = "It looks like you haven't worked out recently. Start with a simple 20-minute bodyweight routine to build momentum. Remember, consistency beats perfection!";
    } else if (workoutCount >= 4) {
      workoutTips = "Excellent consistency! You're working out regularly. Consider adding variety to your routine or increasing intensity to continue seeing progress.";
    } else if (missedWorkouts > 2) {
      workoutTips = "You've missed a few planned workouts. Try scheduling your workouts at the same time each day to build a habit. Even a 15-minute session counts!";
    } else {
      workoutTips = "Good progress! You're building a consistent workout routine. Focus on proper form and gradually increase the challenge to keep improving.";
    }

    // Nutrition tips
    if (workoutCount >= 3) {
      nutritionTips = "Since you're working out regularly, make sure you're eating enough protein (1.6-2.2g per kg body weight) to support muscle recovery and growth.";
    } else {
      nutritionTips = "Focus on building healthy eating habits. Start with regular meal times and include protein with each meal to support your fitness goals.";
    }

    // Weekly goals
    if (workoutCount === 0) {
      weeklyGoals = "This week, aim to complete 2-3 short workouts (15-20 minutes each). Focus on consistency over duration.";
    } else if (workoutCount >= 4) {
      weeklyGoals = "Maintain your momentum with 4-5 workouts this week. Try adding one new exercise or increasing weights by 5% where appropriate.";
    } else {
      weeklyGoals = "Build on your progress with 3-4 workouts this week. Focus on completing each session fully rather than rushing through.";
    }

    // Add streak-specific motivation
    if (streakDays > 0) {
      workoutTips += ` Keep up your ${streakDays}-day streak! Consistency is key to long-term success.`;
    }

    return {
      workout_tips: workoutTips,
      nutrition_tips: nutritionTips,
      weekly_goals: weeklyGoals
    };
  }

  // Calculate workout streak
  private static calculateStreak(workouts: any[]): number {
    if (workouts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasWorkout = workouts.some(workout => {
        const workoutDate = new Date(workout.start_time);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Trigger recommendations update after workout completion
  static async onWorkoutCompleted(userId: string): Promise<void> {
    try {
      // Wait a bit to ensure workout data is saved
      setTimeout(async () => {
        await this.generateDynamicRecommendations(userId);
      }, 1000);
    } catch (error) {
      console.error('Error updating recommendations after workout completion:', error);
    }
  }
}
