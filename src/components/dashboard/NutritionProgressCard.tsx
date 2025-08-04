
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionProgressCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogMeal?: () => void;
  className?: string;
}

export function NutritionProgressCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  onLogMeal,
  className
}: NutritionProgressCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  // Mock nutrition data
  const nutritionData = {
    calories: { current: 1650, target: 2100 },
    protein: { current: 102, target: 150 },
    carbs: { current: 165, target: 210 },
    fat: { current: 65, target: 75 }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const hasLoggedMeals = nutritionData.calories.current > 0;

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Utensils className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">🍗 Nutrition Today</CardTitle>
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
          {hasLoggedMeals ? (
            <>
              {/* Calories */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span className="font-medium">{nutritionData.calories.current}/{nutritionData.calories.target}</span>
                </div>
                <Progress value={getProgressPercentage(nutritionData.calories.current, nutritionData.calories.target)} className="h-2" />
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{nutritionData.protein.current}g</p>
                  <p className="text-xs text-blue-700">Protein</p>
                  <p className="text-xs text-muted-foreground">{nutritionData.protein.target}g goal</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-lg font-bold text-orange-600">{nutritionData.carbs.current}g</p>
                  <p className="text-xs text-orange-700">Carbs</p>
                  <p className="text-xs text-muted-foreground">{nutritionData.carbs.target}g goal</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <p className="text-lg font-bold text-purple-600">{nutritionData.fat.current}g</p>
                  <p className="text-xs text-purple-700">Fat</p>
                  <p className="text-xs text-muted-foreground">{nutritionData.fat.target}g goal</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={onLogMeal}>
                  Log Another Meal
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Utensils size={48} className="mx-auto mb-4 opacity-20 text-green-500" />
              <p className="text-muted-foreground mb-3">
                Need inspiration? Tap here to browse meal ideas 🍽️
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-green-50 hover:border-green-300"
                onClick={onLogMeal}
              >
                📸 Log First Meal
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
