
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanningFABProps {
  onAddWorkout: () => void;
  onAddNutrition: () => void;
  className?: string;
}

export function PlanningFAB({ onAddWorkout, onAddNutrition, className }: PlanningFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      {/* Expanded Options */}
      {isExpanded && (
        <div className="flex flex-col space-y-2 mb-2 animate-fade-in">
          <Button
            onClick={() => {
              onAddWorkout();
              setIsExpanded(false);
            }}
            className="flex items-center space-x-2 bg-hashim-600 hover:bg-hashim-700 text-white shadow-lg"
            size="sm"
          >
            <Dumbbell size={16} />
            <span>Add Workout</span>
          </Button>
          
          <Button
            onClick={() => {
              onAddNutrition();
              setIsExpanded(false);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="sm"
          >
            <Utensils size={16} />
            <span>Add Nutrition</span>
          </Button>
        </div>
      )}
      
      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl transition-all duration-200",
          "bg-hashim-600 hover:bg-hashim-700 text-white",
          isExpanded ? "rotate-45" : ""
        )}
        size="lg"
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}
