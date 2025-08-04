
import { supabase } from "@/integrations/supabase/client";
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

// Define interfaces for API request and response
export interface FitnessAssessmentData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: string;
  workoutFrequency: number;
  diet: string;
  equipment: string;
  sportsPlayed?: string[];
  allergies?: string[];
  existingConditions?: string[];
  fitnessLevel?: string;
  previousExperience?: string;
}

// Interfaces for the AI analysis response
interface WorkoutExerciseAnalysis {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest_time?: number;
  notes?: string;
}

interface DailyWorkoutPlan {
  day: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'sport_specific' | 'custom';
  exercises: WorkoutExerciseAnalysis[];
}

interface MealPlanAnalysis {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_title: string;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionPlanAnalysis {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  diet_type: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten_free';
  meals: MealPlanAnalysis[];
}

export interface AIAnalysisResponse {
  workout_plans: DailyWorkoutPlan[];
  nutrition_plan: NutritionPlanAnalysis;
  recommendations: string[];
}

export async function analyzeFitnessAssessment(req: { user_id: string; assessment: FitnessAssessmentData }): Promise<AIAnalysisResponse> {
  try {
    console.log("Calling fitness assessment function with data:", {
      userId: req.user_id,
      assessmentSummary: {
        age: req.assessment.age,
        gender: req.assessment.gender,
        fitnessGoal: req.assessment.fitnessGoal
      }
    });
    
    if (!req.user_id) {
      throw new Error('User ID is required');
    }
    
    console.log(`Calling edge function at ${supabaseUrl}/functions/v1/analyze-fitness-assessment`);
    
    // Simple direct fetch to the edge function
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-fitness-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          user_id: req.user_id,
          assessment: req.assessment
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from edge function:", errorText);
        throw new Error(`Edge function error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received fitness assessment analysis");
      return data as AIAnalysisResponse;
    } catch (fetchError: any) {
      console.error("Error fetching from edge function:", fetchError.message);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error calling fitness assessment function:', error);
    // Generate mock response for testing/development
    console.log("Generating mock response due to error");
    return {
      workout_plans: [
        {
          day: "Monday",
          title: "Upper Body Strength",
          description: "Focus on building upper body strength",
          category: "strength",
          exercises: [
            {
              name: "Bench Press",
              sets: 3,
              reps: "8-10",
              weight: "60kg",
              rest_time: 90
            },
            {
              name: "Shoulder Press",
              sets: 3,
              reps: "8-10",
              weight: "40kg",
              rest_time: 90
            }
          ]
        },
        {
          day: "Thursday",
          title: "Lower Body Power",
          description: "Focus on building lower body strength and power",
          category: "strength",
          exercises: [
            {
              name: "Squats",
              sets: 4,
              reps: "6-8",
              weight: "80kg",
              rest_time: 120
            },
            {
              name: "Leg Press",
              sets: 3,
              reps: "8-10",
              weight: "120kg",
              rest_time: 90
            }
          ]
        }
      ],
      nutrition_plan: {
        daily_calories: 2200,
        protein_g: 170,
        carbs_g: 50,
        fat_g: 160,
        diet_type: "standard",
        meals: [
          {
            meal_type: "breakfast",
            meal_title: "High Protein Breakfast",
            description: "Eggs and whole grain toast",
            calories: 550,
            protein_g: 35,
            carbs_g: 8,
            fat_g: 45
          },
          {
            meal_type: "lunch",
            meal_title: "Grilled Chicken Salad",
            description: "Grilled chicken with mixed greens",
            calories: 650,
            protein_g: 45,
            carbs_g: 12,
            fat_g: 48
          }
        ]
      },
      recommendations: [
        "Stay hydrated with plenty of water throughout the day",
        "Ensure you're getting 7-8 hours of quality sleep"
      ]
    };
  }
}
