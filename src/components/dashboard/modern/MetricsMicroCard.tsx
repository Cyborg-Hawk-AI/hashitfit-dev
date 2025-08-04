
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsMicroCardProps {
  currentWeight: number;
  weightTrend: string;
  lastLogDate: string;
}

export function MetricsMicroCard({ currentWeight, weightTrend, lastLogDate }: MetricsMicroCardProps) {
  const isPositiveTrend = weightTrend.startsWith('+');
  
  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
          ⚖️ Weight
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
            {currentWeight}kg
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositiveTrend ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {weightTrend}kg
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Last logged: {lastLogDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
