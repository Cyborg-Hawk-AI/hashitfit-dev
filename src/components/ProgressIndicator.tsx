
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  totalExercises: number;
  completedExercises: number;
  estimatedTimeLeft: number;
  className?: string;
}

export function ProgressIndicator({
  totalExercises,
  completedExercises,
  estimatedTimeLeft,
  className
}: ProgressIndicatorProps) {
  const [viewMode, setViewMode] = useState<'bar' | 'circle'>('bar');
  const progressPercentage = (completedExercises / totalExercises) * 100;
  const exercisesRemaining = totalExercises - completedExercises;

  // Generate progress dots for visual feedback
  const progressDots = Array.from({ length: totalExercises }, (_, index) => (
    <div
      key={index}
      className={cn(
        "w-2 h-2 rounded-full transition-all duration-300",
        index < completedExercises ? "bg-violet-600 scale-110" : "bg-slate-300"
      )}
    />
  ));

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-violet-200/50 shadow-sm", className)}>
      <CardContent className="p-4">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-violet-600" />
            <span className="text-sm font-medium text-slate-700">
              Workout Progress
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'bar' ? 'circle' : 'bar')}
            className="text-xs text-slate-500 hover:text-violet-600 h-6 px-2"
          >
            {viewMode === 'bar' ? <Target size={12} /> : <BarChart3 size={12} />}
          </Button>
        </div>

        {/* Enhanced Progress Display */}
        <div className="space-y-3">
          {/* Progress Text with Emojis and Better Formatting */}
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <div className="flex items-center space-x-2">
              <span className="text-violet-700 font-bold">
                {completedExercises === 0 ? "0️⃣" : `${completedExercises}✅`}
              </span>
              <span>Sets Complete</span>
              <span className="text-slate-400">•</span>
              <span className="text-violet-700 font-bold">
                {exercisesRemaining === 0 ? "🎉" : `${exercisesRemaining}🎯`}
              </span>
              <span>Exercises {exercisesRemaining === 0 ? "Done!" : "Remaining"}</span>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center text-sm text-slate-600">
            <Clock size={14} className="mr-2 text-violet-500" />
            <span>⏱ Est. {estimatedTimeLeft} min left</span>
          </div>

          {/* Progress Visualization */}
          {viewMode === 'bar' ? (
            <div className="space-y-2">
              {/* Progress Bar with Enhanced Design */}
              <div className="w-full bg-slate-200 rounded-full h-3 border border-slate-300/50 shadow-inner">
                <div
                  className={cn(
                    "h-3 rounded-full transition-all duration-500 ease-out shadow-sm",
                    progressPercentage === 100 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-gradient-to-r from-violet-600 to-indigo-600"
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              {/* Progress Dots */}
              <div className="flex items-center justify-center space-x-1.5 mt-2">
                {progressDots}
              </div>
            </div>
          ) : (
            /* Circle Progress Alternative */
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${progressPercentage * 1.76} 176`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-700">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Completion Celebration */}
          {progressPercentage === 100 && (
            <div className="text-center py-2 animate-fade-in">
              <span className="text-lg">🎉 Workout Complete! 🎉</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
