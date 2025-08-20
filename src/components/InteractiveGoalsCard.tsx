
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Edit3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  type: 'workouts' | 'protein' | 'calories' | 'sleep';
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

interface InteractiveGoalsCardProps {
  goals: Goal[];
  onUpdateGoal: (type: string, newTarget: number) => void;
  className?: string;
}

export function InteractiveGoalsCard({ 
  goals, 
  onUpdateGoal, 
  className 
}: InteractiveGoalsCardProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newTarget, setNewTarget] = useState<number>(0);

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewTarget(goal.target);
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      onUpdateGoal(editingGoal.type, newTarget);
      setEditingGoal(null);
    }
  };

  const getCompletionPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusEmoji = (percentage: number) => {
    if (percentage >= 90) return '✅';
    if (percentage >= 60) return '🟡';
    return '🔴';
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="h-4 w-4 text-green-600" />
          </div>
          🎯 Weekly Goals
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {goals.map((goal, index) => {
            const percentage = getCompletionPercentage(goal.current, goal.target);
            const emoji = getStatusEmoji(percentage);
            
            return (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                      goal.color
                    )}
                    onClick={() => handleEditGoal(goal)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{emoji}</span>
                      <Edit3 className="h-3 w-3 opacity-50" />
                    </div>
                    <p className="font-medium text-sm">{goal.label}</p>
                    <p className="text-xs opacity-75">
                      {goal.current} of {goal.target}{goal.unit && ` ${goal.unit}`}
                    </p>
                    <div className="w-full bg-white/50 rounded-full h-1 mt-2">
                      <div 
                        className="bg-current h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adjust {goal.label} Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="target">Target {goal.unit && `(${goal.unit})`}</Label>
                      <Input
                        id="target"
                        type="number"
                        value={newTarget}
                        onChange={(e) => setNewTarget(Number(e.target.value))}
                        placeholder={`Enter new target`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveGoal} className="flex-1">
                        Update Goal
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingGoal(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Coach Insight */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700 text-sm">Progress Insight</span>
          </div>
          <p className="text-blue-600 text-xs">
            You're hitting 3/4 goals consistently — consider raising your targets next week!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
