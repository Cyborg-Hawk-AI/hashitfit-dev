import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, subWeeks, subMonths, subDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { NavigationBar, AnimatedCard, SectionTitle, Chip } from "@/components/ui-components";
import { ProgressChart } from "@/components/ProgressChart";
import { ChatFAB } from "@/components/ChatFAB";
import { toast } from "@/hooks/use-toast";
import { WeeklyAnalytics } from "@/components/WeeklyAnalytics";
import { ProgressReflectionsCard } from "@/components/ProgressReflectionsCard";
import { WeeklyMomentumCard } from "@/components/WeeklyMomentumCard";
import { AchievementsGamificationCard } from "@/components/AchievementsGamificationCard";
import { InteractiveGoalsCard } from "@/components/InteractiveGoalsCard";
import { BodyMetricsVisualizationCard } from "@/components/BodyMetricsVisualizationCard";
import { ExerciseProgressCard } from "@/components/ExerciseProgressCard";
import { FitnessJourneyCard } from "@/components/FitnessJourneyCard";
import { AIForecastCard } from "@/components/AIForecastCard";
import { WeeklyWinCard } from "@/components/WeeklyWinCard";
import { GoalStreakCard } from "@/components/GoalStreakCard";
import { WeeklyReflectionModal } from "@/components/WeeklyReflectionModal";
import { ProgressService } from "@/lib/supabase/services/ProgressService";
import { WorkoutService } from "@/lib/supabase/services/WorkoutService";
import { NutritionService } from "@/lib/supabase/services/NutritionService";
import { StreakService } from "@/lib/supabase/services/StreakService";
import { 
  Activity, 
  Weight, 
  Dumbbell,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProgressPage() {
  const { isAuthenticated, userId } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'waist' | 'chest' | 'arms' | 'hips'>('weight');

  // Calculate date ranges based on timeRange
  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
        endDate = endOfWeek(now, { weekStartsOn: 0 }); // Saturday
        break;
      case "month":
        startDate = subMonths(now, 1);
        endDate = now;
        break;
      case "quarter":
        startDate = subMonths(now, 3);
        endDate = now;
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 0 });
        endDate = endOfWeek(now, { weekStartsOn: 0 });
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const { startDate, endDate } = getDateRange(timeRange);

  // Query for progress metrics
  const { data: progressMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['progressMetrics', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      return await ProgressService.getProgressMetrics(userId, startDate, endDate);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for latest progress metric
  const { data: latestMetric } = useQuery({
    queryKey: ['latestProgressMetric', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await ProgressService.getLatestProgressMetric(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for workout logs in date range
  const { data: workoutLogs, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ['workoutLogs', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      return await WorkoutService.getWorkoutLogsByDateRange(userId, startDate, endDate);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for nutrition logs in date range
  const { data: nutritionLogs, isLoading: isLoadingNutrition } = useQuery({
    queryKey: ['nutritionLogs', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      return await NutritionService.getNutritionLogsByDateRange(userId, startDate, endDate);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for streak data
  const { data: streakData } = useQuery({
    queryKey: ['streakData', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await StreakService.getStreakData(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for fitness assessments
  const { data: fitnessAssessments } = useQuery({
    queryKey: ['fitnessAssessments', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await ProgressService.getFitnessAssessments(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for exercise progress data
  const { data: exerciseProgressData, isLoading: isLoadingExerciseProgress } = useQuery({
    queryKey: ['exerciseProgressData', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      return await ProgressService.getExerciseProgressData(userId, startDate, endDate);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Query for top improved exercises
  const { data: topImprovedExercises } = useQuery({
    queryKey: ['topImprovedExercises', userId, timeRange],
    queryFn: async () => {
      if (!userId) return [];
      return await ProgressService.getTopImprovedExercises(userId, timeRange as 'week' | 'month' | 'quarter');
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Process body metrics data for charts
  const bodyMetricsData = progressMetrics?.map(metric => ({
    date: metric.measurement_date,
    weight: metric.weight,
    waist: metric.waist_measurement,
    chest: metric.chest_measurement,
    arms: metric.arm_measurement,
    hips: metric.hip_measurement
  })) || [];

  // Process exercise data for charts
  const exerciseData = exerciseProgressData?.map(dayData => ({
    date: dayData.date,
    volume: dayData.totalVolume,
    workouts: dayData.totalWorkouts
  })) || [];

  // Calculate weekly stats
  const calculateWeeklyStats = () => {
    if (!workoutLogs || !nutritionLogs) return null;

    const completedWorkouts = workoutLogs.filter(log => log.end_time !== null).length;
    const totalWorkouts = workoutLogs.length;
    const workoutCompletion = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

    const totalCalories = nutritionLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    const avgCalories = nutritionLogs.length > 0 ? totalCalories / nutritionLogs.length : 0;
    const totalProtein = nutritionLogs.reduce((sum, log) => sum + (log.total_protein_g || 0), 0);
    const avgProtein = nutritionLogs.length > 0 ? totalProtein / nutritionLogs.length : 0;

    return {
      workoutCompletion,
      nutritionCompliance: nutritionLogs.length > 0 ? 60 : 0, // Placeholder
      habitsCompleted: 12, // Placeholder - should come from habits table
      totalHabits: 21,
      progressTrend: 'up' as const,
      weeklyGoals: {
        workouts: { completed: completedWorkouts, target: 4 },
        calories: { avg: avgCalories, target: 2000 },
        protein: { avg: avgProtein, target: 150 }
      }
    };
  };

  const weeklyStats = calculateWeeklyStats();

  // Calculate momentum based on data
  const momentum = progressMetrics && progressMetrics.length > 0 ? 'up' : 'steady';
  const weeklyProgress = weeklyStats ? weeklyStats.workoutCompletion : 25;

  // Generate AI reflections based on real data
  const generateReflections = () => {
    const reflections = [];
    
    if (weeklyStats) {
      if (weeklyStats.workoutCompletion >= 75) {
        reflections.push({
          type: 'positive' as const,
          message: `You completed ${weeklyStats.weeklyGoals.workouts.completed} workouts this week — great consistency! 💪`,
          icon: '💪'
        });
      } else if (weeklyStats.workoutCompletion < 50) {
        reflections.push({
          type: 'suggestion' as const,
          message: "You missed some workouts this week — want help adjusting your schedule?",
          icon: '📅'
        });
      }

      if (weeklyStats.weeklyGoals.protein.avg < weeklyStats.weeklyGoals.protein.target * 0.8) {
        reflections.push({
          type: 'suggestion' as const,
          message: `Protein goal missed — averaging ${Math.round(weeklyStats.weeklyGoals.protein.avg)}g vs ${weeklyStats.weeklyGoals.protein.target}g target`,
          icon: '🥗'
        });
      }
    }

    return reflections.length > 0 ? reflections : [{
      type: 'positive' as const,
      message: "Start logging your progress to see personalized insights!",
      icon: '🚀'
    }];
  };

  const weeklyReflections = generateReflections();

  // Generate achievements based on real data
  const generateAchievements = () => {
    const achievements = {
      unlocked: [] as any[],
      upcoming: [] as any[]
    };

    if (workoutLogs && workoutLogs.length > 0) {
      achievements.unlocked.push({
        id: 1,
        title: "First Workout",
        icon: "🏃",
        description: "Completed your first workout"
      });
    }

    if (streakData) {
      const currentStreak = streakData.currentWeekStreak || 0;
      if (currentStreak >= 3) {
        achievements.unlocked.push({
          id: 2,
          title: "3-Workout Streak",
          icon: "🔥",
          description: "Complete 3 workouts in a row"
        });
      } else {
        achievements.upcoming.push({
          id: 2,
          title: "3-Workout Streak",
          icon: "🔥",
          description: "Complete 3 workouts in a row",
          progress: currentStreak,
          target: 3
        });
      }
    }

    return achievements;
  };

  const achievements = generateAchievements();

  // Generate user goals based on real data
  const generateUserGoals = () => {
    const goals = [
      { 
        type: 'workouts' as const, 
        label: 'Workouts per week', 
        current: weeklyStats?.weeklyGoals.workouts.completed || 0, 
        target: weeklyStats?.weeklyGoals.workouts.target || 4, 
        unit: 'workouts',
        color: 'bg-blue-50 border-blue-200 text-blue-700'
      },
      { 
        type: 'protein' as const, 
        label: 'Daily Protein', 
        current: Math.round(weeklyStats?.weeklyGoals.protein.avg || 0), 
        target: weeklyStats?.weeklyGoals.protein.target || 150, 
        unit: 'g',
        color: 'bg-green-50 border-green-200 text-green-700'
      },
      { 
        type: 'calories' as const, 
        label: 'Daily Calories', 
        current: Math.round(weeklyStats?.weeklyGoals.calories.avg || 0), 
        target: weeklyStats?.weeklyGoals.calories.target || 2000, 
        unit: 'cal',
        color: 'bg-orange-50 border-orange-200 text-orange-700'
      }
    ];

    return goals;
  };

  const userGoals = generateUserGoals();

  const [userReflections, setUserReflections] = useState([]);

  const handleEditGoal = (goalType: string, newTarget: number) => {
    // TODO: Implement goal updating in database
    toast({
      title: "Goal Updated",
      description: "Your goal has been updated successfully!",
    });
  };

  const handleReviewWorkoutHistory = () => {
    toast({
      title: "Workout History",
      description: "Opening workout history...",
    });
  };

  const handleAskCoachFeedback = () => {
    toast({
      title: "AI Coach",
      description: "Coach feedback feature coming soon!",
    });
  };

  const handleViewHabits = () => {
    toast({
      title: "Habits Tracker",
      description: "Opening habits tracking...",
    });
  };

  const handleAddMilestone = () => {
    toast({
      title: "Add Milestone",
      description: "Milestone creation coming soon!",
    });
  };

  const handleSaveReflection = (reflections: any[]) => {
    setUserReflections(reflections);
    toast({
      title: "Reflection Saved",
      description: "Your weekly reflection has been saved!",
    });
  };

  const hasData = progressMetrics && progressMetrics.length > 0;
  const isLoading = isLoadingMetrics || isLoadingWorkouts || isLoadingNutrition || isLoadingExerciseProgress;

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-hashim-100 text-hashim-700">
              <TrendingUp size={12} className="mr-1" />
              {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : '3 Months'}
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="pt-4 px-4 animate-fade-in pb-20">
        <div className="max-w-lg mx-auto space-y-6">
          <SectionTitle 
            title="Progress" 
            subtitle="Your fitness journey insights" 
          />

          {/* Time Range Selector - Moved up for context */}
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <Chip 
              label="Week" 
              active={timeRange === "week"}
              onClick={() => setTimeRange("week")}
            />
            <Chip 
              label="Month" 
              active={timeRange === "month"}
              onClick={() => setTimeRange("month")}
            />
            <Chip 
              label="3 Months" 
              active={timeRange === "quarter"}
              onClick={() => setTimeRange("quarter")}
            />
          </div>

          {/* Enhanced Exercise Progress - TOP CARD */}
          <ExerciseProgressCard
            data={exerciseData}
            timeRange={timeRange}
            hasData={hasData}
            topImprovedExercises={topImprovedExercises || []}
            className="animate-fade-in"
          />

          {/* Enhanced Body Metrics Visualization - SECOND CARD */}
          <BodyMetricsVisualizationCard
            data={bodyMetricsData}
            selectedMetric={selectedMetric}
            onMetricSelect={setSelectedMetric}
            timeRange={timeRange}
            isLoading={isLoading}
            hasData={hasData}
            className="animate-fade-in"
          />

          {/* Weekly Win */}
          <WeeklyWinCard
            hasData={hasData}
            className="animate-fade-in"
          />

          {/* AI Coach Reflections */}
          <ProgressReflectionsCard
            reflections={weeklyReflections}
            onReviewHistory={handleReviewWorkoutHistory}
            onAskCoach={handleAskCoachFeedback}
            className="animate-fade-in"
          >
            <div className="mt-3">
              <WeeklyReflectionModal
                reflections={userReflections}
                onSaveReflection={handleSaveReflection}
              />
            </div>
          </ProgressReflectionsCard>

          {/* AI Forecast */}
          <AIForecastCard
            hasData={hasData}
            className="animate-fade-in"
          />

          {/* Fitness Journey Timeline */}
          <FitnessJourneyCard
            onAddMilestone={handleAddMilestone}
            className="animate-fade-in"
          />

          {/* Enhanced Weekly Summary with Momentum + Visuals */}
          <WeeklyMomentumCard
            momentum={momentum}
            weeklyProgress={weeklyProgress}
            isJustStarting={!hasData}
            stats={weeklyStats || {
              workoutCompletion: 0,
              nutritionCompliance: 0,
              habitsCompleted: 0,
              totalHabits: 21,
              progressTrend: 'steady',
              weeklyGoals: {
                workouts: { completed: 0, target: 4 },
                calories: { avg: 0, target: 2000 },
                protein: { avg: 0, target: 150 }
              }
            }}
            onViewHabits={handleViewHabits}
            className="animate-fade-in"
          />

          {/* Goal Streaks */}
          <GoalStreakCard
            hasData={hasData}
            className="animate-fade-in"
          />

          {/* Gamified Achievements */}
          <AchievementsGamificationCard
            achievements={achievements}
            className="animate-fade-in"
          />

          {/* Interactive Goals */}
          <InteractiveGoalsCard
            goals={userGoals}
            onUpdateGoal={handleEditGoal}
            className="animate-fade-in"
          />
        </div>
        
        {/* Bottom spacing for floating action buttons */}
        <div className="h-32"></div>
      </main>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
