
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { WorkoutLog, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";

interface WorkoutResultsHeaderProps {
  workoutLog: WorkoutLog;
  workoutPlan: WorkoutPlan | null;
  onBack: () => void;
}

export function WorkoutResultsHeader({ workoutLog, workoutPlan, onBack }: WorkoutResultsHeaderProps) {
  const startTime = new Date(workoutLog.start_time);
  const endTime = workoutLog.end_time ? new Date(workoutLog.end_time) : null;
  
  const duration = endTime && workoutLog.start_time 
    ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      </div>
      
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">
          {workoutPlan?.title || "Workout Complete"}
        </h1>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          {format(startTime, "MMM d, yyyy 'at' h:mm a")}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          {duration && (
            <div className="text-center">
              <div className="text-2xl font-bold text-hashim-600">{duration}</div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
          )}
          
          {workoutLog.calories_burned && (
            <div className="text-center">
              <div className="text-2xl font-bold text-hashim-600">{workoutLog.calories_burned}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
          )}
        </div>
        
        {workoutLog.rating && (
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Rating:</span>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < workoutLog.rating! ? 'bg-hashim-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
