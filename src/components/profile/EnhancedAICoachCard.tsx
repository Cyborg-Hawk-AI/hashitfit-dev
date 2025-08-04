
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface EnhancedAICoachCardProps {
  lastReassessDate?: string;
  isOverdue?: boolean;
  onReassess?: () => void;
  onApplyTip?: () => void;
}

export function EnhancedAICoachCard({ 
  lastReassessDate = "2 weeks ago",
  isOverdue = false,
  onReassess,
  onApplyTip
}: EnhancedAICoachCardProps) {
  const [isReassessing, setIsReassessing] = useState(false);
  const [lastTipApplied, setLastTipApplied] = useState("3 days ago");

  const handleReassess = async () => {
    setIsReassessing(true);
    // Simulate reassessment process
    setTimeout(() => {
      setIsReassessing(false);
      onReassess?.();
    }, 2000);
  };

  const handleApplyTip = () => {
    setLastTipApplied("Just now");
    onApplyTip?.();
  };

  // Mock data for warnings
  const proteinCompliance = 58; // Below 60%
  const workoutsThisWeek = 1; // Below 2
  const hasWarnings = proteinCompliance < 60 || workoutsThisWeek < 2;

  return (
    <AnimatedCard className="mb-6" delay={450}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bot size={20} className="text-hashim-600 mr-3" />
          <div>
            <h3 className="font-semibold">AI Profile Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Your coach uses your plan, preferences, and progress to adjust your journey weekly.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasWarnings && (
            <AlertCircle size={16} className="text-orange-500 animate-pulse" />
          )}
          {isOverdue && (
            <AlertCircle size={16} className="text-red-500 animate-pulse" />
          )}
        </div>
      </div>

      <div className="bg-hashim-50 dark:bg-hashim-900/20 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-2 h-2 bg-hashim-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-hashim-700 dark:text-hashim-300 font-medium mb-2">
              {hasWarnings 
                ? "Your protein intake is low and you've missed workouts. Consider adding a protein shake and scheduling your next session."
                : "Welcome back! Focus on consistency this week and consider increasing your protein intake by 10g daily."
              }
            </p>
            {hasWarnings && (
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                <AlertCircle size={12} className="mr-1" />
                Action needed: Protein {proteinCompliance}% | Workouts {workoutsThisWeek}/4
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>Last reassessed: {lastReassessDate}</span>
          {isOverdue && (
            <Badge variant="secondary" className="text-orange-600 bg-orange-100">
              Overdue
            </Badge>
          )}
        </div>
        
        {lastTipApplied && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <CheckCircle size={12} />
            <span>Applied: {lastTipApplied}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleApplyTip}
          className="hashim-button-outline flex-1"
        >
          Apply Tip
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleReassess}
          disabled={isReassessing}
          className="hashim-button-outline flex-1"
        >
          {isReassessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hashim-600 mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Edit size={16} className="mr-2" />
              Reassess
            </>
          )}
        </Button>
      </div>
    </AnimatedCard>
  );
}
