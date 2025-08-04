
import supabase from '@/lib/supabase';
import { PlanGenerationService, type AssessmentData } from './PlanGenerationService';

export interface AssessmentDataModel {
  id?: string;
  user_id: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitness_goal: string;
  workout_frequency: number;
  diet: string;
  equipment: string;
  sports_played?: string[];
  allergies?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface WeeklyWorkout {
  day: string;
  workout_plan_id: string;
  workout_title: string;
}

interface WorkoutScheduleWithPlan {
  scheduled_date: string;
  workout_plan_id: string;
  workout_plans: {
    title: string;
  }[];
}

export class AssessmentService {
  static async getAssessment(userId: string): Promise<AssessmentDataModel | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_data')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching assessment:', error);
        return null;
      }
      
      // If no assessment data found, return null
      if (!data || data.length === 0) {
        return null;
      }
      
      // If multiple assessment records found, use the first one (most recent)
      // This handles the duplicate assessment data issue
      return data[0] as AssessmentDataModel;
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  }

  static async getWeeklyWorkouts(userId: string): Promise<{[key: string]: WeeklyWorkout[]}> {
    try {
      // Fetch the assessment data to get the user's workout frequency
      const assessment = await this.getAssessment(userId);
      if (!assessment) {
        console.warn('No assessment data found for user:', userId);
        return {};
      }
      
      // Get the current date and calculate the start and end dates of the week
      const today = new Date();
      const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust to Monday
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Adjust to Sunday
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      // Fetch the workout schedules for the week
      const { data: workoutSchedules, error } = await supabase
        .from('workout_schedule')
        .select(`
          scheduled_date, 
          workout_plan_id, 
          workout_plans!inner(title)
        `)
        .eq('user_id', userId)
        .gte('scheduled_date', startDateString)
        .lte('scheduled_date', endDateString);
        
      if (error) {
        console.error('Error fetching workout schedules:', error);
        return {};
      }
      
      // Transform the data into the desired format
      const weeklyWorkouts: {[key: string]: WeeklyWorkout[]} = {};
      
      (workoutSchedules as WorkoutScheduleWithPlan[])?.forEach(schedule => {
        const day = new Date(schedule.scheduled_date).toLocaleDateString('en-US', { weekday: 'long' });
        const workout_title = schedule.workout_plans?.[0]?.title || 'Unknown Workout';
        
        if (!weeklyWorkouts[day]) {
          weeklyWorkouts[day] = [];
        }
        
        weeklyWorkouts[day].push({
          day: schedule.scheduled_date,
          workout_plan_id: schedule.workout_plan_id,
          workout_title: workout_title,
        });
      });
      
      return weeklyWorkouts;
    } catch (error) {
      console.error('Error in getWeeklyWorkouts:', error);
      return {};
    }
  }

  static async analyzeAssessment(userId: string, assessmentData: any): Promise<boolean> {
    try {
      console.log('Starting assessment analysis for user:', userId);
      
      // Prepare assessment data for plan generation
      const planGenerationData: AssessmentData = {
        age: assessmentData.age,
        gender: assessmentData.gender,
        height: assessmentData.height,
        weight: assessmentData.weight,
        fitnessGoal: assessmentData.fitnessGoal,
        workoutFrequency: assessmentData.workoutFrequency,
        diet: assessmentData.diet,
        equipment: assessmentData.equipment,
        sportsPlayed: assessmentData.sportsPlayed || [],
        allergies: assessmentData.allergies || []
      };

      // Generate the fitness plan using OpenAI
      const planResult = await PlanGenerationService.generateFitnessPlan(planGenerationData);
      
      if (!planResult.success) {
        throw new Error(planResult.error || 'Failed to generate fitness plan');
      }

      console.log('Assessment analysis completed successfully');
      return true;
    } catch (error) {
      console.error('Error in assessment analysis:', error);
      throw error;
    }
  }
}
