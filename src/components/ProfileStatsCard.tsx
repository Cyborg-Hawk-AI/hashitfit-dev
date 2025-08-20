
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Calendar, 
  Target,
  TrendingUp,
  Award,
  Activity,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileStats {
  memberSince: string;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercise: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface ProfileStatsCardProps {
  stats: ProfileStats;
  onViewProgress?: () => void;
  className?: string;
}

export function ProfileStatsCard({ 
  stats, 
  onViewProgress,
  className 
}: ProfileStatsCardProps) {
  const achievements = [
    { 
      name: "Streak Master", 
      description: "7+ day streak", 
      earned: stats.currentStreak >= 7,
      icon: "🔥" 
    },
    { 
      name: "Century Club", 
      description: "100+ workouts", 
      earned: stats.totalWorkouts >= 100,
      icon: "💯" 
    },
    { 
      name: "Consistency King", 
      description: "30+ day streak", 
      earned: stats.longestStreak >= 30,
      icon: "👑" 
    }
  ];

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Fitness Journey</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProgress}
            className="flex items-center"
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            View Progress
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="font-semibold text-orange-700">{stats.memberSince}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <Activity className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-muted-foreground">Total Workouts</p>
            <p className="font-semibold text-blue-700">{stats.totalWorkouts}</p>
          </div>
        </div>
        
        {/* Current Streak */}
        <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-700">Current Streak</span>
            </div>
            <Badge variant="secondary" className="bg-red-200 text-red-700">
              {stats.currentStreak} days
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Longest streak: {stats.longestStreak} days
          </p>
        </div>
        
        {/* Weekly Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-hashim-600" />
              <span className="font-medium">Weekly Goal</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.weeklyProgress}/{stats.weeklyGoal} workouts
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
              className="h-2" 
            />
            <div 
              className="absolute top-0 h-2 bg-gradient-to-r from-hashim-400 to-hashim-600 rounded-full transition-all duration-500"
              style={{ width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-yellow-600" />
            Achievements
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={cn(
                  "text-center p-2 rounded-lg border transition-all",
                  achievement.earned 
                    ? "bg-yellow-50 border-yellow-200" 
                    : "bg-gray-50 border-gray-200 opacity-50"
                )}
              >
                <div className="text-lg mb-1">{achievement.icon}</div>
                <p className="text-xs font-medium">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Favorite Exercise */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">Favorite Exercise</span>
          </div>
          <p className="text-hashim-600 font-medium">{stats.favoriteExercise}</p>
          <p className="text-xs text-muted-foreground">Most frequently performed</p>
        </div>
      </CardContent>
    </Card>
  );
}
