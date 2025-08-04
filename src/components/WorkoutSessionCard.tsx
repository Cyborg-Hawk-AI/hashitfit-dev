
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Dumbbell,
  Heart,
  RotateCcw,
  Star,
  StarOff,
  GripVertical,
  MoreHorizontal,
  ArrowLeftRight,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: number;
  rpe?: number;
}

interface WorkoutSessionCardProps {
  workout: {
    id: string;
    title: string;
    exercises: Exercise[];
    category: string;
  };
  onComplete?: () => void;
  onSaveAsFavorite?: () => void;
  onStartRestTimer?: (duration: number) => void;
  className?: string;
}

export function WorkoutSessionCard({ 
  workout, 
  onComplete, 
  onSaveAsFavorite,
  onStartRestTimer,
  className 
}: WorkoutSessionCardProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [exercises, setExercises] = useState(workout.exercises);
  const [supersets, setSupersets] = useState<number[][]>([]);
  
  const currentEx = exercises[currentExercise];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + (ex.completed || 0), 0);
  const progress = (completedSets / totalSets) * 100;

  const completeSet = () => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExercise].completed = (updatedExercises[currentExercise].completed || 0) + 1;
    setExercises(updatedExercises);
    
    // Start rest timer
    if (onStartRestTimer) {
      onStartRestTimer(60);
    }
    
    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    } else {
      onComplete?.();
    }
  };

  const updateRPE = (exerciseIndex: number, rpe: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].rpe = rpe;
    setExercises(updatedExercises);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onSaveAsFavorite?.();
  };

  const swapExercise = () => {
    // Placeholder for exercise swap functionality
    console.log("Opening exercise swap modal");
  };

  const toggleSuperset = (exerciseIndex: number) => {
    // Placeholder for superset functionality
    console.log("Toggling superset for exercise:", exerciseIndex);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <Card className="border-l-4 border-l-hashim-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-hashim-100 rounded-lg">
                <Dumbbell className="h-4 w-4 text-hashim-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{workout.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {workout.category}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className="h-8 w-8 p-0"
            >
              {isFavorite ? 
                <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                <StarOff className="h-4 w-4" />
              }
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedSets}/{totalSets} sets</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div 
                className="absolute top-0 h-3 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Exercise Card */}
      <Card className="bg-gradient-to-br from-hashim-50 to-white border-2 border-hashim-200 animate-pulse-subtle">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-hashim-800">{currentEx.name}</h3>
              <Badge variant="outline" className="mt-1">
                Exercise {currentExercise + 1}/{exercises.length}
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={swapExercise}
                className="h-8 w-8 p-0"
              >
                <ArrowLeftRight size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSuperset(currentExercise)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Set</p>
              <p className="text-2xl font-bold text-hashim-600">{currentSet}</p>
              <p className="text-xs text-muted-foreground">of {currentEx.sets}</p>
            </div>
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Reps</p>
              <Input 
                type="text" 
                defaultValue={currentEx.reps}
                className="text-center font-bold h-8 border-0 bg-transparent text-xl"
              />
            </div>
            <div className="text-center bg-white rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Weight</p>
              <Input 
                type="text" 
                defaultValue={currentEx.weight}
                className="text-center font-bold h-8 border-0 bg-transparent text-xl"
              />
            </div>
          </div>
          
          {/* RPE Selector */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Rate of Perceived Exertion (RPE)</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                <Button
                  key={rpe}
                  variant={currentEx.rpe === rpe ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs transition-all",
                    rpe <= 3 && "border-green-300 text-green-600 hover:bg-green-50",
                    rpe > 3 && rpe <= 6 && "border-yellow-300 text-yellow-600 hover:bg-yellow-50",
                    rpe > 6 && rpe <= 8 && "border-orange-300 text-orange-600 hover:bg-orange-50",
                    rpe > 8 && "border-red-300 text-red-600 hover:bg-red-50",
                    currentEx.rpe === rpe && "ring-2 ring-hashim-300"
                  )}
                  onClick={() => updateRPE(currentExercise, rpe)}
                >
                  {rpe}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Max Effort</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onStartRestTimer?.(60)}
              className="flex-1"
            >
              <Timer size={16} className="mr-2" />
              Rest 1min
            </Button>
            
            <Button 
              onClick={completeSet}
              className="flex-2 bg-hashim-600 hover:bg-hashim-700 text-white"
              size="lg"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Set {currentSet}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Exercise List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                index === currentExercise ? "bg-hashim-100 border-hashim-300 ring-2 ring-hashim-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                index < currentExercise && "opacity-60"
              )}
              onClick={() => {
                setCurrentExercise(index);
                setCurrentSet(1);
              }}
            >
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {exercise.completed && (
                  <Badge variant="secondary" className="text-xs">
                    {exercise.completed}/{exercise.sets}
                  </Badge>
                )}
                {index < currentExercise && (
                  <CheckCircle className="h-4 w-4 text-green-500 animate-bounce" />
                )}
                {index === currentExercise && (
                  <div className="w-2 h-2 bg-hashim-600 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
