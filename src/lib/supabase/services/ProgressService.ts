
import supabase from '@/lib/supabase';

export interface FitnessAssessment {
  id?: string;
  user_id: string;
  assessment_date: string;
  pullups?: number;
  pushups?: number;
  squats?: number;
  bench_press_max?: number;
  squat_max?: number;
  deadlift_max?: number;
  mile_time?: number; // in seconds
  vo2_max?: number;
  flexibility_score?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressMetric {
  id?: string;
  user_id: string;
  measurement_date: string;
  weight: number;
  body_fat_percentage?: number;
  chest_measurement?: number;
  waist_measurement?: number;
  hip_measurement?: number;
  arm_measurement?: number;
  thigh_measurement?: number;
  calf_measurement?: number;
  shoulder_measurement?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class ProgressService {
  // Fitness Assessments
  static async getFitnessAssessments(userId: string): Promise<FitnessAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('fitness_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false });
        
      if (error) throw error;
      return data as FitnessAssessment[];
    } catch (error) {
      console.error('Error fetching fitness assessments:', error);
      return [];
    }
  }

  static async getLatestFitnessAssessment(userId: string): Promise<FitnessAssessment | null> {
    try {
      const { data, error } = await supabase
        .from('fitness_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Object not found
          return null;
        }
        throw error;
      }
      return data as FitnessAssessment;
    } catch (error) {
      console.error('Error fetching latest fitness assessment:', error);
      return null;
    }
  }

  static async createFitnessAssessment(assessment: FitnessAssessment): Promise<FitnessAssessment | null> {
    try {
      const { data, error } = await supabase
        .from('fitness_assessments')
        .insert([assessment])
        .select()
        .single();
        
      if (error) throw error;
      return data as FitnessAssessment;
    } catch (error) {
      console.error('Error creating fitness assessment:', error);
      return null;
    }
  }

