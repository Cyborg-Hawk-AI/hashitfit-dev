
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Activity, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyStats {
  workoutCompletion: number;
  nutritionCompliance: number;
  habitsCompleted: number;
  totalHabits: number;
  progressTrend: 'up' | 'down' | 'stable';
  weeklyGoals: {
    workouts: { completed: number; target: number };
    calories: { avg: number; target: number };
    protein: { avg: number; target: number };
  };
}

interface WeeklyAnalyticsProps {
  stats: WeeklyStats;
  className?: string;
}

export function WeeklyAnalytics({ stats, className }: WeeklyAnalyticsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-500" />;
      case 'down': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-gray-500" />;
    }
  };
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Weekly Summary
          <Badge className={cn("flex items-center space-x-1", getTrendColor(stats.progressTrend))}>
            {getTrendIcon(stats.progressTrend)}
            <span className="text-xs font-medium">
              {stats.progressTrend === 'up' ? 'Improving' : 
               stats.progressTrend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-hashim-600" />
            </div>
            <p className={cn("text-2xl font-bold", getComplianceColor(stats.workoutCompletion))}>
              {stats.workoutCompletion}%
            </p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
            <p className={cn("text-2xl font-bold", getComplianceColor(stats.nutritionCompliance))}>
              {stats.nutritionCompliance}%
            </p>
            <p className="text-xs text-muted-foreground">Nutrition</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.habitsCompleted}/{stats.totalHabits}
            </p>
            <p className="text-xs text-muted-foreground">Habits</p>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Workout Completion</span>
              <span>{stats.workoutCompletion}%</span>
            </div>
            <Progress value={stats.workoutCompletion} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Nutrition Compliance</span>
              <span>{stats.nutritionCompliance}%</span>
            </div>
            <Progress value={stats.nutritionCompliance} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Habit Consistency</span>
              <span>{Math.round((stats.habitsCompleted / stats.totalHabits) * 100)}%</span>
            </div>
            <Progress value={(stats.habitsCompleted / stats.totalHabits) * 100} className="h-2" />
          </div>
        </div>
        
        {/* Weekly Goals */}
        <div className="pt-3 border-t">
          <h4 className="font-medium mb-2">Weekly Goals</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Workouts:</span>
              <span>
                {stats.weeklyGoals.workouts.completed}/{stats.weeklyGoals.workouts.target}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Calories:</span>
              <span>
                {stats.weeklyGoals.calories.avg}/{stats.weeklyGoals.calories.target}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Protein:</span>
              <span>
                {stats.weeklyGoals.protein.avg}g/{stats.weeklyGoals.protein.target}g
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
