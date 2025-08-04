
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, MessageCircle } from "lucide-react";

interface PostWorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: { mood: number; notes: string }) => void;
  workoutTitle: string;
}

export function PostWorkoutFeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmitFeedback,
  workoutTitle 
}: PostWorkoutFeedbackModalProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const moods = [
    { value: 1, emoji: "😫", label: "Tough" },
    { value: 2, emoji: "😐", label: "Okay" },
    { value: 3, emoji: "🙂", label: "Good" },
    { value: 4, emoji: "😄", label: "Great" }
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmitFeedback({
        mood: selectedMood,
        notes: notes.trim()
      });
      
      // Reset form
      setSelectedMood(null);
      setNotes("");
      onClose();
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "bg-red-100 border-red-300 text-red-700";
    if (mood === 3) return "bg-yellow-100 border-yellow-300 text-yellow-700";
    return "bg-green-100 border-green-300 text-green-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto animate-scale-in">
        <DialogHeader>
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
              🎉 Great job! Workout complete.
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {workoutTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              How did it feel? Your coach will use this to tailor next sessions.
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div className="space-y-3">
            <div className="flex justify-center gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center min-w-16
                    ${selectedMood === mood.value 
                      ? getMoodColor(mood.value) 
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-medium">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Want to leave a quick note?
            </label>
            <Textarea
              placeholder="e.g., Felt strong on squats, need to work on form for lunges..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-16 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-hashim-600 hover:bg-hashim-700 transition-all hover:scale-[1.02]"
              disabled={!selectedMood}
              size="lg"
            >
              <MessageCircle size={16} className="mr-2" />
              Send to Coach
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={onClose}
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
