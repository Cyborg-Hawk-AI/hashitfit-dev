
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Mic, Brain, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (withAI?: boolean) => void;
  workout: {
    title: string;
    estimatedDuration: number;
    exercises: any[];
    difficulty?: number;
    targetMuscles?: string[];
  };
}

export function PreWorkoutModal({ 
  isOpen, 
  onClose, 
  onStartWorkout, 
  workout 
}: PreWorkoutModalProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startingWithAI, setStartingWithAI] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      onStartWorkout(startingWithAI);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStartWorkout, startingWithAI]);

  const handleStartCountdown = (withAI = false) => {
    setStartingWithAI(withAI);
    setCountdown(3);
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return "bg-green-100 text-green-700";
    if (difficulty <= 3) return "bg-green-100 text-green-700";
    if (difficulty <= 6) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (countdown !== null) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm mx-auto text-center">
          <div className="py-8">
            <div className={cn(
              "text-6xl font-bold mb-4 animate-pulse",
              countdown === 0 ? "text-green-500" : "text-hashim-600"
            )}>
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <p className="text-muted-foreground">
              {startingWithAI ? "Starting with AI Coach..." : "Get ready to workout!"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Ready to Start?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Workout Overview */}
          <div className="text-center space-y-3">
            <h3 className="font-semibold text-lg">{workout.title}</h3>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{workout.estimatedDuration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>{workout.exercises.length} exercises</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge className={getDifficultyColor(workout.difficulty)}>
                {workout.difficulty && workout.difficulty > 6 ? "Advanced" : 
                 workout.difficulty && workout.difficulty > 3 ? "Intermediate" : "Beginner"}
              </Badge>
              {workout.targetMuscles && workout.targetMuscles.length > 0 && (
                <Badge variant="outline">
                  {workout.targetMuscles.slice(0, 2).join(" & ")}
                </Badge>
              )}
            </div>
          </div>

          {/* AI Coach Section */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-purple-100 rounded">
                <Brain size={16} className="text-purple-600" />
              </div>
              <span className="font-medium text-purple-800">AI Coach Available</span>
            </div>
            <p className="text-sm text-purple-700">
              Get real-time form tips, motivation, and smart rest timing throughout your workout.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => handleStartCountdown(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-hashim-600 hover:from-purple-700 hover:to-hashim-700 text-white"
              size="lg"
            >
              <Brain size={18} className="mr-2" />
              Start with AI Coach
            </Button>
            
            <Button 
              onClick={() => handleStartCountdown(false)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Zap size={18} className="mr-2" />
              Start Now
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Mic size={14} className="mr-1" />
                Voice Mode
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
