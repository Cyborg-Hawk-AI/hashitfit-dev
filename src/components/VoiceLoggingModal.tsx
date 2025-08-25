import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Save, Edit, X, Check, Calendar, Dumbbell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { format } from "date-fns";
import supabase from "@/lib/supabase";

interface WorkoutData {
  sets: number;
  reps: string;
  exercise: string;
  weight_lbs?: number;
  duration_min?: number;
  scheduled_exercise_id?: string;
}

interface ScheduledWorkout {
  id: string;
  workout_plan_id: string;
  scheduled_date: string;
  workout_plans: {
    id: string;
    title: string;
    category: string;
    target_muscles: string[];
  };
}

interface VoiceLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutLogged?: () => void;
}

export function VoiceLoggingModal({ isOpen, onClose, onWorkoutLogged }: VoiceLoggingModalProps) {
  const { userId } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<WorkoutData | null>(null);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [matchedSchedule, setMatchedSchedule] = useState<ScheduledWorkout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (isOpen && userId) {
      loadScheduledWorkouts();
    }
  }, [isOpen, userId]);

  const loadScheduledWorkouts = async () => {
    try {
      const schedules = await WorkoutService.getWorkoutSchedule(userId, today, today);
      setScheduledWorkouts(schedules);
    } catch (error) {
      console.error('Error loading scheduled workouts:', error);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript("");
      setWorkoutData(null);
      setShowConfirmation(false);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to log workouts with voice.",
        variant: "destructive",
      });
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
        body: { 
          audio: base64Audio,
          userId: userId,
          date: today
        }
      });

      if (error) throw error;

      if (data.success) {
        setTranscript(data.transcript);
        setWorkoutData(data.workoutData);
        setScheduledWorkouts(data.scheduledWorkouts || []);
        setMatchedSchedule(data.matchedSchedule);
        setShowConfirmation(true);
        
        const exerciseName = data.workoutData.exercise;
        const scheduleInfo = data.matchedSchedule ? 
          ` (matches today's ${data.matchedSchedule.workout_plans.title})` : '';
        
        toast({
          title: "Voice Processed",
          description: `Detected: ${exerciseName}${scheduleInfo}`,
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
      // Create exercise log entry
      const exerciseLog = {
        exercise_name: workoutData.exercise,
        sets_completed: workoutData.sets,
        reps_completed: workoutData.reps,
        weight_used: workoutData.weight_lbs ? `${workoutData.weight_lbs} lbs` : 
                    workoutData.duration_min ? `${workoutData.duration_min} min` : 'bodyweight',
        order_index: 0
      };

      let workoutLogId: string | null = null;

      // If we have a matched schedule, log to that workout
      if (matchedSchedule) {
        const schedule = scheduledWorkouts.find(s => s.id === matchedSchedule.id);
        
        if (schedule) {
          if (schedule.workout_log_id) {
            // Add to existing workout log
            workoutLogId = schedule.workout_log_id;
            
            // Get existing exercise logs to determine order index
            const existingLogs = await WorkoutService.getExerciseLogs(workoutLogId);
            exerciseLog.order_index = existingLogs.length;
            
            // Add the new exercise log
            await WorkoutService.addExerciseLogs(workoutLogId, [exerciseLog]);
          } else {
            // Create new workout log for existing schedule
            const workoutLog = {
              user_id: userId,
              workout_plan_id: schedule.workout_plan_id,
              start_time: new Date().toISOString(),
              end_time: new Date().toISOString(),
            };
            
            workoutLogId = await WorkoutService.logWorkout(workoutLog, [exerciseLog]);
            
            if (workoutLogId) {
              await WorkoutService.completeScheduledWorkout(schedule.id, workoutLogId);
            }
          }
        }
      } else {
        // No scheduled workout match, create a standalone workout log
        const workoutLog = {
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
        setMatchedSchedule(null);
        
        // Call the callback to refresh the UI
        onWorkoutLogged?.();
        
        const scheduleInfo = matchedSchedule ? 
          ` to today's ${matchedSchedule.workout_plans.title}` : '';
        
        toast({
          title: "Exercise Logged!",
          description: `${workoutData.exercise} has been logged${scheduleInfo}.`,
        });
        
        onClose();
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
    setMatchedSchedule(null);
  };

  const handleClose = () => {
    stopListening();
    setShowConfirmation(false);
    setWorkoutData(null);
    setTranscript("");
    setIsEditing(false);
    setEditData(null);
    setMatchedSchedule(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Log Workout
          </DialogTitle>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-4">
            {/* Scheduled Workouts Info */}
            {scheduledWorkouts.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Today's Scheduled Workouts</span>
                </div>
                <div className="space-y-1">
                  {scheduledWorkouts.map((schedule) => (
                    <div key={schedule.id} className="flex items-center gap-2">
                      <Dumbbell className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-700">{schedule.workout_plans.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recording Interface */}
            <div className="flex flex-col items-center justify-center py-6">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={cn(
                  "relative rounded-full p-8 transition-all duration-300 mb-4",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600" 
                    : isProcessing
                    ? "bg-gray-400"
                    : "bg-hashim-500 hover:bg-hashim-600"
                )}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                ) : isListening ? (
                  <MicOff className="text-white" size={32} />
                ) : (
                  <Mic className="text-white" size={32} />
                )}
                
                {isListening && (
                  <div className="absolute inset-0 rounded-full animate-pulse bg-red-400 opacity-20"></div>
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
                    ? "Say something like: '3 sets of 150lbs bench presses, 12 reps each'" 
                    : "Tap to start voice logging"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Confirmation Interface */}
            <div>
              <h3 className="font-bold text-lg mb-3">Confirm Exercise</h3>
              
              {transcript && (
                <div className="mb-3 p-2 bg-muted rounded text-sm">
                  <span className="text-muted-foreground">You said: </span>
                  "{transcript}"
                </div>
              )}

              {matchedSchedule && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Matches scheduled workout</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">{matchedSchedule.workout_plans.title}</p>
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
                    {workoutData?.exercise}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {workoutData?.sets} sets × {workoutData?.reps} reps
                    {workoutData?.weight_lbs && ` @ ${workoutData.weight_lbs} lbs`}
                    {workoutData?.duration_min && ` for ${workoutData.duration_min} minutes`}
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-hashim-600 hover:bg-hashim-700"
                  >
                    <Save size={16} className="mr-1" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
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
        )}
      </DialogContent>
    </Dialog>
  );
}
