
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TDEEBalanceCardProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function TDEEBalanceCard({ 
  isCollapsed = false, 
  onToggleCollapse,
  className
}: TDEEBalanceCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  
  // Mock data for energy balance
  const caloriesConsumed = 1650;
  const caloriesBurned = 2100; // TDEE
  const netBalance = caloriesConsumed - caloriesBurned;
  const deficit = Math.abs(netBalance);
  const bmr = 1750; // Base Metabolic Rate
  
  const getBalanceIcon = () => {
    if (netBalance < -200) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (netBalance > 200) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };
  
  const getBalanceColor = () => {
    if (netBalance < -200) return "text-red-600";
    if (netBalance > 200) return "text-green-600";
    return "text-yellow-600";
  };
  
  const getCoachingFeedback = () => {
    if (deficit > 500) {
      return "You're in a solid deficit — expect 1–2 lbs/week fat loss 🔥";
    } else if (caloriesConsumed < bmr) {
      return "⚠️ You're below your BMR — recovery may suffer.";
    } else if (Math.abs(netBalance) < 200) {
      return "You're maintaining — perfect for muscle building.";
    } else if (netBalance > 300) {
      return "You're in a surplus — great for building muscle 💪";
    } else {
      return "Small deficit — steady progress without compromising recovery.";
    }
  };

  return (
    <Card className={cn("transition-all duration-300 animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              {getBalanceIcon()}
            </div>
            <CardTitle className="text-lg">⚡ Energy Balance</CardTitle>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{caloriesConsumed}</p>
              <p className="text-sm text-green-700">Consumed</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{caloriesBurned}</p>
              <p className="text-sm text-red-700">Burned (TDEE)</p>
            </div>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className={cn("text-xl font-bold", getBalanceColor())}>
              {netBalance > 0 ? '+' : ''}{netBalance} cal
            </p>
            <p className="text-sm text-muted-foreground">
              {netBalance < 0 ? 'Deficit' : netBalance > 0 ? 'Surplus' : 'Balanced'}
            </p>
          </div>
          
          {/* Coaching Feedback */}
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-700 font-medium">
              {getCoachingFeedback()}
            </p>
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="sm">
              Adjust Targets
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
