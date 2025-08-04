
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Dumbbell, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";

interface CompletedItem {
  type: 'workout' | 'meal' | 'habit';
  name: string;
  time: string;
  completed: boolean;
}

interface CompletedItemsListProps {
  items: CompletedItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CompletedItemsList({ items, isCollapsed = false, onToggleCollapse }: CompletedItemsListProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="h-4 w-4 text-violet-600" />;
      case 'meal':
        return <UtensilsCrossed className="h-4 w-4 text-indigo-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            ✅ Completed Today
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
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
                Nothing completed yet today. Let's get started! 💪
              </p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="p-1 bg-white dark:bg-slate-600 rounded-full">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white text-sm">
                      {item.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {item.time}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
