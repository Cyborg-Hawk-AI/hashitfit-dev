import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Check } from 'lucide-react';
import { WorkoutService } from '@/lib/supabase/services/WorkoutService';
import { toast } from '@/hooks/use-toast';

interface SwapExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (newExerciseName: string) => void;
  currentExerciseName: string;
}

export function SwapExerciseModal({ 
  isOpen, 
  onClose, 
  onSwap, 
  currentExerciseName 
}: SwapExerciseModalProps) {
  const [exercises, setExercises] = useState<{id: string, name: string}[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<{id: string, name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      exercise.name !== currentExerciseName
    );
    setFilteredExercises(filtered);
  }, [searchTerm, exercises, currentExerciseName]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const allExercises = await WorkoutService.getAllExercises();
      setExercises(allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (selectedExerciseId) {
      const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
      if (selectedExercise) {
        onSwap(selectedExercise.name);
        onClose();
        setSelectedExerciseId(null);
        setSearchTerm('');
      }
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedExerciseId(null);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Exercise</DialogTitle>
          <p className="text-sm text-slate-600">
            Choose a new exercise to replace the current one in your workout.
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            Current exercise: <span className="font-medium">{currentExerciseName}</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading exercises...</div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? 'No exercises found matching your search.' : 'No exercises available.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedExerciseId === exercise.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      {selectedExerciseId === exercise.id && (
                        <Check size={16} className="text-violet-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSwap}
              disabled={!selectedExerciseId}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Swap Exercise
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
