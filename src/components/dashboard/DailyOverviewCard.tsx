
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Calendar, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyOverviewCardProps {
  userName?: string;
  todayWorkout?: {
    title: string;
    duration: number;
    isCompleted: boolean;
  };
  mealsLogged?: number;
  totalMeals?: number;
  habitsCompleted?: number;
  totalHabits?: number;
  streakDays?: number;
  onStartWorkout?: () => void;
  onSnapMeal?: () => void;
  onViewHabits?: () => void;
  className?: string;
}

export function DailyOverviewCard({
  userName = "Alex",
  todayWorkout,
  mealsLogged = 0,
  totalMeals = 4,
  habitsCompleted = 1,
  totalHabits = 3,
  streakDays = 3,
  onStartWorkout,
  onSnapMeal,
  onViewHabits,
  className
}: DailyOverviewCardProps) {
  const overallProgress = ((mealsLogged / totalMeals) + (habitsCompleted / totalHabits) + (todayWorkout?.isCompleted ? 1 : 0)) / 3 * 100;
  
  const hasStreak = streakDays > 0;
  const tasksRemaining = (todayWorkout?.isCompleted ? 0 : 1) + (totalMeals - mealsLogged) + (totalHabits - habitsCompleted);

  return (
    <Card className={cn("bg-gradient-to-br from-hashim-50 to-blue-50 border-hashim-200 animate-fade-in", className)}>
      <CardContent className="p-6">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              👋 Hey {userName}! Here's your focus for today:
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {hasStreak ? (
              <div className="flex items-center px-3 py-1 bg-orange-100 rounded-full">
                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-orange-700">{streakDays}-Day Streak</span>
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-sm text-gray-600">⛅ Let's start a streak!</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-3 mb-4">
          {/* Workout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-hashim-100 rounded-lg">
                <Target className="h-4 w-4 text-hashim-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Workout: {todayWorkout ? `${todayWorkout.title} – ${todayWorkout.duration} min` : "No workout scheduled"}
                </p>
                <p className="text-sm text-gray-500">
                  {todayWorkout?.isCompleted ? "✅ Completed" : "Pending"}
                </p>
              </div>
            </div>
            {todayWorkout && !todayWorkout.isCompleted && (
              <Button 
                size="sm" 
                className="bg-hashim-600 hover:bg-hashim-700 text-white"
                onClick={onStartWorkout}
              >
                Start Now
              </Button>
            )}
          </div>

          {/* Meals */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Utensils className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Meals: {mealsLogged}/{totalMeals} logged</p>
                <p className="text-sm text-gray-500">
                  {mealsLogged === totalMeals ? "🎉 All meals logged!" : `${totalMeals - mealsLogged} remaining`}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSnapMeal}
            >
              Snap Meal
            </Button>
          </div>

          {/* Habits */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Habits: {habitsCompleted} of {totalHabits} done</p>
                <p className="text-sm text-gray-500">
                  {habitsCompleted === totalHabits ? "🎯 All habits complete!" : "Keep going!"}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewHabits}
            >
              View
            </Button>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">🎯 Daily Goal Progress</span>
            <span className="text-gray-500">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Ready to Crush Message */}
        <div className="text-center mt-4 p-3 bg-hashim-100 rounded-lg">
          <p className="text-sm font-medium text-hashim-700">
            Ready to crush today? You've got {tasksRemaining} core task{tasksRemaining !== 1 ? 's' : ''} left! 💪
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
