import supabase from '@/lib/supabase';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export interface StreakData {
  workoutStreak: number;
  nutritionStreak: number;
  longestWorkoutStreak: number;
  longestNutritionStreak: number;
  currentWeekStreak: number;
  lastWorkoutDate: string | null;
  lastNutritionDate: string | null;
}

export class StreakService {
  // Calculate workout streak (consecutive days with completed workouts)
  static async calculateWorkoutStreak(userId: string): Promise<number> {
    try {
      // Get workout logs for the last 365 days
      const oneYearAgo = subDays(new Date(), 365);
      const { data: workoutLogs, error } = await supabase
        .from('workout_logs')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .gte('start_time', oneYearAgo.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;

      return this.calculateConsecutiveDays(workoutLogs, 'start_time');
    } catch (error) {
      console.error('Error calculating workout streak:', error);
      return 0;
    }
  }

  // Calculate nutrition streak (consecutive days with logged meals)
  static async calculateNutritionStreak(userId: string): Promise<number> {
    try {
      // Get nutrition logs for the last 365 days
      const oneYearAgo = subDays(new Date(), 365);
      const { data: nutritionLogs, error } = await supabase
        .from('nutrition_logs')
        .select('log_date')
        .eq('user_id', userId)
        .gte('log_date', format(oneYearAgo, 'yyyy-MM-dd'))
        .order('log_date', { ascending: false });

      if (error) throw error;

      return this.calculateConsecutiveDays(nutritionLogs, 'log_date');
    } catch (error) {
      console.error('Error calculating nutrition streak:', error);
      return 0;
    }
  }

  // Calculate longest workout streak
  static async calculateLongestWorkoutStreak(userId: string): Promise<number> {
    try {
      // Get all workout logs
      const { data: workoutLogs, error } = await supabase
        .from('workout_logs')
        .select('start_time')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return this.calculateLongestStreak(workoutLogs, 'start_time');
    } catch (error) {
      console.error('Error calculating longest workout streak:', error);
      return 0;
    }
  }

  // Calculate longest nutrition streak
  static async calculateLongestNutritionStreak(userId: string): Promise<number> {
    try {
      // Get all nutrition logs
      const { data: nutritionLogs, error } = await supabase
        .from('nutrition_logs')
        .select('log_date')
        .eq('user_id', userId)
        .order('log_date', { ascending: true });

      if (error) throw error;

      return this.calculateLongestStreak(nutritionLogs, 'log_date');
    } catch (error) {
      console.error('Error calculating longest nutrition streak:', error);
      return 0;
    }
  }

  // Get last workout date
  static async getLastWorkoutDate(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('start_time')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data ? format(new Date(data.start_time), 'yyyy-MM-dd') : null;
    } catch (error) {
      console.error('Error getting last workout date:', error);
      return null;
    }
  }

  // Get last nutrition date
  static async getLastNutritionDate(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('log_date')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data ? data.log_date : null;
    } catch (error) {
      console.error('Error getting last nutrition date:', error);
      return null;
    }
  }

  // Calculate current week streak (days this week with activity)
  static async calculateCurrentWeekStreak(userId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

      // Get workout logs for this week
      const { data: workoutLogs, error: workoutError } = await supabase
        .from('workout_logs')
        .select('start_time')
        .eq('user_id', userId)
        .gte('start_time', startOfWeek.toISOString())
        .order('start_time', { ascending: true });

      if (workoutError) throw workoutError;

      // Get nutrition logs for this week
      const { data: nutritionLogs, error: nutritionError } = await supabase
        .from('nutrition_logs')
        .select('log_date')
        .eq('user_id', userId)
        .gte('log_date', format(startOfWeek, 'yyyy-MM-dd'))
        .order('log_date', { ascending: true });

      if (nutritionError) throw nutritionError;

      // Combine and count unique days with activity
      const activeDays = new Set();

      // Add workout days
      workoutLogs?.forEach(log => {
        activeDays.add(format(new Date(log.start_time), 'yyyy-MM-dd'));
      });

      // Add nutrition days
      nutritionLogs?.forEach(log => {
        activeDays.add(log.log_date);
      });

      return activeDays.size;
    } catch (error) {
      console.error('Error calculating current week streak:', error);
      return 0;
    }
  }

  // Get comprehensive streak data
  static async getStreakData(userId: string): Promise<StreakData> {
    try {
      const [
        workoutStreak,
        nutritionStreak,
        longestWorkoutStreak,
        longestNutritionStreak,
        currentWeekStreak,
        lastWorkoutDate,
        lastNutritionDate
      ] = await Promise.all([
        this.calculateWorkoutStreak(userId),
        this.calculateNutritionStreak(userId),
        this.calculateLongestWorkoutStreak(userId),
        this.calculateLongestNutritionStreak(userId),
        this.calculateCurrentWeekStreak(userId),
        this.getLastWorkoutDate(userId),
        this.getLastNutritionDate(userId)
      ]);

      return {
        workoutStreak,
        nutritionStreak,
        longestWorkoutStreak,
        longestNutritionStreak,
        currentWeekStreak,
        lastWorkoutDate,
        lastNutritionDate
      };
    } catch (error) {
      console.error('Error getting streak data:', error);
      return {
        workoutStreak: 0,
        nutritionStreak: 0,
        longestWorkoutStreak: 0,
        longestNutritionStreak: 0,
        currentWeekStreak: 0,
        lastWorkoutDate: null,
        lastNutritionDate: null
      };
    }
  }

  // Helper: Calculate consecutive days from current date
  private static calculateConsecutiveDays(logs: any[], dateField: string): number {
    if (!logs || logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Check each day backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const dateString = format(checkDate, 'yyyy-MM-dd');

      const hasActivity = logs.some(log => {
        const logDate = dateField === 'log_date' 
          ? log[dateField] 
          : format(new Date(log[dateField]), 'yyyy-MM-dd');
        return logDate === dateString;
      });

      if (hasActivity) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  // Helper: Calculate longest streak in history
  private static calculateLongestStreak(logs: any[], dateField: string): number {
    if (!logs || logs.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    // Sort logs by date
    const sortedLogs = logs.sort((a, b) => {
      const dateA = dateField === 'log_date' 
        ? new Date(a[dateField]) 
        : new Date(a[dateField]);
      const dateB = dateField === 'log_date' 
        ? new Date(b[dateField]) 
        : new Date(b[dateField]);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate streaks
    for (const log of sortedLogs) {
      const currentDate = dateField === 'log_date' 
        ? new Date(log[dateField]) 
        : new Date(log[dateField]);

      if (previousDate === null) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
        } else if (daysDiff === 0) {
          // Same day, continue streak
          continue;
        } else {
          // Gap in streak, reset
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }

      previousDate = currentDate;
    }

    // Check final streak
    longestStreak = Math.max(longestStreak, currentStreak);

    return longestStreak;
  }
}
