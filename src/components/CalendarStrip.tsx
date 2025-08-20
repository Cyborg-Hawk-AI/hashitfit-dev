
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function CalendarStrip({ selectedDate, onDateSelect, className }: CalendarStripProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };
  
  return (
    <div className={cn("bg-white/80 backdrop-blur-lg border-b border-border", className)}>
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        
        <div className="flex space-x-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "flex flex-col items-center px-3 py-2 rounded-lg transition-all",
                  isSelected 
                    ? "bg-hashim-600 text-white" 
                    : "hover:bg-gray-100",
                  isToday && !isSelected && "bg-hashim-50 text-hashim-700"
                )}
              >
                <span className="text-xs font-medium">
                  {format(day, "EEE")}
                </span>
                <span className="text-sm font-bold">
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
