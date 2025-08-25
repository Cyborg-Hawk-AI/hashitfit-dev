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
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { ProgressService } from "@/lib/supabase/services/ProgressService";
import { format, startOfWeek, endOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { InteractiveAssistantPanel } from "@/components/InteractiveAssistantPanel";
// import { WeeklyTimelineView } from "@/components/WeeklyTimelineView";
import { EnhancedDailySummaryCard } from "@/components/EnhancedDailySummaryCard";
import { PrescriptiveWeeklySummary } from "@/components/PrescriptiveWeeklySummary";
import { ComingUpPreview } from "@/components/ComingUpPreview";
import { InteractiveGoalsCard } from "@/components/InteractiveGoalsCard";
import { EasyPlanModal } from "@/components/EasyPlanModal";
import { AddSecondaryWorkoutModal } from "@/components/AddSecondaryWorkoutModal";
import { SwapWorkoutModal } from "@/components/SwapWorkoutModal";
import { Plus, Loader2, Zap } from "lucide-react";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import supabase, { supabaseUrl } from "@/lib/supabase";

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [showEasyPlanModal, setShowEasyPlanModal] = useState(false);
  const [showAddSecondaryWorkoutModal, setShowAddSecondaryWorkoutModal] = useState(false);
  const [showSwapWorkoutModal, setShowSwapWorkoutModal] = useState(false);
  const [lastSwappedWorkoutId, setLastSwappedWorkoutId] = useState<string | null>(null);
  const { toast } = useToast();
  const { userId } = useAuth();
  const { scheduleWorkoutMutation } = useDashboardMutations();
  const queryClient = useQueryClient();
  
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
    upper: 0,
    lower: 0,
    cardio: 0,
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

  // Calculate workout distribution from current week's scheduled workouts
  const calculateWorkoutDistribution = async () => {
    if (!userId) return;

    try {
      const today = new Date();
      // Change to Sunday to Saturday week (weekStartsOn: 0)
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
      const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 0 });

      console.log('🔄 Calculating workout distribution for week:');
      console.log('📅 Today:', format(today, 'yyyy-MM-dd'));
      console.log('📅 Week start (Sunday):', format(startOfCurrentWeek, 'yyyy-MM-dd'));
      console.log('📅 Week end (Saturday):', format(endOfCurrentWeek, 'yyyy-MM-dd'));

      // Get current week's scheduled workouts
      const { data: scheduledWorkouts, error } = await supabase
        .from('workout_schedule')
        .select(`
          *,
          workout_plans(
            id,
            title,
            category,
            target_muscles
          )
        `)
        .eq('user_id', userId)
        .gte('scheduled_date', format(startOfCurrentWeek, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(endOfCurrentWeek, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled workouts:', error);
        return;
      }

      console.log('📋 Found scheduled workouts:', scheduledWorkouts?.length || 0);
      console.log('📋 Raw scheduled workouts:', scheduledWorkouts);

      // Initialize category counts
      const categoryCounts = {
        upper: 0,
        lower: 0,
        cardio: 0,
        recovery: 0
      };

      // Count workouts by category
      scheduledWorkouts?.forEach((scheduledWorkout) => {
        console.log('🏋️ Processing scheduled workout:', scheduledWorkout);
        const workoutPlan = scheduledWorkout.workout_plans;
        if (workoutPlan) {
          console.log('📋 Workout plan:', workoutPlan);
          const category = workoutPlan.category?.toLowerCase();
          console.log('🏷️ Category:', category);
          if (category) {
            // Map workout categories to our distribution categories
            if (category.includes('strength')) {
              // Check target muscles to determine if it's upper or lower body
              const targetMuscles = workoutPlan.target_muscles || [];
              const muscleGroups = targetMuscles.map(m => m.toLowerCase());
              const workoutTitle = workoutPlan.title?.toLowerCase() || '';
              console.log('💪 Target muscles:', targetMuscles);
              console.log('💪 Muscle groups (lowercase):', muscleGroups);
              console.log('📝 Workout title:', workoutTitle);
              
              // First try to categorize by target muscles
              if (muscleGroups.some(m => m.includes('leg') || m.includes('glute') || m.includes('quad') || m.includes('hamstring') || m.includes('calf'))) {
                console.log('🦵 Categorized as LOWER BODY (by target muscles)');
                categoryCounts.lower++;
              } else if (muscleGroups.some(m => m.includes('chest') || m.includes('back') || m.includes('shoulder') || m.includes('arm') || m.includes('bicep') || m.includes('tricep'))) {
                console.log('💪 Categorized as UPPER BODY (by target muscles)');
                categoryCounts.upper++;
              } else {
                // Fallback: categorize by workout title when target_muscles is empty
                if (workoutTitle.includes('lower') || workoutTitle.includes('leg') || workoutTitle.includes('squat') || workoutTitle.includes('deadlift')) {
                  console.log('🦵 Categorized as LOWER BODY (by title)');
                  categoryCounts.lower++;
                } else if (workoutTitle.includes('upper') || workoutTitle.includes('push') || workoutTitle.includes('pull') || workoutTitle.includes('chest') || workoutTitle.includes('back') || workoutTitle.includes('shoulder') || workoutTitle.includes('arm')) {
                  console.log('💪 Categorized as UPPER BODY (by title)');
                  categoryCounts.upper++;
                } else if (workoutTitle.includes('full') || workoutTitle.includes('total')) {
                  // Split full body workouts between upper and lower
                  console.log('💪 Categorized as UPPER BODY (full body default)');
                  categoryCounts.upper++;
                } else {
                  // Default to upper body for general strength workouts
                  console.log('💪 Categorized as UPPER BODY (default)');
                  categoryCounts.upper++;
                }
              }
            } else if (category.includes('cardio') || category.includes('hiit') || category.includes('endurance')) {
              console.log('🏃 Categorized as CARDIO');
              categoryCounts.cardio++;
            } else if (category.includes('recovery') || category.includes('flexibility') || category.includes('yoga')) {
              console.log('🧘 Categorized as RECOVERY');
              categoryCounts.recovery++;
            } else {
              // Default to upper body for unknown categories
              console.log('💪 Categorized as UPPER BODY (unknown category)');
              categoryCounts.upper++;
            }
          }
        }
      });

      // Update the workout distribution state
      setWorkoutDistribution(categoryCounts);
      console.log('Updated workout distribution:', categoryCounts);

    } catch (error) {
      console.error('Error calculating workout distribution:', error);
    }
  };

  // Data collection for AI optimization
  const collectOptimizationData = async (userId: string) => {
    const today = new Date();
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(today.getDate() - 4);
    
    // 1. Get user assessment data
    const assessment = await AssessmentService.getAssessment(userId);
    
    // 2. Get last 4 days of workout logs with detailed exercise data
    const { data: recentWorkoutLogs } = await supabase
      .from('workout_logs')
      .select(`
        *,
        workout_plans(title, description, category, target_muscles),
        exercise_logs(
          exercise_name,
          sets_completed,
          reps_completed,
          weight_used,
          rest_seconds,
          notes
        )
      `)
      .eq('user_id', userId)
      .gte('start_time', fourDaysAgo.toISOString())
      .lte('start_time', today.toISOString())
      .order('start_time', { ascending: true });

    // 3. Get current week's schedule
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    const { data: currentWeekSchedule } = await supabase
      .from('workout_schedule')
      .select(`
        *,
        workout_plans(title, description, category, target_muscles)
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', format(startOfCurrentWeek, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(endOfCurrentWeek, 'yyyy-MM-dd'))
      .order('scheduled_date', { ascending: true });

    // 4. Get recent nutrition data (handle potential 406 error)
    let recentNutritionLogs = null;
    try {
      const { data: nutritionData } = await supabase
        .from('nutrition_logs')
        .select(`
          *,
          meal_logs(*)
        `)
        .eq('user_id', userId)
        .gte('log_date', format(fourDaysAgo, 'yyyy-MM-dd'))
        .lte('log_date', format(today, 'yyyy-MM-dd'))
        .order('log_date', { ascending: true });
      recentNutritionLogs = nutritionData;
    } catch (error) {
      console.warn('Could not fetch nutrition logs:', error);
      recentNutritionLogs = [];
    }

    // 5. Get latest fitness assessment (handle potential 406 error)
    let latestAssessment = null;
    try {
      latestAssessment = await ProgressService.getLatestFitnessAssessment(userId);
    } catch (error) {
      console.warn('Could not fetch fitness assessment, using assessment data instead:', error);
      // Use assessment data as fallback
      latestAssessment = assessment;
    }

    // 6. Calculate workout patterns and fatigue indicators
    const workoutAnalysis = analyzeRecentWorkouts(recentWorkoutLogs || []);
    
    // 7. Determine remaining days in the week
    const remainingDays = getRemainingWeekDays(today);

    return {
      user_profile: {
        age: assessment?.age || 30,
        gender: assessment?.gender || 'male',
        height: assessment?.height || 175,
        weight: assessment?.weight || 75,
        fitness_goal: assessment?.fitness_goal || 'general_fitness',
        workout_frequency: assessment?.workout_frequency || 3,
        equipment: assessment?.equipment || 'minimal',
        diet: assessment?.diet || 'standard',
        sports_played: assessment?.sports_played || [],
        allergies: assessment?.allergies || []
      },
      recent_performance: {
        workout_logs: recentWorkoutLogs || [],
        nutrition_logs: recentNutritionLogs || [],
        fitness_assessment: latestAssessment,
        workout_analysis: workoutAnalysis
      },
      current_week: {
        schedule: currentWeekSchedule || [],
        completed_workouts: recentWorkoutLogs?.filter(log => 
          new Date(log.start_time) >= startOfCurrentWeek
        ) || [],
        remaining_days: remainingDays
      },
      optimization_context: {
        days_analyzed: 4,
        current_day: format(today, 'EEEE'),
        week_progress: calculateWeekProgress(currentWeekSchedule || [], recentWorkoutLogs || [])
      }
    };
  };

  // Helper functions for workout analysis
  const analyzeRecentWorkouts = (workoutLogs: any[]) => {
    const analysis = {
      total_workouts: workoutLogs.length,
      muscle_groups_trained: new Set<string>(),
      average_rating: 0,
      total_duration: 0,
      fatigue_indicators: {
        declining_ratings: false,
        reduced_volume: false,
        missed_workouts: false
      },
      performance_trends: {
        strength_progress: 'stable',
        endurance_progress: 'stable',
        consistency_score: 0
      },
      recovery_needs: {
        rest_days_needed: 0,
        active_recovery_recommended: false,
        intensity_adjustment: 'maintain'
      }
    };

    if (workoutLogs.length === 0) return analysis;

    // Analyze muscle groups trained
    workoutLogs.forEach(log => {
      if (log.workout_plans?.target_muscles) {
        log.workout_plans.target_muscles.forEach((muscle: string) => 
          analysis.muscle_groups_trained.add(muscle)
        );
      }
    });

    // Calculate average rating and duration
    const ratings = workoutLogs.map(log => log.rating).filter(r => r);
    analysis.average_rating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    // Check for fatigue indicators
    if (workoutLogs.length >= 2) {
      const recentRatings = workoutLogs.slice(-2).map(log => log.rating).filter(r => r);
      if (recentRatings.length >= 2 && recentRatings[0] > recentRatings[1]) {
        analysis.fatigue_indicators.declining_ratings = true;
      }
    }

    // Determine recovery needs
    if (workoutLogs.length >= 3) {
      analysis.recovery_needs.rest_days_needed = 1;
      analysis.recovery_needs.active_recovery_recommended = true;
    }

    return analysis;
  };

  const getRemainingWeekDays = (today: Date) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDay = format(today, 'EEEE');
    const currentIndex = daysOfWeek.indexOf(currentDay);
    
    return daysOfWeek.slice(currentIndex + 1);
  };

  const calculateWeekProgress = (schedule: any[], completedWorkouts: any[]) => {
    const totalScheduled = schedule.length;
    const completed = completedWorkouts.length;
    
    return {
      completion_rate: totalScheduled > 0 ? (completed / totalScheduled) * 100 : 0,
      workouts_completed: completed,
      workouts_scheduled: totalScheduled,
      days_remaining: 7 - new Date().getDay()
    };
  };

  // Call AI optimization edge function
  const callWeekOptimizationAI = async (optimizationData: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/week-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        optimization_data: optimizationData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to optimize week: ${response.status} - ${errorText}`);
    }

    return await response.json();
  };

  // Apply optimized suggestions
  const applyOptimizedSuggestions = async (suggestions: any[]) => {
    for (const suggestion of suggestions) {
      // Create workout plan for the suggested day
      const workoutPlan = {
        user_id: userId,
        title: suggestion.workout_type === 'strength' 
          ? `${suggestion.focus_area} Strength`
          : suggestion.workout_type === 'cardio'
          ? 'Cardio Session'
          : 'Active Recovery',
        description: suggestion.reasoning,
        category: suggestion.workout_type,
        difficulty: suggestion.intensity === 'high' ? 4 : suggestion.intensity === 'moderate' ? 3 : 2,
        estimated_duration: '45 minutes',
        target_muscles: [suggestion.focus_area],
        ai_generated: true
      };

      // Create the workout plan
      const { data: createdPlan } = await supabase
        .from('workout_plans')
        .insert(workoutPlan)
        .select()
        .single();

      if (createdPlan && suggestion.exercises) {
        // Add exercises to the plan
        const exercises = suggestion.exercises.map((ex: any, index: number) => ({
          workout_plan_id: createdPlan.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_time: ex.rest_seconds ? `${ex.rest_seconds} seconds` : '60 seconds',
          notes: ex.notes,
          order_index: index
        }));

        await supabase
          .from('workout_exercises')
          .insert(exercises);

        // Schedule the workout for the suggested day
        const suggestedDate = getDateForDay(suggestion.day);
        
        await supabase
          .from('workout_schedule')
          .insert({
            user_id: userId,
            workout_plan_id: createdPlan.id,
            scheduled_date: format(suggestedDate, 'yyyy-MM-dd'),
            is_completed: false
          });
      }
    }
  };

  const getDateForDay = (dayName: string) => {
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    const currentDayIndex = today.getDay();
    
    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence of that day
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return targetDate;
  };

  // Use React Query for weekly data to ensure consistency with other components
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: weeklySchedules = [] } = useQuery({
    queryKey: ['workoutSchedules', userId, startStr, endStr],
    queryFn: async () => {
      if (!userId) return [];
      console.log('📅 Loading weekly workout schedules for Planner:', startStr, 'to', endStr);
      return await WorkoutService.getWorkoutSchedule(userId, startStr, endStr);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: weeklyNutritionSummary = [] } = useQuery({
    queryKey: ['weeklyNutritionSummary', userId, startStr, endStr],
    queryFn: async () => {
      if (!userId) return [];
      console.log('🍽️ Loading weekly nutrition summary for Planner:', startStr, 'to', endStr);
      return await NutritionService.getNutritionalSummary(userId, startStr, endStr);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Process weekly data when schedules or nutrition data changes
  useEffect(() => {
    if (!userId) return;
    
    // Process week data
    const processedWeekData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStart, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      const daySchedules = weeklySchedules.filter(s => s.scheduled_date === dateStr);
      const dayNutrition = weeklyNutritionSummary.find(n => n.log_date === dateStr);
      
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
    
    // Calculate weekly stats with real data
    const completedWorkouts = weeklySchedules.filter(s => s.is_completed).length;
    const totalScheduled = weeklySchedules.length;
    const nutritionDays = weeklyNutritionSummary.length;
    
    // Calculate average calories and protein from nutrition data
    const totalCalories = weeklyNutritionSummary.reduce((sum, day) => sum + (day.total_calories || 0), 0);
    const totalProtein = weeklyNutritionSummary.reduce((sum, day) => sum + (day.total_protein_g || 0), 0);
    const avgCalories = nutritionDays > 0 ? Math.round(totalCalories / nutritionDays) : 0;
    const avgProtein = nutritionDays > 0 ? Math.round(totalProtein / nutritionDays) : 0;
    
    // Calculate calorie balance (assuming 2000 cal target)
    const calorieTarget = 2000;
    const calorieBalance = avgCalories - calorieTarget;
    
    // Determine momentum state based on data
    let momentumState: 'up' | 'steady' | 'down' = 'steady';
    if (completedWorkouts >= 4 && avgCalories >= calorieTarget) {
      momentumState = 'up';
    } else if (completedWorkouts < 2 || avgCalories < calorieTarget * 0.8) {
      momentumState = 'down';
    }
    
    // Generate coach message based on performance
    let coachMessage = "Great job this week! Keep up the consistency.";
    if (momentumState === 'down') {
      if (completedWorkouts < 2) {
        coachMessage = "You've missed some workouts this week. Let's get back on track with a solid plan for next week.";
      } else if (avgCalories < calorieTarget * 0.8) {
        coachMessage = "Your nutrition slipped this week. Let's aim for 3 of 4 meals tomorrow.";
      } else {
        coachMessage = "Let's focus on consistency next week. Small steps lead to big results!";
      }
    } else if (momentumState === 'up') {
      coachMessage = "Excellent week! You're building great momentum. Keep this energy going!";
    }
    
    setWeeklyStats({
      workoutCompletion: totalScheduled > 0 ? Math.round((completedWorkouts / totalScheduled) * 100) : 0,
      nutritionCompliance: Math.round((nutritionDays / 7) * 100),
      habitsCompleted: 0, // No real habit tracking yet
      totalHabits: 0, // No real habit tracking yet
      progressTrend: momentumState,
      coachMessage: coachMessage,
      weeklyGoals: {
        workouts: { completed: completedWorkouts, target: 4 },
        calories: { avg: avgCalories, target: calorieTarget },
        protein: { avg: avgProtein, target: 150 }
      }
    });
    
    // Update weekly goals with real data
    setWeeklyGoals([
      { type: 'workouts' as const, label: 'Workouts', current: completedWorkouts, target: 4 },
      { type: 'protein' as const, label: 'Protein Goal', current: avgProtein, target: 120, unit: 'g/day' },
      { type: 'calories' as const, label: 'Daily Calories', current: avgCalories, target: calorieTarget, unit: 'cal/day' }
    ]);
    
    // Update momentum state
    setMomentumState(momentumState);
    
  }, [userId, weeklySchedules, weeklyNutritionSummary, weekStart]);

  // Calculate workout distribution when weekly schedules change
  useEffect(() => {
    console.log('🔄 useEffect triggered for workout distribution calculation');
    console.log('👤 User ID:', userId);
    console.log('📅 Weekly schedules count:', weeklySchedules?.length || 0);
    if (userId && weeklySchedules) {
      calculateWorkoutDistribution();
    }
  }, [userId, weeklySchedules]);
  
  // Load selected day data
  useEffect(() => {
    if (!userId) return;
    
    const loadDayData = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('🔄 loadDayData called for date:', dateStr);
      console.log('👤 User ID:', userId);
      
      try {
        // Load workouts for the day
        console.log('📅 Loading workout schedules for date:', dateStr);
        const schedules = await WorkoutService.getWorkoutSchedule(userId, dateStr, dateStr);
        console.log('📋 Raw schedules from database:', schedules);
        
        let primaryWorkout = null;
        let secondaryWorkouts = [];
        
        if (schedules.length > 0) {
          console.log('🏋️ Found', schedules.length, 'scheduled workouts');
          
          // Sort schedules by creation time to determine primary vs secondary
          const sortedSchedules = schedules.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          console.log('📊 Sorted schedules:', sortedSchedules);
          
          // Process all workouts and determine primary vs secondary
          const processedWorkouts = [];
          
          for (let i = 0; i < sortedSchedules.length; i++) {
            const schedule = sortedSchedules[i];
            console.log(`🏋️ Processing schedule ${i + 1}/${sortedSchedules.length}:`, schedule);
            
            const workoutPlan = await WorkoutService.getWorkoutPlanById(schedule.workout_plan_id);
            console.log('📋 Workout plan for schedule:', workoutPlan);
            
            const exercises = await WorkoutService.getWorkoutExercises(schedule.workout_plan_id);
            console.log('💪 Exercises for workout plan:', exercises);
            
            if (workoutPlan) {
              const workoutData = {
                id: workoutPlan.id,
                title: workoutPlan.title,
                duration: 45,
                bodyFocus: workoutPlan.target_muscles || ['Full Body'],
                isCompleted: schedule.is_completed,
                exercises: exercises.length,
                category: workoutPlan.category,
                difficulty: workoutPlan.difficulty,
                estimated_duration: workoutPlan.estimated_duration,
                ai_generated: workoutPlan.ai_generated
              };
              
              console.log('🏋️ Processed workout data:', workoutData);
              processedWorkouts.push(workoutData);
            } else {
              console.log('❌ No workout plan found for schedule:', schedule);
            }
          }
          
          // Determine primary vs secondary workouts
          if (processedWorkouts.length > 0) {
            // If we have a recently swapped workout, prioritize it as primary
            if (lastSwappedWorkoutId) {
              console.log('🏷️ Looking for recently swapped workout ID:', lastSwappedWorkoutId);
              const swappedWorkoutIndex = processedWorkouts.findIndex(w => w.id === lastSwappedWorkoutId);
              
              if (swappedWorkoutIndex !== -1) {
                // Move the swapped workout to the front
                const swappedWorkout = processedWorkouts.splice(swappedWorkoutIndex, 1)[0];
                processedWorkouts.unshift(swappedWorkout);
                console.log('🥇 Prioritized swapped workout as primary:', swappedWorkout.title);
              } else {
                console.log('⚠️ Swapped workout not found in processed workouts');
              }
            }
            
            // First workout is primary, rest are secondary
            primaryWorkout = processedWorkouts[0];
            secondaryWorkouts = processedWorkouts.slice(1);
            
            console.log('🥇 Final primary workout:', primaryWorkout?.title);
            console.log('🥈 Final secondary workouts:', secondaryWorkouts.map(w => w.title));
          }
        } else {
          console.log('📭 No scheduled workouts found for date:', dateStr);
        }
        
        console.log('🏋️ Final primary workout:', primaryWorkout);
        console.log('🏋️ Final secondary workouts:', secondaryWorkouts);
        
        // Load meals for the day - use same method as Dashboard for consistency
        const mealLogs = await NutritionService.getNutritionLogsByDate(userId, dateStr);
        console.log('🍽️ Meal logs for date:', mealLogs);
        
        // Habits data removed - using mock data
        const habits = [];
        
        const finalDayData = {
          workout: primaryWorkout,
          secondaryWorkouts,
          meals: mealLogs || [],
          habits
        };
        
        console.log('📊 Final day data to set:', finalDayData);
        setSelectedDayData(finalDayData);
        console.log('✅ selectedDayData state updated');
        
        // Clear the lastSwappedWorkoutId after using it
        if (lastSwappedWorkoutId) {
          console.log('🧹 Clearing lastSwappedWorkoutId after use');
          setLastSwappedWorkoutId(null);
        }
        
      } catch (error) {
        console.error("❌ Error loading day data:", error);
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
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to optimize your week.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "AI Coach Optimization",
      description: "Analyzing your recent workouts and generating personalized recommendations...",
    });

    try {
      // Show loading state
      setOptimizationLoading(true);
      
      // Collect data and call AI
      const optimizationData = await collectOptimizationData(userId);
      const result = await callWeekOptimizationAI(optimizationData);
      
      if (result.success) {
        // Apply suggestions
        await applyOptimizedSuggestions(result.suggestions);
        
        // Update local state
        setSuggestions(result.suggestions.map(s => ({
          day: s.day,
          title: s.workout_type === 'strength' ? `${s.focus_area} Strength` : s.workout_type,
          type: s.workout_type,
          reason: s.reasoning
        })));
        
        toast({
          title: "Week Optimized!",
          description: "Your personalized workout plan has been updated based on your recent performance.",
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
        queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
      }
    } catch (error) {
      console.error('Error optimizing week:', error);
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize your week. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOptimizationLoading(false);
    }
  };

  const [optimizationData, setOptimizationData] = useState<any>(null);

  const handleEasyPlan = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to generate an easy plan.",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await collectOptimizationData(userId);
      setOptimizationData(data);
      setShowEasyPlanModal(true);
    } catch (error) {
      console.error('Error preparing easy plan:', error);
      toast({
        title: "Error",
        description: `Failed to prepare easy plan: ${error.message}`,
        variant: "destructive"
      });
    }
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
    setShowAddSecondaryWorkoutModal(true);
  };

  const handleSwapWorkout = () => {
    setShowSwapWorkoutModal(true);
  };

  const handleAddSecondaryWorkout = () => {
    setShowAddSecondaryWorkoutModal(true);
  };

  const handleWorkoutAdded = () => {
    console.log('🔄 handleWorkoutAdded called - refreshing data...');
    console.log('📊 Invalidating queries: workoutSchedules, weeklyWorkouts, dailyData, scheduledWorkouts, todayScheduledWorkouts');
    
    // Refresh the data after a workout is added
    queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
    queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
    queryClient.invalidateQueries({ queryKey: ['dailyData', userId, format(selectedDate, 'yyyy-MM-dd')] });
    queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts'] });
    queryClient.invalidateQueries({ queryKey: ['todayScheduledWorkouts'] });
    
    // Force a re-render by updating the selectedDate state
    console.log('🔄 Force refreshing day data by updating selectedDate');
    setSelectedDate(new Date(selectedDate));
    
    console.log('✅ Query invalidation completed');
  };

  const handleWorkoutSwapped = (newWorkoutId?: string) => {
    console.log('🔄 handleWorkoutSwapped called - refreshing data...');
    
    // Track the newly swapped workout ID
    if (newWorkoutId) {
      console.log('🏷️ Tracking swapped workout ID:', newWorkoutId);
      setLastSwappedWorkoutId(newWorkoutId);
    }
    
    console.log('📊 Invalidating queries: workoutSchedules, weeklyWorkouts, dailyData, scheduledWorkouts, todayScheduledWorkouts');
    
    // Refresh the data after a workout is swapped
    queryClient.invalidateQueries({ queryKey: ['workoutSchedules'] });
    queryClient.invalidateQueries({ queryKey: ['weeklyWorkouts'] });
    queryClient.invalidateQueries({ queryKey: ['dailyData', userId, format(selectedDate, 'yyyy-MM-dd')] });
    queryClient.invalidateQueries({ queryKey: ['scheduledWorkouts'] });
    queryClient.invalidateQueries({ queryKey: ['todayScheduledWorkouts'] });
    
    // Force a re-render by updating the selectedDate state
    console.log('🔄 Force refreshing day data by updating selectedDate');
    setSelectedDate(new Date(selectedDate));
    
    console.log('✅ Query invalidation completed');
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
  
  const handleWorkoutSelected = async (workout: any) => {
    console.log('🔍 handleWorkoutSelected called with workout:', workout);
    
    if (!workout) {
      console.log('❌ No workout provided, returning early');
      return;
    }
    
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    console.log('📅 Selected date string:', selectedDateString);
    console.log('👤 User ID:', userId);
    
    try {
      let workoutPlanId = workout.id;
      console.log('🏋️ Initial workout plan ID:', workoutPlanId);
      
      // If workout doesn't have an ID, it's a new workout that needs to be created
      if (!workout.id) {
        console.log('🆕 Creating new workout plan...');
        console.log('📝 Workout data to create:', {
          user_id: userId,
          title: workout.title,
          description: workout.description || '',
          category: workout.category,
          difficulty: workout.difficulty || 3,
          estimated_duration: workout.estimated_duration || '00:30:00',
          target_muscles: workout.target_muscles || ['full_body'],
          ai_generated: false
        });
        
        // Create the workout plan first
        const { data: newWorkoutPlan, error: createError } = await supabase
          .from('workout_plans')
          .insert({
            user_id: userId,
            title: workout.title,
            description: workout.description || '',
            category: workout.category,
            difficulty: workout.difficulty || 3,
            estimated_duration: workout.estimated_duration || '00:30:00',
            target_muscles: workout.target_muscles || ['full_body'],
            ai_generated: false
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Error creating workout plan:', createError);
          toast({
            title: "Error",
            description: "Failed to create workout plan",
            variant: "destructive"
          });
          return;
        }
        
        console.log('✅ Workout plan created successfully:', newWorkoutPlan);
        workoutPlanId = newWorkoutPlan.id;
        console.log('🆔 New workout plan ID:', workoutPlanId);
        
        // Create workout exercises if provided
        if (workout.exercises && workout.exercises.length > 0) {
          console.log('💪 Creating workout exercises:', workout.exercises.length, 'exercises');
          const exercisesToInsert = workout.exercises.map((exercise: any, index: number) => ({
            workout_plan_id: workoutPlanId,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight || 'bodyweight',
            rest_time: exercise.rest_time || '00:01:00',
            order_index: index
          }));
          
          console.log('📝 Exercises to insert:', exercisesToInsert);
          
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(exercisesToInsert);
          
          if (exercisesError) {
            console.error('❌ Error creating workout exercises:', exercisesError);
          } else {
            console.log('✅ Workout exercises created successfully');
          }
        }
      } else {
        console.log('🔄 Using existing workout plan ID:', workoutPlanId);
      }
      
      console.log(`📅 Scheduling workout ${workoutPlanId} for ${selectedDateString}`);
      
      // Schedule the workout
      console.log('🚀 Calling scheduleWorkoutMutation with:', {
        workout_plan_id: workoutPlanId,
        scheduled_date: selectedDateString
      });
      
      scheduleWorkoutMutation.mutate({
        workout_plan_id: workoutPlanId,
        scheduled_date: selectedDateString
      });
      
      console.log('✅ Workout scheduling mutation called');
      setShowAddWorkout(false);
      
      // Force refresh the day data after a short delay to ensure the mutation completes
      setTimeout(() => {
        console.log('🔄 Force refreshing day data after mutation');
        setSelectedDate(new Date(selectedDate));
      }, 500);
      
    } catch (error) {
      console.error('❌ Error in handleWorkoutSelected:', error);
      toast({
        title: "Error",
        description: "Failed to create and schedule workout",
        variant: "destructive"
      });
    }
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
          optimizationLoading={optimizationLoading}
        />

        {/* Easy Plan Button */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Need an Easier Plan?</h3>
            </div>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Get a beginner-friendly workout plan tailored to your current fitness level and goals.
          </p>
          <Button
            onClick={handleEasyPlan}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Easy Plan
          </Button>
        </div>
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Weekly Timeline View - Hidden per user request */}
        {/* <WeeklyTimelineView
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
        /> */}
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Enhanced Daily Summary */}
        {selectedDayData && (
          <EnhancedDailySummaryCard
            date={selectedDate}
            workout={selectedDayData.workout}
            secondaryWorkouts={selectedDayData.secondaryWorkouts}
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
            onSwapWorkout={handleSwapWorkout}
            onAddSecondaryWorkout={handleAddSecondaryWorkout}
            isCollapsed={collapsedSections.dailySummary}
            onToggleCollapse={() => toggleSection('dailySummary')}
          />
        )}
        
        {/* Section Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        {/* Prescriptive Weekly Summary */}
        {weeklyStats && (
          <PrescriptiveWeeklySummary
            coachMessage={weeklyStats.coachMessage || "Great job this week! Keep up the consistency."}
            weeklyGoals={weeklyGoals}
            mostConsistentHabit="Workout Consistency"
            calorieBalance={weeklyStats.weeklyGoals?.calories?.avg - 2000 || 0}
            momentumState={momentumState}
            weeklyTheme={weeklyTheme}
            onUpdateGoal={handleUpdateGoal}
            onSetWeeklyTheme={handleSetWeeklyTheme}
            isCollapsed={collapsedSections.weeklySummary}
            onToggleCollapse={() => toggleSection('weeklySummary')}
          />
        )}
        
        {/* Bottom spacing for floating action buttons and sticky bar */}
        <div className="h-40"></div>
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

      {/* Easy Plan Modal */}
      <EasyPlanModal
        isOpen={showEasyPlanModal}
        onClose={() => setShowEasyPlanModal(false)}
        optimizationData={optimizationData}
      />

      {/* Add Secondary Workout Modal */}
      <AddSecondaryWorkoutModal
        isOpen={showAddSecondaryWorkoutModal}
        onClose={() => setShowAddSecondaryWorkoutModal(false)}
        selectedDate={selectedDate}
        onWorkoutAdded={handleWorkoutAdded}
      />

      {/* Swap Workout Modal */}
      <SwapWorkoutModal
        isOpen={showSwapWorkoutModal}
        onClose={() => setShowSwapWorkoutModal(false)}
        selectedDate={selectedDate}
        currentWorkout={selectedDayData?.workout}
        onWorkoutSwapped={handleWorkoutSwapped}
      />
    </div>
  );
}
