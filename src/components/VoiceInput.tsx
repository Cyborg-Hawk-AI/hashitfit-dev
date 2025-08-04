
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Save, Edit, X, Check } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService, WorkoutLog, ExerciseLog } from "@/lib/supabase/services/WorkoutService";
import { format } from "date-fns";

interface WorkoutData {
  sets: number;
  reps: string;
  exercise: string;
  weight_lbs?: number;
  duration_min?: number;
}

interface VoiceInputProps {
  selectedWorkout?: any;
  onWorkoutUpdated?: () => void;
}

export function VoiceInput({ selectedWorkout, onWorkoutUpdated }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<WorkoutData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const { userId } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionGranted(result.state === 'granted');
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      return stream;
    } catch (error) {
      console.error('Microphone access denied:', error);
      setPermissionGranted(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to log workouts with voice.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript("");
      setWorkoutData(null);
      setShowConfirmation(false);
      audioChunksRef.current = [];

      const stream = await requestMicrophoneAccess();
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        }
      };

      mediaRecorder.start();

      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Audio = btoa(binary);

      console.log('Sending audio for processing...');

      const { data, error } = await supabase.functions.invoke('voice-workout-parser', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data.success) {
        setTranscript(data.transcript);
        setWorkoutData(data.workoutData);
        setShowConfirmation(true);
        
        toast({
          title: "Voice Processed",
          description: `Detected: ${data.workoutData.exercise}`,
        });
      } else {
        throw new Error(data.error || 'Processing failed');
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Failed",
        description: "Could not process your voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const handleSave = async () => {
    if (!workoutData || !userId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Create exercise log entry
      const exerciseLog: Omit<ExerciseLog, 'workout_log_id'> = {
        exercise_name: workoutData.exercise,
        sets_completed: workoutData.sets,
        reps_completed: workoutData.reps,
        weight_used: workoutData.weight_lbs ? `${workoutData.weight_lbs} lbs` : workoutData.duration_min ? `${workoutData.duration_min} min` : 'bodyweight',
        order_index: 0 // Will be updated based on existing exercises
      };

      let workoutLogId: string | null = null;

      // Check if there's already a workout log for today
      if (selectedWorkout && selectedWorkout.schedule_id) {
        // Get the workout schedule to check for existing workout log
        const schedules = await WorkoutService.getWorkoutSchedule(userId, today, today);
        const todaySchedule = schedules.find(s => s.scheduled_date === today);
        
        if (todaySchedule && todaySchedule.workout_log_id) {
          // Add to existing workout log
          workoutLogId = todaySchedule.workout_log_id;
          
          // Get existing exercise logs to determine order index
          const existingLogs = await WorkoutService.getExerciseLogs(workoutLogId);
          exerciseLog.order_index = existingLogs.length;
          
          // Add the new exercise log
          await WorkoutService.addExerciseLogs(workoutLogId, [exerciseLog]);
        } else if (todaySchedule) {
          // Create new workout log for existing schedule
          const workoutLog: WorkoutLog = {
            user_id: userId,
            workout_plan_id: todaySchedule.workout_plan_id,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
          };
          
          workoutLogId = await WorkoutService.logWorkout(workoutLog, [exerciseLog]);
          
          if (workoutLogId && todaySchedule.id) {
            await WorkoutService.completeScheduledWorkout(todaySchedule.id, workoutLogId);
          }
        }
      } else {
        // No scheduled workout, create a standalone workout log
        const workoutLog: WorkoutLog = {
          user_id: userId,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
        };
        
        workoutLogId = await WorkoutService.logWorkout(workoutLog, [exerciseLog]);
      }

      if (workoutLogId) {
        setShowConfirmation(false);
        setWorkoutData(null);
        setTranscript("");
        
        // Call the callback to refresh the UI
        onWorkoutUpdated?.();
        
        toast({
          title: "Exercise Logged!",
          description: `${workoutData.exercise} has been added to today's workout.`,
        });
      } else {
        throw new Error('Failed to create workout log');
      }

    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setEditData({ ...workoutData! });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editData) {
      setWorkoutData(editData);
      setIsEditing(false);
      setEditData(null);
    }
  };

  const handleDiscard = () => {
    setShowConfirmation(false);
    setWorkoutData(null);
    setTranscript("");
    setIsEditing(false);
    setEditData(null);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (showConfirmation && workoutData) {
    return (
      <AnimatedCard className="relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2 text-center">Confirm Exercise</h3>
            
            {transcript && (
              <div className="mb-3 p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">You said: </span>
                "{transcript}"
              </div>
            )}

            {isEditing && editData ? (
              <div className="space-y-3 mb-4">
                <Input
                  placeholder="Exercise name"
                  value={editData.exercise}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, exercise: e.target.value } : null)}
                />
                <div className="flex space-x-2">
                  <Input
                    placeholder="Sets"
                    type="number"
                    value={editData.sets}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, sets: parseInt(e.target.value) || 0 } : null)}
                  />
                  <Input
                    placeholder="Reps"
                    value={editData.reps}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, reps: e.target.value } : null)}
                  />
                </div>
                {editData.weight_lbs && (
                  <Input
                    placeholder="Weight (lbs)"
                    type="number"
                    value={editData.weight_lbs}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, weight_lbs: parseInt(e.target.value) || undefined } : null)}
                  />
                )}
                {editData.duration_min && (
                  <Input
                    placeholder="Duration (min)"
                    type="number"
                    value={editData.duration_min}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, duration_min: parseInt(e.target.value) || undefined } : null)}
                  />
                )}
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                    <Check size={16} className="mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-hashim-50 dark:bg-hashim-900/20 rounded-lg p-4 mb-4">
                <div className="font-semibold text-hashim-800 dark:text-hashim-200 capitalize">
                  {workoutData.exercise}
                </div>
                <div className="text-sm text-muted-foreground">
                  {workoutData.sets} sets × {workoutData.reps} reps
                  {workoutData.weight_lbs && ` @ ${workoutData.weight_lbs} lbs`}
                  {workoutData.duration_min && ` for ${workoutData.duration_min} minutes`}
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  className="flex-1 bg-hashim-600 hover:bg-hashim-700"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDiscard}
                  className="flex-1"
                >
                  <X size={16} className="mr-1" />
                  Discard
                </Button>
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="relative overflow-hidden">
      <div className="flex flex-col items-center justify-center py-4">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={cn(
            "relative rounded-full p-6 transition-all duration-300 mb-4",
            isListening 
              ? "bg-red-500 hover:bg-red-600" 
              : isProcessing
              ? "bg-gray-400"
              : "bg-hashim-500 hover:bg-hashim-600"
          )}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white" />
          ) : isListening ? (
            <MicOff className="text-white" size={28} />
          ) : (
            <Mic className="text-white" size={28} />
          )}
          
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ripple bg-red-400 opacity-20"></div>
          )}
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">
            {isProcessing 
              ? "Processing..." 
              : isListening 
              ? "Listening..." 
              : "Log your workout"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isProcessing
              ? "Converting speech to workout data..."
              : isListening 
              ? "Speak your exercise, sets, reps, and weight" 
              : permissionGranted === false
              ? "Microphone access required"
              : "Tap to start voice logging"}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
