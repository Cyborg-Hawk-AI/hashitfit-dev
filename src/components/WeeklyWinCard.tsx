
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyWin {
  title: string;
  description: string;
  icon: string;
  type: 'achievement' | 'improvement' | 'consistency';
}

interface WeeklyWinCardProps {
  weeklyWin?: WeeklyWin;
  hasData?: boolean;
  className?: string;
}

export function WeeklyWinCard({ 
  weeklyWin, 
  hasData = false,
  className 
}: WeeklyWinCardProps) {
  const defaultWin: WeeklyWin = hasData ? {
    title: "Best workout volume this week!",
    description: "You lifted 25% more than last week 💥",
    icon: "🏋️‍♀️",
    type: 'achievement'
  } : {
    title: "You're getting started!",
    description: "Every journey begins with a single step 🌱",
    icon: "🌱",
    type: 'consistency'
  };

  const currentWin = weeklyWin || defaultWin;

  const getWinStyle = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300';
      case 'improvement':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300';
      default:
        return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300';
    }
  };

  return (
    <Card className={cn(
      "border-2 animate-fade-in transition-all hover:shadow-lg",
      getWinStyle(currentWin.type),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-hashim-600" />
            🏅 Weekly Win
          </CardTitle>
          <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-scale-in">
            {currentWin.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-gray-800">
              {currentWin.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentWin.description}
            </p>
          </div>
        </div>
        
        {hasData && (
          <div className="mt-3 p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-center text-gray-700">
              🎉 Keep up the momentum! You're building lasting habits.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
