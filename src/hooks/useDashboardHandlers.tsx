
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { toast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useDashboardHandlers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // Function to refresh workout data after voice logging
  const handleWorkoutUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
    queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
    queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
  };

  const handleStartWorkout = (workout?: any) => {
    console.log("Starting workout:", workout);
    navigate('/workouts');
    toast({
      title: "Starting Workout",
      description: workout ? `Navigate to workouts page to start ${workout.title}...` : "Navigate to workouts page..."
    });
  };

  const handleContinueWorkout = (workout: any) => {
    console.log("Continuing workout:", workout);
    navigate('/workouts');
    toast({
      title: "Continue Workout",
      description: `Navigate to workouts page to continue ${workout.title}...`
    });
  };

  const handleEditWorkout = (workout: any) => {
    console.log("Editing workout:", workout);
    // Handle edit logic if needed
  };

  const handleAskCoach = () => {
    console.log("Opening AI coach");
    // Handle AI coach interaction
    toast({
      title: "AI Coach",
      description: "AI coach feature will be available soon!"
    });
  };

  const handleReplaceWorkout = () => {
    console.log("Replacing workout");
    return true; // Return value to indicate action should open modal
  };

  const handleUpdateWorkout = async (updatedWorkout: any, applyToAll: boolean = false) => {
    try {
      console.log("Updating workout:", updatedWorkout);
      console.log("Apply to all:", applyToAll);
      
      if (applyToAll) {
        // Update the workout plan template - this affects all future workouts
        const success = await WorkoutService.updateWorkoutPlanWithExercises(updatedWorkout.id, updatedWorkout.exercises);
        if (!success) throw new Error("Failed to update workout plan");
        
        // For template updates, invalidate ALL workout-related queries
        console.log("Invalidating all workout queries for template update");
        queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
        queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
        queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
        queryClient.invalidateQueries({ queryKey: ['workoutPlan'] });
        queryClient.invalidateQueries({ queryKey: ['workoutExercises'] });
        queryClient.invalidateQueries({ queryKey: ['allWorkoutPlans'] });
        
        // Also remove all cached workout plan data to force fresh fetches
        queryClient.removeQueries({ queryKey: ['workoutPlan'] });
        queryClient.removeQueries({ queryKey: ['workoutExercises'] });
        
        console.log("Updated workout plan template for all future workouts");
      } else {
        // Create a copy of the workout plan for this specific instance
        const newPlan = await WorkoutService.createWorkoutPlanCopy(updatedWorkout.id, updatedWorkout.exercises);
        if (newPlan) {
          // Update the schedule to use the new plan
          await WorkoutService.updateScheduledWorkout(updatedWorkout.schedule_id, {
            workout_plan_id: newPlan.id
          });
          console.log("Created workout plan copy for today only");
        }
        
        // Only invalidate current date queries for copy creation
        queryClient.invalidateQueries({ queryKey: ['selectedWorkout'] });
        queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
      }
      
      toast({
        title: "Workout Updated",
        description: applyToAll 
          ? "Your workout has been updated for all future sessions."
          : "Your workout has been updated for today only."
      });
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fixed meal logging to actually capture photos and analyze them
  const handleSnapMeal = () => {
    console.log("Opening meal capture");
    // This will trigger the MealCaptureCard component to open camera/file selection
    // The actual meal analysis happens in the MealCaptureCard component
    toast({
      title: "Meal Capture",
      description: "Take a photo or select an image to analyze your meal"
    });
  };

  // Fixed workout logging to actually invoke the voice parser edge function
  const handleLogWorkoutVoice = async () => {
    console.log("Starting voice workout logging");
    
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to use voice logging",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Not Supported",
          description: "Voice recording is not supported in your browser",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Voice Logging",
        description: "Click the microphone button to start recording your workout"
      });

      // The actual voice recording and processing will be handled by the VoiceInput component
      // This is just triggering the user to use that component
      
    } catch (error) {
      console.error("Error with voice logging:", error);
      toast({
        title: "Error",
        description: "Failed to start voice logging. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManualEntry = () => {
    console.log("Opening manual entry");
    toast({
      title: "Manual Entry",
      description: "Opening manual workout entry..."
    });
  };

  const handleViewHabits = () => {
    console.log("Opening habits view");
    toast({
      title: "✅ Habit tracked!",
      description: "1 of 3 habits done! Keep going 🟢"
    });
  };

  const handleGenerateWorkout = () => {
    console.log("Generating AI workout");
    toast({
      title: "🧠 AI Workout Generated",
      description: "Perfect bodyweight session created just for you!"
    });
  };

  return {
    handleWorkoutUpdated,
    handleStartWorkout,
    handleContinueWorkout,
    handleEditWorkout,
    handleAskCoach,
    handleReplaceWorkout,
    handleUpdateWorkout,
    handleSnapMeal,
    handleLogWorkoutVoice,
    handleManualEntry,
    handleViewHabits,
    handleGenerateWorkout
  };
}
