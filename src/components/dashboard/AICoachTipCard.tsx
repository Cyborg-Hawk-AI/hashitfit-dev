
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICoachTipCardProps {
  className?: string;
  onSeeMoreTips?: () => void;
}

export function AICoachTipCard({ 
  className,
  onSeeMoreTips
}: AICoachTipCardProps) {
  // Mock tip based on user activity - in real app this would come from AI service
  const getTodaysTip = () => {
    const tips = [
      "Rest day? Try 10 minutes of stretching to stay loose 🧘",
      "You've trained 3x already — one more today to hit 100%! 💪",
      "Your protein's been consistent — let's focus on hydration today 💧",
      "Great week so far! A quick walk will boost recovery 🚶‍♀️",
      "Feeling tired? Light yoga can energize without overexerting 🧘‍♂️"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg relative">
            <Brain className="h-4 w-4 text-purple-600" />
            <Sparkles className="h-2 w-2 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <CardTitle className="text-lg">🧠 Today's Focus from Your Coach</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
          <p className="text-purple-700 font-medium">
            {getTodaysTip()}
          </p>
        </div>
        
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSeeMoreTips}
            className="hover:bg-purple-50 hover:border-purple-300"
          >
            See More Tips →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
