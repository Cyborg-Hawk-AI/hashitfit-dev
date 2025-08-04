import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'waist' | 'chest' | 'arms' | 'hips'>('weight');

  // Mock data for demonstration with proper typing
  const [weeklyReflections] = useState<Array<{
    type: 'positive' | 'suggestion' | 'warning';
    message: string;
    icon: string;
  }>>([
    {
      type: 'positive' as const,
      message: "You trained 3x this week — strength focus. Keep it up 💪",
      icon: '💪'
    },
    {
      type: 'suggestion' as const,
      message: "Protein goal missed 4 days — want help adjusting meals?",
      icon: '🥗'
    }
  ]);

  const [achievements] = useState({
    unlocked: [
      { id: 1, title: "First Workout", icon: "🏃", description: "Completed your first workout" }
    ],
    upcoming: [
      { id: 2, title: "3-Workout Streak", icon: "🔥", description: "Complete 3 workouts in a row", progress: 1, target: 3 },
      { id: 3, title: "7-Day Habit", icon: "🏆", description: "Log habits for 7 consecutive days", progress: 3, target: 7 }
    ]
  });

  const [userGoals, setUserGoals] = useState([
    { 
      type: 'workouts' as const, 
      label: 'Workouts per week', 
      current: 3, 
      target: 4, 
      unit: 'workouts',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    { 
      type: 'protein' as const, 
      label: 'Daily Protein', 
      current: 85, 
      target: 150, 
      unit: 'g',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    { 
      type: 'calories' as const, 
      label: 'Daily Calories', 
      current: 1800, 
      target: 2000, 
      unit: 'cal',
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    { 
      type: 'sleep' as const, 
      label: 'Sleep Hours', 
      current: 6, 
      target: 8, 
      unit: 'hrs',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ]);

  const [hasData, setHasData] = useState(false);
  const [bodyMetricsData, setBodyMetricsData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [userReflections, setUserReflections] = useState([]);

  const fetchProgressData = async (range: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate some data for demonstration
      if (range === "month") {
        setHasData(true);
        setBodyMetricsData([
          { date: "2024-05-01", weight: 75, waist: 32, chest: 40, arms: 35, hips: 38 },
          { date: "2024-05-15", weight: 74.5, waist: 31.5, chest: 40.2, arms: 35.2, hips: 37.8 },
          { date: "2024-06-01", weight: 74, waist: 31, chest: 40.5, arms: 35.5, hips: 37.5 }
        ]);
        setExerciseData([
          { date: "Week 1", benchPress: 80, squat: 100, deadlift: 120 },
          { date: "Week 2", benchPress: 82.5, squat: 105, deadlift: 125 },
          { date: "Week 3", benchPress: 85, squat: 107.5, deadlift: 127.5 }
        ]);
      }
      
      setTimeRange(range);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch progress data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProgressData(timeRange);
    }
  }, [isAuthenticated, userId]);

  const handleEditGoal = (goalType: string, newTarget: number) => {
    setUserGoals(prev => 
      prev.map(goal => 
        goal.type === goalType ? { ...goal, target: newTarget } : goal
      )
    );
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

  const momentum = hasData ? 'up' : 'steady';
  const weeklyProgress = hasData ? 65 : 25;

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-hashim-100 text-hashim-700">
              <TrendingUp size={12} className="mr-1" />
              This Week
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
            stats={{
              workoutCompletion: hasData ? 75 : 0,
              nutritionCompliance: hasData ? 60 : 0,
              habitsCompleted: hasData ? 12 : 0,
              totalHabits: 21,
              progressTrend: momentum,
              weeklyGoals: {
                workouts: { completed: hasData ? 3 : 0, target: 4 },
                calories: { avg: hasData ? 1800 : 0, target: 2000 },
                protein: { avg: hasData ? 120 : 0, target: 150 }
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

          {/* Time Range Selector */}
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <Chip 
              label="Week" 
              active={timeRange === "week"}
              onClick={() => fetchProgressData("week")}
            />
            <Chip 
              label="Month" 
              active={timeRange === "month"}
              onClick={() => fetchProgressData("month")}
            />
            <Chip 
              label="3 Months" 
              active={timeRange === "quarter"}
              onClick={() => fetchProgressData("quarter")}
            />
          </div>

          {/* Enhanced Body Metrics Visualization */}
          <BodyMetricsVisualizationCard
            data={bodyMetricsData}
            selectedMetric={selectedMetric}
            onMetricSelect={setSelectedMetric}
            timeRange={timeRange}
            isLoading={isLoading}
            hasData={hasData}
            className="animate-fade-in"
          />
          
          {/* Enhanced Exercise Progress */}
          <ExerciseProgressCard
            data={exerciseData}
            timeRange={timeRange}
            hasData={hasData}
            className="animate-fade-in"
          />
        </div>
      </main>
      
      <NavigationBar />
      <ChatFAB />
    </div>
  );
}
