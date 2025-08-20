
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, RefreshCw, Share } from "lucide-react";
import { WorkoutLog, ExerciseLog, WorkoutPlan } from "@/lib/supabase/services/WorkoutService";

interface WorkoutInsightsProps {
  workoutLog: WorkoutLog;
  exerciseLogs: ExerciseLog[];
  workoutPlan: WorkoutPlan | null;
}

export function WorkoutInsights({ workoutLog, exerciseLogs, workoutPlan }: WorkoutInsightsProps) {
  const [showingInsights, setShowingInsights] = useState(false);

  // Generate simple insights based on workout data
  const insights = [
    {
      type: "performance",
      title: "Great Consistency",
      description: `You completed all ${exerciseLogs.length} exercises in your workout plan.`,
      icon: TrendingUp,
      color: "text-green-600"
    }
  ];

  // Add duration-based insight
  if (workoutLog.duration) {
    const durationMinutes = Math.round(parseInt(workoutLog.duration.toString()) / 60000);
    if (durationMinutes < 30) {
      insights.push({
        type: "efficiency",
        title: "Efficient Workout",
        description: `You completed your workout in just ${durationMinutes} minutes. Great time management!`,
        icon: Brain,
        color: "text-blue-600"
      });
    }
  }

  const handleAskCoach = () => {
    setShowingInsights(true);
    // Here you would integrate with your existing AI coach functionality
  };

  const handleSaveTemplate = () => {
    // Integrate with existing template functionality
    console.log("Save as template");
  };

  const handleRepeatWorkout = () => {
    // Navigate to schedule this workout again
    console.log("Repeat workout");
  };

  const handleShare = () => {
    // Implement sharing functionality
    console.log("Share results");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-hashim-600" />
            <span>Workout Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100 ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAskCoach}
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            Ask Coach for More Insights
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" onClick={handleRepeatWorkout}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Repeat
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Button variant="secondary" size="sm" onClick={handleSaveTemplate} className="w-full">
            Save as Template
          </Button>
          
          <Button variant="default" size="sm" className="w-full bg-hashim-600 hover:bg-hashim-700">
            View Full History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
