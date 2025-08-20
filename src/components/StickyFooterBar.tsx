
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Mic, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyFooterBarProps {
  onStartWorkout?: () => void;
  onVoiceLog?: () => void;
  isWorkoutStarted?: boolean;
  isPaused?: boolean;
  workoutTime?: string;
  onPauseResume?: () => void;
  className?: string;
}

export function StickyFooterBar({
  onStartWorkout,
  onVoiceLog,
  isWorkoutStarted = false,
  isPaused = false,
  workoutTime,
  onPauseResume,
  className
}: StickyFooterBarProps) {
  return (
    <div className={cn(
      "fixed bottom-20 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white via-white/95 to-transparent",
      className
    )}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white/95 backdrop-blur-lg border border-violet-200/50 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between space-x-3">
            {/* Single CTA Button - Changes Based on State */}
            {!isWorkoutStarted ? (
              <Button
                onClick={onStartWorkout}
                size="lg"
                className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play size={18} className="mr-2" />
                ▶ Start Workout
              </Button>
            ) : (
              <Button
                onClick={onPauseResume}
                size="lg"
                className={cn(
                  "flex-1 h-12 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300",
                  isPaused 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                )}
              >
                {isPaused ? (
                  <>
                    <Play size={18} className="mr-2" />
                    ▶ Resume Workout
                  </>
                ) : (
                  <>
                    <Pause size={18} className="mr-2" />
                    ⏸ Pause Workout
                  </>
                )}
              </Button>
            )}

            {/* Voice Log Button - Only show when workout started */}
            {isWorkoutStarted && onVoiceLog && (
              <Button
                onClick={onVoiceLog}
                size="lg"
                variant="outline"
                className="w-12 h-12 p-0 border-violet-300 text-violet-700 hover:bg-violet-100 hover:border-violet-400 rounded-xl"
              >
                <Mic size={18} />
              </Button>
            )}
          </div>

          {/* Workout Timer Display */}
          {isWorkoutStarted && workoutTime && (
            <div className="mt-2 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Workout Active • {workoutTime}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
