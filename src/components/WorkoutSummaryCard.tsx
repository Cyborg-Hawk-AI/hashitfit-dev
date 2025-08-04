
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, Dumbbell, Sparkles, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutSummaryCardProps {
  workout: {
    title: string;
    category: string;
    difficulty: number;
    estimatedDuration: number;
    exercises: any[];
    targetMuscles: string[];
    aiGenerated?: boolean;
    isCompleted?: boolean;
  };
  onStartWorkout: () => void;
  className?: string;
}

export function WorkoutSummaryCard({ workout, onStartWorkout, className }: WorkoutSummaryCardProps) {
  const getCurrentTime = () => {
    const now = new Date();
    const finishTime = new Date(now.getTime() + workout.estimatedDuration * 60000);
    return finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strength': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'cardio': return 'bg-red-100 text-red-800 border-red-200';
      case 'flexibility': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getDifficultyLabel = () => {
    if (workout.difficulty >= 7) return 'Advanced';
    if (workout.difficulty >= 4) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-violet-200/50 shadow-lg", className)}>
      <CardContent className="p-5 space-y-3">
        {/* Header with Icon and Title */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">
              🏋️ {workout.title}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs font-medium", getCategoryColor(workout.category))}>
                💪 {workout.category} ({getDifficultyLabel()})
              </Badge>
              {workout.aiGenerated && (
                <Badge className="text-xs bg-purple-500 text-white">
                  <Sparkles size={10} className="mr-1" />
                  AI
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Combined Metadata Row */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Duration: {workout.estimatedDuration}min</span>
            <span>Exercises: {workout.exercises.length}</span>
            <span>Difficulty: {workout.difficulty}/10</span>
          </div>
          <div className="flex items-center text-sm text-indigo-700">
            <Clock className="h-4 w-4 mr-1" />
            <span>Estimated Finish: {getCurrentTime()}</span>
          </div>
        </div>

        {/* Start Workout Button - Integrated */}
        {!workout.isCompleted && (
          <Button
            onClick={onStartWorkout}
            size="lg"
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play size={16} className="mr-2" />
            Start Workout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
