
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, RotateCcw, Info, CheckCircle, ArrowUpDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
}

interface CompactExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  isNext?: boolean;
  onToggleComplete: (exerciseId: string) => void;
  onSwap?: (exerciseId: string) => void;
  onFormTips?: (exerciseName: string) => void;
  className?: string;
}

export function CompactExerciseCard({
  exercise,
  exerciseNumber,
  isNext = false,
  onToggleComplete,
  onSwap,
  onFormTips,
  className
}: CompactExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to determine muscle group from exercise name
  const getMuscleGroup = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('push') || name.includes('chest') || name.includes('bench')) return 'Chest';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'Back';
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return 'Legs';
    if (name.includes('shoulder') || name.includes('press') || name.includes('raise')) return 'Shoulders';
    if (name.includes('curl') || name.includes('tricep') || name.includes('arm')) return 'Arms';
    if (name.includes('plank') || name.includes('crunch') || name.includes('core')) return 'Core';
    return 'Full Body';
  };

  // Helper function to get muscle group color
  const getMuscleGroupColor = (group: string) => {
    switch (group) {
      case 'Chest': return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' };
      case 'Back': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' };
      case 'Legs': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-400' };
      case 'Shoulders': return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' };
      case 'Arms': return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' };
      case 'Core': return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
    }
  };

  // Helper function to get equipment text with icon
  const getEquipmentText = (weight: string) => {
    if (weight === 'bodyweight') return '🧘 Bodyweight';
    if (weight.toLowerCase().includes('backpack')) return '🎒 Backpack';
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return `🏋️ ${weight}`;
    return `⚡ ${weight}`;
  };

  const muscleGroup = getMuscleGroup(exercise.name);
  const muscleColors = getMuscleGroupColor(muscleGroup);

  // Determine card background (alternating with subtle gradients)
  const getCardBackground = () => {
    if (exercise.completed) return 'bg-gradient-to-r from-green-50/80 to-green-100/60';
    if (isNext) return 'bg-gradient-to-r from-violet-50/80 to-violet-100/60';
    return exerciseNumber % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-slate-50/80 to-slate-100/40';
  };

  return (
    <Card className={cn(
      "transition-all duration-300 overflow-hidden border-0 shadow-sm hover:shadow-md active:shadow-lg",
      getCardBackground(),
      isExpanded && "shadow-lg",
      className
    )}>
      <CardContent className="p-0">
        {/* Compact View - Full Card Tappable */}
        <div
          className="flex items-center p-4 cursor-pointer hover:bg-slate-50/50 active:bg-slate-100/50 transition-all duration-200 min-h-[70px] relative"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            boxShadow: isExpanded ? '0 1px 4px rgba(0,0,0,0.08)' : undefined
          }}
        >
          {/* Left: Exercise Number Circle */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 shadow-sm",
            exercise.completed && "bg-green-500 text-white shadow-green-200",
            isNext && "bg-violet-500 text-white shadow-violet-200",
            !exercise.completed && !isNext && "bg-slate-200 text-slate-700 shadow-slate-200"
          )}>
            {exercise.completed ? <CheckCircle size={16} /> : exerciseNumber}
          </div>

          {/* Middle: Exercise Info */}
          <div className="flex-1 min-w-0 mr-3">
            {/* Exercise Name + Badges Row */}
            <div className="flex items-start gap-2 mb-1">
              {/* Next Badge (left of title) */}
              {isNext && (
                <Badge className="text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  🔜
                </Badge>
              )}
              
              {/* Exercise Name - Allow 2 lines */}
              <h3 className={cn(
                "font-bold text-slate-900 leading-tight text-base flex-1",
                "line-clamp-2", // Tailwind class for 2-line truncation
                exercise.completed && "line-through text-slate-600"
              )}>
                {exercise.name}
              </h3>

              {/* Voice Badge */}
              {exercise.source === 'voice' && (
                <Badge className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  🎤
                </Badge>
              )}
            </div>
            
            {/* Metadata Row */}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {/* Muscle Group with Color Dot */}
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", muscleColors.dot)}></div>
                <Badge className={cn("text-xs font-medium border-0", muscleColors.bg, muscleColors.text)}>
                  {muscleGroup}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="font-medium text-xs">
                {exercise.sets} × {exercise.reps}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs">{getEquipmentText(exercise.weight)}</span>
            </div>
          </div>

          {/* Right: Chevron Icon */}
          <div className="flex items-center flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              "hover:bg-slate-200/50 active:bg-slate-300/50"
            )}>
              {isExpanded ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded View - Smooth Animation */}
        {isExpanded && (
          <div 
            className="border-t border-slate-200/60 bg-slate-50/50 p-4 animate-accordion-down"
            style={{
              background: 'linear-gradient(to right, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))'
            }}
          >
            {/* Rest Timer Info */}
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <Clock size={14} className="text-violet-500" />
              <span>Rest 60s between sets</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs">Next set: {exercise.sets} × {exercise.reps}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onSwap && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwap(exercise.id);
                    }}
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2 h-8 min-h-[44px] md:min-h-0 md:h-8"
                  >
                    <ArrowUpDown size={14} className="mr-1" />
                    ↔ Swap
                  </Button>
                )}
                
                {onFormTips && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormTips(exercise.name);
                    }}
                    className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2 h-8 min-h-[44px] md:min-h-0 md:h-8"
                  >
                    <Info size={14} className="mr-1" />
                    ▶ Form Tips
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-600 hover:text-violet-700 hover:bg-violet-100 text-xs px-3 py-2 h-8 min-h-[44px] md:min-h-0 md:h-8"
                >
                  📝 Notes
                </Button>
              </div>

              {!exercise.completed && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(exercise.id);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-4 py-2 h-8 min-h-[44px] md:min-h-0 md:h-8"
                >
                  <CheckCircle size={14} className="mr-1" />
                  ✅ Done
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
