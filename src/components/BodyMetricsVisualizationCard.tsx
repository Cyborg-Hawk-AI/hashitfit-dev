
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/ProgressChart";
import { Weight, TrendingUp, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { ProgressService } from "@/lib/supabase/services/ProgressService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

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
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for logging weight
  const [weightForm, setWeightForm] = useState({
    weight: '',
    waist: '',
    chest: '',
    arms: '',
    hips: '',
    bodyFat: '',
    notes: ''
  });

  // Form state for photo upload
  const [photoForm, setPhotoForm] = useState({
    photo: null as File | null,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

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

  const handleLogWeight = async () => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      const metricData = {
        user_id: userId,
        measurement_date: new Date().toISOString().split('T')[0],
        weight: weightForm.weight ? parseFloat(weightForm.weight) : null,
        waist_measurement: weightForm.waist ? parseFloat(weightForm.waist) : null,
        chest_measurement: weightForm.chest ? parseFloat(weightForm.chest) : null,
        arm_measurement: weightForm.arms ? parseFloat(weightForm.arms) : null,
        hip_measurement: weightForm.hips ? parseFloat(weightForm.hips) : null,
        body_fat_percentage: weightForm.bodyFat ? parseFloat(weightForm.bodyFat) : null,
        notes: weightForm.notes || null
      };

      const result = await ProgressService.logProgressMetrics(metricData);
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your body metrics have been logged successfully.",
        });
        
        // Reset form
        setWeightForm({
          weight: '',
          waist: '',
          chest: '',
          arms: '',
          hips: '',
          bodyFat: '',
          notes: ''
        });
        
        setIsLogWeightOpen(false);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['progressMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['latestProgressMetric'] });
      }
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: "Error",
        description: "Failed to log your body metrics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!userId || !photoForm.photo) return;
    
    setIsSubmitting(true);
    try {
      const result = await ProgressService.uploadProgressPhoto(
        userId,
        photoForm.photo,
        photoForm.date,
        photoForm.notes
      );
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your progress photo has been uploaded successfully.",
        });
        
        // Reset form
        setPhotoForm({
          photo: null,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        
        setIsUploadPhotoOpen(false);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['progressPhotos'] });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoForm(prev => ({ ...prev, photo: file }));
    }
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
          </div>
        )}

        {/* Log Metrics Button - Always visible */}
        <div className="flex justify-center">
          <Dialog open={isLogWeightOpen} onOpenChange={setIsLogWeightOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="hover:scale-105 transition-all">
                <Weight className="h-4 w-4 mr-2" />
                Log Metrics
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Body Metrics</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={weightForm.weight}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyFat">Body Fat (%)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={weightForm.bodyFat}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, bodyFat: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      placeholder="80.0"
                      value={weightForm.waist}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, waist: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      placeholder="95.0"
                      value={weightForm.chest}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, chest: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arms">Arms (cm)</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.1"
                      placeholder="35.0"
                      value={weightForm.arms}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, arms: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hips">Hips (cm)</Label>
                    <Input
                      id="hips"
                      type="number"
                      step="0.1"
                      placeholder="90.0"
                      value={weightForm.hips}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, hips: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="How are you feeling? Any changes in routine?"
                    value={weightForm.notes}
                    onChange={(e) => setWeightForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsLogWeightOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLogWeight} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Metrics"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
            <Dialog open={isUploadPhotoOpen} onOpenChange={setIsUploadPhotoOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full hover:scale-105 transition-all">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Progress Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Progress Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo">Progress Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a photo to track your visual progress
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="photoDate">Date</Label>
                    <Input
                      id="photoDate"
                      type="date"
                      value={photoForm.date}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="photoNotes">Notes (optional)</Label>
                    <Textarea
                      id="photoNotes"
                      placeholder="How are you feeling? Any changes in routine?"
                      value={photoForm.notes}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsUploadPhotoOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePhotoUpload} disabled={isSubmitting || !photoForm.photo}>
                      {isSubmitting ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
