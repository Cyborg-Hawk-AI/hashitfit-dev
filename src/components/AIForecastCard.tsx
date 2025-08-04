
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Forecast {
  type: 'positive' | 'neutral' | 'challenge';
  icon: string;
  message: string;
  trend: 'up' | 'down' | 'steady';
}

interface AIForecastCardProps {
  forecasts?: Forecast[];
  hasData?: boolean;
  className?: string;
}

export function AIForecastCard({ 
  forecasts = [], 
  hasData = false,
  className 
}: AIForecastCardProps) {
  const defaultForecasts: Forecast[] = hasData ? [
    {
      type: 'positive',
      icon: '🎯',
      message: "At your current pace, you'll hit your workout goal by Friday!",
      trend: 'up'
    },
    {
      type: 'challenge',
      icon: '🍽️',
      message: "Keep logging meals and you'll hit your protein target next week.",
      trend: 'steady'
    },
    {
      type: 'positive',
      icon: '📉',
      message: "Weight trending down — on track to hit goal by August 14",
      trend: 'down'
    }
  ] : [
    {
      type: 'neutral',
      icon: '🌱',
      message: "Start logging workouts to unlock personalized forecasts!",
      trend: 'steady'
    }
  ];

  const allForecasts = forecasts.length > 0 ? forecasts : defaultForecasts;

  const getForecastStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'challenge':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-hashim-600" />
          🔮 Your Forecast
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Predictions
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {allForecasts.map((forecast, index) => (
          <div 
            key={index}
            className={cn(
              "p-3 rounded-lg border-l-4 flex items-start justify-between",
              getForecastStyle(forecast.type)
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">
                {forecast.icon}
              </span>
              <p className="text-sm font-medium leading-relaxed">
                {forecast.message}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getTrendIcon(forecast.trend)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
