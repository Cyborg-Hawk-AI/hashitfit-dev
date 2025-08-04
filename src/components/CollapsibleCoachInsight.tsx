
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCoachInsightProps {
  workout: {
    difficulty: number;
    category: string;
    targetMuscles?: string[];
  };
  className?: string;
}

export function CollapsibleCoachInsight({ workout, className }: CollapsibleCoachInsightProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCoachMessage = () => {
    if (workout.difficulty > 6) {
      return "High intensity session ahead! Focus on proper form and rest between sets. Stay hydrated! 💪";
    }
    return "Perfect training intensity for steady progress. Maintain good form and challenge yourself progressively. You've got this! 🔥";
  };

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardContent className="p-0">
        {/* Collapsed Header */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-violet-50 rounded-lg bg-violet-50/50"
          style={{ backgroundColor: '#EAE7FB' }}
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-indigo-600" />
            <span className="font-medium text-indigo-800 text-sm">
              💬 AI Coach Insight
            </span>
            {!isExpanded && (
              <span className="text-xs text-indigo-600">– Tap to Expand</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-indigo-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-indigo-600" />
          )}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 animate-accordion-down">
            <div className="bg-white border border-indigo-200 rounded-lg p-3">
              <p className="text-indigo-700 text-sm leading-relaxed">
                {getCoachMessage()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
