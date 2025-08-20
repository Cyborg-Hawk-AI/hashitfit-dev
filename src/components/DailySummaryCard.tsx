
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  Plus, 
  Utensils,
  Droplets,
  Moon,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutSummary {
  id: string;
  title: string;
  duration: number;
  bodyFocus: string[];
  isCompleted: boolean;
  exercises: number;
}

interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface HabitEntry {
  id: string;
  name: string;
  isCompleted: boolean;
  target?: number;
  current?: number;
  unit?: string;
}

interface DailySummaryCardProps {
  date: Date;
  workout?: WorkoutSummary;
  meals: MealEntry[];
  habits: HabitEntry[];
  onAddWorkout: () => void;
  onAddMeal: () => void;
  onEditWorkout: (workout: WorkoutSummary) => void;
  className?: string;
}

export function DailySummaryCard({
  date,
  workout,
  meals,
  habits,
  onAddWorkout,
  onAddMeal,
  onEditWorkout,
  className
}: DailySummaryCardProps) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Workout Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Workout</h3>
            {!workout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddWorkout}
                className="flex items-center"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            )}
          </div>
          
          {workout ? (
            <div 
              className="space-y-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
              onClick={() => onEditWorkout(workout)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{workout.title}</h4>
                {workout.isCompleted && (
                  <CheckCircle2 size={18} className="text-green-600" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {workout.duration}min
                </div>
                <div className="flex items-center">
                  <Target size={14} className="mr-1" />
                  {workout.exercises} exercises
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {workout.bodyFocus.map((muscle, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No workout scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Nutrition Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Nutrition</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMeal}
              className="flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add Meal
            </Button>
          </div>
          
          {meals.length > 0 ? (
            <div className="space-y-3">
              {/* Macro Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{totalCalories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{totalProtein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">{totalCarbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{totalFat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </div>
              
              {/* Meal List */}
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMealTypeIcon(meal.type)}</span>
                      <div>
                        <p className="font-medium capitalize">{meal.type}</p>
                        <p className="text-sm text-muted-foreground">{meal.calories} cal</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>P: {meal.protein}g</p>
                      <p>C: {meal.carbs}g | F: {meal.fat}g</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Utensils className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No meals logged</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Habits Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-3">Daily Habits</h3>
          
          <div className="space-y-3">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    habit.isCompleted 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300"
                  )}>
                    {habit.isCompleted && (
                      <CheckCircle2 size={12} className="text-white" />
                    )}
                  </div>
                  <span className="font-medium">{habit.name}</span>
                </div>
                
                {habit.target && (
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {habit.current || 0}/{habit.target} {habit.unit}
                    </p>
                    <Progress 
                      value={((habit.current || 0) / habit.target) * 100} 
                      className="w-16 h-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
