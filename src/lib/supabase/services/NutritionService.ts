
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
      
      // After logging the meal, update the nutrition log totals
      await this.updateNutritionLogTotals(meal.nutrition_log_id);
      
      return data.id;
    } catch (error) {
      console.error('Error logging meal:', error);
      return null;
    }
  }

  // Update nutrition log totals based on all meal logs
  static async updateNutritionLogTotals(nutritionLogId: string): Promise<boolean> {
    try {
      // Get all meal logs for this nutrition log
      const mealLogs = await this.getMealLogs(nutritionLogId);
      
      // Calculate totals
      const totals = mealLogs.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein_g || 0),
        carbs: acc.carbs + (meal.carbs_g || 0),
        fat: acc.fat + (meal.fat_g || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      // Update the nutrition log
      const { error } = await supabase
        .from('nutrition_logs')
        .update({
          total_calories: totals.calories,
          total_protein_g: totals.protein,
          total_carbs_g: totals.carbs,
          total_fat_g: totals.fat,
          updated_at: new Date().toISOString()
        })
        .eq('id', nutritionLogId);
        
      if (error) throw error;
      
      console.log('Updated nutrition log totals:', totals);
      return true;
    } catch (error) {
      console.error('Error updating nutrition log totals:', error);
      return false;
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

  static async getNutritionLogsByDate(userId: string, date: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('meal_logs')
        .select(`
          *,
          nutrition_logs!inner(log_date, user_id)
        `)
        .eq('nutrition_logs.user_id', userId)
        .eq('nutrition_logs.log_date', date)
        .order('consumed_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nutrition logs by date:', error);
      return [];
    }
  }

  static async getNutritionLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select(`
          *,
          meal_logs(*)
        `)
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nutrition logs by date range:', error);
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

  static async getMealPlans(nutritionPlanId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('nutrition_plan_id', nutritionPlanId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
  }

  static async deleteMealLog(logId: string): Promise<boolean> {
    try {
      // First get the meal log to find the nutrition_log_id
      const { data: mealLog, error: fetchError } = await supabase
        .from('meal_logs')
        .select('nutrition_log_id')
        .eq('id', logId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the meal log
      const { error } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', logId);
        
      if (error) throw error;
      
      // Update the nutrition log totals after deletion
      if (mealLog?.nutrition_log_id) {
        await this.updateNutritionLogTotals(mealLog.nutrition_log_id);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting meal log:', error);
      return false;
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
