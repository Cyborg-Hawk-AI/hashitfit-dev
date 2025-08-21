
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Target, ChevronDown, ChevronUp } from "lucide-react";

interface GamificationCardProps {
  streakDays: number;
  nutritionStreak?: number;
  longestWorkoutStreak?: number;
  longestNutritionStreak?: number;
  currentWeekStreak?: number;
  latestBadge?: {
    name: string;
    icon: string;
    earned: boolean;
  };
  xpProgress?: {
    current: number;
    target: number;
    level: number;
  };
  onViewAchievements: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function GamificationCard({ 
  streakDays, 
  nutritionStreak = 0,
  longestWorkoutStreak = 0,
  longestNutritionStreak = 0,
  currentWeekStreak = 0,
  latestBadge, 
  xpProgress, 
  onViewAchievements,
  isCollapsed = false,
  onToggleCollapse
}: GamificationCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            🎖️ Your Wins This Week
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAchievements}
              className="text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
            >
              View All
            </Button>
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
        <CardContent className="pt-0 space-y-4">
          {/* Streaks Section */}
          <div className="space-y-3">
            {/* Primary Workout Streak */}
            {streakDays > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    💪 Workout Streak: {streakDays} days
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {streakDays >= 7 ? "On fire! 🚀" : "Don't break it!"}
                    {longestWorkoutStreak > streakDays && ` (Best: ${longestWorkoutStreak} days)`}
                  </p>
                </div>
              </div>
            )}

            {/* Nutrition Streak */}
            {nutritionStreak > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="h-6 w-6 text-green-500 animate-pulse">🍽️</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    🍽️ Nutrition Streak: {nutritionStreak} days
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {nutritionStreak >= 7 ? "Eating well! 🥗" : "Keep tracking!"}
                    {longestNutritionStreak > nutritionStreak && ` (Best: ${longestNutritionStreak} days)`}
                  </p>
                </div>
              </div>
            )}

            {/* This Week Activity */}
            {currentWeekStreak > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                <Target className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    📅 This Week: {currentWeekStreak} active days
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {currentWeekStreak >= 5 ? "Amazing week! 🌟" : "Great progress!"}
                  </p>
                </div>
              </div>
            )}

            {/* No Streaks Message */}
            {streakDays === 0 && nutritionStreak === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <Target className="h-6 w-6 text-slate-500" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    🎯 Start Your Streak
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Complete a workout or log a meal to begin!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Latest Badge */}
          {latestBadge && (
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
              <div className="text-2xl">{latestBadge.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-white">
                  🏅 Latest Badge
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {latestBadge.name}
                </p>
              </div>
              {latestBadge.earned && (
                <Badge className="bg-green-500 text-white">
                  ✓ Earned
                </Badge>
              )}
            </div>
          )}

          {/* XP Progress */}
          {xpProgress && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <p className="font-semibold text-slate-800 dark:text-white">
                    🎯 Level {xpProgress.level}
                  </p>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {xpProgress.current} / {xpProgress.target} XP
                </span>
              </div>
              <Progress 
                value={(xpProgress.current / xpProgress.target) * 100} 
                className="h-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {xpProgress.target - xpProgress.current} XP to next level
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
