
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCTACardProps {
  workout?: any;
  onStartWorkout: () => void;
  onAddWorkout: () => void;
  isLoading?: boolean;
}

export function HeroCTACard({ workout, onStartWorkout, onAddWorkout, isLoading }: HeroCTACardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
            <span className="text-white ml-2">Loading your workout...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-300 dark:bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              No Workout Scheduled
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Let's add a workout to keep your momentum going!
            </p>
            <Button 
              onClick={onAddWorkout}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Dumbbell className="h-6 w-6 text-white mr-2" />
              <span className="text-white/80 text-sm font-medium">TODAY'S WORKOUT</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {workout.title}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {workout.exercises?.length || 0} exercises • {workout.estimatedDuration || 45} min
            </p>
            <Button 
              onClick={onStartWorkout}
              className="bg-white text-violet-600 hover:bg-white/90 font-bold px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              🚀 Start Workout
            </Button>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center ml-4">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
