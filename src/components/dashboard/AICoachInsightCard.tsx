
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Brain, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsight {
  id: string;
  type: 'motivation' | 'performance' | 'nutrition' | 'recovery';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface AICoachInsightCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  insights?: AIInsight[];
  onCompleteWorkout?: () => void;
  className?: string;
}

export function AICoachInsightCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  insights = [],
  onCompleteWorkout,
  className
}: AICoachInsightCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'motivation': return '💪';
      case 'performance': return '📈';
      case 'nutrition': return '🍎';
      case 'recovery': return '😴';
      default: return '💡';
    }
  };
  
  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmptyStateMessage = () => {
    const messages = [
      "Unlock your next tip — just one more workout to go! 🔓",
      "Your coach is waiting for data — log now to adapt your plan. 📊",
      "Complete today's workout to unlock personalized insights! 💡"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg relative">
              <Brain className="h-4 w-4 text-purple-600" />
              <div className="absolute inset-0 bg-purple-300 rounded-lg opacity-20 animate-ping"></div>
              <Sparkles className="h-2 w-2 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <CardTitle className="text-lg">🧠 AI Coach Insights</CardTitle>
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
          {insights.length === 0 ? (
            <div className="text-center py-6">
              <div className="relative mb-4">
                <Sparkles size={48} className="mx-auto opacity-20 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-muted-foreground mb-3 font-medium">
                {getEmptyStateMessage()}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-purple-50 hover:border-purple-300 animate-pulse"
                onClick={onCompleteWorkout}
              >
                <Target className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 bg-muted/50 rounded-lg animate-fade-in">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg animate-bounce">{getInsightIcon(insight.type)}</span>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", getPriorityColor(insight.priority))}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                  {insight.actionable && (
                    <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs hover:bg-purple-100">
                      Take Action
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
