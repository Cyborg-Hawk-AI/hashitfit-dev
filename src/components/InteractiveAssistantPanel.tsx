
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Wand2, 
  Target, 
  TrendingUp, 
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface WorkoutDistribution {
  upper: number;
  lower: number;
  cardio: number;
  recovery: number;
}

interface Suggestion {
  day: string;
  title: string;
  type: string;
  reason: string;
}

interface InteractiveAssistantPanelProps {
  workoutDistribution: WorkoutDistribution;
  suggestions: Suggestion[];
  onOptimizeWeek: () => void;
  onApplySuggestions: (suggestions: Suggestion[]) => void;
  onAutoPlanWeek: (difficulty: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function InteractiveAssistantPanel({
  workoutDistribution,
  suggestions,
  onOptimizeWeek,
  onApplySuggestions,
  onAutoPlanWeek,
  isCollapsed = false,
  onToggleCollapse
}: InteractiveAssistantPanelProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const toggleSuggestion = (day: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleApplySelected = () => {
    const appliedSuggestions = suggestions.filter(s => selectedSuggestions.includes(s.day));
    onApplySuggestions(appliedSuggestions);
    setSelectedSuggestions([]);
  };

  const getTotalWorkouts = () => {
    return Object.values(workoutDistribution).reduce((sum, count) => sum + count, 0);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      strength: "bg-red-100 text-red-700",
      cardio: "bg-blue-100 text-blue-700", 
      recovery: "bg-green-100 text-green-700"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>🤖 AI Weekly Coach</span>
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
          {/* Workout Distribution Overview */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">This Week's Focus</h3>
              <Badge className="bg-purple-100 text-purple-700">
                {getTotalWorkouts()} workouts scheduled
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{workoutDistribution.upper}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Upper Body</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{workoutDistribution.lower}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Lower Body</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{workoutDistribution.cardio}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Cardio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{workoutDistribution.recovery}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Recovery</p>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>🎯 Optimization Suggestions</span>
              </h3>
              
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSuggestions.includes(suggestion.day)
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600'
                    }`}
                    onClick={() => toggleSuggestion(suggestion.day)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{suggestion.day}</span>
                          <Badge className={getTypeColor(suggestion.type)} variant="secondary">
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {suggestion.reason}
                        </p>
                      </div>
                      {selectedSuggestions.includes(suggestion.day) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedSuggestions.length > 0 && (
                <Button 
                  onClick={handleApplySelected}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply {selectedSuggestions.length} Suggestion{selectedSuggestions.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={onOptimizeWeek}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              ✨ Optimize This Week
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onAutoPlanWeek('beginner')}
                variant="outline"
                className="hover:bg-blue-50 transition-colors"
                size="sm"
              >
                <Zap className="h-3 w-3 mr-1" />
                Easy Plan
              </Button>
              <Button 
                onClick={() => onAutoPlanWeek('advanced')}
                variant="outline"
                className="hover:bg-red-50 transition-colors"
                size="sm"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Challenge Plan
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
