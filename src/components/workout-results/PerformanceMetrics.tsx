
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkoutLog, ExerciseLog } from "@/lib/supabase/services/WorkoutService";

interface PerformanceMetricsProps {
  workoutLog: WorkoutLog;
  exerciseLogs: ExerciseLog[];
}

export function PerformanceMetrics({ workoutLog, exerciseLogs }: PerformanceMetricsProps) {
  // Calculate total volume (simplified calculation)
  const totalVolume = exerciseLogs.reduce((total, exercise) => {
    const weight = exercise.weight_used && exercise.weight_used !== 'bodyweight' 
      ? parseFloat(exercise.weight_used.replace(/[^\d.]/g, '')) || 0
      : 0;
    const reps = parseInt(exercise.reps_completed.toString()) || 0;
    const sets = exercise.sets_completed || 0;
    
    return total + (weight * reps * sets);
  }, 0);

  // Calculate average rest time if available
  const exercisesWithRest = exerciseLogs.filter(ex => ex.rest_seconds);
  const avgRestTime = exercisesWithRest.length > 0
    ? exercisesWithRest.reduce((sum, ex) => sum + (ex.rest_seconds || 0), 0) / exercisesWithRest.length
    : null;

  // Performance completion rate (assuming all logged exercises were completed)
  const completionRate = 100; // Since these are logged exercises, they're completed

  const metrics = [
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      progress: completionRate,
      color: "bg-green-500"
    },
    {
      label: "Total Volume",
      value: totalVolume > 0 ? `${Math.round(totalVolume)} lbs` : "Bodyweight",
      progress: null,
      color: "bg-hashim-500"
    },
    {
      label: "Exercises Completed",
      value: exerciseLogs.length.toString(),
      progress: null,
      color: "bg-blue-500"
    }
  ];

  if (avgRestTime) {
    metrics.push({
      label: "Avg Rest Time",
      value: `${Math.round(avgRestTime)}s`,
      progress: null,
      color: "bg-purple-500"
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-sm font-medium">{metric.value}</span>
              </div>
              {metric.progress !== null && (
                <Progress value={metric.progress} className="h-2" />
              )}
            </div>
          ))}
        </div>

        {workoutLog.duration && (
          <div className="pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-hashim-600">
                {Math.round(parseInt(workoutLog.duration.toString()) / 60000)} min
              </div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
