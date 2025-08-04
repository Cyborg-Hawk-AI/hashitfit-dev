
import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutProgressBarProps {
  completedExercises: number;
  totalExercises: number;
  className?: string;
}

export function WorkoutProgressBar({ 
  completedExercises, 
  totalExercises, 
  className 
}: WorkoutProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = () => {
    if (progress === 0) return "bg-gray-300";
    if (progress < 40) return "bg-yellow-400";
    if (progress < 80) return "bg-orange-400";
    return "bg-green-500";
  };

  const getMotivationalMessage = () => {
    if (progress === 0) return "Let's get started 🚀";
    if (progress < 40) return "Great start! Keep going 💪";
    if (progress < 80) return `${completedExercises} of ${totalExercises} done — almost there! 🔥`;
    if (progress === 100) return "💯 Workout complete!";
    return `${completedExercises} of ${totalExercises} completed ⚡`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {getMotivationalMessage()}
        </span>
        {progress === 100 && (
          <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" />
        )}
      </div>
      
      <div className="relative">
        <Progress 
          value={animatedProgress} 
          className="h-2 transition-all duration-500 ease-out"
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out",
            getProgressColor()
          )}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
}
