
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Plus,
  Dumbbell,
  UtensilsCrossed,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format, isSameDay, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface DayData {
  date: Date;
  workoutTitle?: string;
  workoutType: 'strength' | 'cardio' | 'flexibility' | 'rest';
  mealsLogged: number;
  mealGoal: number;
  habitCompletion: number;
  isToday: boolean;
  isCompleted?: boolean;
  isScheduled?: boolean;
  nutritionLog?: any; // For meal expansion
}

interface WeeklyTimelineViewProps {
  weekData: DayData[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onAddWorkout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onCurrentWeek?: () => void;
  currentWeekStart?: Date;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WeeklyTimelineView({
  weekData,
  selectedDate,
  onDaySelect,
  onAddWorkout,
  isCollapsed = false,
  onToggleCollapse,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  currentWeekStart,
  isLoading = false,
  onRefresh
}: WeeklyTimelineViewProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const getWorkoutTypeColor = (type: string) => {
    const colors = {
      strength: "bg-red-100 text-red-700 border-red-200",
      cardio: "bg-blue-100 text-blue-700 border-blue-200", 
      flexibility: "bg-green-100 text-green-700 border-green-200",
      rest: "bg-gray-100 text-gray-600 border-gray-200"
    };
    return colors[type as keyof typeof colors] || colors.rest;
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="h-3 w-3" />;
      case 'cardio': return <Clock className="h-3 w-3" />;
      case 'flexibility': return <CheckCircle className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span>📅 Weekly Timeline</span>
              {currentWeekStart && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Week Navigation */}
            {!collapsed && onPreviousWeek && onNextWeek && onCurrentWeek && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPreviousWeek}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCurrentWeek}
                  className="text-xs px-2 py-1 text-slate-600 hover:text-blue-600"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNextWeek}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                >
                  →
                </Button>
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                  >
                    🔄
                  </Button>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Updating timeline...</span>
            </div>
          )}
          {weekData.map((day, index) => {
            const isSelected = isSameDay(day.date, selectedDate);
            
            return (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  isSelected 
                    ? "bg-hashim-50 border-hashim-200 dark:bg-hashim-900/20 dark:border-hashim-700" 
                    : "bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
                onClick={() => onDaySelect(day.date)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "font-semibold text-sm",
                      day.isToday && "text-hashim-600"
                    )}>
                      {format(day.date, 'EEEE')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {format(day.date, 'MMM d')}
                    </span>
                    {day.isToday && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWorkout();
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-hashim-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Workout Info */}
                <div className="mb-3">
                  {day.workoutTitle ? (
                    <div className={cn(
                      "flex items-center justify-between p-2 rounded border text-xs",
                      getWorkoutTypeColor(day.workoutType)
                    )}>
                      <div className="flex items-center space-x-2">
                        {getWorkoutTypeIcon(day.workoutType)}
                        <span className="font-medium">{day.workoutTitle}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {day.isScheduled && !day.isCompleted && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Scheduled</span>
                        )}
                        {day.isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 rounded">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 rounded border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>Rest day</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Indicators */}
                <div className="space-y-2">
                  {/* Meals Progress */}
                  <div className="flex items-center space-x-2">
                    <UtensilsCrossed className="h-3 w-3 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Meals</span>
                                              <div className="flex items-center space-x-1">
                        <span className="text-xs font-medium">{day.mealsLogged}/{day.mealGoal}</span>
                        {day.mealsLogged > 0 && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                        {day.nutritionLog?.meal_logs?.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const dateKey = format(day.date, 'yyyy-MM-dd');
                                setExpandedMeals(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(dateKey)) {
                                    newSet.delete(dateKey);
                                  } else {
                                    newSet.add(dateKey);
                                  }
                                  return newSet;
                                });
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {expandedMeals.has(format(day.date, 'yyyy-MM-dd')) ? '▼' : '▶'}
                            </button>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={(day.mealsLogged / day.mealGoal) * 100} 
                        className="h-1.5"
                      />
                      
                      {/* Expanded Meals List */}
                      {expandedMeals.has(format(day.date, 'yyyy-MM-dd')) && day.nutritionLog?.meal_logs?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {day.nutritionLog.meal_logs.map((meal: any, mealIndex: number) => (
                            <div key={mealIndex} className="text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded">
                              <div className="font-medium">{meal.meal_name || `Meal ${mealIndex + 1}`}</div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {meal.calories ? `${meal.calories} cal` : ''}
                                {meal.protein_g ? ` • ${meal.protein_g}g protein` : ''}
                                {meal.carbs_g ? ` • ${meal.carbs_g}g carbs` : ''}
                                {meal.fat_g ? ` • ${meal.fat_g}g fat` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Habits Progress */}
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Habits</span>
                        <span className="text-xs font-medium">{day.habitCompletion}%</span>
                      </div>
                      <Progress 
                        value={day.habitCompletion} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
