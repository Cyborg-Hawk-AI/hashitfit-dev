import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { WeeklyCalendarStrip } from "@/components/WeeklyCalendarStrip";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { AICoachBanner } from "@/components/AICoachBanner";
import { WeeklyAnalytics } from "@/components/WeeklyAnalytics";
import { PlanningFAB } from "@/components/PlanningFAB";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { InteractiveAssistantPanel } from "@/components/InteractiveAssistantPanel";
import { WeeklyTimelineView } from "@/components/WeeklyTimelineView";
import { EnhancedDailySummaryCard } from "@/components/EnhancedDailySummaryCard";
import { PrescriptiveWeeklySummary } from "@/components/PrescriptiveWeeklySummary";
import { ComingUpPreview } from "@/components/ComingUpPreview";
import { InteractiveGoalsCard } from "@/components/InteractiveGoalsCard";
import { Plus } from "lucide-react";

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const { toast } = useToast();
  const { userId } = useAuth();
  
  // Collapse state management
  const [collapsedSections, setCollapsedSections] = useState({
    aiAssistant: false,
    weeklyTimeline: false,
    dailySummary: false,
    weeklySummary: false
  });
  
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const [workoutDistribution, setWorkoutDistribution] = useState({
    upper: 2,
    lower: 1,
    cardio: 1,
    recovery: 0
  });
  
  const [suggestions, setSuggestions] = useState([
    { day: "Friday", title: "HIIT Day Friday", type: "cardio", reason: "Balance upper body focus" },
    { day: "Saturday", title: "Recovery Yoga", type: "recovery", reason: "Active recovery needed" }
  ]);

  const [weeklyGoals, setWeeklyGoals] = useState([
    { type: 'workouts' as const, label: 'Workouts', current: 3, target: 4 },
    { type: 'protein' as const, label: 'Protein Goal', current: 85, target: 120, unit: 'g/day' },
    { type: 'calories' as const, label: 'Daily Calories', current: 1800, target: 2000, unit: 'cal/day' }
  ]);

  const [weeklyTheme, setWeeklyTheme] = useState<string>('Consistency');
  const [momentumState, setMomentumState] = useState<'up' | 'steady' | 'down'>('up');

  useEffect(() => {
    if (!userId) return;
    
    const loadWeeklyData = async () => {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      
      try {
        // Load workout schedules
        const schedules = await WorkoutService.getWorkoutSchedule(userId, startStr, endStr);
        
        // Load nutrition logs for the week
        const nutritionSummary = await NutritionService.getNutritionalSummary(userId, startStr, endStr);
        
        // Process week data
        const processedWeekData = [];
        for (let i = 0; i < 7; i++) {
          const currentDate = addDays(weekStart, i);
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          const daySchedules = schedules.filter(s => s.scheduled_date === dateStr);
          const dayNutrition = nutritionSummary.find(n => n.log_date === dateStr);
          
          processedWeekData.push({
            date: currentDate,
            hasWorkout: daySchedules.length > 0,
            hasMeals: !!dayNutrition,
            calorieStatus: dayNutrition 
              ? (dayNutrition.total_calories > 2000 ? 'good' : dayNutrition.total_calories > 1500 ? 'warning' : 'poor')
              : 'none'
          });
        }
        
        setWeekData(processedWeekData);
        
        // Calculate weekly stats
        const completedWorkouts = schedules.filter(s => s.is_completed).length;
        const totalScheduled = schedules.length;
        const nutritionDays = nutritionSummary.length;
        
        setWeeklyStats({
          workoutCompletion: totalScheduled > 0 ? Math.round((completedWorkouts / totalScheduled) * 100) : 0,
          nutritionCompliance: Math.round((nutritionDays / 7) * 100),
          habitsCompleted: 12, // Mock data
          totalHabits: 21, // Mock data
          progressTrend: 'up',
          weeklyGoals: {
            workouts: { completed: completedWorkouts, target: 4 },
            calories: { avg: 1800, target: 2000 },
            protein: { avg: 120, target: 150 }
          }
        });
        
      } catch (error) {
        console.error("Error loading weekly data:", error);
      }
    };
    
    loadWeeklyData();
  }, [userId, selectedDate]);
  
  // Load selected day data
  useEffect(() => {
    if (!userId) return;
    
    const loadDayData = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        // Load workout for the day
        const schedules = await WorkoutService.getWorkoutSchedule(userId, dateStr, dateStr);
        let workout = null;
        
        if (schedules.length > 0) {
          const schedule = schedules[0];
          const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
          const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
          
          if (workoutPlan) {
            workout = {
              id: workoutPlan.id,
              title: workoutPlan.title,
              duration: 45,
              bodyFocus: workoutPlan.target_muscles || ['Full Body'],
              isCompleted: schedule.is_completed,
              exercises: exercises.length
            };
          }
        }
        
        // Load meals for the day
        const mealLogs = await NutritionService.getMealLogsForDate(userId, dateStr);
        
        // Mock habits data
        const habits = [
          { id: '1', name: 'Water Intake', isCompleted: true, target: 8, current: 6, unit: 'glasses' },
          { id: '2', name: 'Sleep 8 hours', isCompleted: false },
          { id: '3', name: 'Take Vitamins', isCompleted: true },
        ];
        
        setSelectedDayData({
          workout,
          meals: mealLogs || [],
          habits
        });
        
      } catch (error) {
        console.error("Error loading day data:", error);
      }
    };
    
    loadDayData();
  }, [userId, selectedDate]);
  
  // Generate AI insights
  useEffect(() => {
    const insights = [
      {
        type: 'suggestion',
        title: 'Muscle Balance',
        message: "You've focused on upper body this week. Consider adding a leg workout tomorrow.",
        action: 'Add Leg Day'
      },
      {
        type: 'warning',
        title: 'Protein Goal',
        message: "You've been under your protein target for 3 days. Would you like meal suggestions?",
        action: 'View Protein-Rich Meals'
      }
    ];
    
    setAIInsights(insights);
  }, []);

  const handleOptimizeWeek = async () => {
    toast({
      title: "AI Coach Optimization",
      description: "Analyzing your week and generating personalized recommendations...",
    });
    
    // Simulate AI analysis
    setTimeout(() => {
      setSuggestions([
        { day: "Thursday", title: "Lower Body Strength", type: "strength", reason: "Balance upper body focus" },
        { day: "Friday", title: "Active Recovery Walk", type: "recovery", reason: "Prevent overtraining" },
        { day: "Sunday", title: "HIIT Cardio", type: "cardio", reason: "Boost weekly cardio" }
      ]);
    }, 2000);
  };

  const handleAutoPlanWeek = async (difficulty: string) => {
    toast({
      title: "Auto-Planning Week",
      description: `Generating a ${difficulty} 4-day plan based on your goals...`,
    });
    
    // Simulate AI plan generation
    setTimeout(() => {
      toast({
        title: "Week Auto-Planned!",
        description: "Your personalized 4-day workout plan is ready.",
      });
    }, 3000);
  };
  
  const handleApplySuggestions = (appliedSuggestions: any[]) => {
    toast({
      title: "Week Optimized!",
      description: `Applied ${appliedSuggestions.length} workout suggestions to your schedule.`,
    });
    // TODO: Apply suggestions to actual schedule
  };

  const handleSwapDay = (type: string) => {
    toast({
      title: "Workout Type Selected",
      description: `${type} workout will be added to ${format(selectedDate, 'MMM d')}.`,
    });
    // TODO: Implement workout type assignment
  };

  const handleUpdateGoal = (type: string, newTarget: number) => {
    setWeeklyGoals(prev => 
      prev.map(goal => 
        goal.type === type ? { ...goal, target: newTarget } : goal
      )
    );
    toast({
      title: "Goal Updated",
      description: `Updated ${type} target to ${newTarget}.`,
    });
  };

  const handleSetWeeklyTheme = (theme: string) => {
    setWeeklyTheme(theme);
    toast({
      title: "Weekly Focus Set",
      description: `This week's theme: ${theme}`,
    });
  };

  const handleAddAnotherSession = () => {
    toast({
      title: "Additional Session",
      description: "Adding another workout session to your day!",
    });
  };

  const handlePreLogMeal = (date: Date) => {
    toast({
      title: "Pre-logging Meals",
      description: `Pre-logging meals for ${format(date, 'MMM d')}`,
    });
  };

  const handleScanPlate = () => {
    toast({
      title: "Meal Scanning",
      description: "Camera feature coming soon!",
    });
  };

  const handleUseTemplate = () => {
    toast({
      title: "Meal Templates",
      description: "Template selection coming soon!",
    });
  };

  const handleAskCoach = () => {
    toast({
      title: "AI Coach",
      description: "Coach consultation feature coming soon!",
    });
  };

  const handleDismissInsight = (index: number) => {
    setAIInsights(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddWorkout = () => {
    setShowAddWorkout(true);
  };
  
  const handleAddNutrition = () => {
    toast({
      title: "Add Nutrition Plan",
      description: "Nutrition planning feature coming soon!",
    });
  };
  
  const handleWorkoutSelected = (workout: any) => {
    // TODO: Implement workout scheduling logic
    setShowAddWorkout(false);
    toast({
      title: "Workout Scheduled",
      description: `${workout.title} has been added to ${format(selectedDate, 'MMM d')}.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Compressed header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-between items-center">
          <Logo />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Planner</h1>
        </div>
      </header>
      
      {/* Compressed calendar */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-border">
        <WeeklyCalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          weekData={weekData}
        />
      </div>
      
      <main className="pt-4 px-4 pb-32 max-w-lg mx-auto space-y-6">
        {/* Interactive AI Assistant Panel */}
        <InteractiveAssistantPanel
          workoutDistribution={workoutDistribution}
          suggestions={suggestions}
          onOptimizeWeek={handleOptimizeWeek}
          onApplySuggestions={handleApplySuggestions}
          onAutoPlanWeek={handleAutoPlanWeek}
          isCollapsed={collapsedSections.aiAssistant}
          onToggleCollapse={() => toggleSection('aiAssistant')}
        />
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Weekly Timeline View */}
        <WeeklyTimelineView
          weekData={weekData.map(day => ({
            date: day.date,
            workoutTitle: day.hasWorkout ? "Upper Body Strength" : undefined,
            workoutType: day.hasWorkout ? 'strength' : 'rest',
            mealsLogged: day.hasMeals ? 3 : 0,
            mealGoal: 4,
            habitCompletion: Math.floor(Math.random() * 100),
            isToday: day.date.toDateString() === new Date().toDateString()
          }))}
          selectedDate={selectedDate}
          onDaySelect={setSelectedDate}
          onAddWorkout={handleAddWorkout}
          isCollapsed={collapsedSections.weeklyTimeline}
          onToggleCollapse={() => toggleSection('weeklyTimeline')}
        />
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Enhanced Daily Summary */}
        {selectedDayData && (
          <EnhancedDailySummaryCard
            date={selectedDate}
            workout={selectedDayData.workout}
            meals={selectedDayData.meals}
            habits={selectedDayData.habits}
            onAddWorkout={handleAddWorkout}
            onEditWorkout={(workout) => {
              toast({
                title: "Edit Workout",
                description: "Workout editing feature coming soon!",
              });
            }}
            onAddMeal={handleAddNutrition}
            onScanPlate={handleScanPlate}
            onUseTemplate={handleUseTemplate}
            onAskCoach={handleAskCoach}
            onSwapDay={handleSwapDay}
            onAddAnotherSession={handleAddAnotherSession}
            onPreLogMeal={handlePreLogMeal}
            isCollapsed={collapsedSections.dailySummary}
            onToggleCollapse={() => toggleSection('dailySummary')}
          />
        )}
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Prescriptive Weekly Summary */}
        {weeklyStats && (
          <PrescriptiveWeeklySummary
            coachMessage="Your nutrition slipped this week. Let's aim for 3 of 4 meals tomorrow."
            weeklyGoals={weeklyGoals}
            mostConsistentHabit="Water Intake"
            calorieBalance={-200}
            momentumState={momentumState}
            weeklyTheme={weeklyTheme}
            onUpdateGoal={handleUpdateGoal}
            onSetWeeklyTheme={handleSetWeeklyTheme}
            isCollapsed={collapsedSections.weeklySummary}
            onToggleCollapse={() => toggleSection('weeklySummary')}
          />
        )}
      </main>
      
      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border p-4 z-40">
        <div className="max-w-lg mx-auto flex gap-2">
          <Button
            onClick={handleAddWorkout}
            className="flex-1 bg-hashim-600 hover:bg-hashim-700 transition-colors duration-200"
            size="sm"
          >
            <Plus size={14} className="mr-1" />
            Add Workout
          </Button>
          <Button
            onClick={handleAddNutrition}
            variant="outline"
            className="flex-1 hover:bg-hashim-50 transition-colors duration-200"
            size="sm"
          >
            <Plus size={14} className="mr-1" />
            Add Meal
          </Button>
          <Button
            onClick={handleAskCoach}
            variant="outline"
            className="px-3 hover:bg-purple-50 transition-colors duration-200"
            size="sm"
          >
            Ask Coach
          </Button>
        </div>
      </div>
      
      <NavigationBar />
      <ChatFAB />
      
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        onAddWorkout={handleWorkoutSelected}
        selectedDay={format(selectedDate, 'EEEE')}
      />
    </div>
  );
}
