
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Play, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
  equipment?: string;
  bodyRegion?: string;
  tip?: string;
}

interface InteractiveExerciseListProps {
  exercises: Exercise[];
  onExerciseToggle?: (exerciseId: string) => void;
  showPreview?: boolean;
}

export function InteractiveExerciseList({ 
  exercises, 
  onExerciseToggle,
  showPreview = false 
}: InteractiveExerciseListProps) {
  const [showTips, setShowTips] = useState<string | null>(null);

  const getEquipmentIcon = (equipment?: string) => {
    if (!equipment) return "🏋️";
    if (equipment.toLowerCase().includes('dumbbell')) return "🏋️";
    if (equipment.toLowerCase().includes('barbell')) return "🤸";
    if (equipment.toLowerCase().includes('bodyweight')) return "💪";
    return "🏋️";
  };

  const getBodyRegionColor = (region?: string) => {
    if (!region) return "bg-gray-100 text-gray-600";
    if (region.toLowerCase().includes('upper')) return "bg-blue-100 text-blue-700";
    if (region.toLowerCase().includes('lower')) return "bg-green-100 text-green-700";
    if (region.toLowerCase().includes('core')) return "bg-orange-100 text-orange-700";
    return "bg-purple-100 text-purple-700";
  };

  const generateTip = (exerciseName: string) => {
    const tips = [
      "Keep your core tight throughout the movement",
      "Focus on controlled movement, not speed",
      "Breathe out on the exertion phase",
      "Maintain proper form over heavy weight",
      "Keep your shoulders back and chest up"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={cn(
              "relative p-4 rounded-lg border-2 transition-all duration-300",
              exercise.completed 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-background border-border hover:border-hashim-300 hover:shadow-md"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Animated Progress Indicator */}
              <button
                onClick={() => onExerciseToggle?.(exercise.id)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1",
                  exercise.completed 
                    ? "bg-green-500 border-green-500 text-white animate-scale-in" 
                    : "border-gray-300 hover:border-hashim-500 hover:bg-hashim-50"
                )}
              >
                {exercise.completed ? (
                  <CheckCircle size={20} className="animate-pulse" />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getEquipmentIcon(exercise.equipment)}</span>
                  <h4 className={cn(
                    "font-semibold text-base",
                    exercise.completed && "line-through"
                  )}>
                    {exercise.name}
                  </h4>
                  
                  {exercise.source === 'voice' && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                      Voice
                    </Badge>
                  )}
                  
                  {exercise.bodyRegion && (
                    <Badge className={cn("text-xs", getBodyRegionColor(exercise.bodyRegion))}>
                      {exercise.bodyRegion}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exercise.sets} sets × {exercise.reps}
                    {exercise.weight && exercise.weight !== 'bodyweight' && 
                      ` @ ${exercise.weight}`
                    }
                  </p>
                  
                  <div className="flex items-center gap-1">
                    {showPreview && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Watch form guide</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setShowTips(showTips === exercise.id ? null : exercise.id)}
                        >
                          <Info size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Form tip</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Exercise Tip */}
                {showTips === exercise.id && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs">💡</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>Tip:</strong> {exercise.tip || generateTip(exercise.name)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Animation */}
            {exercise.completed && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs">💥</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
