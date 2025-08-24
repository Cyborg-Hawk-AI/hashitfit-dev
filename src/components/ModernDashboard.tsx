import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";

// Import existing components
// import { WeeklyTimelineView } from "@/components/WeeklyTimelineView";

// Import modern components
import { HeroCTACard } from "@/components/dashboard/modern/HeroCTACard";
import { DailySnapshotRing } from "@/components/dashboard/modern/DailySnapshotRing";
import { StreakMomentumBadge } from "@/components/dashboard/modern/StreakMomentumBadge";
import { AIInsightTile } from "@/components/dashboard/modern/AIInsightTile";
import { DailyItemsList } from "@/components/dashboard/modern/DailyItemsList";
import { WeightProgressCard } from "@/components/dashboard/modern/WeightProgressCard";
import { GamificationCard } from "@/components/dashboard/modern/GamificationCard";

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSelectedWorkout } from "@/hooks/useSelectedWorkout";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useAICoach } from "@/hooks/useAICoach";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProgressService } from "@/lib/supabase/services/ProgressService";

export function ModernDashboard() {
  // For Dashboard, we always want to show today's workout by default
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Initialize to start of current week (Monday)
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  
  // Add collapse state management
  const [collapsedSections, setCollapsedSections] = useState({
    completedToday: false,
    winsThisWeek: false,
    weightProgress: false,
    aiInsights: false
  });
  
  const { user } = useUser();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const { generateNewRecommendations } = useAICoach();
  
  // Custom hooks for data and functionality
  const { 
    weeklyWorkouts, 
    workoutSchedules, 
    nutritionProgress,
    currentNutritionPlan,
    streakData,
    completedItems,
    pendingItems,
    weeklyWorkoutLogs,
    weeklyNutritionLogs,
    weeklyHabitScores,
    isLoadingSchedules, 
    isLoadingNutrition,
    isLoadingTodayNutrition,
    isLoadingStreaks,
    isLoadingTodayWorkouts,
    isLoadingTodayNutritionLogs,
    isLoadingWeeklyWorkouts,
    isLoadingWeeklyNutrition,
    isLoadingWeeklyHabits,
    isLoadingTodayScheduled,
    isLoadingMealPlans,
    startOfCurrentWeek, 
    today 
  } = useDashboardData();
  
  const { scheduleWorkoutMutation, completeExerciseMutation } = useDashboardMutations();

  // Handle item completion
  const handleCompleteItem = async (item: any) => {
    console.log('Completing item:', item);
    
    const processingKey = `${item.type}-${item.workoutPlanId || item.mealPlanId}`;
    setProcessingItems(prev => new Set(prev).add(processingKey));
    
    try {
      if (item.type === 'workout') {
        // For workouts, we need to create a workout log
        if (item.workoutPlanId) {
          console.log('Completing workout:', item.workoutPlanId);
          
          // Create a workout log entry
          const workoutLog = {
            user_id: userId,
            workout_plan_id: item.workoutPlanId,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration: 45, // Default duration
            calories_burned: 300, // Default calories
            rating: 4, // Default rating
            notes: 'Completed via dashboard'
          };
          
          const result = await WorkoutService.logWorkout(workoutLog, []);
          if (result) {
            console.log('Workout logged successfully:', result);
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(['todayWorkoutLogs']);
            queryClient.invalidateQueries(['workoutSchedules']);
            queryClient.invalidateQueries(['weeklyWorkoutLogs']);
            queryClient.invalidateQueries(['weeklyHabitScores']);
            
            // Generate new recommendations based on updated progress
            setTimeout(() => {
              generateNewRecommendations();
            }, 1000); // Small delay to ensure data is updated
          }
        }
      } else if (item.type === 'meal') {
        // For meals, we need to create a meal log
        if (item.mealPlanId) {
          console.log('Completing meal:', item.mealPlanId);
          
          try {
            // First, get the actual meal plan data to get real nutritional values
            const mealPlans = await NutritionService.getMealPlans(currentNutritionPlan?.id || '');
            const mealPlan = mealPlans.find(plan => plan.id === item.mealPlanId);
            
            if (!mealPlan) {
              console.error('Meal plan not found:', item.mealPlanId);
              return;
            }
            
            console.log('Found meal plan with nutritional data:', mealPlan);
            
            // Get or create nutrition log for today
            const todayString = format(today, 'yyyy-MM-dd');
            let nutritionLog = await NutritionService.getNutritionLog(userId, todayString);
            
            if (!nutritionLog) {
              // Create new nutrition log for today
              const nutritionLogId = await NutritionService.createOrUpdateNutritionLog({
                user_id: userId,
                log_date: todayString,
                total_calories: 0,
                total_protein_g: 0,
                total_carbs_g: 0,
                total_fat_g: 0
              });
              nutritionLog = await NutritionService.getNutritionLog(userId, todayString);
            }
            
            if (nutritionLog?.id) {
              // Create meal log entry with real nutritional values
              const mealLog = {
                nutrition_log_id: nutritionLog.id,
                meal_type: item.mealType || mealPlan.meal_type || 'snack',
                meal_title: item.name || mealPlan.meal_title,
                calories: mealPlan.calories || 300,
                protein_g: mealPlan.protein_g || 20,
                carbs_g: mealPlan.carbs_g || 30,
                fat_g: mealPlan.fat_g || 10,
                consumed_at: new Date().toISOString(),
                notes: 'Logged via dashboard'
              };
              
              console.log('Creating meal log with nutritional data:', mealLog);
              
              const result = await NutritionService.logMeal(mealLog);
              if (result) {
                console.log('Meal logged successfully:', result);
                
                // Wait a moment for the totals to be updated
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Update the nutrition log totals
                const updatedNutritionLog = await NutritionService.getNutritionLog(userId, todayString);
                if (updatedNutritionLog) {
                  console.log('Updated nutrition log totals:', {
                    calories: updatedNutritionLog.total_calories,
                    protein: updatedNutritionLog.total_protein_g,
                    carbs: updatedNutritionLog.total_carbs_g,
                    fat: updatedNutritionLog.total_fat_g
                  });
                } else {
                  console.log('No updated nutrition log found');
                }
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries(['todayNutritionLogs']);
                queryClient.invalidateQueries(['todayNutritionLog']);
                queryClient.invalidateQueries(['currentMealPlans']);
                queryClient.invalidateQueries(['weeklyNutritionLogs']);
                queryClient.invalidateQueries(['weeklyHabitScores']);
                
                console.log('Queries invalidated, data should refresh');
                
                // Generate new recommendations based on updated progress
                setTimeout(() => {
                  generateNewRecommendations();
                }, 1000); // Small delay to ensure data is updated
              } else {
                console.log('Failed to log meal');
              }
            }
          } catch (error) {
            console.error('Error completing meal with nutritional data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error completing item:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(processingKey);
        return newSet;
      });
    }
  };

  const handleUncompleteItem = async (item: any) => {
    console.log('Uncompleting item:', item);
    
    const processingKey = `${item.type}-${item.workoutLogId || item.mealLogId}`;
    setProcessingItems(prev => new Set(prev).add(processingKey));
    
    try {
      if (item.type === 'workout' && item.workoutLogId) {
        // Delete workout log
        const result = await WorkoutService.deleteWorkoutLog(item.workoutLogId);
        if (result) {
          console.log('Workout log deleted successfully');
          queryClient.invalidateQueries(['todayWorkoutLogs']);
          queryClient.invalidateQueries(['workoutSchedules']);
          queryClient.invalidateQueries(['weeklyWorkoutLogs']);
          queryClient.invalidateQueries(['weeklyHabitScores']);
        }
      } else if (item.type === 'meal' && item.mealLogId) {
        // Delete meal log
        const result = await NutritionService.deleteMealLog(item.mealLogId);
        if (result) {
          console.log('Meal log deleted successfully');
          
          // Get updated nutrition log totals after deletion
          const todayString = format(today, 'yyyy-MM-dd');
          const updatedNutritionLog = await NutritionService.getNutritionLog(userId, todayString);
          if (updatedNutritionLog) {
            console.log('Updated nutrition log totals after deletion:', {
              calories: updatedNutritionLog.total_calories,
              protein: updatedNutritionLog.total_protein_g,
              carbs: updatedNutritionLog.total_carbs_g,
              fat: updatedNutritionLog.total_fat_g
            });
          }
          
          queryClient.invalidateQueries(['todayNutritionLogs']);
          queryClient.invalidateQueries(['todayNutritionLog']);
          queryClient.invalidateQueries(['currentMealPlans']);
          queryClient.invalidateQueries(['weeklyNutritionLogs']);
          queryClient.invalidateQueries(['weeklyHabitScores']);
          
          // Generate new recommendations based on updated progress
          setTimeout(() => {
            generateNewRecommendations();
          }, 1000); // Small delay to ensure data is updated
        }
      }
    } catch (error) {
      console.error('Error uncompleting item:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(processingKey);
        return newSet;
      });
    }
  };

  // Manual refresh function for debugging
  const handleRefreshNutrition = () => {
    console.log('Manual refresh triggered');
    queryClient.invalidateQueries(['todayNutritionLog']);
    queryClient.invalidateQueries(['todayNutritionLogs']);
    queryClient.invalidateQueries(['currentMealPlans']);
    queryClient.invalidateQueries(['weeklyNutritionLogs']);
    queryClient.invalidateQueries(['weeklyHabitScores']);
  };

  // Manual refresh function for weekly timeline
  const handleRefreshWeeklyTimeline = () => {
    console.log('Weekly timeline refresh triggered');
    queryClient.invalidateQueries(['weeklyNutritionLogs']);
    queryClient.invalidateQueries(['weeklyHabitScores']);
    queryClient.invalidateQueries(['weeklyWorkoutLogs']);
  };
  
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

  // Find the next scheduled workout (for when there's no workout today)
  const findNextWorkout = async () => {
    if (!workoutSchedules || workoutSchedules.length === 0) return null;
    
    const todayString = format(today, 'yyyy-MM-dd');
    const sortedSchedules = workoutSchedules
      .filter(schedule => schedule.scheduled_date > todayString)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
    
    if (sortedSchedules.length === 0) return null;
    
    const nextSchedule = sortedSchedules[0];
    const nextDate = new Date(nextSchedule.scheduled_date);
    const dayName = format(nextDate, 'EEEE');
    const dateDisplay = format(nextDate, 'MMM d');
    
    // Try to fetch the workout plan directly
    let workoutPlan = null;
    try {
      workoutPlan = await WorkoutService.getWorkoutPlanById(nextSchedule.workout_plan_id);
      console.log('🔍 Direct fetch workout plan:', workoutPlan);
    } catch (error) {
      console.error('🔍 Error in direct fetch:', error);
    }
    
    return {
      schedule: nextSchedule,
      dayName,
      dateDisplay,
      isTomorrow: format(nextDate, 'yyyy-MM-dd') === format(addDays(today, 1), 'yyyy-MM-dd'),
      workoutPlanId: nextSchedule.workout_plan_id,
      workoutPlan
    };
  };

  const [nextWorkout, setNextWorkout] = useState(null);

  // Fetch next workout when workoutSchedules changes
  useEffect(() => {
    const fetchNextWorkout = async () => {
      const result = await findNextWorkout();
      setNextWorkout(result);
    };
    
    if (workoutSchedules) {
      fetchNextWorkout();
    }
  }, [workoutSchedules]);

  // We're now fetching the workout plan directly in findNextWorkout
  const isLoadingNextWorkoutPlan = false;
  const nextWorkoutPlanError = null;

  // Debug logging for next workout
  console.log('🔍 Next Workout Debug:', {
    nextWorkout,
    nextWorkoutPlanId: nextWorkout?.workoutPlanId,
    nextWorkoutPlan: nextWorkout?.workoutPlan,
    nextWorkoutPlanTitle: nextWorkout?.workoutPlan?.title,
    workoutSchedulesCount: workoutSchedules?.length || 0,
    workoutSchedules: workoutSchedules
  });

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

  // Add toggle function for collapse states
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // User data available if needed for other components
  const userName = user?.name || "Alex";

  // Generate real weekly data starting from Monday
  const generateWeeklyData = () => {
    // Use the current week start state
    const weekStart = currentWeekStart;
    
    // Generate week dates starting from Monday
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    // Debug logging
    console.log('🔍 Weekly Timeline Debug:', {
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      today: format(today, 'yyyy-MM-dd'),
      workoutSchedules: workoutSchedules,
      weeklyWorkoutLogs: weeklyWorkoutLogs,
      weeklyNutritionLogs: weeklyNutritionLogs,
      weeklyHabitScores: weeklyHabitScores,
      weekDates: weekDates.map(d => format(d, 'yyyy-MM-dd')),
      isCurrentWeek: weekDates.some(d => format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    });
    
    // Debug: Check weekly nutrition logs in detail
    if (weeklyNutritionLogs) {
      console.log('🔍 Weekly Nutrition Logs Details:');
      weeklyNutritionLogs.forEach((log, index) => {
        console.log(`  Log ${index}:`, {
          date: log.log_date,
          mealCount: log.meal_logs?.length || 0,
          meals: log.meal_logs
        });
      });
    }
    
    return weekDates.map((date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      
      // Find scheduled workout for this date
      const scheduledWorkout = workoutSchedules?.find(schedule => 
        schedule.scheduled_date === dateString
      );
      
      // Find completed workout for this date (from weekly data)
      const completedWorkout = weeklyWorkoutLogs?.find(log => 
        format(new Date(log.start_time), 'yyyy-MM-dd') === dateString
      );
      
      // Find nutrition log for this date (from weekly data)
      const nutritionLog = weeklyNutritionLogs?.find(log => {
        const logDate = log.log_date;
        console.log(`🔍 Comparing dates: ${logDate} === ${dateString}`, logDate === dateString);
        return logDate === dateString;
      });
      
      // Debug logging for each day
      console.log(`🔍 Day ${format(date, 'EEEE')} (${dateString}):`, {
        scheduledWorkout,
        completedWorkout,
        nutritionLog,
        nutritionLogMealCount: nutritionLog?.meal_logs?.length || 0,
        nutritionLogMeals: nutritionLog?.meal_logs,
        habitScore: weeklyHabitScores?.[dateString],
        scheduledWorkoutTitle: scheduledWorkout?.workout_plans?.title,
        completedWorkoutTitle: completedWorkout?.workout_plans?.title
      });
      
      // Count meals logged for this date
      const mealsLogged = nutritionLog?.meal_logs?.length || 0;
      const mealGoal = 4; // Default meal goal
      
      // Get habit score for this date
      const habitScore = weeklyHabitScores?.[dateString];
      const habitCompletion = habitScore?.totalScore || 0;
      
      return {
        date,
        workoutTitle: scheduledWorkout?.workout_plans?.title || completedWorkout?.workout_plans?.title,
        workoutType: scheduledWorkout?.workout_plans?.category || completedWorkout?.workout_plans?.category || 'rest',
        mealsLogged,
        mealGoal,
        habitCompletion,
        isToday,
        isCompleted: !!completedWorkout,
        isScheduled: !!scheduledWorkout,
        nutritionLog // Add this for meal expansion
      };
    });
  };

  // Week navigation functions
  const navigateToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const navigateToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const navigateToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Check if we should show current week or next week based on today's date
  useEffect(() => {
    const today = new Date();
    const currentWeekStartDate = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekEndDate = addDays(currentWeekStartDate, 6);
    
    // If today is in the current week, show current week
    // If today is past the current week, show next week
    if (today > currentWeekEndDate) {
      setCurrentWeekStart(addDays(currentWeekStartDate, 7));
    } else {
      setCurrentWeekStart(currentWeekStartDate);
    }
  }, []);

  // Generate weekly data whenever currentWeekStart changes
  const weeklyData = generateWeeklyData();
  
  // Debug logging for weekly data updates
  useEffect(() => {
    console.log('🔍 Weekly data updated for week starting:', format(currentWeekStart, 'yyyy-MM-dd'));
    console.log('🔍 Weekly data:', weeklyData);
    
    // Debug: Check if today's meals are being detected
    const todayString = format(today, 'yyyy-MM-dd');
    const todayData = weeklyData.find(day => format(day.date, 'yyyy-MM-dd') === todayString);
    console.log('🔍 Today\'s data in weekly timeline:', todayData);
    console.log('🔍 Today\'s meals logged:', todayData?.mealsLogged);
    console.log('🔍 Today\'s nutrition log:', todayData?.nutritionLog);
  }, [currentWeekStart, weeklyData, today]);

  // completedItems is now destructured from useDashboardData() above

  // Fetch real weight data
  const { data: weightData = [], isLoading: isLoadingWeightData } = useQuery({
    queryKey: ['weightProgressData', userId],
    queryFn: () => ProgressService.getWeightProgressData(userId!),
    enabled: !!userId,
  });

  // Fetch initial and current weight
  const { data: initialWeight } = useQuery({
    queryKey: ['initialWeight', userId],
    queryFn: () => ProgressService.getInitialWeight(userId!),
    enabled: !!userId,
  });

  const { data: currentWeight } = useQuery({
    queryKey: ['currentWeight', userId],
    queryFn: () => ProgressService.getCurrentWeight(userId!),
    enabled: !!userId,
  });

  // Generate dynamic coach insights based on real data
  const generateCoachInsights = () => {
    const calorieDeficit = nutritionProgress.caloriesTarget - nutritionProgress.caloriesConsumed;
    const proteinRatio = nutritionProgress.proteinConsumed / nutritionProgress.proteinTarget;
    const carbsRatio = nutritionProgress.carbsConsumed / nutritionProgress.carbsTarget;
    const fatRatio = nutritionProgress.fatConsumed / nutritionProgress.fatTarget;
    const weightChange = weightData.length >= 2 ? weightData[weightData.length - 1].value - weightData[0].value : 0;
    
    let insights = [];
    
    // Calorie analysis
    if (calorieDeficit > 200) {
      insights.push(`Strong ${calorieDeficit.toFixed(0)} calorie deficit today - great for weight loss!`);
    } else if (calorieDeficit > 0) {
      insights.push(`You're in a ${calorieDeficit.toFixed(0)} calorie deficit today`);
    } else if (calorieDeficit < -200) {
      insights.push(`You're ${Math.abs(calorieDeficit).toFixed(0)} calories over - consider adjusting portion sizes`);
    } else if (calorieDeficit < 0) {
      insights.push(`You're ${Math.abs(calorieDeficit).toFixed(0)} calories over your target`);
    } else {
      insights.push("You're hitting your calorie target perfectly");
    }
    
    // Protein analysis
    if (proteinRatio >= 0.9) {
      insights.push("Excellent protein intake - great for muscle preservation!");
    } else if (proteinRatio >= 0.7) {
      insights.push("Good protein intake, but could be higher for optimal results");
    } else if (proteinRatio >= 0.5) {
      insights.push("Protein intake is moderate - consider adding more lean protein sources");
    } else {
      insights.push("Consider increasing protein intake for better muscle support");
    }
    
    // Carbs analysis
    if (carbsRatio >= 0.8 && carbsRatio <= 1.2) {
      insights.push("Carb intake is well-balanced");
    } else if (carbsRatio < 0.5) {
      insights.push("Low carb intake - consider adding healthy carbs for energy");
    } else if (carbsRatio > 1.5) {
      insights.push("High carb intake - consider reducing refined carbs");
    }
    
    // Fat analysis
    if (fatRatio >= 0.7 && fatRatio <= 1.3) {
      insights.push("Fat intake is well-balanced");
    } else if (fatRatio < 0.5) {
      insights.push("Low fat intake - consider adding healthy fats");
    } else if (fatRatio > 1.5) {
      insights.push("High fat intake - consider reducing saturated fats");
    }
    
    // Weight trend analysis
    if (weightChange < -1.0) {
      insights.push("Significant weight loss trend - excellent progress!");
    } else if (weightChange < -0.5) {
      insights.push("Your weight is trending down - the deficit is working!");
    } else if (weightChange > 1.0) {
      insights.push("Weight is trending up significantly - consider reviewing your nutrition plan");
    } else if (weightChange > 0.5) {
      insights.push("Weight is trending up - consider adjusting your calorie intake");
    } else {
      insights.push("Weight is stable - good consistency!");
    }
    
    // Weekly consistency
    const weeklyWorkoutCount = streakData?.currentWeekStreak || 0;
    if (weeklyWorkoutCount >= 5) {
      insights.push("Amazing weekly consistency with workouts!");
    } else if (weeklyWorkoutCount >= 3) {
      insights.push("Good weekly activity - keep it up!");
    } else if (weeklyWorkoutCount >= 1) {
      insights.push("Some weekly activity - try to increase frequency");
    } else {
      insights.push("No workouts this week - consider adding some activity");
    }
    
    // Overall progress assessment
    const totalProgress = (nutritionProgress.caloriesConsumed / nutritionProgress.caloriesTarget) * 100;
    if (totalProgress >= 80 && totalProgress <= 120) {
      insights.push("Great overall nutrition balance today!");
    } else if (totalProgress < 50) {
      insights.push("Low overall intake - make sure you're eating enough");
    } else if (totalProgress > 150) {
      insights.push("High overall intake - consider portion control");
    }
    
    // Nutrition plan context
    if (currentNutritionPlan) {
      const planType = currentNutritionPlan.daily_calories > 2500 ? "bulking" : 
                      currentNutritionPlan.daily_calories < 1800 ? "cutting" : "maintenance";
      
      if (planType === "cutting" && calorieDeficit > 0) {
        insights.push("Perfect alignment with your cutting goals!");
      } else if (planType === "bulking" && calorieDeficit < 0) {
        insights.push("Great progress toward your bulking goals!");
      } else if (planType === "maintenance" && Math.abs(calorieDeficit) < 100) {
        insights.push("Excellent maintenance balance!");
      }
    }
    
    // Limit insights to prevent overwhelming the user
    const maxInsights = 6;
    if (insights.length > maxInsights) {
      insights = insights.slice(0, maxInsights);
    }
    
    return insights.join(". ") + ".";
  };

  const nutritionData = {
    dailyCalories: nutritionProgress.caloriesConsumed,
    targetCalories: nutritionProgress.caloriesTarget,
    protein: nutritionProgress.proteinConsumed,
    targetProtein: nutritionProgress.proteinTarget,
    carbs: nutritionProgress.carbsConsumed,
    targetCarbs: nutritionProgress.carbsTarget,
    fat: nutritionProgress.fatConsumed,
    targetFat: nutritionProgress.fatTarget,
    trendReason: generateCoachInsights()
  };

  const gamificationData = {
    streakDays: streakData?.workoutStreak || 0,
    latestBadge: {
      name: "First Meal Tracked",
      icon: "🍽️",
      earned: true
    },
    xpProgress: {
      current: 1240,
      target: 2000,
      level: 3
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Modern gradient background with enhanced pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent)]" />
      
      <div className="relative max-w-lg mx-auto pb-20">
        {/* Streak Header - Simplified top section */}
        <div className="px-4 pt-4 pb-2">
          <StreakMomentumBadge 
            streakDays={gamificationData.streakDays}
            nutritionStreak={streakData?.nutritionStreak || 0}
            longestStreak={Math.max(streakData?.longestWorkoutStreak || 0, streakData?.longestNutritionStreak || 0)}
            isLoading={isLoadingStreaks}
          />
        </div>

        {/* Hero CTA - Primary action above the fold */}
        <div className="px-4 mb-4">
          <HeroCTACard 
            workout={selectedWorkout}
            nextWorkout={nextWorkout}
            onStartWorkout={() => selectedWorkout && handleStartWorkout(selectedWorkout)}
            onAddWorkout={() => setShowAddWorkout(true)}
            isLoading={isLoadingSelectedWorkout}
            isLoadingNextWorkout={isLoadingNextWorkoutPlan}
          />
        </div>

        {/* AI Insight Tile - Motivational coaching */}
        <div className="px-4 mb-4">
          <AIInsightTile 
            isCollapsed={collapsedSections.aiInsights}
            onToggleCollapse={() => toggleSection('aiInsights')}
          />
        </div>

        {/* Today's Progress - Two-column layout for completed items and daily snapshot */}
        <div className="px-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DailyItemsList 
            completedItems={completedItems}
            pendingItems={pendingItems}
            isCollapsed={collapsedSections.completedToday}
            onToggleCollapse={() => toggleSection('completedToday')}
            isLoading={isLoadingTodayWorkouts || isLoadingTodayNutritionLogs || isLoadingTodayScheduled || isLoadingMealPlans}
            onCompleteItem={handleCompleteItem}
            onUncompleteItem={handleUncompleteItem}
            processingItems={processingItems}
          />
          <DailySnapshotRing 
            caloriesConsumed={nutritionProgress.caloriesConsumed}
            caloriesTarget={nutritionProgress.caloriesTarget}
            proteinConsumed={nutritionProgress.proteinConsumed}
            proteinTarget={nutritionProgress.proteinTarget}
            isLoading={isLoadingNutrition || isLoadingTodayNutrition}
            onRefresh={handleRefreshNutrition}
          />
        </div>

        {/* Your Wins This Week */}
        <div className="px-4 mb-4">
          <GamificationCard
            streakDays={gamificationData.streakDays}
            nutritionStreak={streakData?.nutritionStreak || 0}
            longestWorkoutStreak={streakData?.longestWorkoutStreak || 0}
            longestNutritionStreak={streakData?.longestNutritionStreak || 0}
            currentWeekStreak={streakData?.currentWeekStreak || 0}
            latestBadge={gamificationData.latestBadge}
            xpProgress={gamificationData.xpProgress}
            onViewAchievements={() => console.log('View achievements')}
            isCollapsed={collapsedSections.winsThisWeek}
            onToggleCollapse={() => toggleSection('winsThisWeek')}
          />
        </div>

        {/* Enhanced Weight Progress Card with Nutrition Context and Coach Insights */}
        <div className="px-4 mb-4">
          <WeightProgressCard
            currentWeight={currentWeight || undefined}
            startWeight={initialWeight || undefined}
            weightData={weightData}
            nutritionData={nutritionData}
            onAddWeight={() => console.log('Add weight modal')}
            isCollapsed={collapsedSections.weightProgress}
            onToggleCollapse={() => toggleSection('weightProgress')}
          />
        </div>

        {/* Bottom spacing for floating action buttons */}
        <div className="h-32"></div>

        {/* Weekly Overview - Hidden per user request */}
        {/* <div className="px-4 mb-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-slate-700/40 overflow-hidden">
            <WeeklyTimelineView
              weekData={weeklyData}
              selectedDate={selectedDate}
              onDaySelect={(date) => {
                const dayName = format(date, 'EEEE');
                setSelectedDay(dayName);
              }}
              onAddWorkout={() => setShowAddWorkout(true)}
              onPreviousWeek={navigateToPreviousWeek}
              onNextWeek={navigateToNextWeek}
              onCurrentWeek={navigateToCurrentWeek}
              currentWeekStart={currentWeekStart}
              isLoading={isLoadingWeeklyNutrition || isLoadingWeeklyHabits}
              onRefresh={handleRefreshWeeklyTimeline}
            />
          </div>
        </div> */}
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
