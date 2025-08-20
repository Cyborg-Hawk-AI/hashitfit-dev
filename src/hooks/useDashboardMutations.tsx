
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService, WorkoutSchedule, WorkoutLog, ExerciseLog } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";

export function useDashboardMutations() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Mutation to schedule a workout
  const scheduleWorkoutMutation = useMutation({
    mutationFn: async ({ workout_plan_id, scheduled_date }: { workout_plan_id: string, scheduled_date: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log(`Scheduling workout ${workout_plan_id} for ${scheduled_date}`);
      
      const schedule: WorkoutSchedule = {
        user_id: userId,
        workout_plan_id,
        scheduled_date,
        is_completed: false
      };
      
      return await WorkoutService.scheduleWorkout(schedule);
    },
    onSuccess: () => {
      console.log("Successfully scheduled workout");
      queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
      
      toast({
        title: "Workout Scheduled",
        description: "Your workout has been scheduled."
      });
    },
    onError: (error) => {
      console.error("Error scheduling workout:", error);
      toast({
        title: "Error",
        description: "Failed to schedule workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to complete or uncomplete exercise
  const completeExerciseMutation = useMutation({
    mutationFn: async ({
      scheduleId,
      exerciseId,
      exerciseName,
      completed,
      allExercises,
      workoutSchedules
    }: {
      scheduleId: string,
      exerciseId: string,
      exerciseName: string,
      completed: boolean,
      allExercises: any[],
      workoutSchedules: any[]
    }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const schedule = workoutSchedules?.find(s => s.id === scheduleId);
      if (!schedule) throw new Error("Workout schedule not found");
      
      console.log(`Updating exercise completion for ${exerciseName} to ${completed}`);
      
      const updatedCompletedExercises = allExercises
        .filter(ex => ex.id === exerciseId ? completed : !!ex.completed)
        .map((ex, index) => ({
          exercise_name: ex.name,
          sets_completed: ex.sets,
          reps_completed: ex.reps,
          weight_used: ex.weight,
          order_index: index,
          superset_group_id: ex.superset_group_id || null
        } as Omit<ExerciseLog, 'workout_log_id'>));
      
      if (schedule.workout_log_id) {
        if (updatedCompletedExercises.length === 0) {
          await WorkoutService.deleteWorkoutLog(schedule.workout_log_id);
          await WorkoutService.updateScheduledWorkout(scheduleId, {
            is_completed: false,
            workout_log_id: null,
            completion_date: null
          });
          return scheduleId;
        } else {
          await WorkoutService.deleteExerciseLogs(schedule.workout_log_id);
          await WorkoutService.addExerciseLogs(
            schedule.workout_log_id, 
            updatedCompletedExercises
          );
          
          const isStillCompleted = updatedCompletedExercises.length > 0;
          if (isStillCompleted !== schedule.is_completed) {
            await WorkoutService.updateScheduledWorkout(scheduleId, {
              is_completed: isStillCompleted
            });
          }
          
          return scheduleId;
        }
      } else if (updatedCompletedExercises.length > 0) {
        const log: WorkoutLog = {
          user_id: userId,
          workout_plan_id: schedule.workout_plan_id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        const logId = await WorkoutService.logWorkout(log, updatedCompletedExercises);
        
        if (logId) {
          console.log(`Created workout log ${logId} and updating schedule ${scheduleId}`);
          await WorkoutService.completeScheduledWorkout(scheduleId, logId);
          return scheduleId;
        }
      }
      
      return scheduleId;
    },
    onSuccess: () => {
      console.log("Successfully updated exercise completion");
      queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
      queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      
      toast({
        title: "Progress Updated",
        description: "Your workout progress has been saved."
      });
    },
    onError: (error) => {
      console.error("Error updating exercise completion:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise completion. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    scheduleWorkoutMutation,
    completeExerciseMutation
  };
}
