
import supabase from '@/lib/supabase';
import { UserProfile, WorkoutFrequency } from '@/context/UserContext';

export interface ProfileData {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  fitness_goal: 'muscle_gain' | 'weight_loss' | 'endurance' | 'sport_specific';
  workout_frequency: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  diet: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten_free';
  equipment: 'full_gym' | 'home_gym' | 'minimal' | 'bodyweight_only';
  target_weight?: number;
  sports_played?: string[];
  profile_image_url?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
  has_completed_assessment: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ProfileService {
  static async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
        
      if (error) throw error;
      
      // If no profiles found, return null
      if (!data || data.length === 0) {
        return null;
      }
      
      // If multiple profiles found, use the first one (most recent)
      // This handles the duplicate profile issue
      return data[0] as ProfileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, profile: Partial<ProfileData>): Promise<boolean> {
    try {
      // Add updated_at timestamp
      profile.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  static async createProfile(userId: string, profile: Partial<ProfileData>): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profile }])
        .select()
        .single();
        
      if (error) throw error;
      return data as ProfileData;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  static mapProfileToUserContext(profile: ProfileData): UserProfile {
    return {
      name: profile.name || '',
      age: profile.age || 30,
      gender: profile.gender || 'male',
      height: profile.height || 175,
      weight: profile.weight || 75,
      fitnessGoal: profile.fitness_goal || 'muscle_gain',
      workoutFrequency: profile.workout_frequency as WorkoutFrequency || 3,
      diet: profile.diet || 'standard',
      equipment: profile.equipment || 'full_gym',
      targetWeight: profile.target_weight,
      sportsPlayed: profile.sports_played,
      hasCompletedAssessment: profile.has_completed_assessment || false,
      allergies: profile.allergies || []
    };
  }

  static mapUserContextToProfile(user: UserProfile): Partial<ProfileData> {
    return {
      name: user.name,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      fitness_goal: user.fitnessGoal,
      workout_frequency: user.workoutFrequency as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      diet: user.diet,
      equipment: user.equipment,
      target_weight: user.targetWeight,
      sports_played: user.sportsPlayed,
      has_completed_assessment: user.hasCompletedAssessment,
      allergies: user.allergies
    };
  }

  static async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile-image.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('profile-images')
        .getPublicUrl(filePath);
        
      // Update profile with new image URL
      await this.updateProfile(userId, { profile_image_url: data.publicUrl });
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  }
}
