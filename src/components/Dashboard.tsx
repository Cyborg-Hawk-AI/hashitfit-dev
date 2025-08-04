
import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";

// Import new dashboard components
import { DailyOverviewCard } from "@/components/dashboard/DailyOverviewCard";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { DailyWorkoutSummaryCard } from "@/components/dashboard/DailyWorkoutSummaryCard";
import { NutritionProgressCard } from "@/components/dashboard/NutritionProgressCard";
import { AICoachTipCard } from "@/components/dashboard/AICoachTipCard";
import { WeeklyMomentumCard } from "@/components/dashboard/WeeklyMomentumCard";

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedWorkout } from "@/hooks/useSelectedWorkout";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

export function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [cardStates, setCardStates] = useState({
    workoutSummary: false,
    nutrition: false
  });
  
  const { user } = useUser();
  
  // Custom hooks for data and functionality
  const { 
    weeklyWorkouts, 
    workoutSchedules, 
    isLoadingSchedules, 
    startOfCurrentWeek, 
    today 
  } = useDashboardData();
  
  const { scheduleWorkoutMutation, completeExerciseMutation } = useDashboardMutations();
  
  const {
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
  } = useDashboardHandlers();
  
  // Get the current week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  // Get the selected date
  const selectedDateIndex = weekDates.findIndex(date => 
    format(date, 'EEEE').toLowerCase() === selectedDay.toLowerCase()
  );
  const selectedDate = selectedDateIndex !== -1 ? weekDates[selectedDateIndex] : today;
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const { selectedWorkout, isLoadingSelectedWorkout } = useSelectedWorkout(selectedDateString, workoutSchedules || []);

  const handleWorkoutSelected = (workout: any) => {
    if (!workout || !workout.id) {
      return;
    }
    
    console.log(`Selected workout: ${workout.id}`);
    scheduleWorkoutMutation.mutate({
      workout_plan_id: workout.id,
      scheduled_date: selectedDateString
    });
    
    setShowAddWorkout(false);
  };

  const handleCompleteExercise = (exerciseId: string, exerciseName: string, completed: boolean) => {
    if (!selectedWorkout || !selectedWorkout.schedule_id) {
      return;
    }

    completeExerciseMutation.mutate({
      scheduleId: selectedWorkout.schedule_id,
      exerciseId,
      exerciseName,
      completed,
      allExercises: selectedWorkout.exercises,
      workoutSchedules: workoutSchedules || []
    });
  };

  const toggleCardCollapse = (cardKey: keyof typeof cardStates) => {
    setCardStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleSeeMoreTips = () => {
    console.log("Opening AI coach tips");
    // This would navigate to coach chat or tips modal
  };

  // Get today's workout data for the overview card
  const todayWorkoutData = selectedWorkout ? {
    title: selectedWorkout.title,
    duration: selectedWorkout.estimatedDuration || 45,
    isCompleted: selectedWorkout.is_completed
  } : undefined;

  // Get user name from profile
  const userName = user?.name || "Alex";

  return (
    <div className="max-w-lg mx-auto pb-20">
      {/* 🧠 Daily Focus Block */}
      <div className="mb-6">
        <DailyOverviewCard 
          userName={userName}
          todayWorkout={todayWorkoutData}
          mealsLogged={1}
          totalMeals={4}
          habitsCompleted={1}
          totalHabits={3}
          streakDays={3}
          onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
          onSnapMeal={handleSnapMeal}
          onViewHabits={handleViewHabits}
        />
      </div>

      {/* 📥 Logging Actions Block */}
      <div className="mb-6">
        <QuickActionsWidget 
          onLogWorkout={handleLogWorkoutVoice}
          onLogMeal={handleSnapMeal}
        />
      </div>

      {/* 🧠 AI Coach Tip - Today's Focus */}
      <div className="mb-6">
        <AICoachTipCard onSeeMoreTips={handleSeeMoreTips} />
      </div>

      {/* 📈 Weekly Momentum Tracker */}
      <div className="mb-6">
        <WeeklyMomentumCard />
      </div>

      {/* 📊 Stats + Coaching Block */}
      <div className="bg-gray-50/50 dark:bg-gray-900/20 rounded-xl p-4 mb-6">
        <div className="space-y-3">
          {/* Workout Today Card */}
          <DailyWorkoutSummaryCard 
            isCollapsed={cardStates.workoutSummary}
            onToggleCollapse={() => toggleCardCollapse('workoutSummary')}
            workoutData={selectedWorkout}
            onContinueWorkout={handleContinueWorkout}
            onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
            onCompleteExercise={handleCompleteExercise}
            onGenerateWorkout={handleGenerateWorkout}
            onAddWorkout={() => setShowAddWorkout(true)}
            isLoading={isLoadingSelectedWorkout}
          />
          
          {/* Nutrition Today */}
          <NutritionProgressCard 
            isCollapsed={cardStates.nutrition}
            onToggleCollapse={() => toggleCardCollapse('nutrition')}
            onLogMeal={handleSnapMeal}
          />
        </div>
      </div>
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={selectedDay}
      />
    </div>
  );
}
