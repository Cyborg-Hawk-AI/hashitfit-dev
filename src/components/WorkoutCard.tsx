
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Dumbbell, 
  Play, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Flame,
  Star,
  Edit3,
  Save,
  X,
  GripVertical,
  Plus,
  Minus,
  Copy,
  Calendar,
  CalendarDays,
  Undo2,
  RotateCcw,
  Users,
  ArrowLeftRight,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
  rest_seconds?: number;
  superset_group_id?: string;
  position_in_workout?: number;
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
  schedule_id?: string;
  workout_log_id?: string;
}

interface WorkoutCardProps {
  workout: Workout;
  onStart?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
  onAskCoach?: () => void;
  onReplaceWorkout?: () => void;
  onUpdateWorkout?: (workout: Workout, applyToAll?: boolean) => void;
}

export function WorkoutCard({ 
  workout, 
  onStart,
  onEdit,
  onAskCoach,
  onReplaceWorkout,
  onUpdateWorkout
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFullExercises, setShowFullExercises] = useState(false);
  const [editingExercises, setEditingExercises] = useState<Exercise[]>(workout.exercises);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '10',
    weight: 'bodyweight',
    rest_seconds: 60
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate progress
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Handle view results navigation
  const handleViewResults = () => {
    if (workout.workout_log_id) {
      navigate(`/workout-results/${workout.workout_log_id}`);
    } else {
      console.error('No workout log ID available for this completed workout');
    }
  };

  // Get difficulty info with Apple-inspired colors
  const getDifficultyInfo = (difficulty?: number) => {
    if (!difficulty) return { 
      label: "Intermediate", 
      gradient: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
      textColor: "text-orange-700"
    };
    if (difficulty <= 2) return { 
      label: "Beginner", 
      gradient: "from-green-400 to-emerald-500",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      textColor: "text-green-700"
    };
    if (difficulty <= 4) return { 
      label: "Intermediate", 
      gradient: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
      textColor: "text-orange-700"
    };
    return { 
      label: "Advanced", 
      gradient: "from-red-400 to-pink-500",
      bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
      textColor: "text-red-700"
    };
  };

  const difficultyInfo = getDifficultyInfo(workout.difficulty);

  // Get workout type with colors
  const getWorkoutTypeInfo = () => {
    const type = (!workout.targetMuscles || workout.targetMuscles.length === 0 || workout.targetMuscles.length > 3) 
      ? "Full Body" 
      : workout.targetMuscles.join(" & ");

    const colorMap: Record<string, any> = {
      "Full Body": { 
        gradient: "from-purple-400 to-indigo-500",
        bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
        textColor: "text-purple-700"
      },
      "Chest": { 
        gradient: "from-blue-400 to-cyan-500",
        bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
        textColor: "text-blue-700"
      },
      "Back": { 
        gradient: "from-emerald-400 to-teal-500",
        bgColor: "bg-gradient-to-r from-emerald-50 to-teal-50",
        textColor: "text-emerald-700"
      },
      "Legs": { 
        gradient: "from-orange-400 to-red-500",
        bgColor: "bg-gradient-to-r from-orange-50 to-red-50",
        textColor: "text-orange-700"
      }
    };

    return {
      type,
      ...colorMap[type] || colorMap["Full Body"]
    };
  };

  const workoutTypeInfo = getWorkoutTypeInfo();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !isEditMode) return;
    
    const items = Array.from(editingExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...item,
      position_in_workout: index
    }));
    
    setEditingExercises(updatedItems);
    setHasUnsavedChanges(true);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setEditingExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
    setHasUnsavedChanges(true);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const createSuperset = () => {
    if (selectedExercises.length < 2) return;
    
    const supersetId = `superset-${Date.now()}`;
    setEditingExercises(prev => prev.map(ex => 
      selectedExercises.includes(ex.id) 
        ? { ...ex, superset_group_id: supersetId }
        : ex
    ));
    setSelectedExercises([]);
    setHasUnsavedChanges(true);
  };

  const removeFromSuperset = (exerciseId: string) => {
    setEditingExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, superset_group_id: undefined } : ex
    ));
    setHasUnsavedChanges(true);
  };

  const addNewExercise = () => {
    if (!newExercise.name.trim()) return;
    
    const exercise: Exercise = {
      id: `new-${Date.now()}`,
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight,
      rest_seconds: newExercise.rest_seconds,
      completed: false,
      source: 'planned',
      position_in_workout: editingExercises.length
    };
    
    setEditingExercises(prev => [...prev, exercise]);
    setNewExercise({
      name: '',
      sets: 3,
      reps: '10',
      weight: 'bodyweight',
      rest_seconds: 60
    });
    setShowAddExercise(false);
    setHasUnsavedChanges(true);
  };

  const removeExercise = (exerciseId: string) => {
    setEditingExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    setHasUnsavedChanges(true);
  };

  const resetChanges = () => {
    setEditingExercises(workout.exercises);
    setHasUnsavedChanges(false);
    setSelectedExercises([]);
  };

  const saveChanges = (applyToAll: boolean = false) => {
    console.log(`Saving workout changes. Apply to all: ${applyToAll}`);
    console.log("Edited exercises:", editingExercises);
    
    const updatedWorkout = {
      ...workout,
      exercises: editingExercises
    };
    
    onUpdateWorkout?.(updatedWorkout, applyToAll);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setShowSaveOptions(false);
  };

  const enterEditMode = () => {
    setIsEditMode(true);
    setEditingExercises(workout.exercises);
    setShowFullExercises(true);
  };

  const exitEditMode = () => {
    if (hasUnsavedChanges) {
      setShowSaveOptions(true);
    } else {
      setIsEditMode(false);
      setShowFullExercises(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className={cn(
        "w-full transition-all duration-500 hover:shadow-xl border-0 rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-white via-gray-50/50 to-white",
        workout.isCompleted 
          ? "shadow-lg shadow-green-500/20 ring-2 ring-green-500/20" 
          : "shadow-lg shadow-hashim-500/10 hover:shadow-hashim-500/20",
        isEditMode && "ring-2 ring-blue-500/30 shadow-blue-500/20"
      )}>
        {/* Header with gradient background */}
        <CardHeader className={cn(
          "pb-4 relative overflow-hidden",
          workout.isCompleted 
            ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
            : "bg-gradient-to-r from-hashim-400 via-hashim-500 to-hashim-600"
        )}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white drop-shadow-sm">{workout.title}</h3>
                  <div className="flex items-center gap-1">
                    {workout.aiGenerated && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        <Zap size={10} className="mr-1" />
                        AI
                      </Badge>
                    )}
                    {workout.streak && workout.streak > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-100 border-orange-300/30 backdrop-blur-sm">
                        <Flame size={10} className="mr-1" />
                        {workout.streak}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-sm text-white/90 mb-3">
                  {workout.estimatedDuration && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{workout.estimatedDuration} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>{editingExercises.length} exercises</span>
                  </div>
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-xs px-3 py-1 border-0 font-medium",
                    difficultyInfo.bgColor,
                    difficultyInfo.textColor
                  )}>
                    {difficultyInfo.label}
                  </Badge>
                  <Badge className={cn(
                    "text-xs px-3 py-1 border-0 font-medium",
                    workoutTypeInfo.bgColor,
                    workoutTypeInfo.textColor
                  )}>
                    {workoutTypeInfo.type}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {workout.isFavorite && (
                  <Star size={20} className="text-yellow-300 fill-current drop-shadow-sm" />
                )}
                {workout.isCompleted && (
                  <div className="flex items-center text-white">
                    <CheckCircle size={20} className="drop-shadow-sm" />
                    <TrendingUp size={16} className="ml-1 drop-shadow-sm" />
                  </div>
                )}
                {!isEditMode ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={enterEditMode}
                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Edit3 size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exitEditMode}
                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 p-6">
          {/* Exercise List */}
          {(showFullExercises || isEditMode) && editingExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Dumbbell size={16} />
                  Exercises
                  {isEditMode && hasUnsavedChanges && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                      Modified
                    </Badge>
                  )}
                </h4>
                
                {isEditMode && (
                  <div className="flex items-center gap-2">
                    {selectedExercises.length >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={createSuperset}
                        className="text-xs h-7"
                      >
                        <Users size={12} className="mr-1" />
                        Superset
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddExercise(true)}
                      className="text-xs h-7 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus size={12} className="mr-1" />
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="exercises" isDropDisabled={!isEditMode}>
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={cn(
                        "space-y-2 transition-colors duration-200 rounded-xl p-3",
                        snapshot.isDraggingOver && isEditMode && "bg-blue-50 ring-2 ring-blue-200"
                      )}
                    >
                      {editingExercises.map((exercise, index) => (
                        <Draggable 
                          key={exercise.id} 
                          draggableId={exercise.id} 
                          index={index}
                          isDragDisabled={!isEditMode}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              layout
                              className={cn(
                                "rounded-xl border border-gray-200 p-4 transition-all",
                                exercise.completed 
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                                  : "bg-white hover:bg-gray-50",
                                exercise.superset_group_id && "border-l-4 border-l-blue-400 bg-blue-50/50",
                                selectedExercises.includes(exercise.id) && isEditMode && "ring-2 ring-orange-300 bg-orange-50",
                                snapshot.isDragging && "shadow-lg scale-105 rotate-1 z-10 bg-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {isEditMode && (
                                  <div className="flex items-center gap-2">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                    >
                                      <GripVertical size={16} />
                                    </div>
                                    <button
                                      onClick={() => toggleExerciseSelection(exercise.id)}
                                      className={cn(
                                        "w-4 h-4 rounded border-2 transition-colors",
                                        selectedExercises.includes(exercise.id) 
                                          ? "bg-orange-500 border-orange-500" 
                                          : "border-gray-300 hover:border-orange-300"
                                      )}
                                    >
                                      {selectedExercises.includes(exercise.id) && (
                                        <CheckCircle size={12} className="text-white" />
                                      )}
                                    </button>
                                  </div>
                                )}

                                <div className="flex-shrink-0">
                                  {exercise.completed ? (
                                    <CheckCircle size={20} className="text-green-600" />
                                  ) : (
                                    <Circle size={20} className="text-gray-400" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {isEditMode ? (
                                      <Input
                                        value={exercise.name}
                                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                        className="font-medium h-7 text-sm border-0 bg-transparent p-0 focus:bg-white focus:border focus:px-2 focus:rounded"
                                      />
                                    ) : (
                                      <p className={cn(
                                        "font-medium",
                                        exercise.completed && "line-through text-gray-500"
                                      )}>
                                        {exercise.name}
                                      </p>
                                    )}
                                    
                                    {exercise.superset_group_id && (
                                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        Superset
                                        {isEditMode && (
                                          <button
                                            onClick={() => removeFromSuperset(exercise.id)}
                                            className="ml-1 hover:text-red-600"
                                          >
                                            <X size={10} />
                                          </button>
                                        )}
                                      </Badge>
                                    )}
                                    
                                    {exercise.source === 'voice' && (
                                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                        Voice
                                      </Badge>
                                    )}
                                  </div>

                                  {isEditMode ? (
                                    <div className="flex items-center gap-2 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          value={exercise.sets}
                                          onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                                          className="w-12 h-6 text-xs text-center border-gray-300"
                                          min="1"
                                        />
                                        <span className="text-gray-500">sets</span>
                                      </div>
                                      <span className="text-gray-400">×</span>
                                      <div className="flex items-center gap-1">
                                        <Input
                                          value={exercise.reps}
                                          onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                                          className="w-16 h-6 text-xs text-center border-gray-300"
                                        />
                                        <span className="text-gray-500">reps</span>
                                      </div>
                                      <span className="text-gray-400">@</span>
                                      <Input
                                        value={exercise.weight}
                                        onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                                        className="w-20 h-6 text-xs text-center border-gray-300"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600">
                                      {exercise.sets} × {exercise.reps}
                                      {exercise.weight && exercise.weight !== 'bodyweight' && 
                                        ` @ ${exercise.weight}`
                                      }
                                    </p>
                                  )}
                                </div>

                                {isEditMode && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExercise(exercise.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X size={12} />
                                  </Button>
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

              {/* Add Exercise Form */}
              <AnimatePresence>
                {showAddExercise && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                  >
                    <h5 className="text-sm font-medium text-blue-800 mb-3">Add New Exercise</h5>
                    <div className="space-y-3">
                      <Input
                        placeholder="Exercise name"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Sets</label>
                          <Input
                            type="number"
                            value={newExercise.sets}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                            className="bg-white"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Reps</label>
                          <Input
                            value={newExercise.reps}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Weight</label>
                          <Input
                            value={newExercise.weight}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addNewExercise} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Plus size={14} className="mr-1" />
                          Add Exercise
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddExercise(false)} 
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showFullExercises && !isEditMode && totalExercises > 3 && (
                <div className="text-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullExercises(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <ChevronDown size={12} className="mr-1" />
                    Show {totalExercises - 3} more exercises
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Exercise Preview (when not in edit mode) */}
          {!showFullExercises && !isEditMode && workout.exercises.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Dumbbell size={16} />
                  Exercise Preview
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullExercises(true)}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <ChevronDown size={12} className="mr-1" />
                  View All
                </Button>
              </div>

              <div className="space-y-2">
                {workout.exercises.slice(0, 3).map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/70 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      {exercise.completed ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Circle size={16} className="text-gray-400" />
                      )}
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          exercise.completed && "line-through text-gray-500"
                        )}>
                          {exercise.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight && exercise.weight !== 'bodyweight' && 
                            ` @ ${exercise.weight}`
                          }
                        </p>
                      </div>
                    </div>
                    {exercise.source === 'voice' && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        Voice
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Section */}
          {!workout.isCompleted && !isEditMode && totalExercises > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="font-semibold text-gray-800">
                  {completedExercises}/{totalExercises}
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-gray-200" />
                <div 
                  className="absolute top-0 h-3 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {isEditMode ? (
              <div className="space-y-2">
                {hasUnsavedChanges && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetChanges}
                      variant="outline"
                      className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      <RotateCcw size={14} className="mr-2" />
                      Reset
                    </Button>
                    <Button 
                      onClick={() => setShowSaveOptions(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save size={14} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {workout.isCompleted ? (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleViewResults}
                    className="w-full text-green-600 border-green-200 hover:bg-green-50 h-12 rounded-2xl font-semibold"
                  >
                    <BarChart3 size={18} className="mr-2" />
                    View Results
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onStart?.(workout)}
                    className="w-full bg-gradient-to-r from-hashim-500 to-hashim-600 hover:from-hashim-600 hover:to-hashim-700 text-white h-12 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <Play size={18} className="mr-2" />
                    Start Workout
                  </Button>
                )}

                {/* Secondary CTAs */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAskCoach}
                    className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50 rounded-xl"
                  >
                    <MessageCircle size={14} className="mr-1" />
                    Ask Coach
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplaceWorkout}
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl"
                  >
                    <Dumbbell size={14} className="mr-1" />
                    Replace
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Empty State */}
          {workout.exercises.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No exercises in this workout</p>
              <p className="text-xs mt-1">Add exercises to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Options Modal */}
      <AnimatePresence>
        {showSaveOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Save Changes</h3>
              <p className="text-sm text-gray-600 mb-6">
                How would you like to apply these changes?
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => saveChanges(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-medium"
                >
                  <Calendar size={16} className="mr-2" />
                  Save for Today Only
                </Button>
                
                <Button
                  onClick={() => saveChanges(true)}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-12 rounded-2xl font-medium"
                >
                  <CalendarDays size={16} className="mr-2" />
                  Save for All "{workout.title}" Workouts
                </Button>
                
                <Button
                  onClick={() => setShowSaveOptions(false)}
                  variant="ghost"
                  className="w-full text-gray-600 hover:bg-gray-100 h-10 rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
