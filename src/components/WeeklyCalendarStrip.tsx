
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: Date;
  hasWorkout: boolean;
  hasMeals: boolean;
  calorieStatus: 'good' | 'warning' | 'poor' | 'none';
}

interface WeeklyCalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weekData: CalendarDay[];
  className?: string;
}

export function WeeklyCalendarStrip({ 
  selectedDate, 
  onDateSelect, 
  weekData, 
  className 
}: WeeklyCalendarStripProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(selectedDate, { weekStartsOn: 0 }));
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayData = weekData.find(d => isSameDay(d.date, date));
    return {
      date,
      ...dayData
    };
  });
  
  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };
  
  const getCalorieStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className={cn("bg-white/95 backdrop-blur-lg border-b border-border sticky top-16 z-20", className)}>
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        
        <span className="text-sm font-semibold text-muted-foreground">
          {format(weekStart, 'MMM yyyy')}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      
      <div className="flex justify-between px-2 pb-3">
        {days.map((day) => {
          const isSelected = isSameDay(day.date, selectedDate);
          const isTodayDate = isToday(day.date);
          
          return (
            <button
              key={day.date.toISOString()}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-all min-w-[48px] relative",
                isSelected 
                  ? "bg-hashim-600 text-white shadow-lg scale-105" 
                  : isTodayDate
                  ? "bg-hashim-50 text-hashim-700 border border-hashim-200"
                  : "hover:bg-gray-50"
              )}
            >
              <span className="text-xs font-medium mb-1">
                {format(day.date, "EEE")}
              </span>
              <span className={cn(
                "text-lg font-bold",
                isSelected ? "text-white" : isTodayDate ? "text-hashim-600" : ""
              )}>
                {format(day.date, "d")}
              </span>
              
              {/* Activity indicators */}
              <div className="flex items-center space-x-1 mt-1">
                {day.hasWorkout && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-hashim-600"
                  )} title="Workout scheduled" />
                )}
                {day.hasMeals && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-blue-500"
                  )} title="Meals logged" />
                )}
                {day.calorieStatus !== 'none' && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : getCalorieStatusColor(day.calorieStatus)
                  )} title="Calorie status" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
