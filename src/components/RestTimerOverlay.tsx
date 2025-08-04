
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, Plus, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestTimer } from "@/hooks/useRestTimer";

interface RestTimerOverlayProps {
  className?: string;
}

export function RestTimerOverlay({ className }: RestTimerOverlayProps) {
  const { timer, pauseTimer, resumeTimer, stopTimer, addTime, formatTime } = useRestTimer();

  if (!timer.isActive && timer.remaining === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4",
      className
    )}>
      <Card className={cn(
        "bg-gradient-to-r border-2 shadow-lg",
        timer.remaining > 10 
          ? "from-blue-50 to-blue-100 border-blue-200" 
          : "from-red-50 to-red-100 border-red-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Timer className={cn(
                "h-5 w-5",
                timer.remaining > 10 ? "text-blue-600" : "text-red-600"
              )} />
              <span className={cn(
                "font-medium",
                timer.remaining > 10 ? "text-blue-800" : "text-red-800"
              )}>
                Rest Timer
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopTimer}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTime(-10)}
                disabled={timer.remaining <= 10}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={timer.isActive ? pauseTimer : resumeTimer}
                className="h-8 w-8 p-0"
              >
                {timer.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTime(10)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-right">
              <div className={cn(
                "text-2xl font-bold",
                timer.remaining > 10 ? "text-blue-600" : "text-red-600"
              )}>
                {formatTime(timer.remaining)}
              </div>
              {timer.exerciseName && (
                <div className="text-xs text-muted-foreground">
                  {timer.exerciseName}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={cn(
                "h-1 rounded-full transition-all duration-1000",
                timer.remaining > 10 ? "bg-blue-500" : "bg-red-500"
              )}
              style={{ 
                width: `${timer.duration > 0 ? (timer.remaining / timer.duration) * 100 : 0}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
