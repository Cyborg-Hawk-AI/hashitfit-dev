
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Clock,
  Dumbbell,
  Plus,
  Edit3,
  UtensilsCrossed,
  Camera,
  BookOpen,
  MessageCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Workout {
  id: string;
  title: string;
  duration: number;
  bodyFocus: string[];
  isCompleted: boolean;
  exercises: number;
}

interface Habit {
  id: string;
  name: string;
  isCompleted: boolean;
  target?: number;
  current?: number;
  unit?: string;
}

interface EnhancedDailySummaryCardProps {
  date: Date;
  workout?: Workout;
  meals: any[];
  habits: Habit[];
  onAddWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onAddMeal: () => void;
  onScanPlate: () => void;
  onUseTemplate: () => void;
  onAskCoach: () => void;
  onSwapDay: (type: string) => void;
  onAddAnotherSession: () => void;
  onPreLogMeal: (date: Date) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function EnhancedDailySummaryCard({
  date,
  workout,
  meals,
  habits,
  onAddWorkout,
  onEditWorkout,
  onAddMeal,
  onScanPlate,
  onUseTemplate,
  onAskCoach,
  onSwapDay,
  onAddAnotherSession,
  onPreLogMeal,
  isCollapsed = false,
  onToggleCollapse
}: EnhancedDailySummaryCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const isToday = date.toDateString() === new Date().toDateString();
  const completedHabits = habits.filter(h => h.isCompleted).length;
  const habitCompletion = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-hashim-600" />
            <span>📋 {isToday ? 'Today' : format(date, 'MMM d')} Summary</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          {/* Workout Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2">
              <Dumbbell className="h-4 w-4 text-red-600" />
              <span>💪 Workout</span>
            </h3>
            
            {workout ? (
              <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-white">{workout.title}</h4>
                  {workout.isCompleted && (
                    <Badge className="bg-green-100 text-green-700">✓ Completed</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{workout.duration}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Dumbbell className="h-3 w-3" />
                    <span>{workout.exercises} exercises</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {workout.bodyFocus.map((muscle, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditWorkout(workout)}
                    className="flex-1"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onAddAnotherSession}
                    className="flex-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Session
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center">
                <Dumbbell className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  No workout scheduled
                </p>
                <div className="flex gap-2">
                  <Button onClick={onAddWorkout} size="sm" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Workout
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSwapDay('strength')}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Swap Day
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Nutrition Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2">
              <UtensilsCrossed className="h-4 w-4 text-blue-600" />
              <span>🍽️ Nutrition</span>
            </h3>
            
            {meals.length > 0 ? (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  {meals.length} meal{meals.length > 1 ? 's' : ''} logged today
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onScanPlate} className="flex-1">
                    <Camera className="h-3 w-3 mr-1" />
                    Scan Plate
                  </Button>
                  <Button variant="outline" size="sm" onClick={onAddMeal} className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Meal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center">
                <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  No meals logged yet
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={onScanPlate}>
                    <Camera className="h-3 w-3 mr-1" />
                    Scan
                  </Button>
                  <Button variant="outline" size="sm" onClick={onUseTemplate}>
                    <BookOpen className="h-3 w-3 mr-1" />
                    Template
                  </Button>
                  <Button onClick={onAddMeal} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Habits Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>✅ Habits</span>
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {completedHabits}/{habits.length}
              </span>
            </div>
            
            <Progress value={habitCompletion} className="h-2" />
            
            <div className="space-y-2">
              {habits.map((habit, index) => (
                <div 
                  key={habit.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-colors",
                    habit.isCompleted 
                      ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700" 
                      : "bg-slate-50 border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle 
                      className={cn(
                        "h-4 w-4",
                        habit.isCompleted ? "text-green-600" : "text-slate-400"
                      )} 
                    />
                    <span className={cn(
                      "text-sm",
                      habit.isCompleted ? "text-green-700 dark:text-green-300" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {habit.name}
                    </span>
                  </div>
                  {habit.target && habit.current !== undefined && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {habit.current}/{habit.target} {habit.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAskCoach}
              className="flex-1 hover:bg-purple-50 transition-colors"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Ask Coach
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPreLogMeal(date)}
              className="flex-1 hover:bg-blue-50 transition-colors"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Pre-log Meals
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
