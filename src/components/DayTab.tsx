
import { cn } from "@/lib/utils";

interface DayTabProps {
  day: string;
  date: string;
  isActive?: boolean;
  isToday?: boolean;
  hasActivity?: boolean;
  onClick?: () => void;
}

export function DayTab({
  day,
  date,
  isActive = false,
  isToday = false,
  hasActivity = false,
  onClick
}: DayTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center py-3 px-5 rounded-lg transition-all mr-2 min-w-[85px]",
        isActive
          ? "bg-hashim-600 text-white"
          : isToday
          ? "bg-hashim-50 dark:bg-hashim-900/20 text-hashim-800"
          : "bg-white dark:bg-gray-800 border border-border hover:bg-muted/50"
      )}
    >
      <span className="text-xs font-medium mb-1">
        {day.substring(0, 3)}
      </span>
      <span className={cn(
        "text-lg font-bold",
        isActive ? "text-white" : isToday ? "text-hashim-600" : ""
      )}>
        {date}
      </span>
      {hasActivity && !isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-hashim-600 mt-1"></div>
      )}
    </button>
  );
}

export default DayTab;
