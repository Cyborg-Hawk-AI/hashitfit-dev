import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trophy,
  Flame,
  Brain,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyGoal {
  type: 'workouts' | 'protein' | 'calories';
  label: string;
  current: number;
  target: number;
  unit?: string;
}

interface PrescriptiveWeeklySummaryProps {
  coachMessage: string;
  weeklyGoals: WeeklyGoal[];
  mostConsistentHabit: string;
  calorieBalance: number;
  momentumState?: 'up' | 'steady' | 'down';
  weeklyTheme?: string;
  onUpdateGoal: (type: string, newTarget: number) => void;
  onSetWeeklyTheme?: (theme: string) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PrescriptiveWeeklySummary({
  coachMessage,
  weeklyGoals,
  mostConsistentHabit,
  calorieBalance,
  momentumState = 'steady',
  weeklyTheme,
  onUpdateGoal,
  onSetWeeklyTheme,
  className,
  isCollapsed = false,
  onToggleCollapse
}: PrescriptiveWeeklySummaryProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [editingTheme, setEditingTheme] = useState(false);
  const [tempTheme, setTempTheme] = useState(weeklyTheme || '');

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const getMomentumConfig = () => {
    const configs = {
      up: {
        icon: <TrendingUp size={16} />,
        text: "🔥 You're trending up!",
        color: "bg-green-50 text-green-700 border-green-200"
      },
      steady: {
        icon: <Minus size={16} />,
        text: "🧠 You're holding steady",
        color: "bg-blue-50 text-blue-700 border-blue-200"
      },
      down: {
        icon: <TrendingDown size={16} />,
        text: "⚠️ Slipping on nutrition",
        color: "bg-red-50 text-red-700 border-red-200"
      }
    };
    return configs[momentumState];
  };

  const getComplianceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getComplianceIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return <CheckCircle size={16} />;
    if (percentage >= 60) return <AlertTriangle size={16} />;
    return <AlertTriangle size={16} />;
  };

  const handleStartEdit = (goal: WeeklyGoal) => {
    setEditingGoal(goal.type);
    setTempValue(goal.target.toString());
  };

  const handleSaveEdit = (type: string) => {
    const newTarget = parseInt(tempValue);
    if (!isNaN(newTarget) && newTarget > 0) {
      onUpdateGoal(type, newTarget);
    }
    setEditingGoal(null);
    setTempValue('');
  };

  const handleSaveTheme = () => {
    onSetWeeklyTheme?.(tempTheme);
    setEditingTheme(false);
  };

  const formatCalorieBalance = (balance: number) => {
    if (balance > 0) return `+${balance} surplus`;
    if (balance < 0) return `${Math.abs(balance)} deficit`;
    return "balanced";
  };

  const momentum = getMomentumConfig();

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} />
            📊 Weekly Summary
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
        <CardContent className="space-y-4">
          {/* Momentum State */}
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg border",
            momentum.color
          )}>
            {momentum.icon}
            <span className="font-medium">{momentum.text}</span>
          </div>

          <Separator />

          {/* Coach Message */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Brain size={16} className="text-purple-600 mt-0.5" />
              <p className="text-purple-800 font-medium text-sm">{coachMessage}</p>
            </div>
          </div>

          {/* Weekly Theme */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">This Week's Focus</h3>
            {editingTheme ? (
              <div className="flex gap-2">
                <Input
                  value={tempTheme}
                  onChange={(e) => setTempTheme(e.target.value)}
                  placeholder="e.g., Consistency, Endurance, Strength"
                  className="h-8 text-sm"
                  onBlur={handleSaveTheme}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTheme();
                    if (e.key === 'Escape') setEditingTheme(false);
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 p-2 bg-hashim-50 rounded border border-hashim-200 cursor-pointer hover:bg-hashim-100 transition-colors"
                onClick={() => setEditingTheme(true)}
              >
                <span className="text-sm font-medium text-hashim-700">
                  {weeklyTheme || 'Set your weekly focus...'}
                </span>
                <Edit3 size={12} className="text-hashim-500" />
              </div>
            )}
          </div>

          <Separator />

          {/* Weekly Goals */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Target size={16} />
              This Week's Goals
            </h3>
            
            <div className="space-y-2">
              {weeklyGoals.map((goal) => (
                <div
                  key={goal.type}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                    getComplianceColor(goal.current, goal.target)
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getComplianceIcon(goal.current, goal.target)}
                    <span className="font-medium text-sm">{goal.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingGoal === goal.type ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{goal.current}/</span>
                        <Input
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-16 h-6 text-xs"
                          onBlur={() => handleSaveEdit(goal.type)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(goal.type);
                            if (e.key === 'Escape') setEditingGoal(null);
                          }}
                          autoFocus
                        />
                        <span className="text-sm">{goal.unit || ''}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {goal.current}/{goal.target} {goal.unit || ''}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-white/50"
                          onClick={() => handleStartEdit(goal)}
                        >
                          <Edit3 size={10} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Highlights */}
          <div className="space-y-3">
            <h3 className="font-medium">This Week's Highlights</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                <Trophy size={14} className="text-green-600" />
                <span className="text-sm text-green-700">
                  Most consistent: <strong>{mostConsistentHabit}</strong> 🔥
                </span>
              </div>
              
              {calorieBalance !== 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <Flame size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Estimated weekly {formatCalorieBalance(calorieBalance)} calories
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Quick Goal Suggestions */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Quick Goal Adjustments</h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-hashim-50 transition-colors"
                onClick={() => onUpdateGoal('workouts', 4)}
              >
                🎯 4 workouts/week
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-hashim-50 transition-colors"
                onClick={() => onUpdateGoal('protein', 120)}
              >
                🥩 120g protein/day
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-hashim-50 transition-colors"
                onClick={() => onUpdateGoal('calories', 2000)}
              >
                🔥 2000 cal/day
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
