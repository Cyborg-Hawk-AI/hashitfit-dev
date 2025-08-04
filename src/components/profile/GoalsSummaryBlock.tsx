
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  type: 'bar' | 'ring';
  color: string;
  insight?: string;
}

interface GoalsSummaryBlockProps {
  goals?: Goal[];
  onUpdateGoals?: () => void;
}

export function GoalsSummaryBlock({
  goals = [
    {
      id: 'workouts',
      title: 'Weekly workouts',
      current: 3,
      target: 4,
      unit: 'workouts',
      type: 'bar',
      color: 'bg-green-500',
      insight: 'Streak 3 days strong'
    },
    {
      id: 'protein',
      title: 'Protein target',
      current: 72,
      target: 100,
      unit: '% compliance',
      type: 'ring',
      color: 'bg-blue-500',
      insight: 'Missed 2 of 7 days'
    },
    {
      id: 'steps',
      title: 'Step goal',
      current: 6300,
      target: 8000,
      unit: 'steps',
      type: 'bar',
      color: 'bg-purple-500',
      insight: 'Up 400 from yesterday'
    }
  ],
  onUpdateGoals
}: GoalsSummaryBlockProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '% compliance') return `${value}%`;
    if (unit === 'steps') return `${value.toLocaleString()}`;
    return `${value} ${unit}`;
  };

  const getProgressEmoji = (percentage: number) => {
    if (percentage >= 90) return "✅";
    if (percentage >= 60) return "🟡";
    return "🔴";
  };

  return (
    <AnimatedCard className="mb-6" delay={300}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-lg mr-2">🎯</span>
          <h3 className="font-semibold">Your Goals</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUpdateGoals}
          className="flex items-center"
        >
          <Edit size={14} className="mr-1" />
          Update Goals
        </Button>
      </div>
      
      <div className="space-y-4">
        {goals.map((goal) => {
          const percentage = getProgressPercentage(goal.current, goal.target);
          const emoji = getProgressEmoji(percentage);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-lg">{emoji}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold">{formatValue(goal.current, goal.unit)}</span>
                  <span className="text-muted-foreground"> of {formatValue(goal.target, goal.unit)}</span>
                </div>
              </div>
              
              {goal.insight && (
                <p className="text-xs text-muted-foreground italic">{goal.insight}</p>
              )}
              
              {goal.type === 'bar' ? (
                <Progress 
                  value={percentage} 
                  className="h-2 animate-pulse"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90 animate-pulse" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                        className="text-blue-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
