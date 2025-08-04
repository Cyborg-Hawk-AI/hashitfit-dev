
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Dumbbell, UtensilsCrossed, Droplets, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyMomentumCardProps {
  className?: string;
}

interface MomentumMetric {
  icon: React.ReactNode;
  label: string;
  completed: number;
  target: number;
  emoji: string;
}

export function WeeklyMomentumCard({ className }: WeeklyMomentumCardProps) {
  // Mock data - in real app this would come from user's weekly progress
  const metrics: MomentumMetric[] = [
    {
      icon: <Dumbbell className="h-4 w-4" />,
      label: "Workouts Logged",
      completed: 3,
      target: 4,
      emoji: "✅"
    },
    {
      icon: <UtensilsCrossed className="h-4 w-4" />,
      label: "Meals Logged",
      completed: 9,
      target: 12,
      emoji: "🍽"
    },
    {
      icon: <Droplets className="h-4 w-4" />,
      label: "Water Logged",
      completed: 6,
      target: 7,
      emoji: "🥤"
    },
    {
      icon: <Brain className="h-4 w-4" />,
      label: "Coach Check-In",
      completed: 1,
      target: 1,
      emoji: "🧠"
    }
  ];

  const getCompletionPercentage = (completed: number, target: number) => {
    return (completed / target) * 100;
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMotivationalMessage = () => {
    const overallCompletion = metrics.reduce((acc, metric) => {
      return acc + getCompletionPercentage(metric.completed, metric.target);
    }, 0) / metrics.length;

    if (overallCompletion >= 80) {
      return "You're trending up — great consistency this week! 📈";
    } else if (overallCompletion >= 60) {
      return "Solid progress — keep the momentum going! 💪";
    } else {
      return "Missed yesterday? Try a short bodyweight workout to rebound 💪";
    }
  };

  // Weekly overview strip data
  const weeklyOverview = [
    { day: "Mon", status: "✅" },
    { day: "Tue", status: "✅" },
    { day: "Wed", status: "🍽" },
    { day: "Thu", status: "🚫" },
    { day: "Fri", status: "✅" },
    { day: "Sat", status: "✅" },
    { day: "Sun", status: "⏳" }
  ];

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <CardTitle className="text-lg">📈 Your Momentum This Week</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => {
            const percentage = getCompletionPercentage(metric.completed, metric.target);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{metric.emoji}</span>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={cn("text-sm font-bold", getCompletionColor(percentage))}>
                    {metric.completed} of {metric.target}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>

        {/* Weekly Overview Strip */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Weekly Overview:</p>
          <div className="flex justify-between items-center">
            {weeklyOverview.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                <span className="text-lg">{day.status}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>✅ = workout done</span>
            <span>🍽 = meal only</span>
            <span>🚫 = nothing logged</span>
            <span>⏳ = today</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-sm text-blue-700 font-medium">
            {getMotivationalMessage()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
