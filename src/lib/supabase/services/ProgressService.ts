
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
}
