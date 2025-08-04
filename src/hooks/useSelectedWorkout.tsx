
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";

export function useSelectedWorkout(selectedDateString: string, workoutSchedules: any[]) {
  const { userId } = useAuth();
  
  // Query for the selected day workout details
  const { data: selectedWorkout, isLoading: isLoadingSelectedWorkout } = useQuery({
    queryKey: ['selectedWorkout', selectedDateString, userId],
    queryFn: async () => {
      if (!userId || !workoutSchedules) return null;
      
      console.log(`Finding workout for ${selectedDateString}`);
      const scheduledWorkout = workoutSchedules.find(schedule => 
        schedule.scheduled_date === selectedDateString
      );
      
      if (!scheduledWorkout || !scheduledWorkout.workout_plan_id) {
        console.log("No scheduled workout found for selected date");
        return null;
      }
      
      console.log(`Found scheduled workout: ${scheduledWorkout.id}`);
      const workoutPlan = await WorkoutService.getWorkoutPlanById(scheduledWorkout.workout_plan_id);
      if (!workoutPlan) {
        console.log("Could not find workout plan");
        return null;
      }
      
      console.log(`Found workout plan: ${workoutPlan.title}`);
      const exercises = await WorkoutService.getWorkoutExercises(workoutPlan.id!);
      
      let completedExercises: Record<string, boolean> = {};
      let allExerciseLogs: any[] = [];
      
      if (scheduledWorkout.is_completed && scheduledWorkout.workout_log_id) {
        const exerciseLogs = await WorkoutService.getExerciseLogs(scheduledWorkout.workout_log_id);
        allExerciseLogs = exerciseLogs;
        completedExercises = exerciseLogs.reduce((acc, log) => {
          acc[log.exercise_name] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
      
      // Combine planned exercises with logged exercises (including voice-logged ones)
      const plannedExercises = exercises.map(ex => ({
        id: ex.id!,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 'bodyweight',
        completed: completedExercises[ex.name] || false,
        source: 'planned' as const,
        rest_seconds: 60,
        superset_group_id: ex.notes?.includes('Superset:') ? ex.notes.split('Superset: ')[1] : null,
        position_in_workout: exercises.findIndex(e => e.id === ex.id)
      }));

      // Add voice-logged exercises that aren't in the plan
      const voiceLoggedExercises = allExerciseLogs
        .filter(log => !exercises.some(ex => ex.name === log.exercise_name))
        .map(log => ({
          id: `voice-${log.id}`,
          name: log.exercise_name,
          sets: log.sets_completed,
          reps: log.reps_completed,
          weight: log.weight_used || 'bodyweight',
          completed: true,
          source: 'voice' as const,
          rest_seconds: 60,
          superset_group_id: log.superset_group_id || null,
          position_in_workout: allExerciseLogs.findIndex(l => l.id === log.id)
        }));
      
      return {
        schedule_id: scheduledWorkout.id,
        id: workoutPlan.id,
        title: workoutPlan.title,
        exercises: [...plannedExercises, ...voiceLoggedExercises],
        is_completed: scheduledWorkout.is_completed || false,
        workout_log_id: scheduledWorkout.workout_log_id,
        estimatedDuration: 45 // Add estimated duration property
      };
    },
    enabled: !!userId && !!workoutSchedules,
    staleTime: 1000 * 60 * 5,
  });

  return { selectedWorkout, isLoadingSelectedWorkout };
}
