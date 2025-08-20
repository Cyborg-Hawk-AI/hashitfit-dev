
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Clock, 
  CheckCircle, 
  Target,
  TrendingUp,
  BarChart3,
  Play,
  Brain,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
  source: 'planned' | 'voice';
  rest_seconds?: number;
  superset_group_id?: string | null;
  position_in_workout?: number;
}

interface WorkoutData {
  schedule_id?: string;
  id?: string;
  title: string;
  exercises: Exercise[];
  difficulty?: number;
  estimated_duration?: number;
  target_muscles?: string[];
  is_completed: boolean;
  workout_log_id?: string;
}

interface DailyWorkoutSummaryCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  workoutData?: WorkoutData | null;
  onContinueWorkout?: (workout: WorkoutData) => void;
  onStartWorkout?: (workout: WorkoutData) => void;
  onCompleteExercise?: (exerciseId: string, exerciseName: string, completed: boolean) => void;
  onGenerateWorkout?: () => void;
  onAddWorkout?: () => void;
  isLoading?: boolean;
}

export function DailyWorkoutSummaryCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className,
  workoutData,
  onContinueWorkout,
  onStartWorkout,
  onCompleteExercise,
  onGenerateWorkout,
  onAddWorkout,
  isLoading = false
}: DailyWorkoutSummaryCardProps) {
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  // Get difficulty info with conditional colors
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { label: 'Beginner', color: 'bg-green-100 text-green-800', emoji: '🟢' };
    
    if (difficulty <= 3) return { label: 'Beginner', color: 'bg-green-100 text-green-800', emoji: '🟢' };
    if (difficulty <= 6) return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', emoji: '🟡' };
    if (difficulty <= 8) return { label: 'Advanced', color: 'bg-orange-100 text-orange-800', emoji: '🟠' };
    return { label: 'Expert', color: 'bg-red-100 text-red-800', emoji: '🔴' };
  };

  // Handle view results navigation
  const handleViewResults = () => {
    if (workoutData?.workout_log_id) {
      navigate(`/workout-results/${workoutData.workout_log_id}`);
    } else {
      console.error('No workout log ID available for this completed workout');
      toast({
        title: "Error",
        description: "Unable to view results. Workout log not found.",
        variant: "destructive"
      });
    }
  };

  // Handle exercise completion toggle
  const handleExerciseToggle = (exercise: Exercise) => {
    if (onCompleteExercise && workoutData) {
      onCompleteExercise(exercise.id, exercise.name, !exercise.completed);
    }
  };

  // Calculate progress
  const completedExercises = workoutData?.exercises.filter(ex => ex.completed).length || 0;
  const totalExercises = workoutData?.exercises.length || 0;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const hasStarted = completedExercises > 0;

  // Determine if workout is completed
  const isCompleted = workoutData?.is_completed || false;

  if (isLoading) {
    return (
      <Card className={cn("transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-hashim-100 rounded-lg">
                <Dumbbell className="h-4 w-4 text-hashim-600" />
              </div>
              <CardTitle className="text-lg">Today's Workout</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workoutData) {
    return (
      <Card className={cn("transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-hashim-100 rounded-lg">
                <Dumbbell className="h-4 w-4 text-hashim-600" />
              </div>
              <CardTitle className="text-lg">Today's Workout</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">
              You haven't scheduled today's workout — try a quick bodyweight session?
            </p>
            <div className="flex space-x-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateWorkout}
                className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
              >
                <Brain className="h-4 w-4 text-purple-600" />
                <span>Generate One</span>
              </Button>
              <Button
                size="sm"
                onClick={onAddWorkout}
                className="flex items-center space-x-1 bg-hashim-600 hover:bg-hashim-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Workout</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const difficultyInfo = getDifficultyInfo(workoutData.difficulty);

  // Use green gradient when completed, original when not
  const cardBackground = isCompleted 
    ? "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600" 
    : "";
  
  const textColor = isCompleted ? "text-white" : "";
  const iconColor = isCompleted ? "text-white/90" : "text-hashim-600";
  const badgeColor = isCompleted ? "bg-white/20 text-white border-white/20" : difficultyInfo.color;

  return (
    <Card className={cn("transition-all duration-300", cardBackground, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("p-2 rounded-lg", isCompleted ? "bg-white/20" : "bg-hashim-100")}>
              <Dumbbell className={cn("h-4 w-4", iconColor)} />
            </div>
            <CardTitle className={cn("text-lg", textColor)}>Today's Workout</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn("h-8 w-8 p-0", isCompleted && "hover:bg-white/20 text-white")}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          {/* Workout Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn("font-semibold text-base", textColor)}>{workoutData.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={cn("text-xs", badgeColor)}>
                  {difficultyInfo.emoji} {difficultyInfo.label}
                </Badge>
                {isCompleted && (
                  <div className="flex items-center space-x-1 text-white">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={textColor}>Progress</span>
              <span className={textColor}>{completedExercises}/{totalExercises} exercises</span>
            </div>
            <Progress 
              value={progress} 
              className={cn("h-2", isCompleted && "bg-white/20")} 
            />
          </div>

          {/* Workout Stats */}
          <div className={cn("flex items-center justify-between text-sm", isCompleted ? "text-white/90" : "text-muted-foreground")}>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{workoutData.estimated_duration || 45} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{totalExercises} exercises</span>
            </div>
          </div>

          {/* Target Muscles */}
          {workoutData.target_muscles && workoutData.target_muscles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {workoutData.target_muscles.slice(0, 3).map((muscle, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={cn("text-xs", isCompleted && "bg-white/20 text-white")}
                >
                  {muscle}
                </Badge>
              ))}
              {workoutData.target_muscles.length > 3 && (
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", isCompleted && "bg-white/20 text-white")}
                >
                  +{workoutData.target_muscles.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Exercise List (if workout has started and not completed) */}
          {hasStarted && !isCompleted && (
            <div className="space-y-2">
              <h4 className={cn("text-sm font-medium", textColor)}>Exercises</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {workoutData.exercises.slice(0, 4).map((exercise) => (
                  <div 
                    key={exercise.id}
                    className={cn("flex items-center justify-between p-2 rounded-lg", 
                      isCompleted ? "bg-white/20" : "bg-gray-50"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExerciseToggle(exercise)}
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                          exercise.completed 
                            ? "bg-green-500 border-green-500" 
                            : isCompleted 
                              ? "border-white/50 hover:border-white" 
                              : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {exercise.completed && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span className={cn(
                        "text-sm",
                        exercise.completed && "line-through",
                        isCompleted ? "text-white" : exercise.completed ? "text-muted-foreground" : ""
                      )}>
                        {exercise.name}
                      </span>
                    </div>
                    <span className={cn("text-xs", isCompleted ? "text-white/90" : "text-muted-foreground")}>
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                ))}
                {workoutData.exercises.length > 4 && (
                  <div className="text-center">
                    <span className={cn("text-xs", isCompleted ? "text-white/90" : "text-muted-foreground")}>
                      +{workoutData.exercises.length - 4} more exercises
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercise List for completed workouts */}
          {isCompleted && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Completed Exercises</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {workoutData.exercises.slice(0, 4).map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center justify-between p-2 bg-white/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">
                        {exercise.name}
                      </span>
                    </div>
                    <span className="text-xs text-white/90">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                ))}
                {workoutData.exercises.length > 4 && (
                  <div className="text-center">
                    <span className="text-xs text-white/90">
                      +{workoutData.exercises.length - 4} more exercises
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="pt-2">
            {isCompleted ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleViewResults}
                className="w-full bg-white/20 text-white border-white/50 hover:bg-white/30 hover:text-white"
              >
                <BarChart3 size={16} className="mr-2" />
                View Results
              </Button>
            ) : hasStarted ? (
              <Button 
                size="sm" 
                onClick={() => onContinueWorkout?.(workoutData)}
                className="w-full bg-hashim-600 hover:bg-hashim-700"
              >
                <TrendingUp size={16} className="mr-2" />
                Continue Workout
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => onStartWorkout?.(workoutData)}
                className="w-full bg-hashim-600 hover:bg-hashim-700"
              >
                <Play size={16} className="mr-2" />
                Start Workout
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
