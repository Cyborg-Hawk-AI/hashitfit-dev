
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { RecommendationsService } from "@/lib/supabase/services/RecommendationsService";

export function useDashboardData() {
  const { userId } = useAuth();
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const todayString = format(today, 'yyyy-MM-dd');
  
  // Query for weekly workout schedules
  const { data: weeklyWorkouts, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['weeklyWorkouts', userId],
    queryFn: async () => {
      if (!userId) return {};
      console.log("Fetching weekly workouts for user:", userId);
      return await AssessmentService.getWeeklyWorkouts(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for workout schedules
  const { data: workoutSchedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['workoutSchedules', userId, format(startOfCurrentWeek, 'yyyy-MM-dd'), format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching workout schedules");
      return await WorkoutService.getWorkoutSchedule(
        userId,
        format(startOfCurrentWeek, 'yyyy-MM-dd'),
        format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd')
      );
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for nutrition plans
  const { data: nutritionPlans, isLoading: isLoadingNutrition } = useQuery({
    queryKey: ['nutritionPlans', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching nutrition plans for user:", userId);
      return await NutritionService.getNutritionPlans(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for today's nutrition log
  const { data: todayNutritionLog, isLoading: isLoadingTodayNutrition } = useQuery({
    queryKey: ['todayNutritionLog', userId, todayString],
    queryFn: async () => {
      if (!userId) return null;
      console.log("Fetching today's nutrition log for user:", userId);
      return await NutritionService.getNutritionLog(userId, todayString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for user recommendations
  const { data: userRecommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['userRecommendations', userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log("Fetching user recommendations for user:", userId);
      return await RecommendationsService.getUserRecommendations(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Get current nutrition plan (most recent)
  const currentNutritionPlan = nutritionPlans && nutritionPlans.length > 0 ? nutritionPlans[0] : null;

  // Calculate nutrition progress
  const nutritionProgress = {
    caloriesConsumed: todayNutritionLog?.total_calories || 0,
    caloriesTarget: currentNutritionPlan?.daily_calories || 2000,
    proteinConsumed: todayNutritionLog?.total_protein_g || 0,
    proteinTarget: currentNutritionPlan?.protein_g || 150,
    carbsConsumed: todayNutritionLog?.total_carbs_g || 0,
    carbsTarget: currentNutritionPlan?.carbs_g || 200,
    fatConsumed: todayNutritionLog?.total_fat_g || 0,
    fatTarget: currentNutritionPlan?.fat_g || 65,
  };

  return {
    weeklyWorkouts,
    workoutSchedules,
    nutritionPlans,
    currentNutritionPlan,
    todayNutritionLog,
    userRecommendations,
    nutritionProgress,
    isLoadingWeekly,
    isLoadingSchedules,
    isLoadingNutrition,
    isLoadingTodayNutrition,
    isLoadingRecommendations,
    startOfCurrentWeek,
    today
  };
}
