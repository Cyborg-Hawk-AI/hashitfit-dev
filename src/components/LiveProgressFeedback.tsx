
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveProgressFeedbackProps {
  completedExercises: number;
  totalExercises: number;
  onAskCoach?: () => void;
  className?: string;
}

export function LiveProgressFeedback({ 
  completedExercises, 
  totalExercises, 
  onAskCoach,
  className 
}: LiveProgressFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  useEffect(() => {
    if (completedExercises > 0) {
      setShowFeedback(true);
      
      // Generate encouraging feedback based on progress
      const messages = {
        early: [
          "Great start! You're building momentum 🔥",
          "Nice work! Keep that energy going ⚡",
          "You're off to a strong start! 💪"
        ],
        middle: [
          `Halfway there! You're ${completedExercises}/${totalExercises} done — keep pushing 🚀`,
          "You're hitting your stride! Form is looking solid 💯",
          "Strong progress! Your consistency is paying off 🔥"
        ],
        late: [
          "Almost finished! You've got this! 💪",
          "Final push! You're crushing it today 🎯",
          "So close! Finish strong! ⚡"
        ]
      };

      let messageCategory: keyof typeof messages;
      if (progress < 40) messageCategory = 'early';
      else if (progress < 80) messageCategory = 'middle';
      else messageCategory = 'late';

      const categoryMessages = messages[messageCategory];
      const randomMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
      setFeedbackMessage(randomMessage);

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => setShowFeedback(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [completedExercises, totalExercises, progress]);

  const getProgressColor = () => {
    if (progress < 40) return "bg-yellow-500";
    if (progress < 80) return "bg-orange-500";
    return "bg-green-500";
  };

  const getProgressTextColor = () => {
    if (progress < 40) return "text-yellow-700";
    if (progress < 80) return "text-orange-700";
    return "text-green-700";
  };

  if (completedExercises === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar with Dynamic Colors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className={cn("text-sm font-semibold", getProgressTextColor())}>
            {completedExercises}/{totalExercises}
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-3 transition-all duration-500"
        />
      </div>

      {/* Animated Feedback Message */}
      {showFeedback && (
        <div className={cn(
          "bg-gradient-to-r from-hashim-50 to-purple-50 border border-hashim-200 rounded-lg p-3",
          "animate-fade-in transition-all duration-300"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-hashim-600" />
              <span className="text-sm font-medium text-hashim-800">
                {feedbackMessage}
              </span>
            </div>
            {onAskCoach && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAskCoach}
                className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <MessageCircle size={12} className="mr-1" />
                Ask Coach
              </Button>
            )}
          </div>
          
          {progress > 50 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Want to modify the next set? Ask Coach for suggestions →
            </div>
          )}
        </div>
      )}
    </div>
  );
}