  // Progress Metrics
  static async getProgressMetrics(userId: string, startDate: string, endDate: string): Promise<ProgressMetric[]> {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('measurement_date', startDate)
        .lte('measurement_date', endDate)
        .order('measurement_date', { ascending: true });
        
      if (error) throw error;
      return data as ProgressMetric[];
    } catch (error) {
      console.error('Error fetching progress metrics:', error);
      return [];
    }
  }

  static async getLatestProgressMetric(userId: string): Promise<ProgressMetric | null> {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Object not found
          return null;
        }
        throw error;
      }
      return data as ProgressMetric;
    } catch (error) {
      console.error('Error fetching latest progress metric:', error);
      return null;
    }
  }

  static async logProgressMetrics(metric: ProgressMetric): Promise<ProgressMetric | null> {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .insert([metric])
        .select()
        .single();
        
      if (error) throw error;
      return data as ProgressMetric;
    } catch (error) {
      console.error('Error logging progress metrics:', error);
      return null;
    }
  }

  // Get weight progress data for a user
  static async getWeightProgressData(userId: string): Promise<{ date: string; value: number }[]> {
    try {
      // First, get the user's initial assessment data (get the earliest one if multiple exist)
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_data')
        .select('weight, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (assessmentError) {
        console.error('Error fetching assessment data:', assessmentError);
        return [];
      }

      // Then, get all progress metrics with weight data
      const { data: progressData, error: progressError } = await supabase
        .from('progress_metrics')
        .select('weight, measurement_date')
        .eq('user_id', userId)
        .not('weight', 'is', null)
        .order('measurement_date', { ascending: true });

      if (progressError) {
        console.error('Error fetching progress metrics:', progressError);
        return [];
      }

      // Combine assessment data (initial weight) with progress metrics
      const weightData: { date: string; value: number }[] = [];

      // Add initial weight from assessment
      if (assessmentData?.weight && assessmentData?.created_at) {
        weightData.push({
          date: assessmentData.created_at.split('T')[0], // Get just the date part
          value: assessmentData.weight
        });
      }

      // Add progress metrics
      if (progressData) {
        progressData.forEach(metric => {
          if (metric.weight && metric.measurement_date) {
            weightData.push({
              date: metric.measurement_date,
              value: metric.weight
            });
          }
        });
      }

      // Sort by date and remove duplicates
      const uniqueData = weightData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter((item, index, self) => 
          index === 0 || item.date !== self[index - 1].date
        );

      return uniqueData;
    } catch (error) {
      console.error('Error fetching weight progress data:', error);
      return [];
    }
  }

  // Get user's initial weight from assessment
  static async getInitialWeight(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_data')
        .select('weight')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching initial weight:', error);
        return null;
      }

      return data?.weight || null;
    } catch (error) {
      console.error('Error fetching initial weight:', error);
      return null;
    }
  }

  // Get user's current weight (latest progress metric or initial weight)
  static async getCurrentWeight(userId: string): Promise<number | null> {
    try {
      // First try to get the latest progress metric
      const { data: latestMetric, error: metricError } = await supabase
        .from('progress_metrics')
        .select('weight')
        .eq('user_id', userId)
        .not('weight', 'is', null)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();

      if (latestMetric?.weight) {
        return latestMetric.weight;
      }

      // If no progress metrics, fall back to initial weight from assessment
      return await this.getInitialWeight(userId);
    } catch (error) {
      console.error('Error fetching current weight:', error);
      // Fall back to initial weight
      return await this.getInitialWeight(userId);
    }
  }

  // Analytics
  static async getWeightTrend(userId: string, period: 'week' | 'month' | 'quarter' | 'half-year' | 'year'): Promise<{date: string, value: number}[]> {
    try {
      // Calculate date range based on period
      const endDate = new Date().toISOString().split('T')[0];
      let startDate: string;
      
      switch (period) {
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'quarter':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'half-year':
          startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('measurement_date, weight')
        .eq('user_id', userId)
        .gte('measurement_date', startDate)
        .lte('measurement_date', endDate)
        .order('measurement_date', { ascending: true });
        
      if (error) throw error;
      
      return data.map(item => ({
        date: item.measurement_date,
        value: item.weight
      }));
    } catch (error) {
      console.error('Error fetching weight trend:', error);
      return [];
    }
  }

  static async getStrengthProgress(userId: string, period: 'month' | 'quarter' | 'half-year' | 'year'): Promise<any[]> {
    try {
      // Calculate date range based on period
      const endDate = new Date().toISOString().split('T')[0];
      let startDate: string;
      
      switch (period) {
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'quarter':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'half-year':
          startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from('fitness_assessments')
        .select('assessment_date, bench_press_max, squat_max, deadlift_max, pullups')
        .eq('user_id', userId)
        .gte('assessment_date', startDate)
        .lte('assessment_date', endDate)
        .order('assessment_date', { ascending: true });
        
      if (error) throw error;
      
      // Process and format the data as needed for your app
      return data;
    } catch (error) {
      console.error('Error fetching strength progress:', error);
      return [];
    }
  }

  // Get exercise progress data from workout logs and exercise logs
  static async getExerciseProgressData(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      // Get workout logs in the date range
      const { data: workoutLogs, error: workoutError } = await supabase
        .from('workout_logs')
        .select(`
          id,
          start_time,
          end_time,
          calories_burned,
          duration,
          exercise_logs (
            id,
            exercise_name,
            weight_used,
            reps_completed,
            sets_completed,
            notes
          )
        `)
        .eq('user_id', userId)
        .gte('start_time', `${startDate}T00:00:00`)
        .lte('start_time', `${endDate}T23:59:59`)
        .order('start_time', { ascending: true });

      if (workoutError) throw workoutError;

      // Process the data to group by date and calculate totals
      const exerciseData: { [date: string]: any } = {};

      workoutLogs?.forEach(log => {
        const date = log.start_time.split('T')[0];
        
        if (!exerciseData[date]) {
          exerciseData[date] = {
            date,
            totalVolume: 0,
            totalWorkouts: 0,
            exercises: {}
          };
        }

        exerciseData[date].totalWorkouts++;

        // Calculate volume from exercise logs
        log.exercise_logs?.forEach(exercise => {
          const exerciseName = exercise.exercise_name;
          const volume = (parseFloat(exercise.weight_used) || 0) * (exercise.reps_completed || 0) * (exercise.sets_completed || 0);
          
          exerciseData[date].totalVolume += volume;

          if (!exerciseData[date].exercises[exerciseName]) {
            exerciseData[date].exercises[exerciseName] = {
              totalVolume: 0,
              maxWeight: 0,
              totalReps: 0,
              totalSets: 0
            };
          }

          exerciseData[date].exercises[exerciseName].totalVolume += volume;
          exerciseData[date].exercises[exerciseName].maxWeight = Math.max(
            exerciseData[date].exercises[exerciseName].maxWeight,
            parseFloat(exercise.weight_used) || 0
          );
          exerciseData[date].exercises[exerciseName].totalReps += exercise.reps_completed || 0;
          exerciseData[date].exercises[exerciseName].totalSets += exercise.sets_completed || 0;
        });
      });

      // Convert to array format
      return Object.values(exerciseData);
    } catch (error) {
      console.error('Error fetching exercise progress data:', error);
      return [];
    }
  }

  // Get top improved exercises
  static async getTopImprovedExercises(userId: string, period: 'week' | 'month' | 'quarter'): Promise<any[]> {
    try {
      const exerciseData = await this.getExerciseProgressData(userId, 
        period === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        period === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      // Calculate improvements for each exercise
      const exerciseImprovements: { [name: string]: any } = {};

      exerciseData.forEach(dayData => {
        Object.entries(dayData.exercises).forEach(([exerciseName, exerciseData]: [string, any]) => {
          if (!exerciseImprovements[exerciseName]) {
            exerciseImprovements[exerciseName] = {
              name: exerciseName,
              maxWeight: 0,
              totalVolume: 0,
              sessions: 0
            };
          }

          exerciseImprovements[exerciseName].maxWeight = Math.max(
            exerciseImprovements[exerciseName].maxWeight,
            exerciseData.maxWeight
          );
          exerciseImprovements[exerciseName].totalVolume += exerciseData.totalVolume;
          exerciseImprovements[exerciseName].sessions++;
        });
      });

      // Sort by total volume and return top 3
      return Object.values(exerciseImprovements)
        .sort((a: any, b: any) => b.totalVolume - a.totalVolume)
        .slice(0, 3)
        .map((exercise: any, index) => ({
          ...exercise,
          rank: index + 1,
          improvement: `+${Math.round(exercise.maxWeight)}kg max weight`
        }));
    } catch (error) {
      console.error('Error fetching top improved exercises:', error);
      return [];
    }
  }

  // Progress Photos Methods
  static async uploadProgressPhoto(userId: string, file: File, photoDate: string, notes?: string): Promise<any> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from('progress_photos')
        .insert([{
          user_id: userId,
          photo_url: publicUrl,
          photo_date: photoDate,
          notes: notes || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading progress photo:', error);
      throw error;
    }
  }

  static async getProgressPhotos(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('photo_date', { ascending: false });

      if (startDate) {
        query = query.gte('photo_date', startDate);
      }
      if (endDate) {
        query = query.lte('photo_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      return [];
    }
  }

  static async deleteProgressPhoto(userId: string, photoId: string): Promise<boolean> {
    try {
      // Get photo URL first
      const { data: photo, error: fetchError } = await supabase
        .from('progress_photos')
        .select('photo_url')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (photo?.photo_url) {
        const fileName = photo.photo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('progress-photos')
            .remove([`${userId}/${fileName}`]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting progress photo:', error);
      return false;
    }
  }
}
