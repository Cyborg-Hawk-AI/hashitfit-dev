
import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService } from "@/lib/supabase/services/ProfileService";

export type FitnessGoal = "muscle_gain" | "weight_loss" | "endurance" | "sport_specific";
export type WorkoutFrequency = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Diet = "standard" | "vegetarian" | "vegan" | "keto" | "paleo" | "gluten_free";
export type Equipment = "full_gym" | "home_gym" | "minimal" | "bodyweight_only";

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: FitnessGoal;
  workoutFrequency: WorkoutFrequency;
  targetWeight?: number; // optional target weight in kg
  diet: Diet;
  equipment: Equipment;
  sportsPlayed?: string[];
  allergies?: string[];
  hasCompletedAssessment: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
  isAuthenticated: boolean;
  completeAssessment: (profile: Partial<UserProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userId, userProfile, updateUserProfile } = useAuth();

  const setUser = (newUser: UserProfile) => {
    updateUserProfile(newUser);
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (userProfile && userId) {
      const updatedUser = { ...userProfile, ...updates };
      updateUserProfile(updatedUser);
      
      // Update profile in Supabase
      const profileData = ProfileService.mapUserContextToProfile(updatedUser);
      return await ProfileService.updateProfile(userId, profileData);
    }
    return false;
  };

  const completeAssessment = async (profile: Partial<UserProfile>): Promise<boolean> => {
    if (userId) {
      const defaultUser = {
        name: "",
        age: 30,
        gender: "male" as const,
        height: 175,
        weight: 75,
        fitnessGoal: "muscle_gain" as const,
        workoutFrequency: 3 as const,
        diet: "standard" as const,
        equipment: "full_gym" as const,
        hasCompletedAssessment: false,
        allergies: [],
      };
      
      const newUser = {
        ...defaultUser,
        ...profile,
        hasCompletedAssessment: true,
      };
      
      updateUserProfile(newUser);
      
      // Update profile in Supabase
      const profileData = ProfileService.mapUserContextToProfile(newUser);
      profileData.has_completed_assessment = true;
      return await ProfileService.updateProfile(userId, profileData);
    }
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        user: userProfile,
        setUser,
        updateUser,
        isAuthenticated,
        completeAssessment,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
