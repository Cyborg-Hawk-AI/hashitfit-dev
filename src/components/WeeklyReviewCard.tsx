
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  MessageCircle,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklySummary {
  workoutsCompleted: number;
  workoutsScheduled: number;
  caloriesHit: number;
  caloriesTarget: number;
  weightDelta: number;
  moodRating: number; // 1-5
  achievements: string[];
}

interface WeeklyReviewCardProps {
  summary: WeeklySummary;
  onSendToCoach: () => void;
  className?: string;
}

export function WeeklyReviewCard({ summary, onSendToCoach, className }: WeeklyReviewCardProps) {
  const workoutCompletionRate = (summary.workoutsCompleted / summary.workoutsScheduled) * 100;
  const calorieAccuracy = Math.abs(1 - Math.abs(summary.caloriesHit - summary.caloriesTarget) / summary.caloriesTarget) * 100;
  
  const getWeightDeltaEmoji = (delta: number) => {
    if (delta < -0.5) return "👍";
    if (delta > 0.5) return "⚠️";
    return "💪";
  };
  
  const getWeightDeltaColor = (delta: number) => {
    if (delta < -0.5) return "text-green-600";
    if (delta > 0.5) return "text-orange-600";
    return "text-blue-600";
  };
  
  const getMoodEmojis = (rating: number) => {
    const emojis = ["😢", "😕", "😐", "😊", "😁"];
    return emojis[rating - 1] || "😐";
  };

  return (
    <Card className={cn("border-l-4 border-l-hashim-500", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-hashim-600" />
            <span>Weekly Review</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-hashim-100 text-hashim-700">
            This Week
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Workouts</span>
              {workoutCompletionRate >= 80 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-2xl font-bold">{summary.workoutsCompleted}/{summary.workoutsScheduled}</p>
            <Progress value={workoutCompletionRate} className="h-2 mt-2" />
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Calories</span>
              {calorieAccuracy >= 90 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-2xl font-bold">{Math.round(calorieAccuracy)}%</p>
            <p className="text-xs text-muted-foreground">
              {summary.caloriesHit} avg vs {summary.caloriesTarget} target
            </p>
          </div>
        </div>
        
        {/* Weight & Mood */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div>
            <p className="text-sm font-medium mb-1">Weight Change</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getWeightDeltaEmoji(summary.weightDelta)}</span>
              <span className={cn("font-bold", getWeightDeltaColor(summary.weightDelta))}>
                {summary.weightDelta > 0 ? '+' : ''}{summary.weightDelta}kg
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Mood</p>
            <div className="flex items-center space-x-1">
              <span className="text-2xl">{getMoodEmojis(summary.moodRating)}</span>
              <span className="text-sm text-muted-foreground">{summary.moodRating}/5</span>
            </div>
          </div>
        </div>
        
        {/* Achievements */}
        {summary.achievements.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>This Week's Wins</span>
            </h4>
            <div className="space-y-2">
              {summary.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Send to Coach Button */}
        <Button
          onClick={onSendToCoach}
          className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
          size="sm"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Send Summary to AI Coach
        </Button>
      </CardContent>
    </Card>
  );
}
