import supabase from '@/lib/supabase';
import { format } from 'date-fns';

export interface HabitScore {
  workoutScore: number; // 0-50
  nutritionScore: number; // 0-25
  waterScore: number; // 0-15
  sleepScore: number; // 0-10
  totalScore: number; // 0-100
}

export class HabitsService {
  static async getHabitScoreForDate(userId: string, date: string): Promise<HabitScore> {
    try {
      // Check workout completion
      const workoutScore = await this.getWorkoutScore(userId, date);
      
      // Check nutrition logging
      const nutritionScore = await this.getNutritionScore(userId, date);
      
      // Check water intake (placeholder - would need water_logs table)
      const waterScore = await this.getWaterScore(userId, date);
      
      // Check sleep tracking (placeholder - would need sleep_logs table)
      const sleepScore = await this.getSleepScore(userId, date);
      
      const totalScore = workoutScore + nutritionScore + waterScore + sleepScore;
      
      return {
        workoutScore,
        nutritionScore,
        waterScore,
        sleepScore,
        totalScore
      };
    } catch (error) {
      console.error('Error calculating habit score:', error);
      return {
        workoutScore: 0,
        nutritionScore: 0,
        waterScore: 0,
        sleepScore: 0,
        totalScore: 0
      };
    }
  }

  private static async getWorkoutScore(userId: string, date: string): Promise<number> {
    try {
      // Check if user completed any workout on this date
      const { data: workoutLogs, error } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('start_time', `${date}T00:00:00`)
        .lt('start_time', `${date}T23:59:59`)
        .limit(1);
        
      if (error) throw error;
      
      // If any workout was completed, give full workout score (50)
      return workoutLogs && workoutLogs.length > 0 ? 50 : 0;
    } catch (error) {
      console.error('Error getting workout score:', error);
      return 0;
    }
  }

  private static async getNutritionScore(userId: string, date: string): Promise<number> {
    try {
      // Check if user logged any nutrition on this date
      const { data: nutritionLogs, error } = await supabase
        .from('nutrition_logs')
        .select('id, meal_logs(id)')
        .eq('user_id', userId)
        .eq('log_date', date);
        
      if (error) throw error;
      
      if (!nutritionLogs || nutritionLogs.length === 0) return 0;
      
      // Count total meals logged
      const totalMeals = nutritionLogs.reduce((total, log) => {
        return total + (log.meal_logs?.length || 0);
      }, 0);
      
      // Score based on meals logged (max 25 points)
      // 1 meal = 6.25 points, 2 meals = 12.5 points, 3 meals = 18.75 points, 4+ meals = 25 points
      return Math.min(totalMeals * 6.25, 25);
    } catch (error) {
      console.error('Error getting nutrition score:', error);
      return 0;
    }
  }

  private static async getWaterScore(userId: string, date: string): Promise<number> {
    // Placeholder - would need water_logs table
    // For now, return 0 or a default score
    return 0;
  }

  private static async getSleepScore(userId: string, date: string): Promise<number> {
    // Placeholder - would need sleep_logs table
    // For now, return 0 or a default score
    return 0;
  }

  static async getWeeklyHabitScores(userId: string, startDate: string, endDate: string): Promise<Record<string, HabitScore>> {
    try {
      const scores: Record<string, HabitScore> = {};
      
      // Generate dates between start and end
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = format(d, 'yyyy-MM-dd');
        scores[dateString] = await this.getHabitScoreForDate(userId, dateString);
      }
      
      return scores;
    } catch (error) {
      console.error('Error getting weekly habit scores:', error);
      return {};
    }
  }
}
