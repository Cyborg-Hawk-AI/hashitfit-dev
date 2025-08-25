import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutService } from '@/lib/supabase/services/WorkoutService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ExerciseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
}

export function ExerciseNotesModal({ 
  isOpen, 
  onClose, 
  exerciseId, 
  exerciseName 
}: ExerciseNotesModalProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (isOpen && userId) {
      loadNotes();
    }
  }, [isOpen, exerciseId, userId]);

  const loadNotes = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const userNotes = await WorkoutService.getUserExerciseNotes(userId, exerciseId);
      setNotes(userNotes || '');
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const success = await WorkoutService.saveUserExerciseNotes(userId, exerciseId, notes);
      if (success) {
        toast({
          title: "Success",
          description: "Notes saved successfully!",
        });
        onClose();
      } else {
        throw new Error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notes for {exerciseName}</DialogTitle>
          <p className="text-sm text-slate-600">
            Add your personal notes and tips for this exercise.
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading notes...</div>
          ) : (
            <Textarea
              placeholder="Add your personal notes for this exercise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
