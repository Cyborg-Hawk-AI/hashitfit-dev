
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, Mic, Brain, Target, Zap, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreWorkoutModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (options: { withAI: boolean; voiceMode: boolean }) => void;
  workout: {
    title: string;
    estimatedDuration: number;
    exercises: any[];
    difficulty?: number;
    targetMuscles?: string[];
  };
}

export function PreWorkoutModalEnhanced({ 
  isOpen, 
  onClose, 
  onStartWorkout, 
  workout 
}: PreWorkoutModalEnhancedProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [startingWithAI, setStartingWithAI] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      onStartWorkout({ withAI: startingWithAI, voiceMode });
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStartWorkout, startingWithAI, voiceMode]);

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

  const getEncouragement = () => {
    const encouragements = [
      "Let's go! Stay consistent with your form and focus. 💪",
      "You've got this! Focus on quality over speed today. 🔥",
      "Time to crush this workout! Listen to your body and push when it feels right. ⚡",
      "Ready to build some momentum? Every rep counts toward your goals! 🎯"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
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
            {voiceMode && (
              <div className="mt-2 flex items-center justify-center gap-1 text-sm text-blue-600">
                <Volume2 size={14} />
                <span>Voice mode enabled</span>
              </div>
            )}
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
                <span>⏱ {workout.estimatedDuration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>{workout.exercises.length} exercises</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge className={getDifficultyColor(workout.difficulty)}>
                {workout.difficulty && workout.difficulty > 6 ? "Hard" : 
                 workout.difficulty && workout.difficulty > 3 ? "Intermediate" : "Easy"}
              </Badge>
              {workout.targetMuscles && workout.targetMuscles.length > 0 && (
                <Badge variant="outline">
                  {workout.targetMuscles.slice(0, 2).join(" & ")}
                </Badge>
              )}
            </div>
          </div>

          {/* AI Encouragement */}
          <div className="bg-hashim-50 rounded-lg p-4 border border-hashim-200">
            <p className="text-sm text-hashim-700 text-center leading-relaxed">
              {getEncouragement()}
            </p>
          </div>

          {/* Voice Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Voice Logging</span>
            </div>
            <Switch
              checked={voiceMode}
              onCheckedChange={setVoiceMode}
              className="data-[state=checked]:bg-blue-600"
            />
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

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
