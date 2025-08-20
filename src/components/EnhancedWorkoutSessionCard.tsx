import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Dumbbell,
  RotateCcw,
  Star,
  StarOff,
  GripVertical,
  MoreHorizontal,
  ArrowLeftRight,
  Timer,
  Plus,
  Minus,
  Edit2,
  Save,
  X,
  Users,
  Undo,
  MessageCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: number;
  rpe?: number;
  rest_seconds?: number;
  superset_group_id?: string;
  position_in_workout?: number;
  originalData?: {
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
  };
}

// Define the extended exercise type with required originalData for internal state
interface ExerciseWithOriginalData extends Exercise {
  originalData: {
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
  };
}

interface WorkoutSessionCardProps {
  workout: {
    id: string;
    title: string;
    exercises: Exercise[];
    category: string;
    workout_log_id?: string;
  };
  onComplete?: () => void;
  onSaveAsFavorite?: () => void;
  onStartRestTimer?: (duration: number) => void;
  className?: string;
}

export function EnhancedWorkoutSessionCard({ 
  workout, 
  onComplete, 
  onSaveAsFavorite,
  onStartRestTimer,
  className 
}: WorkoutSessionCardProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [exercises, setExercises] = useState<ExerciseWithOriginalData[]>(
    workout.exercises.map(ex => ({
      ...ex,
      originalData: ex.originalData || {
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: ex.rest_seconds || 60
      }
    }))
  );
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});
  const [restTimers, setRestTimers] = useState<{[key: string]: number}>({});
  const [activeTimers, setActiveTimers] = useState<{[key: string]: boolean}>({});
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const queryClient = useQueryClient();
  const currentEx = exercises[currentExercise];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + (ex.completed || 0), 0);
  const progress = (completedSets / totalSets) * 100;

  // Group exercises by superset
  const groupedExercises = exercises.reduce((acc, ex, index) => {
    if (ex.superset_group_id) {
      if (!acc.supersets[ex.superset_group_id]) {
        acc.supersets[ex.superset_group_id] = [];
      }
      acc.supersets[ex.superset_group_id].push({...ex, originalIndex: index});
    } else {
      acc.individual.push({...ex, originalIndex: index});
    }
    return acc;
  }, { individual: [] as any[], supersets: {} as any });

  // Rest timer effect with sound
  useEffect(() => {
    const intervals: { [key: string]: NodeJS.Timeout } = {};
    
    Object.entries(activeTimers).forEach(([exerciseId, isActive]) => {
      if (isActive && restTimers[exerciseId] > 0) {
        intervals[exerciseId] = setInterval(() => {
          setRestTimers(prev => {
            const newTime = (prev[exerciseId] || 0) - 1;
            if (newTime <= 0) {
              setActiveTimers(current => ({...current, [exerciseId]: false}));
              if (soundEnabled) {
                // Simple beep using Web Audio API
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
              }
              toast({
                title: "Rest Complete!",
                description: "Time for your next set.",
              });
            }
            return {...prev, [exerciseId]: Math.max(0, newTime)};
          });
        }, 1000);
      }
    });
    
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [activeTimers, restTimers, soundEnabled]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions with animation - ensure originalData is preserved
    const updatedItems: ExerciseWithOriginalData[] = items.map((item, index) => ({
      ...item,
      position_in_workout: index,
      originalData: item.originalData // This is guaranteed to exist due to our state type
    }));
    
    setExercises(updatedItems);
    
    if (workout.workout_log_id) {
      const positions = updatedItems.map((item, index) => ({
        exercise_id: item.id,
        new_position: index
      }));
      
      const success = await WorkoutService.reorderExercises(workout.workout_log_id, positions);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to save exercise order",
          variant: "destructive"
        });
        // Revert to original with proper typing
        const revertedExercises: ExerciseWithOriginalData[] = workout.exercises.map(ex => ({
          ...ex,
          originalData: ex.originalData || {
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_seconds: ex.rest_seconds || 60
          }
        }));
        setExercises(revertedExercises);
      } else {
        queryClient.invalidateQueries({ queryKey: ['workout-session', workout.workout_log_id] });
      }
    }
  };

  const startEditing = (exerciseId: string, field: string, currentValue: any) => {
    setEditingExercise(exerciseId);
    setEditingField(field);
    setEditValues({
      [field]: currentValue
    });
  };

  const saveEdit = async (exerciseId: string, field: string) => {
    const newValue = editValues[field];
    if (!newValue && newValue !== 0) return;
    
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: newValue } : ex
    ));
    
    if (workout.workout_log_id) {
      // Create update object with only valid ExerciseLog fields
      const updateData: Record<string, any> = {};
      if (field === 'reps') updateData.reps_completed = newValue;
      else if (field === 'weight') updateData.weight_used = newValue;
      else if (field === 'sets') updateData.sets_completed = newValue;
      else if (field === 'rest_seconds') updateData.rest_seconds = newValue;
      
      const success = await WorkoutService.updateExerciseLog(exerciseId, updateData);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive"
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['workout-session', workout.workout_log_id] });
      }
    }
    
    setEditingExercise(null);
    setEditingField(null);
    setEditValues({});
  };

  const undoEdit = (exerciseId: string, field: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise?.originalData) return;
    
    const originalValue = exercise.originalData[field as keyof typeof exercise.originalData];
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: originalValue } : ex
    ));
    
    if (workout.workout_log_id) {
      const updateData: Record<string, any> = {};
      if (field === 'reps') updateData.reps_completed = originalValue;
      else if (field === 'weight') updateData.weight_used = originalValue;
      else if (field === 'sets') updateData.sets_completed = originalValue;
      else if (field === 'rest_seconds') updateData.rest_seconds = originalValue;
      
      WorkoutService.updateExerciseLog(exerciseId, updateData);
    }
  };

  const adjustValue = (exerciseId: string, field: string, delta: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    const currentValue = typeof exercise[field as keyof Exercise] === 'number' 
      ? exercise[field as keyof Exercise] as number 
      : parseInt(exercise[field as keyof Exercise] as string) || 0;
    
    const newValue = Math.max(0, currentValue + delta);
    setEditValues({ [field]: newValue });
    saveEdit(exerciseId, field);
  };

  const createSuperset = async () => {
    if (selectedExercises.length < 2) {
      toast({
        title: "Error",
        description: "Select at least 2 exercises to create a superset",
        variant: "destructive"
      });
      return;
    }
    
    if (workout.workout_log_id) {
      const supersetId = await WorkoutService.createSuperset(
        workout.workout_log_id, 
        selectedExercises
      );
      
      if (supersetId) {
        setExercises(prev => prev.map(ex => 
          selectedExercises.includes(ex.id) 
            ? { ...ex, superset_group_id: supersetId }
            : ex
        ));
        setSelectedExercises([]);
        queryClient.invalidateQueries({ queryKey: ['workout-session', workout.workout_log_id] });
        toast({
          title: "Superset Created",
          description: "Exercises have been grouped into a superset"
        });
      }
    }
  };

  const removeFromSuperset = async (exerciseId: string) => {
    const success = await WorkoutService.removeFromSuperset(exerciseId);
    if (success) {
      setExercises(prev => prev.map(ex => 
        ex.id === exerciseId ? { ...ex, superset_group_id: undefined } : ex
      ));
      queryClient.invalidateQueries({ queryKey: ['workout-session', workout.workout_log_id] });
      toast({
        title: "Removed from Superset",
        description: "Exercise removed from superset group"
      });
    }
  };

  const startRestTimer = (exerciseId: string, duration?: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const restTime = duration || exercise?.rest_seconds || 60;
    
    setRestTimers(prev => ({ ...prev, [exerciseId]: restTime }));
    setActiveTimers(prev => ({ ...prev, [exerciseId]: true }));
    
    if (onStartRestTimer) {
      onStartRestTimer(restTime);
    }
  };

  const editRestTime = (exerciseId: string, newTime: number) => {
    const clampedTime = Math.max(15, Math.min(180, newTime));
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, rest_seconds: clampedTime } : ex
    ));
    
    if (workout.workout_log_id) {
      WorkoutService.updateExerciseLog(exerciseId, { rest_seconds: clampedTime });
    }
  };

  const completeSet = () => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExercise].completed = (updatedExercises[currentExercise].completed || 0) + 1;
    setExercises(updatedExercises);
    
    // Auto-start rest timer
    startRestTimer(currentEx.id);
    
    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    } else {
      onComplete?.();
    }
  };

  const updateRPE = async (exerciseIndex: number, rpe: number) => {
    const exerciseId = exercises[exerciseIndex].id;
    setExercises(prev => prev.map((ex, idx) => 
      idx === exerciseIndex ? { ...ex, rpe } : ex
    ));
    
    if (workout.workout_log_id) {
      const notes = JSON.stringify({ rpe });
      await WorkoutService.updateExerciseLog(exerciseId, { notes });
    }
  };

  const handleAICoachSubmit = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAIProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-coach', {
        body: {
          prompt: aiPrompt,
          currentExercises: exercises,
          workoutLogId: workout.workout_log_id
        }
      });
      
      if (error) throw error;
      
      if (data.updatedExercises) {
        // Ensure each updated exercise has originalData by preserving it from current state
        const updatedExercisesWithOriginalData: ExerciseWithOriginalData[] = data.updatedExercises.map((updatedEx: any) => {
          const currentEx = exercises.find(ex => ex.id === updatedEx.id);
          return {
            ...updatedEx,
            originalData: currentEx?.originalData || {
              sets: updatedEx.sets,
              reps: updatedEx.reps,
              weight: updatedEx.weight,
              rest_seconds: updatedEx.rest_seconds || 60
            }
          };
        });
        
        setExercises(updatedExercisesWithOriginalData);
        queryClient.invalidateQueries({ queryKey: ['workout-session', workout.workout_log_id] });
        toast({
          title: "✅ Plan updated by AI Coach",
          description: data.message || "Your workout has been optimized"
        });
      }
      
      setShowAICoach(false);
      setAiPrompt("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance",
        variant: "destructive"
      });
    } finally {
      setIsAIProcessing(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onSaveAsFavorite?.();
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasChanges = (exercise: ExerciseWithOriginalData) => {
    if (!exercise.originalData) return false;
    return (
      exercise.sets !== exercise.originalData.sets ||
      exercise.reps !== exercise.originalData.reps ||
      exercise.weight !== exercise.originalData.weight ||
      exercise.rest_seconds !== exercise.originalData.rest_seconds
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-l-4 border-l-hashim-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-hashim-100 rounded-lg">
                  <Dumbbell className="h-4 w-4 text-hashim-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{workout.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {workout.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedExercises.length >= 2 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createSuperset}
                      className="text-xs"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Superset
                    </Button>
                  </motion.div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="h-8 w-8 p-0"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="h-8 w-8 p-0"
                >
                  {isFavorite ? 
                    <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                    <StarOff className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{completedSets}/{totalSets} sets</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3" />
                <motion.div 
                  className="absolute top-0 h-3 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* AI Coach Modal */}
      <AnimatePresence>
        {showAICoach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAICoach(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">AI Coach Assistant</h3>
              <Input
                placeholder="e.g., I'm too sore for squats, change this workout"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAICoachSubmit}
                  disabled={isAIProcessing || !aiPrompt.trim()}
                  className="flex-1"
                >
                  {isAIProcessing ? "Processing..." : "Ask Coach"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAICoach(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Exercise Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-hashim-50 to-white border-2 border-hashim-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-hashim-800">{currentEx.name}</h3>
                <Badge variant="outline" className="mt-1">
                  Exercise {currentExercise + 1}/{exercises.length}
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExerciseSelection(currentEx.id)}
                  className={cn(
                    "h-8 w-8 p-0",
                    selectedExercises.includes(currentEx.id) && "bg-hashim-100"
                  )}
                >
                  <ArrowLeftRight size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Sets */}
              <div className="text-center bg-white rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">Set</p>
                <p className="text-2xl font-bold text-hashim-600">{currentSet}</p>
                <p className="text-xs text-muted-foreground">of {currentEx.sets}</p>
              </div>
              
              {/* Reps */}
              <div className="text-center bg-white rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">Reps</p>
                {editingExercise === currentEx.id && editingField === 'reps' ? (
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustValue(currentEx.id, 'reps', -1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      type="text" 
                      value={editValues.reps || currentEx.reps}
                      onChange={(e) => setEditValues({...editValues, reps: e.target.value})}
                      onBlur={() => saveEdit(currentEx.id, 'reps')}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(currentEx.id, 'reps')}
                      className="text-center font-bold h-8 border-0 bg-transparent text-xl w-16"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustValue(currentEx.id, 'reps', 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <motion.div 
                      className="text-2xl font-bold text-hashim-600 cursor-pointer flex items-center justify-center"
                      onClick={() => startEditing(currentEx.id, 'reps', currentEx.reps)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentEx.reps}
                      <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                    </motion.div>
                    {hasChanges(currentEx) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => undoEdit(currentEx.id, 'reps')}
                        className="h-6 w-6 p-0 ml-1"
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Weight */}
              <div className="text-center bg-white rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">Weight</p>
                {editingExercise === currentEx.id && editingField === 'weight' ? (
                  <Input 
                    type="text" 
                    value={editValues.weight || currentEx.weight}
                    onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                    onBlur={() => saveEdit(currentEx.id, 'weight')}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(currentEx.id, 'weight')}
                    className="text-center font-bold h-8 border-0 bg-transparent text-xl"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <motion.div 
                      className="text-2xl font-bold text-hashim-600 cursor-pointer flex items-center justify-center"
                      onClick={() => startEditing(currentEx.id, 'weight', currentEx.weight)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentEx.weight}
                      <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                    </motion.div>
                    {hasChanges(currentEx) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => undoEdit(currentEx.id, 'weight')}
                        className="h-6 w-6 p-0 ml-1"
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* RPE Selector */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Rate of Perceived Exertion (RPE)</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                  <motion.div key={rpe} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant={currentEx.rpe === rpe ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-8 h-8 p-0 text-xs transition-all",
                        rpe <= 3 && "border-green-300 text-green-600 hover:bg-green-50",
                        rpe > 3 && rpe <= 6 && "border-yellow-300 text-yellow-600 hover:bg-yellow-50",
                        rpe > 6 && rpe <= 8 && "border-orange-300 text-orange-600 hover:bg-orange-50",
                        rpe > 8 && "border-red-300 text-red-600 hover:bg-red-50",
                        currentEx.rpe === rpe && "ring-2 ring-hashim-300"
                      )}
                      onClick={() => updateRPE(currentExercise, rpe)}
                    >
                      {rpe}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Rest Timer and Actions */}
            <div className="space-y-3">
              {/* Custom Rest Timer */}
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Rest Timer</span>
                  {activeTimers[currentEx.id] && (
                    <motion.span
                      key={restTimers[currentEx.id]}
                      initial={{ scale: 1.2, color: "#ef4444" }}
                      animate={{ scale: 1, color: "#2563eb" }}
                      className="text-lg font-bold"
                    >
                      {formatTime(restTimers[currentEx.id] || 0)}
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="15"
                    max="180"
                    value={currentEx.rest_seconds || 60}
                    onChange={(e) => editRestTime(currentEx.id, parseInt(e.target.value))}
                    className="w-16 h-8 text-xs text-center"
                  />
                  <span className="text-xs text-muted-foreground">sec</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startRestTimer(currentEx.id)}
                    disabled={activeTimers[currentEx.id]}
                  >
                    {activeTimers[currentEx.id] ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAICoach(true)}
                  className="flex-1"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Ask AI Coach
                </Button>
                
                <Button 
                  onClick={completeSet}
                  className="flex-2 bg-hashim-600 hover:bg-hashim-700 text-white"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Set {currentSet}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Exercise List with Drag & Drop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              All Exercises
              {selectedExercises.length > 0 && (
                <Badge variant="secondary">
                  {selectedExercises.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="exercises">
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={cn(
                      "transition-colors duration-200",
                      snapshot.isDraggingOver && "bg-hashim-50 rounded-lg"
                    )}
                  >
                    {exercises.map((exercise, index) => (
                      <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer mb-2",
                              index === currentExercise ? "bg-hashim-100 border-hashim-300 ring-2 ring-hashim-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                              index < currentExercise && "opacity-60",
                              exercise.superset_group_id && "border-l-4 border-l-blue-400 bg-blue-50",
                              selectedExercises.includes(exercise.id) && "ring-2 ring-orange-300 bg-orange-50",
                              snapshot.isDragging && "shadow-lg scale-105 rotate-2 z-10"
                            )}
                            onClick={() => {
                              setCurrentExercise(index);
                              setCurrentSet(1);
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{exercise.name}</p>
                                  {exercise.superset_group_id && (
                                    <Badge variant="outline" className="text-xs bg-blue-100">
                                      Superset
                                    </Badge>
                                  )}
                                  {hasChanges(exercise) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2 h-2 bg-orange-500 rounded-full"
                                    />
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>{exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}</span>
                                  {restTimers[exercise.id] > 0 && activeTimers[exercise.id] && (
                                    <span className="text-blue-600 font-medium">
                                      Rest: {formatTime(restTimers[exercise.id])}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExerciseSelection(exercise.id);
                                }}
                                className={cn(
                                  "h-8 w-8 p-0",
                                  selectedExercises.includes(exercise.id) && "bg-orange-200"
                                )}
                              >
                                <ArrowLeftRight className="h-3 w-3" />
                              </Button>
                              
                              {exercise.superset_group_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromSuperset(exercise.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {exercise.completed && (
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.completed}/{exercise.sets}
                                </Badge>
                              )}
                              {index < currentExercise && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </motion.div>
                              )}
                              {index === currentExercise && (
                                <motion.div 
                                  className="w-2 h-2 bg-hashim-600 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating AI Coach Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          onClick={() => setShowAICoach(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    </div>
  );
}
