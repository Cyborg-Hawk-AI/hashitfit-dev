
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsWidgetProps {
  onLogWorkout?: () => void;
  onLogMeal?: () => void;
  className?: string;
}

export function QuickActionsWidget({
  onLogWorkout,
  onLogMeal,
  className
}: QuickActionsWidgetProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Log Workout Card */}
          <div 
            className="relative bg-gradient-to-br from-red-500 to-hashim-600 rounded-2xl p-4 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[120px] flex flex-col justify-between shadow-lg"
            onClick={onLogWorkout}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">🎙️</div>
              <div className="p-2 bg-white/20 rounded-full animate-pulse">
                <Mic className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Log Workout</h3>
              <p className="text-white/90 text-sm mb-3">Use voice recording to log your exercises</p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-0 w-full text-sm font-medium transition-all duration-200 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onLogWorkout?.();
              }}
            >
              🎤 Start Recording
            </Button>
          </div>

          {/* Log Meal Card */}
          <div 
            className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[120px] flex flex-col justify-between shadow-lg"
            onClick={onLogMeal}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">📷</div>
              <div className="p-2 bg-white/20 rounded-full">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Log Meal</h3>
              <p className="text-white text-sm mb-3">Take a photo to analyze nutrition</p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-0 w-full text-sm font-medium transition-all duration-200 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onLogMeal?.();
              }}
            >
              📸 Take Photo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
