
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, Info, Dumbbell, Users, Zap, Heart, ArrowRight, ChevronDown, ChevronUp, Clock, Square } from "lucide-react";
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
}

interface EnhancedExerciseListProps {
  exercises: Exercise[];
  onExerciseToggle?: (exerciseId: string) => void;
  className?: string;
}

export function EnhancedExerciseList({ 
  exercises, 
  onExerciseToggle,
  className 
}: EnhancedExerciseListProps) {
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  const toggleExpanded = (exerciseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId);
    } else {
      newExpanded.add(exerciseId);
    }
    setExpandedExercises(newExpanded);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    onExerciseToggle?.(exerciseId);
  };

  const handleSwapExercise = (exerciseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Swap exercise:', exerciseId);
    // TODO: Implement exercise swap functionality
  };

  const handleFormGuide = (exerciseName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Show form guide for:', exerciseName);
    // TODO: Implement form guide modal
  };

  const handleMarkComplete = (exerciseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleExerciseToggle(exerciseId);
  };

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

  // Helper function to get muscle group icon
  const getMuscleGroupIcon = (group: string) => {
    switch (group) {
      case 'Chest': return '💪';
      case 'Back': return '🔙';
      case 'Legs': return '🦵';
      case 'Shoulders': return '🤲';
      case 'Arms': return '💪';
      case 'Core': return '⚡';
      default: return '🏋️';
    }
  };

  // Helper function to get equipment icon
  const getEquipmentIcon = (weight: string) => {
    if (weight === 'bodyweight') return <Users size={14} className="text-slate-400 opacity-60" />;
    if (weight.toLowerCase().includes('kg') || weight.toLowerCase().includes('lb')) return <Dumbbell size={14} className="text-slate-400 opacity-60" />;
    return <Zap size={14} className="text-slate-400 opacity-60" />;
  };

  // Find the first incomplete exercise for highlighting
  const firstIncompleteIndex = exercises.findIndex(ex => !ex.completed);

  // Get exercise status
  const getExerciseStatus = (exercise: Exercise, index: number) => {
    if (exercise.completed) return 'completed';
    if (index === firstIncompleteIndex) return 'current';
    return 'upcoming';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'current': return <Clock size={16} className="text-violet-500" />;
      default: return <Square size={16} className="text-slate-300" />;
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {exercises.map((exercise, index) => {
          const muscleGroup = getMuscleGroup(exercise.name);
          const isExpanded = expandedExercises.has(exercise.id);
          const status = getExerciseStatus(exercise, index);
          
          return (
            <div
              key={exercise.id}
              className={cn(
                "relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group",
                "bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md",
                // Status-based styling
                status === 'completed' && "border-green-300 bg-green-50/80",
                status === 'current' && "border-violet-400 bg-violet-50/80 ring-2 ring-violet-200/50 shadow-lg shadow-violet-100/50",
                status === 'upcoming' && "border-slate-200 hover:border-violet-300",
                isExpanded && "shadow-xl",
                "animate-fade-in"
              )}
              style={{ 
                animationDelay: `${index * 50}ms`,
              }}
              onClick={() => toggleExpanded(exercise.id, {} as React.MouseEvent)}
            >
              {/* Compact Card View */}
              <div className="flex items-center p-5 min-h-[90px] relative">
                {/* Top-Left: Muscle Group Badge */}
                <div className="absolute top-3 left-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all duration-300",
                    status === 'completed' && "bg-green-500 border-green-500 text-white",
                    status === 'current' && "bg-violet-500 border-violet-500 text-white",
                    status === 'upcoming' && "bg-slate-100 border-slate-200 text-slate-600"
                  )}>
                    {getMuscleGroupIcon(muscleGroup)}
                  </div>
                </div>

                {/* Current Exercise "Next Up" Label */}
                {status === 'current' && (
                  <div className="absolute top-1 right-3">
                    <Badge className="text-xs bg-violet-500 text-white px-2 py-1 rounded-full shadow-sm">
                      Next Up
                    </Badge>
                  </div>
                )}

                {/* Left: Exercise Number */}
                <div className="flex-shrink-0 mr-4 ml-8">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    status === 'completed' && "bg-green-500 text-white",
                    status === 'current' && "bg-violet-500 text-white",
                    status === 'upcoming' && "bg-slate-100 text-slate-600 border-2 border-slate-200"
                  )}>
                    {getStatusIcon(status)}
                  </div>
                </div>

                {/* Center: Exercise Info */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className={cn(
                    "text-lg font-bold text-slate-900 leading-tight mb-2",
                    "line-clamp-2", // Allow 2 lines max with ellipsis
                    status === 'completed' && "line-through text-slate-600"
                  )}>
                    {exercise.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={cn(
                      "font-semibold",
                      status === 'current' && "text-violet-700",
                      status === 'completed' && "text-green-600",
                      status === 'upcoming' && "text-slate-700"
                    )}>
                      {exercise.sets} × {exercise.reps}
                    </span>
                    {!isExpanded && exercise.weight !== 'bodyweight' && (
                      <span className="text-slate-500 font-medium text-xs">
                        {exercise.weight}
                      </span>
                    )}
                    {exercise.source === 'voice' && (
                      <Badge className="text-xs bg-blue-500 text-white px-2 py-1">
                        🎤
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right: Equipment Icon + Expand Arrow */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Bottom-Right: Equipment Icon */}
                <div className="absolute bottom-3 right-3">
                  {getEquipmentIcon(exercise.weight)}
                </div>
              </div>

              {/* Expanded View - Additional Details */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-5 animate-accordion-down">
                  {/* Equipment and Details Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "text-sm font-bold px-3 py-2 rounded-full",
                        "bg-violet-100 text-violet-800 border border-violet-200"
                      )}>
                        <span className="mr-2">{getMuscleGroupIcon(muscleGroup)}</span>
                        {muscleGroup}
                      </Badge>

                      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-slate-200">
                        {getEquipmentIcon(exercise.weight)}
                        <span className="text-sm font-medium text-slate-700">
                          {exercise.weight === 'bodyweight' ? 'Bodyweight' : exercise.weight}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Rep Breakdown */}
                  <div className="mb-5 p-4 bg-white rounded-xl border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Workout Details</h4>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-violet-700">{exercise.sets}</div>
                        <div className="text-xs text-slate-500 mt-1">Sets</div>
                      </div>
                      <div className="text-slate-400 text-xl">×</div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-700">{exercise.reps}</div>
                        <div className="text-xs text-slate-500 mt-1">Reps</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSwapExercise(exercise.id, e)}
                            className="h-10 px-4 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-100 rounded-xl transition-all duration-200 border border-transparent hover:border-violet-200"
                          >
                            <RotateCcw size={14} className="mr-2" />
                            Swap
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Replace with alternative exercise</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleFormGuide(exercise.name, e)}
                            className="h-10 px-4 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-100 rounded-xl transition-all duration-200 border border-transparent hover:border-violet-200"
                          >
                            <Info size={14} className="mr-2" />
                            Form Tips
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View exercise demonstration and tips</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Mark Complete Button */}
                    {status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={(e) => handleMarkComplete(exercise.id, e)}
                        className="h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all duration-200"
                      >
                        <CheckCircle size={14} className="mr-2" />
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-400/0 via-violet-400/5 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          );
        })}

        {/* Exercise Count Summary */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-md border border-violet-200/50">
            <Heart size={16} className="text-violet-600" />
            <p className="text-sm font-medium text-slate-700">
              <span className="text-violet-700 font-bold">{exercises.filter(ex => ex.completed).length}</span>
              <span className="mx-1">of</span>
              <span className="text-violet-700 font-bold">{exercises.length}</span>
              <span className="ml-1">completed</span>
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
