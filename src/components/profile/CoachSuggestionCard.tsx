
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, Settings } from "lucide-react";

interface CoachSuggestionCardProps {
  proteinCompliance?: number;
  workoutsThisWeek?: number;
  onAdjustPlan?: () => void;
  onMessageCoach?: () => void;
}

export function CoachSuggestionCard({
  proteinCompliance = 58,
  workoutsThisWeek = 1,
  onAdjustPlan,
  onMessageCoach
}: CoachSuggestionCardProps) {
  const needsAttention = proteinCompliance < 60 || workoutsThisWeek < 2;

  if (!needsAttention) return null;

  const getSuggestionMessage = () => {
    if (proteinCompliance < 60 && workoutsThisWeek < 2) {
      return "This week's activity and nutrition are both below target. Let's realign your plan to get back on track.";
    } else if (proteinCompliance < 60) {
      return "Your protein intake is low this week. Consider adding a protein shake or adjusting your meal plan.";
    } else {
      return "You've missed some workouts this week. Want help rescheduling or adjusting your routine?";
    }
  };

  return (
    <AnimatedCard className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/10" delay={350}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle size={20} className="text-orange-600 mt-1" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Coach Suggestion</h3>
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              Action Needed
            </Badge>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
            {getSuggestionMessage()}
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={onAdjustPlan}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Settings size={14} className="mr-1" />
              Adjust Plan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onMessageCoach}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <MessageCircle size={14} className="mr-1" />
              Message Coach
            </Button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
