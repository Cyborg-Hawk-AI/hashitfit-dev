
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { ExerciseLog, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";

interface ExerciseSummaryListProps {
  exerciseLogs: ExerciseLog[];
  workoutPlan: WorkoutPlan | null;
}

export function ExerciseSummaryList({ exerciseLogs, workoutPlan }: ExerciseSummaryListProps) {
  // Group exercises by superset if they exist
  const groupedExercises = exerciseLogs.reduce((groups, exercise) => {
    const groupKey = exercise.superset_group_id || exercise.id;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(exercise);
    return groups;
  }, {} as Record<string, ExerciseLog[]>);

  const sortedGroups = Object.values(groupedExercises).sort((a, b) => 
    (a[0].order_index || 0) - (b[0].order_index || 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Exercise Summary</span>
          <Badge variant="secondary">
            {exerciseLogs.length} {exerciseLogs.length === 1 ? 'Exercise' : 'Exercises'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.length > 1 && (
              <Badge variant="outline" className="mb-2 text-xs">
                Superset
              </Badge>
            )}
            
            {group.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{exercise.exercise_name}</h4>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">{exercise.sets_completed}</span> sets
                        </div>
                        <div>
                          <span className="font-medium">{exercise.reps_completed}</span> reps
                        </div>
                        {exercise.weight_used && exercise.weight_used !== 'bodyweight' && (
                          <div>
                            <span className="font-medium">{exercise.weight_used}</span>
                          </div>
                        )}
                      </div>
                      
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {exerciseIndex < group.length - 1 && (
                  <div className="ml-9">
                    <Separator className="my-2" />
                  </div>
                )}
              </div>
            ))}
            
            {groupIndex < sortedGroups.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
