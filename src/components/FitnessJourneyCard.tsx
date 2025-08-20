
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: number;
  icon: string;
  title: string;
  date: string;
  isPersonal?: boolean;
}

interface FitnessJourneyCardProps {
  milestones?: Milestone[];
  onAddMilestone?: () => void;
  className?: string;
}

export function FitnessJourneyCard({ 
  milestones = [], 
  onAddMilestone,
  className 
}: FitnessJourneyCardProps) {
  const defaultMilestones: Milestone[] = [
    { id: 1, icon: "🏁", title: "Joined Hashim Fit", date: "May 15" },
    { id: 2, icon: "🔥", title: "First Workout Completed", date: "May 16" },
    { id: 3, icon: "🍽️", title: "First Meal Logged", date: "May 17" },
    { id: 4, icon: "📉", title: "2 lbs lost", date: "May 25" },
    { id: 5, icon: "💪", title: "7-Day Streak", date: "Jun 1" }
  ];

  const allMilestones = [...defaultMilestones, ...milestones];

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-hashim-600" />
            📅 Your Fitness Journey
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddMilestone}
            className="text-hashim-600 hover:text-hashim-700 hover:bg-hashim-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Milestone
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allMilestones.map((milestone, index) => (
            <div 
              key={milestone.id} 
              className={cn(
                "flex-shrink-0 p-3 bg-gray-50 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer min-w-32",
                milestone.isPersonal ? "border-hashim-200 bg-hashim-50" : "border-gray-200"
              )}
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{milestone.icon}</div>
                <p className="text-xs font-medium text-gray-800 mb-1 leading-tight">
                  {milestone.title}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {milestone.date}
                </Badge>
              </div>
            </div>
          ))}
          
          {/* Add Milestone CTA */}
          <div 
            className="flex-shrink-0 p-3 border-2 border-dashed border-gray-300 rounded-lg transition-all hover:border-hashim-300 hover:bg-hashim-50 cursor-pointer min-w-32"
            onClick={onAddMilestone}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <p className="text-xs font-medium text-gray-600 mb-1 leading-tight">
                Add Personal Milestone
              </p>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
