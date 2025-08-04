
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
}

interface HabitStreakCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onTrackHabits?: () => void;
  habits?: Habit[];
  className?: string;
}

export function HabitStreakCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  onTrackHabits,
  habits = [
    {
      id: '1',
      name: 'Sleep 8 hours',
      emoji: '😴',
      currentStreak: 8,
      longestStreak: 11,
      isCompletedToday: true
    },
    {
      id: '2',
      name: 'Drink 2L water',
      emoji: '💧',
      currentStreak: 3,
      longestStreak: 7,
      isCompletedToday: false
    },
    {
      id: '3',
      name: 'Walk 8k steps',
      emoji: '🚶',
      currentStreak: 0,
      longestStreak: 5,
      isCompletedToday: false
    }
  ],
  className
}: HabitStreakCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  const completedToday = habits.filter(h => h.isCompletedToday).length;
  const totalHabits = habits.length;
  const mostConsistentHabit = habits.reduce((prev, current) => 
    (prev.currentStreak > current.currentStreak) ? prev : current
  );

  const hasHabits = habits.length > 0;

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">🔥 Habit Streaks</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-4">
          {hasHabits ? (
            <>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{completedToday}/{totalHabits}</p>
                <p className="text-sm text-purple-700">Habits completed today</p>
              </div>
              
              <div className="space-y-3">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{habit.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Longest: {habit.longestStreak} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={habit.isCompletedToday ? "default" : "secondary"}
                        className={habit.isCompletedToday ? "bg-green-500" : ""}
                      >
                        {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={onTrackHabits}>
                  Track Habits
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Target size={48} className="mx-auto mb-4 opacity-20 text-purple-500" />
              <p className="text-muted-foreground mb-3">
                Most consistent: '{mostConsistentHabit?.name}' — want to keep that streak? {mostConsistentHabit?.emoji}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-purple-50 hover:border-purple-300"
                onClick={onTrackHabits}
              >
                🎯 Start Tracking
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
