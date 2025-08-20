
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyMomentumCardProps {
  momentum: 'up' | 'steady' | 'down';
  weeklyProgress: number;
  isJustStarting: boolean;
  stats: {
    workoutCompletion: number;
    nutritionCompliance: number;
    habitsCompleted: number;
    totalHabits: number;
    progressTrend: string;
    weeklyGoals: {
      workouts: { completed: number; target: number };
      calories: { avg: number; target: number };
      protein: { avg: number; target: number };
    };
  };
  onViewHabits?: () => void;
  className?: string;
}

export function WeeklyMomentumCard({ 
  momentum, 
  weeklyProgress, 
  isJustStarting, 
  stats, 
  onViewHabits,
  className 
}: WeeklyMomentumCardProps) {
  const getMomentumIcon = () => {
    switch (momentum) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMomentumColor = () => {
    switch (momentum) {
      case 'up': return 'border-l-green-500';
      case 'down': return 'border-l-red-500';
      default: return 'border-l-yellow-500';
    }
  };

  const getMomentumBg = () => {
    switch (momentum) {
      case 'up': return 'bg-green-50';
      case 'down': return 'bg-red-50';
      default: return 'bg-yellow-50';
    }
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 90) return "One more day to hit it! 🎯";
    if (percentage >= 75) return "You're nearly there! 💪";
    if (percentage >= 50) return "You're picking up steam 🔥";
    if (percentage >= 25) return "Great start, keep going! ⭐";
    return "Every step counts! 🌱";
  };

  const getHabitsProgress = () => {
    const percentage = stats.totalHabits > 0 ? (stats.habitsCompleted / stats.totalHabits) * 100 : 0;
    return percentage;
  };

  const getHabitsColor = () => {
    const percentage = getHabitsProgress();
    if (percentage >= 70) return 'bg-green-100 border-green-300 text-green-700';
    if (percentage >= 40) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    return 'bg-red-100 border-red-300 text-red-700';
  };

  return (
    <Card className={cn("border-l-4 animate-fade-in", getMomentumColor(), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {getMomentumIcon()}
            <Badge variant="secondary" className="text-xs capitalize">
              {momentum} Trend
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isJustStarting ? (
          <div className={cn("p-3 rounded-lg border", getMomentumBg())}>
            <h4 className="text-sm font-medium mb-1">🌱 Just getting started?</h4>
            <p className="text-xs text-muted-foreground">
              Let's build your baseline this week. Every workout and meal logged helps!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-hashim-50 rounded-lg animate-scale-in">
                <p className="text-2xl font-bold text-hashim-700">{stats.workoutCompletion}%</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
                <p className="text-xs text-hashim-600 mt-1">
                  {getProgressMessage(stats.workoutCompletion)}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg animate-scale-in">
                <p className="text-2xl font-bold text-blue-700">{stats.nutritionCompliance}%</p>
                <p className="text-xs text-muted-foreground">Nutrition</p>
                <p className="text-xs text-blue-600 mt-1">
                  {getProgressMessage(stats.nutritionCompliance)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Progress</span>
                <span className="font-medium">{weeklyProgress}%</span>
              </div>
              <Progress 
                value={weeklyProgress} 
                className="h-2 animate-slide-in-right" 
              />
              <p className="text-xs text-muted-foreground">
                {getProgressMessage(weeklyProgress)}
              </p>
            </div>
          </div>
        )}

        {/* Goals Progress */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-1" />
            This Week's Goals
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span>Workouts: {stats.weeklyGoals.workouts.completed}/{stats.weeklyGoals.workouts.target}</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(stats.weeklyGoals.workouts.completed / stats.weeklyGoals.workouts.target) * 100} 
                  className="w-16 h-1.5" 
                />
                <span className="text-xs text-muted-foreground">
                  {getProgressMessage((stats.weeklyGoals.workouts.completed / stats.weeklyGoals.workouts.target) * 100)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Avg Calories: {stats.weeklyGoals.calories.avg}/{stats.weeklyGoals.calories.target}</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(stats.weeklyGoals.calories.avg / stats.weeklyGoals.calories.target) * 100} 
                  className="w-16 h-1.5" 
                />
                <span className="text-xs text-muted-foreground">
                  {getProgressMessage((stats.weeklyGoals.calories.avg / stats.weeklyGoals.calories.target) * 100)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Avg Protein: {stats.weeklyGoals.protein.avg}g/{stats.weeklyGoals.protein.target}g</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(stats.weeklyGoals.protein.avg / stats.weeklyGoals.protein.target) * 100} 
                  className="w-16 h-1.5" 
                />
                <span className="text-xs text-muted-foreground">
                  {getProgressMessage((stats.weeklyGoals.protein.avg / stats.weeklyGoals.protein.target) * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Habits Section */}
        <div className={cn("p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer", getHabitsColor())} onClick={onViewHabits}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Daily Habits</span>
            <span className="text-sm font-bold">
              {stats.habitsCompleted}/{stats.totalHabits} this week
            </span>
          </div>
          <div className="space-y-1">
            <Progress value={getHabitsProgress()} className="h-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs">
                {getProgressMessage(getHabitsProgress())}
              </span>
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                → Track Habits
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
