
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Dumbbell, UtensilsCrossed, Heart } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface ComingUpItem {
  date: Date;
  type: 'workout' | 'nutrition' | 'recovery';
  title: string;
  subtitle?: string;
  isCoachRecommended?: boolean;
}

interface ComingUpPreviewProps {
  className?: string;
  onViewFullSchedule?: () => void;
}

export function ComingUpPreview({ className, onViewFullSchedule }: ComingUpPreviewProps) {
  // Mock upcoming items - in real app this would come from schedule data
  const upcomingItems: ComingUpItem[] = [
    {
      date: addDays(new Date(), 1),
      type: 'workout',
      title: 'Lower Body Strength',
      subtitle: 'Squats, Deadlifts, Lunges'
    },
    {
      date: addDays(new Date(), 2),
      type: 'nutrition',
      title: 'Meal Planning Focus',
      subtitle: 'Prep protein sources',
      isCoachRecommended: true
    },
    {
      date: addDays(new Date(), 3),
      type: 'recovery',
      title: 'Flexibility Session',
      subtitle: '20min yoga flow',
      isCoachRecommended: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="h-3 w-3" />;
      case 'nutrition': return <UtensilsCrossed className="h-3 w-3" />;
      case 'recovery': return <Heart className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'nutrition': return 'text-green-600 bg-green-50 border-green-200';
      case 'recovery': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            🗓️ Coming Up
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewFullSchedule}
            className="text-xs text-muted-foreground hover:text-blue-600"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {upcomingItems.map((item, index) => (
          <div key={index} className={cn(
            "flex items-center justify-between p-3 rounded-lg border transition-all",
            getTypeColor(item.type)
          )}>
            <div className="flex items-center space-x-3">
              {getIcon(item.type)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.title}</span>
                  {item.isCoachRecommended && (
                    <Badge variant="secondary" className="text-xs">Coach Rec</Badge>
                  )}
                </div>
                <p className="text-xs opacity-75">{format(item.date, 'EEE')}</p>
                {item.subtitle && (
                  <p className="text-xs opacity-60">{item.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onViewFullSchedule}
          className="w-full text-xs"
        >
          View 7-Day Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
