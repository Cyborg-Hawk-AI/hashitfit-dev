
import supabase from '@/lib/supabase';

export interface AppConfig {
  id?: string;
  key: string;
  value: string;
  is_secret: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  units_system: 'metric' | 'imperial';
  created_at?: string;
  updated_at?: string;
}

export class ConfigService {
  // App Configurations
  static async getAppConfig(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('value')
        .eq('key', key)
        .single();
        
      if (error) throw error;
      return data.value;
    } catch (error) {
      console.error(`Error fetching app config for key ${key}:`, error);
      return null;
    }
  }

  // User Settings
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data as UserSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  static async updateUserSettings(userId: string, settings: Partial<Omit<UserSettings, 'user_id' | 'id'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }
}
