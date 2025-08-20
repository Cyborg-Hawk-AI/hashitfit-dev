
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

interface AIInsightTileProps {
  onAskCoach: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AIInsightTile({ onAskCoach, isCollapsed = false, onToggleCollapse }: AIInsightTileProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Brain className="h-5 w-5 text-violet-600" />
            <span>🧠 Coach Insights</span>
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
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-700/50">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              💡 Based on your recent workouts, you're building great consistency! Consider adding a rest day between your strength sessions to optimize recovery.
            </p>
            <Button 
              onClick={onAskCoach}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Your Coach
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
