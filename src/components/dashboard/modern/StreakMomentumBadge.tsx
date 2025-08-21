
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target } from "lucide-react";

interface StreakMomentumBadgeProps {
  streakDays: number;
  nutritionStreak?: number;
  longestStreak?: number;
  isLoading?: boolean;
}

export function StreakMomentumBadge({ 
  streakDays, 
  nutritionStreak = 0, 
  longestStreak = 0,
  isLoading = false 
}: StreakMomentumBadgeProps) {
  if (isLoading) {
    return (
      <div className="text-center py-1">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (streakDays === 0 && nutritionStreak === 0) {
    return (
      <div className="text-center py-1">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Start working out to begin your streak! 💪
        </p>
      </div>
    );
  }

  // Determine which streak to show (prioritize workout streak)
  const primaryStreak = streakDays > 0 ? streakDays : nutritionStreak;
  const streakType = streakDays > 0 ? 'workout' : 'nutrition';
  const streakIcon = streakDays > 0 ? '💪' : '🍽️';

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Primary Streak Badge */}
      <div className="flex justify-center">
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
          <Flame className="h-4 w-4 mr-2" />
          {streakIcon} {primaryStreak}-day {streakType} streak! Keep going!
        </Badge>
      </div>

      {/* Additional Streak Info */}
      {(streakDays > 0 || nutritionStreak > 0) && (
        <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
          {streakDays > 0 && nutritionStreak > 0 && (
            <div className="flex items-center">
              <Trophy className="h-3 w-3 mr-1" />
              <span>🍽️ {nutritionStreak} days nutrition</span>
            </div>
          )}
          {longestStreak > 0 && longestStreak > primaryStreak && (
            <div className="flex items-center">
              <Target className="h-3 w-3 mr-1" />
              <span>Best: {longestStreak} days</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
