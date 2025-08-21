
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Dumbbell, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";

interface DailyItem {
  type: 'workout' | 'meal' | 'habit';
  name: string;
  time: string;
  completed: boolean;
  scheduledTime?: string;
  mealPlanId?: string;
  mealType?: string;
  workoutPlanId?: string;
  scheduleId?: string;
}

interface DailyItemsListProps {
  completedItems: DailyItem[];
  pendingItems: DailyItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isLoading?: boolean;
  onCompleteItem?: (item: DailyItem) => void;
  onUncompleteItem?: (item: DailyItem) => void;
  processingItems?: Set<string>; // Track items being processed
}

export function DailyItemsList({ 
  completedItems, 
  pendingItems, 
  isCollapsed = false, 
  onToggleCollapse, 
  isLoading = false,
  onCompleteItem,
  onUncompleteItem,
  processingItems = new Set()
}: DailyItemsListProps) {
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
            📅 Today's Progress
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
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="p-1 bg-white dark:bg-slate-600 rounded-full w-6 h-6"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="p-1 bg-white dark:bg-slate-600 rounded-full w-6 h-6"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Completed Items Section */}
                {completedItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed ({completedItems.length})
                    </h4>
                    <div className="space-y-2">
                      {completedItems.map((item, index) => {
                        const isProcessing = processingItems.has(`${item.type}-${item.workoutLogId || item.mealLogId}`);
                        return (
                          <div 
                            key={`completed-${index}`} 
                            className={`flex items-center space-x-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors ${onUncompleteItem && !isProcessing ? 'hover:scale-[1.02]' : ''} ${isProcessing ? 'opacity-50' : ''}`}
                            onClick={() => !isProcessing && onUncompleteItem?.(item)}
                            title={onUncompleteItem && !isProcessing ? "Click to mark as incomplete" : undefined}
                          >
                            <div className="p-1 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                              {isProcessing ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                              ) : (
                                getIcon(item.type)
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 dark:text-white text-sm">
                                {item.name}
                              </p>
                              <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                                {isProcessing ? 'Processing...' : `Completed at ${item.time}`}
                              </p>
                            </div>
                            {isProcessing ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            ) : (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pending Items Section */}
                {pendingItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center">
                      <div className="h-4 w-4 mr-1 rounded-full border-2 border-amber-500"></div>
                      Pending ({pendingItems.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingItems.map((item, index) => {
                        const isProcessing = processingItems.has(`${item.type}-${item.workoutPlanId || item.mealPlanId}`);
                        return (
                          <div 
                            key={`pending-${index}`} 
                            className={`flex items-center space-x-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors ${onCompleteItem && !isProcessing ? 'hover:scale-[1.02]' : ''} ${isProcessing ? 'opacity-50' : ''}`}
                            onClick={() => !isProcessing && onCompleteItem?.(item)}
                            title={onCompleteItem && !isProcessing ? "Click to mark as completed" : undefined}
                          >
                            <div className="p-1 bg-amber-100 dark:bg-amber-800 rounded-full">
                              {isProcessing ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                              ) : (
                                getIcon(item.type)
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 dark:text-white text-sm">
                                {item.name}
                              </p>
                              <p className="text-amber-600 dark:text-amber-400 text-xs">
                                {isProcessing ? 'Processing...' : (item.scheduledTime ? `Scheduled for ${item.scheduledTime}` : 'Not scheduled')}
                              </p>
                            </div>
                            {isProcessing ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-amber-400"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {completedItems.length === 0 && pendingItems.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
                    No activities scheduled for today. Let's add some! 💪
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
