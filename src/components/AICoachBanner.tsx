
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AICoachBannerProps {
  workoutType?: string;
  difficulty?: number;
  targetMuscles?: string[];
  className?: string;
}

export function AICoachBanner({ 
  workoutType = "Full Body", 
  difficulty = 3,
  targetMuscles = [],
  className 
}: AICoachBannerProps) {
  const [showMoreTips, setShowMoreTips] = useState(false);

  // Generate contextual tip based on workout
  const getContextualTip = () => {
    const tips = [
      {
        condition: workoutType.toLowerCase().includes('pull') || targetMuscles.some(m => m.toLowerCase().includes('back')),
        tip: "Focus on squeezing your shoulder blades together on pulling movements for better back activation 💪"
      },
      {
        condition: workoutType.toLowerCase().includes('push') || targetMuscles.some(m => m.toLowerCase().includes('chest')),
        tip: "Control the descent on push movements — slow negatives build more strength 🔥"
      },
      {
        condition: workoutType.toLowerCase().includes('leg') || targetMuscles.some(m => m.toLowerCase().includes('leg')),
        tip: "Try holding the bottom position of squats for 2 seconds for more time under tension ⚡"
      },
      {
        condition: workoutType.toLowerCase().includes('core') || targetMuscles.some(m => m.toLowerCase().includes('core')),
        tip: "Pair core moves with steady breathing for better stability and control 🧘"
      },
      {
        condition: difficulty >= 7,
        tip: "This is an advanced session — focus on perfect form over speed. You've got this! 💯"
      },
      {
        condition: difficulty <= 3,
        tip: "Perfect for building consistency — focus on the mind-muscle connection 🧠"
      }
    ];

    const matchingTip = tips.find(tip => tip.condition);
    return matchingTip?.tip || "Stay hydrated and listen to your body. Every rep counts! 💪";
  };

  // Additional tips for the expanded section
  const getAdditionalTips = () => [
    "💡 Rest 60-90 seconds between sets for optimal recovery",
    "🎯 Quality over quantity — perfect form prevents injury",
    "⚡ Stay hydrated throughout your session",
    "🔥 Push yourself, but listen to your body's signals"
  ];

  return (
    <Card className={cn(
      "bg-gradient-to-r from-purple-50/80 to-blue-50/80 border-purple-200/50 animate-fade-in",
      "backdrop-blur-sm",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-purple-100/80 rounded-lg">
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-800 italic">🧠 Today's Focus</h3>
              <Button
                variant="ghost"
                size="sm" 
                onClick={() => setShowMoreTips(!showMoreTips)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50 h-6 px-2"
              >
                {showMoreTips ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    More Tips
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-purple-700 leading-relaxed italic">
              {getContextualTip()}
            </p>
            
            {showMoreTips && (
              <div className="mt-3 pt-3 border-t border-purple-200/50 animate-fade-in">
                <div className="space-y-2">
                  {getAdditionalTips().map((tip, index) => (
                    <p key={index} className="text-xs text-purple-600 leading-relaxed">
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
