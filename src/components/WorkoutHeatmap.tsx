
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutDay {
  date: string;
  intensity: 0 | 1 | 2 | 3; // 0 = no workout, 1 = light, 2 = moderate, 3 = intense
  workoutType?: string;
}

interface WorkoutHeatmapProps {
  data: WorkoutDay[];
  onDateClick?: (date: string) => void;
  className?: string;
}

export function WorkoutHeatmap({ data, onDateClick, className }: WorkoutHeatmapProps) {
  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-gray-100";
      case 1: return "bg-hashim-200";
      case 2: return "bg-hashim-400";
      case 3: return "bg-hashim-600";
      default: return "bg-gray-100";
    }
  };
  
  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 0: return "Rest";
      case 1: return "Light";
      case 2: return "Moderate";
      case 3: return "Intense";
      default: return "Rest";
    }
  };
  
  // Calculate stats
  const totalWorkouts = data.filter(day => day.intensity > 0).length;
  const totalDays = data.length;
  const consistencyRate = Math.round((totalWorkouts / totalDays) * 100);
  const currentStreak = calculateCurrentStreak(data);
  
  function calculateCurrentStreak(data: WorkoutDay[]): number {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].intensity > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  
  // Group data into weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-hashim-600" />
            <span>Workout Activity</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-hashim-100 text-hashim-700">
            Last 12 weeks
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-hashim-600">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{consistencyRate}%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
        
        {/* Heatmap Grid */}
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center py-1">{day}</div>
            ))}
          </div>
          
          {/* Heatmap weeks */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => onDateClick?.(day.date)}
                    className={cn(
                      "aspect-square rounded-sm transition-all hover:scale-110 relative group",
                      getIntensityColor(day.intensity)
                    )}
                    title={`${day.date}: ${getIntensityLabel(day.intensity)}${day.workoutType ? ` - ${day.workoutType}` : ''}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {day.date}: {getIntensityLabel(day.intensity)}
                      {day.workoutType && <br />}{day.workoutType}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map(intensity => (
                <div
                  key={intensity}
                  className={cn("w-3 h-3 rounded-sm", getIntensityColor(intensity))}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          <Button variant="ghost" size="sm" className="text-hashim-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            View Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
