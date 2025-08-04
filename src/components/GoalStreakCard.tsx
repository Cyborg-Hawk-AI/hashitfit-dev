
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalStreak {
  type: string;
  current: number;
  target: number;
  weeks: number;
  isActive: boolean;
}

interface GoalStreakCardProps {
  streaks?: GoalStreak[];
  hasData?: boolean;
  className?: string;
}

export function GoalStreakCard({ 
  streaks = [], 
  hasData = false,
  className 
}: GoalStreakCardProps) {
  const defaultStreaks: GoalStreak[] = hasData ? [
    {
      type: "Weekly Workouts",
      current: 3,
      target: 3,
      weeks: 3,
      isActive: true
    },
    {
      type: "Protein Goal",
      current: 140,
      target: 150,
      weeks: 2,
      isActive: true
    }
  ] : [];

  const allStreaks = streaks.length > 0 ? streaks : defaultStreaks;

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          🔥 Goal Streaks
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {allStreaks.length > 0 ? (
          allStreaks.map((streak, index) => (
            <div 
              key={index}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                streak.isActive 
                  ? "bg-orange-50 border-orange-200" 
                  : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{streak.type}</span>
                  {streak.isActive && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      🔥 {streak.weeks} weeks
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {streak.current}/{streak.target}
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={Math.min((streak.current / streak.target) * 100, 100)} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {streak.isActive 
                    ? `Keep it up! You're on a ${streak.weeks}-week streak 🔥`
                    : "Start a new streak this week!"
                  }
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Target size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Complete goals consistently to build streaks!</p>
            <p className="text-xs mt-1">🔥 Streaks unlock when you hit goals 2+ weeks in a row</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
