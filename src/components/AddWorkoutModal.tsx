
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { X, Plus, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: any) => void;
  selectedDay: string;
  availableWorkouts?: any[];
}

interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

export function AddWorkoutModal({ 
  isOpen, 
  onClose, 
  onAddWorkout, 
  selectedDay,
  availableWorkouts = []
}: AddWorkoutModalProps) {
  const { userId } = useAuth();
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: "", sets: 3, reps: "10", weight: "bodyweight" }
  ]);
  
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "10", weight: "bodyweight" }]);
  };
  
  const handleRemoveExercise = (index: number) => {
    if (exercises.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises.splice(index, 1);
      setExercises(updatedExercises);
    }
  };
  
  const handleExerciseChange = (index: number, field: keyof ExerciseInput, value: any) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { 
      ...updatedExercises[index], 
      [field]: field === 'sets' ? parseInt(value) || 1 : value 
    };
    setExercises(updatedExercises);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const title = (e.target as HTMLFormElement).workoutTitle.value;
    const category = (e.target as HTMLFormElement).category.value;
    
    if (!title || exercises.some(ex => !ex.name.trim())) {
      return; // Don't submit if title or any exercise name is empty
    }
    
    const workout = {
      id: `temp-${Date.now()}`, // Add a temporary ID to prevent the "valid workout" error
      title,
      category,
      exercises: exercises.map(ex => ({
        ...ex,
        sets: parseInt(ex.sets.toString()) 
      }))
    };
    
    onAddWorkout(workout);
    
    // Reset form
    setExercises([{ name: "", sets: 3, reps: "10", weight: "bodyweight" }]);
    (e.target as HTMLFormElement).reset();
  };
  
  const handleSelectExistingWorkout = (workout: any) => {
    onAddWorkout(workout);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Workout {selectedDay ? `for ${selectedDay}` : ""}</DialogTitle>
          <DialogDescription>
            Choose an existing workout or create a new one
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Choose Existing</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4">
            {availableWorkouts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableWorkouts.map((workout) => (
                  <Card 
                    key={workout.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectExistingWorkout(workout)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{workout.title}</h3>
                        {workout.aiGenerated && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            <Zap size={10} className="mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                        {workout.estimatedDuration && (
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {workout.estimatedDuration}min
                          </div>
                        )}
                        <div className="flex items-center">
                          <Target size={14} className="mr-1" />
                          {workout.exercises?.length || 0} exercises
                        </div>
                      </div>
                      
                      {workout.targetMuscles && workout.targetMuscles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {workout.targetMuscles.slice(0, 3).map((muscle: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-gray-50"
                            >
                              {muscle}
                            </Badge>
                          ))}
                          {workout.targetMuscles.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              +{workout.targetMuscles.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No existing workouts found.</p>
                <p className="text-sm mt-1">Create your first workout in the "Create New" tab.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="workoutTitle" className="block text-sm font-medium mb-1">
                  Workout Title
                </label>
                <Input
                  id="workoutTitle"
                  name="workoutTitle"
                  placeholder="e.g. Upper Body Strength"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  defaultValue="strength"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="hiit">HIIT</option>
                  <option value="recovery">Recovery</option>
                  <option value="sport_specific">Sport Specific</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Exercises</label>
                </div>
                
                {exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Exercise {index + 1}</h4>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Exercise Name
                      </label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        placeholder="e.g. Bench Press"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Sets
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Reps
                        </label>
                        <Input
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          placeholder="e.g. 10 or 8-12"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Weight
                        </label>
                        <Input
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          placeholder="e.g. 50kg"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddExercise}
                >
                  <Plus size={16} className="mr-1" />
                  Add Exercise
                </Button>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-hashim-600 hover:bg-hashim-700 text-white"
                >
                  Create Workout
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
