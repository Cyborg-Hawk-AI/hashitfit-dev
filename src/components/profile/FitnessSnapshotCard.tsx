
import { AnimatedCard } from "@/components/ui-components";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FitnessSnapshotCardProps {
  workoutsCompleted?: number;
  workoutsGoal?: number;
  weightChange?: number;
  avgProtein?: number;
  proteinGoal?: number;
  habitStreak?: number;
  longestStreak?: number;
}

export function FitnessSnapshotCard({
  workoutsCompleted = 3,
  workoutsGoal = 4,
  weightChange = -1.8,
  avgProtein = 102,
  proteinGoal = 150,
  habitStreak = 8,
  longestStreak = 11
}: FitnessSnapshotCardProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp size={14} className="text-green-600" />;
    if (value < 0) return <TrendingDown size={14} className="text-red-600" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const formatWeightChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change} kg since start`;
  };

  return (
    <AnimatedCard className="mb-6" delay={100}>
      <div className="flex items-center mb-4">
        <span className="text-lg mr-2">📊</span>
        <h3 className="font-semibold">Your Fitness Snapshot</h3>
      </div>
      
      <div className="space-y-4">
        {/* Workouts This Week */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>🏋️</span>
            <span className="text-sm font-medium">Workouts This Week:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">{workoutsCompleted} of {workoutsGoal} complete</span>
            <Progress value={(workoutsCompleted / workoutsGoal) * 100} className="w-16 h-2" />
          </div>
        </div>

        {/* Weight Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>📉</span>
            <span className="text-sm font-medium">Weight Progress:</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold">{formatWeightChange(weightChange)}</span>
            {getTrendIcon(weightChange)}
          </div>
        </div>

        {/* Average Protein */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>🍗</span>
            <span className="text-sm font-medium">Avg Protein:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">{avgProtein}g/day (Goal: {proteinGoal}g)</span>
            <Progress value={(avgProtein / proteinGoal) * 100} className="w-16 h-2" />
          </div>
        </div>

        {/* Habit Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span className="text-sm font-medium">Habit Streak:</span>
          </div>
          <div className="text-sm font-bold">
            {habitStreak}-day streak, longest: {longestStreak}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
