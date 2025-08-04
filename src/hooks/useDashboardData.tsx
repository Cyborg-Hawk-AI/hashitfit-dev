
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";

export function useDashboardData() {
  const { userId } = useAuth();
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  
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

  return {
    weeklyWorkouts,
    workoutSchedules,
    isLoadingWeekly,
    isLoadingSchedules,
    startOfCurrentWeek,
    today
  };
}
