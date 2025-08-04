
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Play, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Flame,
  Star,
  Heart,
  Mic,
  MoreHorizontal,
  Save,
  ArrowUpDown,
  Dumbbell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PreWorkoutModalEnhanced } from "./PreWorkoutModalEnhanced";
import { EnhancedExerciseList } from "./EnhancedExerciseList";
import { WorkoutProgressBar } from "./WorkoutProgressBar";
import { PostWorkoutFeedbackModal } from "./PostWorkoutFeedbackModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
  category?: string;
  estimatedDuration?: number;
  targetMuscles?: string[];
  difficulty?: number;
  aiGenerated?: boolean;
  streak?: number;
  isFavorite?: boolean;
  isCompleted?: boolean;
}

interface WorkoutCardImprovedProps {
  workout: Workout;
  onStart?: (workout: Workout, options?: { withAI?: boolean; voiceMode?: boolean }) => void;
  onEdit?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onSaveAsFavorite?: () => void;
  isToday?: boolean;
}

export function WorkoutCardImproved({ 
  workout, 
  onStart,
  onEdit,
  onAskCoach,
  onReplaceWorkout,
  onSaveAsFavorite,
  isToday = false
}: WorkoutCardImprovedProps) {
  const [showFullExercises, setShowFullExercises] = useState(false);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Calculate progress
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Check if workout is complete and show feedback modal
  useEffect(() => {
    if (progress === 100 && !workout.isCompleted) {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true);
      }, 1000); // Delay to allow progress animation to complete
      return () => clearTimeout(timer);
    }
  }, [progress, workout.isCompleted]);

  // Pulse start button after 30 seconds of inactivity
  useEffect(() => {
    if (isToday && !workout.isCompleted && completedExercises === 0) {
      const timer = setTimeout(() => {
        setShouldPulse(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isToday, workout.isCompleted, completedExercises]);

  // Get difficulty info
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { label: "Intermediate", color: "bg-amber-100 text-amber-700", emoji: "🟡", bar: "bg-gradient-to-r from-amber-400 to-orange-400" };
    if (difficulty <= 3) return { label: "Easy", color: "bg-emerald-100 text-emerald-700", emoji: "🟢", bar: "bg-gradient-to-r from-emerald-400 to-green-400" };
    if (difficulty <= 6) return { label: "Intermediate", color: "bg-amber-100 text-amber-700", emoji: "🟡", bar: "bg-gradient-to-r from-amber-400 to-orange-400" };
    return { label: "Hard", color: "bg-red-100 text-red-700", emoji: "🔴", bar: "bg-gradient-to-r from-red-400 to-pink-400" };
  };

  const difficultyInfo = getDifficultyInfo(workout.difficulty);

  // Get workout type from target muscles
  const getWorkoutType = () => {
    if (!workout.targetMuscles || workout.targetMuscles.length === 0) return "Full Body";
    if (workout.targetMuscles.length > 3) return "Full Body";
    return workout.targetMuscles.join(" & ");
  };

  // Add emoji to workout title
  const getWorkoutTitleWithEmoji = () => {
    const title = workout.title;
    if (title.toLowerCase().includes('pull') || title.toLowerCase().includes('back')) return `${title} 💪`;
    if (title.toLowerCase().includes('push') || title.toLowerCase().includes('chest')) return `${title} 🔥`;
    if (title.toLowerCase().includes('leg') || title.toLowerCase().includes('squat')) return `${title} 🦵`;
    if (title.toLowerCase().includes('core') || title.toLowerCase().includes('abs')) return `${title} ⚡`;
    if (title.toLowerCase().includes('cardio') || title.toLowerCase().includes('run')) return `${title} 🏃`;
    return `${title} 💯`;
  };

  const handleStartWorkout = (options: { withAI: boolean; voiceMode: boolean }) => {
    setShowPreWorkoutModal(false);
    setShouldPulse(false);
    onStart?.(workout, options);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    console.log('Toggle exercise:', exerciseId);
    // This would typically update the workout state
  };

  const handleFeedbackSubmit = (feedback: { mood: number; notes: string }) => {
    console.log('Workout feedback:', feedback);
    // TODO: Send feedback to backend/AI coach
    setShowFeedbackModal(false);
  };

  return (
    <TooltipProvider>
      <Card className={cn(
        "w-full transition-all duration-300 hover:shadow-xl border-0 relative overflow-hidden backdrop-blur-xl",
        "animate-fade-in hover:scale-[1.02] shadow-lg",
        workout.isCompleted 
          ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500" 
          : "bg-white/70 dark:bg-slate-800/70 border-l-4 border-l-violet-500",
        isToday && "ring-2 ring-violet-300 ring-opacity-50 shadow-xl"
      )}>
        {/* Gradient Border Top */}
        <div className={cn("absolute top-0 left-0 right-0 h-1", difficultyInfo.bar)}></div>

        {/* Animated pulse for today's workout */}
        {isToday && !workout.isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 animate-pulse"></div>
        )}

        {/* Top Section - Overview */}
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={cn(
                  "text-xl font-bold text-slate-800 dark:text-white",
                  isToday && "text-violet-800 dark:text-violet-200"
                )}>
                  {getWorkoutTitleWithEmoji()}
                </h3>
                <div className="flex items-center gap-1">
                  {workout.aiGenerated && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 px-2 py-1 border-0">
                      <Zap size={10} className="mr-1" />
                      AI ✨
                    </Badge>
                  )}
                  {workout.streak && workout.streak > 0 && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-2 py-1 border-0">
                      <Flame size={10} className="mr-1" />
                      {workout.streak}
                    </Badge>
                  )}
                  {voiceModeEnabled && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-1 border-0">
                      <Mic size={10} className="mr-1" />
                      Voice
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-2">
                {workout.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-violet-500" />
                    <span>{workout.estimatedDuration} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Target size={14} className="text-indigo-500" />
                  <span>{totalExercises} exercises</span>
                </div>
              </div>

              {/* Tags Row */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs px-2 py-1 border-0", difficultyInfo.color)}>
                  {difficultyInfo.emoji} {difficultyInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2 py-1 border-0">
                  {getWorkoutType()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {workout.isFavorite && (
                <Star size={20} className="text-amber-500 fill-current" />
              )}
              {workout.isCompleted && (
                <div className="flex items-center text-emerald-600">
                  <CheckCircle size={20} />
                  <TrendingUp size={16} className="ml-1" />
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-violet-50 dark:hover:bg-violet-900/30">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-violet-200/50">
                  <DropdownMenuItem onClick={() => setVoiceModeEnabled(!voiceModeEnabled)}>
                    <Mic size={14} className="mr-2" />
                    {voiceModeEnabled ? "Disable" : "Enable"} Voice Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSaveAsFavorite?.()}>
                    <Heart size={14} className="mr-2" />
                    Save as Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(workout)}>
                    <Save size={14} className="mr-2" />
                    Save as Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 relative z-10">
          {/* Enhanced Exercise List */}
          {workout.exercises.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Exercise Preview</h4>
                
                {totalExercises > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullExercises(!showFullExercises)}
                    className="h-6 px-2 text-xs hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-600"
                  >
                    {showFullExercises ? (
                      <>
                        <ChevronUp size={12} className="mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="mr-1" />
                        Show All
                      </>
                    )}
                  </Button>
                )}
              </div>

              <EnhancedExerciseList
                exercises={showFullExercises ? workout.exercises : workout.exercises.slice(0, 3)}
                onExerciseToggle={handleExerciseToggle}
              />

              {!showFullExercises && totalExercises > 3 && (
                <div className="text-center py-2 mt-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{totalExercises - 3} more exercises
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Progress Bar */}
          {totalExercises > 0 && (
            <WorkoutProgressBar
              completedExercises={completedExercises}
              totalExercises={totalExercises}
            />
          )}

          {/* Bottom CTA Section */}
          <div className="space-y-3 pt-2">
            {workout.isCompleted ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onStart?.(workout)}
                className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all"
              >
                <TrendingUp size={16} className="mr-2" />
                View Results
              </Button>
            ) : (
              <Button 
                onClick={() => setShowPreWorkoutModal(true)}
                className={cn(
                  "w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all hover:scale-[1.02] shadow-lg",
                  shouldPulse && "animate-pulse shadow-xl"
                )}
                size="lg"
              >
                <Play size={16} className="mr-2" />
                Start Workout
              </Button>
            )}

            {/* Secondary CTAs */}
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAskCoach?.()}
                    className="flex-1 border-violet-200 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/30 transition-all"
                  >
                    <MessageCircle size={14} className="mr-1" />
                    Ask Coach
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Need help adjusting difficulty or form?</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReplaceWorkout?.()}
                    className="flex-1 border-violet-200 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/30 transition-all"
                  >
                    <Dumbbell size={14} className="mr-1" />
                    Replace
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Replace entire session or individual exercises</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Empty State */}
          {workout.exercises.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No exercises in this workout</p>
              <p className="text-xs mt-1">Add exercises to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Pre-Workout Modal */}
      <PreWorkoutModalEnhanced
        isOpen={showPreWorkoutModal}
        onClose={() => setShowPreWorkoutModal(false)}
        onStartWorkout={handleStartWorkout}
        workout={{
          title: workout.title,
          estimatedDuration: workout.estimatedDuration || 45,
          exercises: workout.exercises,
          difficulty: workout.difficulty,
          targetMuscles: workout.targetMuscles
        }}
      />

      {/* Post-Workout Feedback Modal */}
      <PostWorkoutFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmitFeedback={handleFeedbackSubmit}
        workoutTitle={workout.title}
      />
    </TooltipProvider>
  );
}
