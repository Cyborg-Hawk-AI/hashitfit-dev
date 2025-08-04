
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Dumbbell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface WorkoutSession {
  id: string;
  date: Date;
  title: string;
  duration: number;
  type: "strength" | "cardio" | "flexibility" | "recovery";
  completed?: boolean;
}

interface WeeklyPlannerCardProps {
  sessions: WorkoutSession[];
  onAddWorkout?: (date: Date) => void;
  onCompleteWorkout?: (sessionId: string) => void;
  className?: string;
}

export function WeeklyPlannerCard({ 
  sessions, 
  onAddWorkout, 
  onCompleteWorkout,
  className 
}: WeeklyPlannerCardProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };
  
  const getTypeColor = (type: string) => {
    const colors = {
      strength: "bg-red-100 text-red-700 border-red-200",
      cardio: "bg-blue-100 text-blue-700 border-blue-200",
      flexibility: "bg-green-100 text-green-700 border-green-200",
      recovery: "bg-purple-100 text-purple-700 border-purple-200"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'prev' ? -7 : 7));
  };

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Weekly Planner</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {weekDays.map((day, index) => {
          const daySessions = getSessionsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={index}
              className={cn(
                "p-3 rounded-lg border transition-all",
                isToday ? "bg-hashim-50 border-hashim-200" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "font-medium",
                    isToday && "text-hashim-600"
                  )}>
                    {format(day, 'EEEE')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(day, 'MMM d')}
                  </span>
                  {isToday && (
                    <Badge variant="secondary" className="text-xs">Today</Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddWorkout?.(day)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-hashim-600"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              {daySessions.length > 0 ? (
                <div className="space-y-2">
                  {daySessions.map((session) => (
                    <div 
                      key={session.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded border",
                        getTypeColor(session.type)
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="h-3 w-3" />
                        <div>
                          <p className="font-medium text-xs">{session.title}</p>
                          <div className="flex items-center space-x-1 text-xs opacity-75">
                            <Clock className="h-2 w-2" />
                            <span>{session.duration}min</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCompleteWorkout?.(session.id)}
                        className="h-6 w-6 p-0"
                      >
                        {session.completed ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <div className="h-3 w-3 border border-current rounded-full" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  Rest day
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
