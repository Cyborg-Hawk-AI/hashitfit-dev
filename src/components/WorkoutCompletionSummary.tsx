import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  Share2, 
  Save,
  Star,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCompletionSummaryProps {
  workout: {
    title: string;
    duration: number;
    caloriesBurned?: number;
    muscleGroups: string[];
    performanceTrend: 'improved' | 'consistent' | 'regressed';
  };
  onSaveAsTemplate: () => void;
  onShare: () => void;
  onComplete: (rating: number, notes: string) => void;
  className?: string;
}

export function WorkoutCompletionSummary({ 
  workout, 
  onSaveAsTemplate, 
  onShare, 
  onComplete,
  className 
}: WorkoutCompletionSummaryProps) {
  const [rating, setRating] = useState([5]); // Start at "Too Hard" like in the screenshot
  const [notes, setNotes] = useState("");
  
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'improved':
        return { 
          icon: TrendingUp, 
          color: "text-green-600", 
          bg: "bg-green-100",
          message: "Great progress! You're trending toward progressive overload."
        };
      case 'regressed':
        return { 
          icon: TrendingUp, 
          color: "text-red-600", 
          bg: "bg-red-100",
          message: "Consider adjusting intensity or taking extra recovery time."
        };
      default:
        return { 
          icon: Target, 
          color: "text-blue-600", 
          bg: "bg-blue-100",
          message: "Consistent performance - keep up the steady progress!"
        };
    }
  };
  
  const trendInfo = getTrendInfo(workout.performanceTrend);
  const TrendIcon = trendInfo.icon;
  
  const getDifficultyLabel = (value: number) => {
    if (value <= 1) return "Too Easy";
    if (value <= 2) return "Easy";
    if (value <= 3) return "Just Right";
    if (value <= 4) return "Challenging";
    return "Too Hard";
  };
  
  const getDifficultyColor = (value: number) => {
    if (value <= 1) return "text-green-600 font-bold";
    if (value <= 2) return "text-green-500 font-bold";
    if (value <= 3) return "text-blue-600 font-bold";
    if (value <= 4) return "text-orange-600 font-bold";
    return "text-red-600 font-bold";
  };
  
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      {/* Celebration Header */}
      <Card className="bg-gradient-to-br from-hashim-50 to-hashim-100 border-hashim-200">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-hashim-600" />
          <h2 className="text-2xl font-bold text-hashim-800 mb-1">
            Workout Complete! 🎉
          </h2>
          <p className="text-hashim-600">
            Great job finishing "{workout.title}"
          </p>
        </CardContent>
      </Card>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-orange-500 mr-1" />
            </div>
            <p className="text-2xl font-bold">{workout.duration}min</p>
            <p className="text-sm text-muted-foreground">Duration</p>
          </CardContent>
        </Card>
        
        {workout.caloriesBurned && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-red-500 mr-1" />
              </div>
              <p className="text-2xl font-bold">{workout.caloriesBurned}</p>
              <p className="text-sm text-muted-foreground">Calories</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Muscle Groups */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Muscle Groups Targeted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workout.muscleGroups.map((muscle, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="bg-hashim-100 text-hashim-700"
              >
                {muscle}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Performance Feedback */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            AI Coach Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("flex items-center p-3 rounded-lg", trendInfo.bg)}>
            <TrendIcon className={cn("h-5 w-5 mr-3", trendInfo.color)} />
            <p className={cn("text-sm font-medium", trendInfo.color)}>
              {trendInfo.message}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Rating Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">How was this workout?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Difficulty Level</span>
              <span className={cn("text-xl font-bold", getDifficultyColor(rating[0]))}>
                {getDifficultyLabel(rating[0])}
              </span>
            </div>
            
            {/* Enhanced Slider with Gradient */}
            <div className="px-2 py-3">
              <Slider
                value={rating}
                onValueChange={setRating}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Slider Labels */}
            <div className="flex justify-between text-sm font-semibold px-1">
              <span className="text-green-600">Too Easy</span>
              <span className="text-blue-600">Just Right</span>
              <span className="text-red-600">Too Hard</span>
            </div>
            
            {/* Visual Difficulty Indicators */}
            <div className="flex justify-between items-center pt-2 px-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                <span className="text-xs font-medium text-green-600">1-2</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
                <span className="text-xs font-medium text-orange-600">4</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                <span className="text-xs font-medium text-red-600">5</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="What went well? Any adjustments needed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onSaveAsTemplate}
            className="flex items-center justify-center"
          >
            <Save size={16} className="mr-2" />
            Save Template
          </Button>
          
          <Button
            variant="outline"
            onClick={onShare}
            className="flex items-center justify-center"
          >
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
        
        <Button
          onClick={() => onComplete(rating[0], notes)}
          className="w-full bg-hashim-600 hover:bg-hashim-700 text-white"
          size="lg"
        >
          <Star size={16} className="mr-2" />
          Complete Workout
        </Button>
      </div>
    </div>
  );
}
