
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Calendar,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricData {
  current: number;
  previous: number;
  goal?: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  changePercent: number;
}

interface ProgressMetricCardProps {
  title: string;
  icon: React.ElementType;
  metric: MetricData;
  timeframe: string;
  color?: string;
  showGoal?: boolean;
  className?: string;
}

export function ProgressMetricCard({ 
  title, 
  icon: Icon, 
  metric, 
  timeframe,
  color = "hashim",
  showGoal = false,
  className 
}: ProgressMetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };
  
  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up': return "text-green-600";
      case 'down': return "text-red-600";
      default: return "text-gray-500";
    }
  };
  
  const getProgressToGoal = () => {
    if (!metric.goal) return 0;
    return Math.min((metric.current / metric.goal) * 100, 100);
  };
  
  const TrendIcon = getTrendIcon();

  return (
    <Card 
      className={cn("transition-all duration-300 cursor-pointer hover:shadow-md", className)}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 bg-${color}-100 rounded-lg`}>
              <Icon className={`h-4 w-4 text-${color}-600`} />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {timeframe}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">
              {metric.current}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                {metric.unit}
              </span>
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs {metric.previous}{metric.unit}
              </span>
            </div>
          </div>
          
          {showGoal && metric.goal && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                <span className="text-xs">Goal: {metric.goal}{metric.unit}</span>
              </div>
              <div className="mt-2">
                <div className="relative w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-500`}
                    style={{ width: `${getProgressToGoal()}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {Math.round(getProgressToGoal())}%
                </span>
              </div>
            </div>
          )}
        </div>
        
        {expanded && (
          <div className="space-y-3 pt-3 border-t animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-medium">This Week</p>
                <p className="text-muted-foreground">{metric.current}{metric.unit}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <Award className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-medium">Best Week</p>
                <p className="text-muted-foreground">{metric.current + 5}{metric.unit}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Weekly average</span>
                <span className="font-medium">{metric.current - 2}{metric.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly trend</span>
                <span className={cn("font-medium", getTrendColor())}>
                  {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
