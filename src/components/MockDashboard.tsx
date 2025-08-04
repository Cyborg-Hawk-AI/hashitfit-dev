
import React, { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { MealCaptureCard } from "@/components/MealCaptureCard";
import { VoiceInput } from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { DayTab } from "@/components/DayTab";
import { AnimatedCard } from "@/components/ui-components";
import { WorkoutCardImproved } from "@/components/WorkoutCardImproved";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MockDataBanner } from "@/components/MockDataBanner";

// Import mock data hooks
import { 
  useMockSelectedWorkout, 
  useMockWorkoutSchedules, 
  useMockWeeklyWorkouts,
  useMockExerciseCompletion 
} from "@/hooks/useMockData";

// Import dashboard components
import { DailyWorkoutSummaryCard } from "@/components/dashboard/DailyWorkoutSummaryCard";
import { NutritionProgressCard } from "@/components/dashboard/NutritionProgressCard";
import { TDEEBalanceCard } from "@/components/dashboard/TDEEBalanceCard";
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { AICoachInsightCard } from "@/components/dashboard/AICoachInsightCard";

export function MockDashboard() {
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [cardStates, setCardStates] = useState({
    workoutSummary: false,
    nutrition: false,
    tdeeBalance: false,
    habitStreak: false,
    aiInsights: false
  });
  
  const today = new Date();
  const dateString = format(today, 'yyyy-MM-dd');
  
  // Get the current week dates
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  // Get the selected date
  const selectedDateIndex = weekDates.findIndex(date => 
    format(date, 'EEEE').toLowerCase() === selectedDay.toLowerCase()
  );
  const selectedDate = selectedDateIndex !== -1 ? weekDates[selectedDateIndex] : today;
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  // Mock data hooks
  const { weeklyWorkouts, isLoading: isLoadingWeekly } = useMockWeeklyWorkouts();
  const { workoutSchedules, isLoading: isLoadingSchedules } = useMockWorkoutSchedules();
  const { selectedWorkout, isLoading: isLoadingSelectedWorkout } = useMockSelectedWorkout(selectedDateString);
  const { completeExercise } = useMockExerciseCompletion();

  const handleDaySelect = (day: string) => {
    console.log(`Selected day: ${day}`);
    setSelectedDay(day);
  };

  const handleStartWorkout = (workout: any) => {
    console.log("Starting workout:", workout);
    toast({
      title: "Starting Workout",
      description: `Starting ${workout.title}...`
    });
  };

  const handleContinueWorkout = (workout: any) => {
    console.log("Continuing workout:", workout);
    toast({
      title: "Continue Workout",
      description: `Continuing ${workout.title}...`
    });
  };

  const handleCompleteExercise = (exerciseId: string, exerciseName: string, completed: boolean) => {
    if (!selectedWorkout || !selectedWorkout.schedule_id) {
      toast({
        title: "Error",
        description: "No workout selected.",
        variant: "destructive"
      });
      return;
    }

    completeExercise(selectedWorkout.schedule_id, exerciseId, completed);
    
    toast({
      title: "Progress Updated",
      description: `${exerciseName} marked as ${completed ? 'completed' : 'incomplete'}.`
    });
  };

  const handleEditWorkout = (workout: any) => {
    console.log("Editing workout:", workout);
    toast({
      title: "Edit Workout",
      description: "Workout editing feature will be available soon!"
    });
  };

  const handleAskCoach = () => {
    console.log("Opening AI coach");
    toast({
      title: "AI Coach",
      description: "AI coach feature will be available soon!"
    });
  };

  const handleReplaceWorkout = () => {
    console.log("Replacing workout");
    setShowAddWorkout(true);
    toast({
      title: "Replace Workout",
      description: "Workout replacement feature will be available soon!"
    });
  };

  const handleWorkoutUpdated = () => {
    console.log("Workout updated via voice input");
    toast({
      title: "Workout Updated",
      description: "Voice logging feature will be available soon!"
    });
  };

  const toggleCardCollapse = (cardKey: keyof typeof cardStates) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      <MockDataBanner />
      
      {/* Snap a Snack and Log your workout buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="h-16">
          <MealCaptureCard />
        </div>
        <div className="h-16">
          <VoiceInput 
            selectedWorkout={selectedWorkout}
            onWorkoutUpdated={handleWorkoutUpdated}
          />
        </div>
      </div>
      
      {/* Move DailyWorkoutSummaryCard here - right after the snap/log buttons */}
      <div className="mb-6">
        <DailyWorkoutSummaryCard 
          isCollapsed={cardStates.workoutSummary}
          onToggleCollapse={() => toggleCardCollapse('workoutSummary')}
          workoutData={selectedWorkout}
          onContinueWorkout={handleContinueWorkout}
          onStartWorkout={handleStartWorkout}
          onCompleteExercise={handleCompleteExercise}
          isLoading={isLoadingSelectedWorkout}
        />
      </div>
      
      <div className="space-y-4 mb-6">
        <NutritionProgressCard 
          isCollapsed={cardStates.nutrition}
          onToggleCollapse={() => toggleCardCollapse('nutrition')}
        />
        
        <TDEEBalanceCard 
          isCollapsed={cardStates.tdeeBalance}
          onToggleCollapse={() => toggleCardCollapse('tdeeBalance')}
        />
        
        <HabitStreakCard 
          isCollapsed={cardStates.habitStreak}
          onToggleCollapse={() => toggleCardCollapse('habitStreak')}
        />
        
        <AICoachInsightCard 
          isCollapsed={cardStates.aiInsights}
          onToggleCollapse={() => toggleCardCollapse('aiInsights')}
        />
      </div>
      
      <div className="flex flex-nowrap overflow-x-auto mb-6 pb-1 scrollbar-none">
        {weekDates.map((date, index) => {
          const dayName = format(date, 'EEEE');
          const dayNumber = format(date, 'd');
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isActive = dayName === selectedDay;
          const hasScheduledWorkout = workoutSchedules?.some(
            schedule => schedule.scheduled_date === format(date, 'yyyy-MM-dd')
          );
          
          return (
            <DayTab
              key={dayName}
              day={dayName}
              date={dayNumber}
              isActive={isActive}
              isToday={isToday}
              hasActivity={hasScheduledWorkout}
              onClick={() => handleDaySelect(dayName)}
            />
          );
        })}
      </div>
      
      <AnimatedCard className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Today's Workout</h3>
            <p className="text-sm text-muted-foreground">{selectedDay}</p>
          </div>
          {!selectedWorkout && !isLoadingSelectedWorkout && (
            <Button 
              size="sm" 
              className="bg-hashim-600 hover:bg-hashim-700 text-white"
              onClick={() => setShowAddWorkout(true)}
            >
              <Plus size={16} className="mr-1" />
              Add Workout
            </Button>
          )}
        </div>
        
        {isLoadingSelectedWorkout || isLoadingSchedules ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
          </div>
        ) : selectedWorkout ? (
          <WorkoutCardImproved 
            workout={selectedWorkout} 
            onStart={handleStartWorkout}
            onEdit={handleEditWorkout}
            onAskCoach={handleAskCoach}
            onReplaceWorkout={handleReplaceWorkout}
          />
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">No workout scheduled for {selectedDay}</p>
            <Button 
              variant="outline"
              onClick={() => setShowAddWorkout(true)}
              className="flex items-center mx-auto"
            >
              <Plus size={16} className="mr-1" />
              Add a workout
            </Button>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
