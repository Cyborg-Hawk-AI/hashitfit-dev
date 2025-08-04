
import supabase from '@/lib/supabase';

export interface NutritionPlan {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  diet_type: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten_free';
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MealPlan {
  id?: string;
  nutrition_plan_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_title: string;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionLog {
  id?: string;
  user_id: string;
  log_date: string;
  total_calories?: number;
  total_protein_g?: number;
  total_carbs_g?: number;
  total_fat_g?: number;
  water_intake_ml?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MealLog {
  id?: string;
  nutrition_log_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_title: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  consumed_at: string;
  notes?: string;
  meal_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export class NutritionService {
  // Nutrition Plans
  static async getNutritionPlans(userId: string): Promise<NutritionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as NutritionPlan[];
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      return [];
    }
  }

  static async getNutritionPlanById(planId: string): Promise<NutritionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (error) throw error;
      return data as NutritionPlan;
    } catch (error) {
      console.error('Error fetching nutrition plan:', error);
      return null;
    }
  }

  static async createNutritionPlan(plan: NutritionPlan): Promise<NutritionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert([plan])
        .select()
        .single();
        
      if (error) throw error;
      return data as NutritionPlan;
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      return null;
    }
  }

  // Meal Plans
  static async getMealPlans(nutritionPlanId: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('nutrition_plan_id', nutritionPlanId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data as MealPlan[];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
  }

  static async createMealPlans(meals: MealPlan[]): Promise<MealPlan[] | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(meals)
        .select();
        
      if (error) throw error;
      return data as MealPlan[];
    } catch (error) {
      console.error('Error creating meal plans:', error);
      return null;
    }
  }

  // Nutrition Logs
  static async getNutritionLog(userId: string, date: string): Promise<NutritionLog | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Object not found
          return null;
        }
        throw error;
      }
      return data as NutritionLog;
    } catch (error) {
      console.error('Error fetching nutrition log:', error);
      return null;
    }
  }

  static async createOrUpdateNutritionLog(log: NutritionLog): Promise<string | null> {
    try {
      // Check if a log already exists for this date
      const existingLog = await this.getNutritionLog(log.user_id, log.log_date);
      
      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('nutrition_logs')
          .update({
            total_calories: log.total_calories,
            total_protein_g: log.total_protein_g,
            total_carbs_g: log.total_carbs_g,
            total_fat_g: log.total_fat_g,
            water_intake_ml: log.water_intake_ml,
            notes: log.notes
          })
          .eq('id', existingLog.id);
          
        if (error) throw error;
        return existingLog.id;
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('nutrition_logs')
          .insert([log])
          .select()
          .single();
          
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error('Error creating/updating nutrition log:', error);
      return null;
    }
  }

  // Meal Logs
  static async logMeal(meal: MealLog): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('meal_logs')
        .insert([meal])
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error logging meal:', error);
      return null;
    }
  }

  static async getMealLogs(nutritionLogId: string): Promise<MealLog[]> {
    try {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('nutrition_log_id', nutritionLogId)
        .order('consumed_at', { ascending: true });
        
      if (error) throw error;
      return data as MealLog[];
    } catch (error) {
      console.error('Error fetching meal logs:', error);
      return [];
    }
  }

  static async getMealLogsForDate(userId: string, date: string): Promise<MealLog[]> {
    try {
      // First get the nutrition log for the date
      const nutritionLog = await this.getNutritionLog(userId, date);
      
      if (!nutritionLog) {
        return [];
      }
      
      // Then get all meal logs for that nutrition log
      return await this.getMealLogs(nutritionLog.id!);
    } catch (error) {
      console.error('Error fetching meal logs for date:', error);
      return [];
    }
  }

  static async uploadMealImage(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/meals/${fileName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('meal-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('meal-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading meal image:', error);
      return null;
    }
  }
  
  // Get daily nutritional summary for a specific period
  static async getNutritionalSummary(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching nutritional summary:', error);
      return [];
    }
  }
}
