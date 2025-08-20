
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/ProgressChart";
import { Weight, TrendingUp, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface BodyMetricsVisualizationCardProps {
  data: any[];
  selectedMetric: 'weight' | 'waist' | 'chest' | 'arms' | 'hips';
  onMetricSelect: (metric: 'weight' | 'waist' | 'chest' | 'arms' | 'hips') => void;
  timeRange: string;
  isLoading: boolean;
  hasData: boolean;
  className?: string;
}

export function BodyMetricsVisualizationCard({ 
  data, 
  selectedMetric, 
  onMetricSelect, 
  timeRange, 
  isLoading, 
  hasData, 
  className 
}: BodyMetricsVisualizationCardProps) {
  const metrics = [
    { key: 'weight' as const, label: 'Weight', unit: 'kg' },
    { key: 'waist' as const, label: 'Waist', unit: 'cm' },
    { key: 'chest' as const, label: 'Chest', unit: 'cm' },
    { key: 'arms' as const, label: 'Arms', unit: 'cm' },
    { key: 'hips' as const, label: 'Hips', unit: 'cm' }
  ];

  const getSingleMetricData = () => {
    return data.map(item => ({
      date: item.date,
      value: item[selectedMetric]
    }));
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Weight className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Body Metrics</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-hashim-600 hover:bg-hashim-50 transition-all hover:scale-105"
              title="See your weight and body stat trends once data is logged"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              📈 Trends
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Metric Selector */}
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {metrics.map((metric) => (
                <Button
                  key={metric.key}
                  size="sm"
                  variant={selectedMetric === metric.key ? "default" : "outline"}
                  onClick={() => onMetricSelect(metric.key)}
                  className="capitalize flex-shrink-0 transition-all hover:scale-105"
                >
                  {metric.label}
                </Button>
              ))}
            </div>
            
            {/* Chart */}
            <div className="h-48 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : (
                <ProgressChart
                  data={getSingleMetricData()}
                  singleMetric={selectedMetric}
                />
              )}
            </div>

            {/* Latest Measurement */}
            {data.length > 0 && (
              <div className="p-3 bg-hashim-50 rounded-lg animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Latest {metrics.find(m => m.key === selectedMetric)?.label}</span>
                  <span className="text-lg font-bold text-hashim-700">
                    {data[data.length - 1]?.[selectedMetric]} {metrics.find(m => m.key === selectedMetric)?.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  📈 Tracking since {timeRange === 'week' ? '1 week' : timeRange === 'month' ? '1 month' : '3 months'} ago
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Weight size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">No data yet — log your weight to see trends over time 📈</p>
            <p className="text-xs text-muted-foreground mb-4">Start tracking to unlock visual progress insights!</p>
            <div className="flex justify-center space-x-2 mt-4">
              <Button size="sm" variant="outline" className="hover:scale-105 transition-all">
                <Weight className="h-4 w-4 mr-2" />
                Log Weight
              </Button>
              <Button size="sm" variant="outline" className="hover:scale-105 transition-all">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Progress Photos Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Progress Photos</h4>
            <Button 
              size="sm" 
              variant="outline" 
              className="hover:scale-105 transition-all"
              title="Upload at least 2 photos to compare visually"
            >
              <Camera className="h-4 w-4 mr-2" />
              Compare
            </Button>
          </div>
          
          {/* Enhanced Comparison UI */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="w-16 h-20 mx-auto mb-2 bg-gray-200 rounded-lg opacity-30"></div>
              <p className="text-xs font-medium text-muted-foreground">Week 1</p>
              <p className="text-xs text-muted-foreground">Starting photo</p>
            </div>
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="w-16 h-20 mx-auto mb-2 bg-gray-200 rounded-lg opacity-30"></div>
              <p className="text-xs font-medium text-muted-foreground">Latest</p>
              <p className="text-xs text-muted-foreground">Current progress</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 Upload at least 2 photos to unlock visual comparison
            </p>
            <p className="text-xs text-hashim-600">
              📅 Best results if logged every 2–4 weeks
            </p>
            <Button size="sm" className="w-full hover:scale-105 transition-all">
              <Camera className="h-4 w-4 mr-2" />
              Upload Progress Photo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
