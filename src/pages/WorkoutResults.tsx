
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { WorkoutResultsHeader } from "@/components/workout-results/WorkoutResultsHeader";
import { ExerciseSummaryList } from "@/components/workout-results/ExerciseSummaryList";
import { PerformanceMetrics } from "@/components/workout-results/PerformanceMetrics";
import { WorkoutInsights } from "@/components/workout-results/WorkoutInsights";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function WorkoutResults() {
  const { workoutLogId } = useParams<{ workoutLogId: string }>();
  const navigate = useNavigate();

  // Fetch workout log data
  const { data: workoutLog, isLoading: isLoadingLog } = useQuery({
    queryKey: ['workoutLog', workoutLogId],
    queryFn: async () => {
      if (!workoutLogId) throw new Error("Workout log ID is required");
      return await WorkoutService.getWorkoutLogById(workoutLogId);
    },
    enabled: !!workoutLogId,
  });

  // Fetch exercise logs
  const { data: exerciseLogs, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exerciseLogs', workoutLogId],
    queryFn: async () => {
      if (!workoutLogId) throw new Error("Workout log ID is required");
      return await WorkoutService.getExerciseLogs(workoutLogId);
    },
    enabled: !!workoutLogId,
  });

  // Fetch workout plan details
  const { data: workoutPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['workoutPlan', workoutLog?.workout_plan_id],
    queryFn: async () => {
      if (!workoutLog?.workout_plan_id) return null;
      return await WorkoutService.getWorkoutPlanById(workoutLog.workout_plan_id);
    },
    enabled: !!workoutLog?.workout_plan_id,
  });

  const isLoading = isLoadingLog || isLoadingExercises || isLoadingPlan;

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto p-4 pt-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
        </div>
      </div>
    );
  }

  if (!workoutLog || !exerciseLogs) {
    return (
      <div className="max-w-lg mx-auto p-4 pt-8">
        <Card className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Workout Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The workout results you're looking for could not be found.
          </p>
          <Button onClick={() => navigate('/workouts')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workouts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pt-8 pb-20 space-y-6">
      <WorkoutResultsHeader 
        workoutLog={workoutLog}
        workoutPlan={workoutPlan}
        onBack={() => navigate('/workouts')}
      />
      
      <ExerciseSummaryList 
        exerciseLogs={exerciseLogs}
        workoutPlan={workoutPlan}
      />
      
      <PerformanceMetrics 
        workoutLog={workoutLog}
        exerciseLogs={exerciseLogs}
      />
      
      <WorkoutInsights 
        workoutLog={workoutLog}
        exerciseLogs={exerciseLogs}
        workoutPlan={workoutPlan}
      />
    </div>
  );
}
