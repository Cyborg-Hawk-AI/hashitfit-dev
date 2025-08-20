
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline?: string;
  category: 'weight' | 'strength' | 'consistency';
  progress: number;
  isCompleted: boolean;
}

interface GoalTrackerCardProps {
  goals: Goal[];
  onAddGoal: () => void;
  onUpdateGoal: (goalId: string, current: number) => void;
  className?: string;
}

export function GoalTrackerCard({ goals, onAddGoal, onUpdateGoal, className }: GoalTrackerCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weight' | 'strength' | 'consistency'>('all');
  
  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight': return 'bg-blue-100 text-blue-700';
      case 'strength': return 'bg-red-100 text-red-700';
      case 'consistency': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5 text-hashim-600" />
            <span>Goals</span>
          </CardTitle>
          <Button
            onClick={onAddGoal}
            size="sm"
            className="bg-hashim-600 hover:bg-hashim-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
        
        {/* Category Filter */}
        <div className="flex space-x-2 mt-3">
          {(['all', 'weight', 'strength', 'consistency'] as const).map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">No goals set yet</p>
            <Button onClick={onAddGoal} variant="outline" size="sm">
              Set Your First Goal
            </Button>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                goal.isCompleted 
                  ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200" 
                  : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{goal.name}</h4>
                  {goal.isCompleted && (
                    <Award className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className={getCategoryColor(goal.category)}
                >
                  {goal.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={goal.progress} 
                    className="h-3"
                  />
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-3 rounded-full transition-all duration-500",
                      getProgressColor(goal.progress)
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.round(goal.progress)}% complete</span>
                  {goal.deadline && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{goal.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {goal.progress >= 100 && !goal.isCompleted && (
                <div className="mt-3 p-2 bg-green-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Goal achieved! 🎉
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
