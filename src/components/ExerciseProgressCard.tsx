
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/ProgressChart";
import { Dumbbell, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseProgressCardProps {
  data: any[];
  timeRange: string;
  hasData: boolean;
  className?: string;
}

export function ExerciseProgressCard({ 
  data, 
  timeRange, 
  hasData, 
  className 
}: ExerciseProgressCardProps) {
  const topImprovedExercises = hasData ? [
    { name: 'Bench Press', improvement: '+12.5kg', trend: 'up' },
    { name: 'Squat', improvement: '+15kg', trend: 'up' },
    { name: 'Deadlift', improvement: '+10kg', trend: 'up' }
  ] : [];

  const mostLoggedExercise = hasData ? "Bench Press (6 sessions)" : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Exercise Progress</CardTitle>
          </div>
          {hasData && (
            <Button variant="ghost" size="sm" className="text-hashim-600 hover:scale-105 transition-all">
              <Trophy className="h-4 w-4 mr-1" />
              View PRs
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Most Logged Exercise Preview */}
            {mostLoggedExercise && (
              <div className="p-3 bg-hashim-50 border border-hashim-200 rounded-lg animate-fade-in">
                <h4 className="text-sm font-medium text-hashim-800 mb-1">🏆 Most logged exercise</h4>
                <p className="text-xs text-hashim-600">{mostLoggedExercise}</p>
              </div>
            )}

            {/* Volume Chart */}
            <div className="h-48 overflow-hidden">
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Weekly Volume Trend</h4>
                <p className="text-xs text-muted-foreground">Total weight lifted per week</p>
              </div>
              <ProgressChart
                data={data.map(item => ({
                  date: item.date,
                  volume: (item.benchPress + item.squat + item.deadlift) * 15
                }))}
                singleMetric="volume"
              />
            </div>

            {/* Top Improved Exercises */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                Most Improved ({timeRange})
              </h4>
              <div className="space-y-2">
                {topImprovedExercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg animate-fade-in hover:shadow-md transition-all">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{exercise.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-green-600">{exercise.improvement}</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* This Time Last Month */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">📈 This time last month</h4>
              <p className="text-xs text-blue-600">
                You've increased your weekly volume by 25% and added 15kg to your main lifts!
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">Every rep counts. Start logging workouts to see your strongest lifts over time 💪</p>
            <p className="text-xs mb-4">Nothing logged yet? Let's change that this week.</p>
            <Button size="sm" className="mt-4 hover:scale-105 transition-all" variant="outline">
              <Dumbbell className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
