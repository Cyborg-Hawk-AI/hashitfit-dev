
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reflection {
  type: 'positive' | 'suggestion' | 'warning';
  message: string;
  icon: string;
}

interface ProgressReflectionsCardProps {
  reflections: Reflection[];
  onReviewHistory: () => void;
  onAskCoach: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressReflectionsCard({ 
  reflections, 
  onReviewHistory, 
  onAskCoach, 
  className,
  children
}: ProgressReflectionsCardProps) {
  const getReflectionStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card className={cn("border-l-4 border-l-hashim-500", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-hashim-600" />
          <span>This Week's Reflections</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Coach Insights
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {reflections.length > 0 ? (
          <>
            <div className="space-y-3">
              {reflections.map((reflection, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border-l-4 flex items-start space-x-3",
                    getReflectionStyle(reflection.type)
                  )}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {reflection.icon}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">
                    {reflection.message}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={onReviewHistory}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <History className="h-4 w-4 mr-2" />
                Review History
              </Button>
              
              <Button
                onClick={onAskCoach}
                size="sm"
                className="flex-1 bg-hashim-600 hover:bg-hashim-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Coach
              </Button>
            </div>

            {children}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Complete a few workouts to see your personalized insights!</p>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
