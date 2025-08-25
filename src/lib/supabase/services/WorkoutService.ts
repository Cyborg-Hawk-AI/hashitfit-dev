import supabase from '@/lib/supabase';
import { addDays, startOfWeek, addMonths, format } from 'date-fns';

export interface WorkoutPlan {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'sport_specific' | 'custom';
  difficulty: number;
  estimated_duration?: number;
  target_muscles?: string[];
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutExercise {
  id?: string;
  workout_plan_id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_time?: number;
  notes?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  calories_burned?: number;
  rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLog {
  id?: string;
  workout_log_id: string;
  exercise_name: string;
  sets_completed: number;
  reps_completed: string;
  weight_used?: string;
  rest_time?: number;
  notes?: string;
  order_index: number;
  superset_group_id?: string;
  rest_seconds?: number;
  position_in_workout?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutSchedule {
  id?: string;
  user_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration?: number;
  is_completed?: boolean;
  completion_date?: string;
  workout_log_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class WorkoutService {
  // Workout Plans
  static async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as WorkoutPlan[];
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      return [];
    }
  }

  static async getWorkoutPlanById(planId: string): Promise<WorkoutPlan | null> {
    console.log('🔍 WorkoutService.getWorkoutPlanById called with planId:', planId);
    
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (error) {
        console.error('❌ Error in getWorkoutPlanById:', error);
        throw error;
      }
      
      console.log('✅ WorkoutService.getWorkoutPlanById result:', data);
      return data as WorkoutPlan;
    } catch (error) {
      console.error('❌ Error fetching workout plan:', error);
      return null;
    }
  }

  static async createWorkoutPlan(plan: WorkoutPlan): Promise<WorkoutPlan | null> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([plan])
        .select()
        .single();
        
      if (error) throw error;
      return data as WorkoutPlan;
    } catch (error) {
      console.error('Error creating workout plan:', error);
      return null;
    }
  }

  static async updateWorkoutPlan(planId: string, plan: Partial<WorkoutPlan>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .update(plan)
        .eq('id', planId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      return false;
    }
  }

  static async deleteWorkoutPlan(planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      return false;
    }
  }

  // Workout Exercises
  static async getWorkoutExercises(planId: string): Promise<WorkoutExercise[]> {
    console.log('🔍 WorkoutService.getWorkoutExercises called with planId:', planId);
    
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_plan_id', planId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error('❌ Error in getWorkoutExercises:', error);
        throw error;
      }
      
      console.log('✅ WorkoutService.getWorkoutExercises result:', data);
      return data as WorkoutExercise[];
    } catch (error) {
      console.error('❌ Error fetching workout exercises:', error);
      return [];
    }
  }

  static async createWorkoutExercises(exercises: WorkoutExercise[]): Promise<WorkoutExercise[] | null> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert(exercises)
        .select();
        
      if (error) throw error;
      return data as WorkoutExercise[];
    } catch (error) {
      console.error('Error creating workout exercises:', error);
      return null;
    }
  }
  
  static async updateWorkoutExercise(exerciseId: string, exercise: Partial<WorkoutExercise>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .update(exercise)
        .eq('id', exerciseId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating workout exercise:', error);
      return false;
    }
  }
  
  static async deleteWorkoutExercise(exerciseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout exercise:', error);
      return false;
    }
  }

  // Workout Logs
  static async logWorkout(log: WorkoutLog, exercises: Omit<ExerciseLog, 'workout_log_id'>[]): Promise<string | null> {
    try {
      // Start a transaction
      // First insert the workout log
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_logs')
        .insert([log])
        .select()
        .single();
        
      if (workoutError) throw workoutError;
      
      // Then insert the exercise logs
      const exerciseLogs = exercises.map(ex => ({
        workout_log_id: workoutData.id,
        ...ex
      }));
      
      const { error: exerciseError } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogs);
        
      if (exerciseError) throw exerciseError;
      
      return workoutData.id;
    } catch (error) {
      console.error('Error logging workout:', error);
      return null;
    }
  }

  static async getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      return data as WorkoutLog[];
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      return [];
    }
  }

  static async getWorkoutLogsByDate(userId: string, date: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          workout_plans(title, description)
        `)
        .eq('user_id', userId)
        .gte('start_time', `${date}T00:00:00`)
        .lt('start_time', `${date}T23:59:59`)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workout logs by date:', error);
      return [];
    }
  }

  static async getWorkoutLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          workout_plans(title, description, category)
        `)
        .eq('user_id', userId)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workout logs by date range:', error);
      return [];
    }
  }

  static async deleteWorkoutLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout log:', error);
      return false;
    }
  }

  static async getExerciseLogs(workoutLogId: string): Promise<ExerciseLog[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_log_id', workoutLogId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data as ExerciseLog[];
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
      return [];
    }
  }

  // Workout Schedule
  static async scheduleWorkout(schedule: WorkoutSchedule): Promise<string | null> {
    console.log('🔍 WorkoutService.scheduleWorkout called with:', schedule);
    
    try {
      // Create recurring schedules for 6 months
      const scheduledDate = new Date(schedule.scheduled_date);
      const endDate = addMonths(scheduledDate, 6);
      
      console.log('📅 Scheduled date:', scheduledDate);
      console.log('📅 End date:', endDate);
      console.log('📅 Day of week for scheduled date:', scheduledDate.getDay());
      
      // Get the first day of the current week (Sunday)
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
      
      // Start date should be the earlier of scheduledDate or currentWeekStart
      const startDate = scheduledDate < currentWeekStart ? scheduledDate : currentWeekStart;
      
      console.log('📅 Current week start:', currentWeekStart);
      console.log('📅 Start date for scheduling:', startDate);
      
      // Create an array to store all schedule entries
      const scheduleEntries: WorkoutSchedule[] = [];
      let currentDate = new Date(startDate);
      
      // First, ensure we have a schedule for the exact requested date
      const exactDateEntry = {
        ...schedule,
        scheduled_date: schedule.scheduled_date,
      };
      scheduleEntries.push(exactDateEntry);
      console.log('📅 Adding exact date schedule entry for:', exactDateEntry.scheduled_date);
      
      // Then create recurring schedules for 6 months (same day of week)
      while (currentDate <= endDate) {
        // For each date, if it's the same day of week as the scheduled day AND it's not the exact date we already added
        if (currentDate.getDay() === scheduledDate.getDay() && 
            format(currentDate, 'yyyy-MM-dd') !== schedule.scheduled_date) {
          const entry = {
            ...schedule,
            scheduled_date: format(currentDate, 'yyyy-MM-dd'),
          };
          scheduleEntries.push(entry);
          console.log('📅 Adding recurring schedule entry for:', entry.scheduled_date);
        }
        
        // Move to next day
        currentDate = addDays(currentDate, 1);
      }
      
      console.log('📅 Total schedule entries to create:', scheduleEntries.length);
      console.log('📅 Schedule entries:', scheduleEntries.map(e => e.scheduled_date));
      
      // If we have schedules to insert
      if (scheduleEntries.length > 0) {
        console.log(`Inserting ${scheduleEntries.length} schedule entries`);
        
        // Check for existing schedules first on the original date
        console.log('🔍 Checking for existing schedules on date:', schedule.scheduled_date);
        const { data: existingSchedules, error: checkError } = await supabase
          .from('workout_schedule')
          .select('id')
          .eq('user_id', schedule.user_id)
          .eq('scheduled_date', schedule.scheduled_date);
          
        if (checkError) throw checkError;
        
        console.log('🔍 Existing schedules found:', existingSchedules);
        
        // If there's an existing schedule for the exact original date, update it
        if (existingSchedules && existingSchedules.length > 0) {
          // Update the existing schedule
          const { data, error } = await supabase
            .from('workout_schedule')
            .update({
              workout_plan_id: schedule.workout_plan_id,
              is_completed: false,
              workout_log_id: null,
              completion_date: null
            })
            .eq('id', existingSchedules[0].id)
            .select();
            
          if (error) throw error;
          
          // Then insert all the other recurring schedules (skip the first one we just updated)
          const recurringSchedules = scheduleEntries.filter(
            entry => entry.scheduled_date !== schedule.scheduled_date
          );
          
          if (recurringSchedules.length > 0) {
            // Insert each recurring schedule individually to avoid upsert constraints issue
            let insertedId = null;
            
            for (const entry of recurringSchedules) {
              const { data: insertedData, error: insertError } = await supabase
                .from('workout_schedule')
                .insert(entry)
                .select();
                
              if (insertError) {
                console.error(`Error inserting schedule for ${entry.scheduled_date}:`, insertError);
                continue; // Skip this one but continue with others
              }
              
              if (!insertedId && insertedData && insertedData.length > 0) {
                insertedId = insertedData[0].id;
              }
            }
            
            return data[0].id || insertedId;
          }
          
          return data[0].id;
        } else {
          // No existing schedule for the original date, insert each schedule individually
          let firstInsertedId = null;
          
          for (const entry of scheduleEntries) {
            console.log('📝 Inserting schedule entry:', entry);
            const { data, error } = await supabase
              .from('workout_schedule')
              .insert(entry)
              .select();
              
            if (error) {
              console.error(`❌ Error inserting schedule for ${entry.scheduled_date}:`, error);
              continue; // Skip this one but continue with others
            }
            
            console.log('✅ Successfully inserted schedule for:', entry.scheduled_date, 'with ID:', data?.[0]?.id);
            
            if (!firstInsertedId && data && data.length > 0) {
              firstInsertedId = data[0].id;
            }
          }
          
          return firstInsertedId;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error scheduling workout:', error);
      return null;
    }
  }

  static async getWorkoutSchedule(userId: string, startDate: string, endDate: string): Promise<WorkoutSchedule[]> {
    console.log('🔍 WorkoutService.getWorkoutSchedule called with:', { userId, startDate, endDate });
    
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .select(`
          *,
          workout_plans(title, description, category)
        `)
        .eq('user_id', userId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true });
        
      if (error) {
        console.error('❌ Error in getWorkoutSchedule:', error);
        throw error;
      }
      
      console.log('✅ WorkoutService.getWorkoutSchedule result:', data);
      return data as WorkoutSchedule[];
    } catch (error) {
      console.error('❌ Error fetching workout schedule:', error);
      return [];
    }
  }

  static async completeScheduledWorkout(scheduleId: string, workoutLogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_schedule')
        .update({
          is_completed: true,
          completion_date: new Date().toISOString(),
          workout_log_id: workoutLogId
        })
        .eq('id', scheduleId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing scheduled workout:', error);
      return false;
    }
  }
  
  static async getRecentWorkoutStats(userId: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Get workout logs in the date range
      const { data: workoutLogs, error: logsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', formattedStartDate)
        .lte('start_time', formattedEndDate)
        .order('start_time', { ascending: true });
        
      if (logsError) throw logsError;
      
      // Get scheduled workouts in the date range
      const { data: scheduledWorkouts, error: scheduleError } = await supabase
        .from('workout_schedule')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', formattedStartDate)
        .lte('scheduled_date', formattedEndDate);
        
      if (scheduleError) throw scheduleError;
      
      // Calculate statistics
      const totalWorkouts = workoutLogs?.length || 0;
      const completedWorkouts = scheduledWorkouts?.filter(w => w.is_completed)?.length || 0;
      const scheduledCount = scheduledWorkouts?.length || 0;
      const completionRate = scheduledCount > 0 ? (completedWorkouts / scheduledCount) * 100 : 0;
      
      // Group workouts by category
      const workoutPlanIds = workoutLogs?.map(log => log.workout_plan_id).filter(id => id) as string[];
      
      let categoryBreakdown: Record<string, number> = {};
      
      if (workoutPlanIds.length > 0) {
        const { data: workoutPlans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id, category')
          .in('id', workoutPlanIds);
          
        if (plansError) throw plansError;
        
        if (workoutPlans) {
          categoryBreakdown = workoutPlans.reduce((acc, plan) => {
            const category = plan.category || 'other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }
      
      return {
        totalWorkouts,
        completedWorkouts,
        scheduledCount,
        completionRate,
        categoryBreakdown,
        logs: workoutLogs,
        scheduledWorkouts
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return {
        totalWorkouts: 0,
        completedWorkouts: 0,
        scheduledCount: 0,
        completionRate: 0,
        categoryBreakdown: {},
        logs: [],
        scheduledWorkouts: []
      };
    }
  }

  // Add new methods for handling exercise unchecking

  static async deleteExerciseLogs(workoutLogId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .eq('workout_log_id', workoutLogId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting exercise logs:', error);
      return false;
    }
  }

  static async addExerciseLogs(workoutLogId: string, exercises: Omit<ExerciseLog, 'workout_log_id'>[]): Promise<boolean> {
    try {
      const exerciseLogs = exercises.map(ex => ({
        workout_log_id: workoutLogId,
        ...ex
      }));
      
      const { error } = await supabase
        .from('exercise_logs')
        .insert(exerciseLogs);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding exercise logs:', error);
      return false;
    }
  }

  static async updateScheduledWorkout(scheduleId: string, updates: Partial<WorkoutSchedule>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_schedule')
        .update(updates)
        .eq('id', scheduleId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating scheduled workout:', error);
      return false;
    }
  }

  // New methods for enhanced workout session management

  static async updateExerciseLog(exerciseLogId: string, updates: Partial<ExerciseLog>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', exerciseLogId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating exercise log:', error);
      return false;
    }
  }

  static async reorderExercises(workoutLogId: string, exercisePositions: Array<{exercise_id: string, new_position: number}>): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('reorder_workout_exercises', {
        p_workout_log_id: workoutLogId,
        p_exercise_positions: exercisePositions
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reordering exercises:', error);
      return false;
    }
  }

  static async createSuperset(workoutLogId: string, exerciseIds: string[], supersetGroupId?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('manage_superset', {
        p_workout_log_id: workoutLogId,
        p_exercise_ids: exerciseIds,
        p_superset_group_id: supersetGroupId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating superset:', error);
      return null;
    }
  }

  static async removeFromSuperset(exerciseId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('remove_from_superset', {
        p_exercise_id: exerciseId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing from superset:', error);
      return false;
    }
  }

  // New methods for handling workout plan updates
  static async updateWorkoutPlanWithExercises(planId: string, exercises: any[]): Promise<boolean> {
    try {
      console.log(`Updating workout plan ${planId} with ${exercises.length} exercises`);
      
      // First, delete existing exercises
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_plan_id', planId);
        
      if (deleteError) throw deleteError;
      
      // Then create new exercises with proper superset handling
      const exerciseData = exercises.map((ex: any, index: number) => ({
        workout_plan_id: planId,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 'bodyweight',
        rest_time: ex.rest_seconds || 60,
        order_index: index,
        notes: ex.superset_group_id ? `Superset: ${ex.superset_group_id}` : undefined
      }));
      
      const { error: insertError } = await supabase
        .from('workout_exercises')
        .insert(exerciseData);
        
      if (insertError) throw insertError;
      
      console.log(`Successfully updated workout plan ${planId}`);
      return true;
    } catch (error) {
      console.error('Error updating workout plan with exercises:', error);
      return false;
    }
  }

  static async createWorkoutPlanCopy(originalPlanId: string, exercises: any[]): Promise<WorkoutPlan | null> {
    try {
      console.log(`Creating copy of workout plan ${originalPlanId}`);
      
      // Get the original plan
      const { data: originalPlan, error: fetchError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', originalPlanId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create a new plan
      const newPlan: WorkoutPlan = {
        user_id: originalPlan.user_id,
        title: `${originalPlan.title} (Custom)`,
        description: originalPlan.description,
        category: originalPlan.category,
        difficulty: originalPlan.difficulty,
        estimated_duration: originalPlan.estimated_duration,
        target_muscles: originalPlan.target_muscles,
        ai_generated: false
      };
      
      const { data: createdPlan, error: createError } = await supabase
        .from('workout_plans')
        .insert([newPlan])
        .select()
        .single();
        
      if (createError) throw createError;
      
      // Add exercises to the new plan
      const exerciseData = exercises.map((ex: any, index: number) => ({
        workout_plan_id: createdPlan.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 'bodyweight',
        rest_time: ex.rest_seconds || 60,
        order_index: index,
        notes: ex.superset_group_id ? `Superset: ${ex.superset_group_id}` : undefined
      }));
      
      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(exerciseData);
        
      if (exerciseError) throw exerciseError;
      
      console.log(`Successfully created workout plan copy: ${createdPlan.id}`);
      return createdPlan as WorkoutPlan;
    } catch (error) {
      console.error('Error creating workout plan copy:', error);
      return null;
    }
  }

  static async getWorkoutLogById(logId: string): Promise<WorkoutLog | null> {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('id', logId)
        .single();
        
      if (error) throw error;
      return data as WorkoutLog;
    } catch (error) {
      console.error('Error fetching workout log:', error);
      return null;
    }
  }

  // Get all available exercises for swapping
  static async getAllExercises(): Promise<{id: string, name: string}[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all exercises:', error);
      return [];
    }
  }

  // Swap an exercise in a workout plan
  static async swapExercise(workoutPlanId: string, oldExerciseId: string, newExerciseName: string): Promise<boolean> {
    try {
      // Get the current exercise to preserve its settings
      const { data: currentExercise, error: currentError } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('id', oldExerciseId)
        .eq('workout_plan_id', workoutPlanId)
        .single();

      if (currentError) throw currentError;

      // Update the exercise with the new name while preserving other settings
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          name: newExerciseName,
          updated_at: new Date().toISOString()
        })
        .eq('id', oldExerciseId)
        .eq('workout_plan_id', workoutPlanId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error swapping exercise:', error);
      return false;
    }
  }

  // Get user exercise notes
  static async getUserExerciseNotes(userId: string, exerciseId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_exercise_notes')
        .select('notes')
        .eq('user_id', userId)
        .eq('workout_exercise_id', exerciseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data?.notes || null;
    } catch (error) {
      console.error('Error fetching user exercise notes:', error);
      return null;
    }
  }

  // Save user exercise notes
  static async saveUserExerciseNotes(userId: string, exerciseId: string, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_exercise_notes')
        .upsert({
          user_id: userId,
          workout_exercise_id: exerciseId,
          notes: notes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving user exercise notes:', error);
      return false;
    }
  }
}
