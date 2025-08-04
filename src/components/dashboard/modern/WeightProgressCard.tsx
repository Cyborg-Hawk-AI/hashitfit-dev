import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Weight, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";

interface WeightProgressCardProps {
  currentWeight?: number;
  startWeight?: number;
  weightData: { date: string; value: number }[];
  nutritionData?: {
    dailyCalories: number;
    targetCalories: number;
    protein: number;
    targetProtein: number;
    carbs: number;
    targetCarbs: number;
    fat: number;
    targetFat: number;
    trendReason: string;
  };
  onAddWeight: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WeightProgressCard({ 
  currentWeight, 
  startWeight, 
  weightData, 
  nutritionData,
  onAddWeight,
  isCollapsed = false,
  onToggleCollapse
}: WeightProgressCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  const hasWeightData = weightData.length > 0;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
  const isImproving = weightChange < 0; // Assuming weight loss is the goal
  
  if (!hasWeightData) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              📉 Weight Trend
            </CardTitle>
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
          <CardContent className="pt-0">
            <div className="text-center py-8">
              <Weight size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium mb-2">No weight logged yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Tap to add your first weight entry!
              </p>
              <Button onClick={onAddWeight} className="w-full hover:scale-105 transition-all">
                <Weight className="h-4 w-4 mr-2" />
                Log Your Weight
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              📉 Weight Trend
            </CardTitle>
            {weightChange !== 0 && (
              <div className="flex items-center space-x-1 text-sm mt-1">
                {isImproving ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                )}
                <span className={`font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg since start
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!collapsed && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0"
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0 space-y-4">
          <div className={`transition-all duration-300 ${isExpanded ? 'h-48' : 'h-24'} overflow-hidden`}>
            <ProgressChart
              data={weightData}
              singleMetric="weight"
            />
          </div>
          
          {/* Coach Insights Section */}
          {nutritionData && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  🤖 Coach Insights
                </p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {nutritionData.trendReason}
              </p>
              
              {/* ... keep existing code (nutrition data grid) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Calories</span>
                    <span className={`font-medium ${nutritionData.dailyCalories < nutritionData.targetCalories ? 'text-green-600' : 'text-orange-600'}`}>
                      {nutritionData.dailyCalories}/{nutritionData.targetCalories}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${nutritionData.dailyCalories < nutritionData.targetCalories ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min((nutritionData.dailyCalories / nutritionData.targetCalories) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Protein</span>
                    <span className={`font-medium ${nutritionData.protein >= nutritionData.targetProtein * 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
                      {nutritionData.protein}g/{nutritionData.targetProtein}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${nutritionData.protein >= nutritionData.targetProtein * 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min((nutritionData.protein / nutritionData.targetProtein) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Carbs</span>
                    <span className="font-medium text-blue-600">
                      {nutritionData.carbs}g/{nutritionData.targetCarbs}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${Math.min((nutritionData.carbs / nutritionData.targetCarbs) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Fat</span>
                    <span className="font-medium text-purple-600">
                      {nutritionData.fat}g/{nutritionData.targetFat}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className="h-1.5 rounded-full bg-purple-500"
                      style={{ width: `${Math.min((nutritionData.fat / nutritionData.targetFat) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <p className={`text-sm font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
              {isImproving ? 'Trending down – keep it up 💪' : 'Stay consistent – you got this! 💪'}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
