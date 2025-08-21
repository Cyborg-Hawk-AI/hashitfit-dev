
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { RecommendationsService } from "@/lib/supabase/services/RecommendationsService";
import { StreakService } from "@/lib/supabase/services/StreakService";
import { HabitsService } from "@/lib/supabase/services/HabitsService";

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

  // Query for streak data
  const { data: streakData, isLoading: isLoadingStreaks } = useQuery({
    queryKey: ['streakData', userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log("Fetching streak data for user:", userId);
      return await StreakService.getStreakData(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for today's completed workouts
  const { data: todayWorkoutLogs, isLoading: isLoadingTodayWorkouts } = useQuery({
    queryKey: ['todayWorkoutLogs', userId, todayString],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching today's workout logs for user:", userId);
      return await WorkoutService.getWorkoutLogsByDate(userId, todayString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for today's nutrition logs
  const { data: todayNutritionLogs, isLoading: isLoadingTodayNutritionLogs } = useQuery({
    queryKey: ['todayNutritionLogs', userId, todayString],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching today's nutrition logs for user:", userId);
      return await NutritionService.getNutritionLogsByDate(userId, todayString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for this week's workout logs
  const { data: weeklyWorkoutLogs, isLoading: isLoadingWeeklyWorkouts } = useQuery({
    queryKey: ['weeklyWorkoutLogs', userId, startOfCurrentWeek],
    queryFn: async () => {
      if (!userId) return [];
      const weekEnd = addDays(startOfCurrentWeek, 6);
      const weekEndString = format(weekEnd, 'yyyy-MM-dd');
      console.log("Fetching weekly workout logs for user:", userId, "from", startOfCurrentWeek, "to", weekEndString);
      return await WorkoutService.getWorkoutLogsByDateRange(userId, startOfCurrentWeek, weekEndString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for this week's nutrition logs
  const { data: weeklyNutritionLogs, isLoading: isLoadingWeeklyNutrition } = useQuery({
    queryKey: ['weeklyNutritionLogs', userId, startOfCurrentWeek],
    queryFn: async () => {
      if (!userId) return [];
      const weekEnd = addDays(startOfCurrentWeek, 6);
      const weekEndString = format(weekEnd, 'yyyy-MM-dd');
      console.log("Fetching weekly nutrition logs for user:", userId, "from", startOfCurrentWeek, "to", weekEndString);
      return await NutritionService.getNutritionLogsByDateRange(userId, startOfCurrentWeek, weekEndString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for this week's habit scores
  const { data: weeklyHabitScores, isLoading: isLoadingWeeklyHabits } = useQuery({
    queryKey: ['weeklyHabitScores', userId, startOfCurrentWeek],
    queryFn: async () => {
      if (!userId) return {};
      const weekEnd = addDays(startOfCurrentWeek, 6);
      const weekEndString = format(weekEnd, 'yyyy-MM-dd');
      console.log("Fetching weekly habit scores for user:", userId, "from", startOfCurrentWeek, "to", weekEndString);
      return await HabitsService.getWeeklyHabitScores(userId, startOfCurrentWeek, weekEndString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for today's scheduled workouts
  const { data: todayScheduledWorkouts, isLoading: isLoadingTodayScheduled } = useQuery({
    queryKey: ['todayScheduledWorkouts', userId, todayString],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching today's scheduled workouts for user:", userId);
      return await WorkoutService.getWorkoutSchedule(userId, todayString, todayString);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Get current nutrition plan (most recent)
  const currentNutritionPlan = nutritionPlans && nutritionPlans.length > 0 ? nutritionPlans[0] : null;

  // Query for current meal plans
  const { data: currentMealPlans, isLoading: isLoadingMealPlans } = useQuery({
    queryKey: ['currentMealPlans', currentNutritionPlan?.id],
    queryFn: async () => {
      if (!currentNutritionPlan?.id) return [];
      console.log("Fetching meal plans for nutrition plan:", currentNutritionPlan.id);
      return await NutritionService.getMealPlans(currentNutritionPlan.id);
    },
    enabled: !!currentNutritionPlan?.id,
    staleTime: 1000 * 60 * 5,
  });

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

  // Debug logging
  console.log('🔍 Debug - todayWorkoutLogs:', todayWorkoutLogs);
  console.log('🔍 Debug - todayNutritionLogs:', todayNutritionLogs);
  console.log('🔍 Debug - todayNutritionLog:', todayNutritionLog);
  console.log('🔍 Debug - currentNutritionPlan:', currentNutritionPlan);
  console.log('🔍 Debug - nutritionProgress:', nutritionProgress);
  
  // Calculate completed items for today
  let completedItems: any[] = [];
  
  try {
    completedItems = [
      // Add completed workouts
      ...(todayWorkoutLogs || []).map(log => {
        try {
          const completedAt = log.end_time || log.start_time;
          if (!completedAt) {
            console.log('No completion time found for workout log:', log);
            return null;
          }
          
          console.log('Processing workout log with completion time:', completedAt);
          const date = new Date(completedAt);
          
          if (isNaN(date.getTime())) {
            console.log('Invalid date for workout log:', completedAt);
            return null;
          }
          
          const formattedTime = format(date, 'h:mm a');
          console.log('Formatted workout time:', formattedTime);
          
          return {
            type: 'workout' as const,
            name: log.workout_plans?.title || 'Workout',
            time: formattedTime,
            completed: true,
            timestamp: date.getTime(), // For sorting
            workoutPlanId: log.workout_plan_id,
            workoutLogId: log.id
          };
        } catch (error) {
          console.error('Error processing workout log:', error, 'Log data:', log);
          return null;
        }
      }).filter(Boolean),
      // Add logged meals
      ...(todayNutritionLogs || []).map(log => {
        try {
          const loggedAt = log.consumed_at;
          if (!loggedAt) {
            console.log('No consumption time found for meal log:', log);
            return null;
          }
          
          console.log('Processing meal log with consumption time:', loggedAt);
          const date = new Date(loggedAt);
          
          if (isNaN(date.getTime())) {
            console.log('Invalid date for meal log:', loggedAt);
            return null;
          }
          
          const formattedTime = format(date, 'h:mm a');
          console.log('Formatted meal time:', formattedTime);
          
          return {
            type: 'meal' as const,
            name: log.meal_title || 'Meal',
            time: formattedTime,
            completed: true,
            timestamp: date.getTime(), // For sorting
            mealLogId: log.id,
            mealType: log.meal_type
          };
        } catch (error) {
          console.error('Error processing meal log:', error, 'Log data:', log);
          return null;
        }
      }).filter(Boolean)
    ].sort((a, b) => {
      // Sort by timestamp (most recent first)
      return (b.timestamp || 0) - (a.timestamp || 0);
    }).map(({ timestamp, ...item }) => item); // Remove timestamp from final result
  } catch (error) {
    console.error('Error calculating completed items:', error);
    completedItems = [];
  }

  // Calculate pending items for today
  let pendingItems: any[] = [];
  
  try {
    pendingItems = [
    // Add pending workouts (scheduled but not completed)
    ...(todayScheduledWorkouts || []).map(schedule => {
      // Check if this workout is already completed
      const isCompleted = todayWorkoutLogs?.some(log => 
        log.workout_plan_id === schedule.workout_plan_id
      );
      
      if (isCompleted) return null;
      
      return {
        type: 'workout' as const,
        name: schedule.workout_plans?.title || 'Scheduled Workout',
        time: 'Pending',
        completed: false,
        scheduledTime: schedule.scheduled_time ? format(new Date(`2000-01-01T${schedule.scheduled_time}`), 'h:mm a') : undefined,
        workoutPlanId: schedule.workout_plan_id,
        scheduleId: schedule.id
      };
    }).filter(Boolean),
    // Add pending meals (from meal plans but not logged)
    ...(currentMealPlans || []).map(mealPlan => {
      // Check if this meal type is already logged
      const isLogged = todayNutritionLogs?.some(log => 
        log.meal_type?.toLowerCase() === mealPlan.meal_type?.toLowerCase()
      );
      
      if (isLogged) return null;
      
      // Convert order_index to approximate time
      const getScheduledTime = (orderIndex: number) => {
        switch (orderIndex) {
          case 1: return '8:00 AM'; // Breakfast
          case 2: return '12:00 PM'; // Lunch
          case 3: return '6:00 PM'; // Dinner
          case 4: return '3:00 PM'; // Snack
          default: return undefined;
        }
      };
      
      return {
        type: 'meal' as const,
        name: mealPlan.meal_title,
        time: 'Pending',
        completed: false,
        scheduledTime: getScheduledTime(mealPlan.order_index),
        mealPlanId: mealPlan.id,
        mealType: mealPlan.meal_type
      };
    }).filter(Boolean)
  ];
  } catch (error) {
    console.error('Error calculating pending items:', error);
    pendingItems = [];
  }

  return {
    weeklyWorkouts,
    workoutSchedules,
    nutritionPlans,
    currentNutritionPlan,
    todayNutritionLog,
    userRecommendations,
    streakData,
    nutritionProgress,
    completedItems,
    pendingItems,
    todayWorkoutLogs,
    todayNutritionLogs,
    weeklyWorkoutLogs,
    weeklyNutritionLogs,
    weeklyHabitScores,
    todayScheduledWorkouts,
    currentMealPlans,
    isLoadingWeekly,
    isLoadingSchedules,
    isLoadingNutrition,
    isLoadingTodayNutrition,
    isLoadingRecommendations,
    isLoadingStreaks,
    isLoadingTodayWorkouts,
    isLoadingTodayNutritionLogs,
    isLoadingWeeklyWorkouts,
    isLoadingWeeklyNutrition,
    isLoadingWeeklyHabits,
    isLoadingTodayScheduled,
    isLoadingMealPlans,
    startOfCurrentWeek,
    today
  };
}
