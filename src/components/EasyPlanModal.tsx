import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Play, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { supabaseUrl } from "@/lib/supabase";

interface EasyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  optimizationData: any;
}

interface EasyPlanExercise {
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

interface EasyPlanDay {
  focus: string;
  intensity: string;
  exercises: EasyPlanExercise[];
  rationale: string;
}

interface EasyPlanResponse {
  easy_plan: Record<string, EasyPlanDay>;
  analysis: any;
  nutrition: any;
  recovery: any;
  goals: string[];
  reasoning: string;
}

export function EasyPlanModal({ isOpen, onClose, optimizationData }: EasyPlanModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [easyPlan, setEasyPlan] = useState<EasyPlanResponse | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isAdopting, setIsAdopting] = useState(false);
  const { toast } = useToast();
  const { userId } = useAuth();

  const generateEasyPlan = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to generate an easy plan.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStreamingText("🤖 AI Coach is analyzing your data and creating an easier workout plan...\n\n");
    setEasyPlan(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/easy-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          optimization_data: optimizationData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate easy plan: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEasyPlan(result);
        setStreamingText(prev => prev + "✅ Easy plan generated successfully!\n\n");
      } else {
        throw new Error(result.error || 'Failed to generate easy plan');
      }

    } catch (error) {
      console.error('Error generating easy plan:', error);
      setStreamingText(prev => prev + `❌ Error: ${error.message}\n\n`);
      toast({
        title: "Error",
        description: `Failed to generate easy plan: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const adoptEasyPlan = async () => {
    if (!easyPlan || !userId) return;

    setIsAdopting(true);
    try {
      // Clear existing workout schedule for the week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

      await supabase
        .from('workout_schedule')
        .delete()
        .eq('user_id', userId)
        .gte('scheduled_date', format(startOfWeek, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(endOfWeek, 'yyyy-MM-dd'));

      // Create new workout plans and schedule them
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const [dayName, dayPlan] of Object.entries(easyPlan.easy_plan)) {
        if (dayPlan.exercises.length === 0) continue;

        // Create workout plan
        const workoutPlan = {
          user_id: userId,
          title: `${dayPlan.focus.charAt(0).toUpperCase() + dayPlan.focus.slice(1)} - Easy`,
          description: dayPlan.rationale,
          category: dayPlan.focus,
          difficulty: 1, // Easy difficulty
          estimated_duration: '30 minutes',
          target_muscles: [dayPlan.focus],
          ai_generated: true
        };

        const { data: createdPlan } = await supabase
          .from('workout_plans')
          .insert(workoutPlan)
          .select()
          .single();

        if (createdPlan) {
          // Add exercises to the plan
          const exercises = dayPlan.exercises.map((ex, index) => ({
            workout_plan_id: createdPlan.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: 'bodyweight',
            rest_time: '90 seconds',
            notes: ex.notes,
            order_index: index
          }));

          await supabase
            .from('workout_exercises')
            .insert(exercises);

          // Schedule the workout
          const dayIndex = dayNames.indexOf(dayName);
          if (dayIndex !== -1) {
            const scheduledDate = new Date(startOfWeek);
            scheduledDate.setDate(startOfWeek.getDate() + dayIndex);
            
            await supabase
              .from('workout_schedule')
              .insert({
                user_id: userId,
                workout_plan_id: createdPlan.id,
                scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
                is_completed: false
              });
          }
        }
      }

      toast({
        title: "Success!",
        description: "Easy plan has been adopted and scheduled for your week.",
        variant: "default"
      });

      onClose();

    } catch (error) {
      console.error('Error adopting easy plan:', error);
      toast({
        title: "Error",
        description: `Failed to adopt easy plan: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAdopting(false);
    }
  };

  useEffect(() => {
    if (isOpen && optimizationData) {
      generateEasyPlan();
    }
  }, [isOpen, optimizationData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            Easy Plan Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Streaming Status */}
          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Easy Plan...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                  {streamingText}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Easy Plan Results */}
          {easyPlan && !isLoading && (
            <div className="space-y-4">
              {/* Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Easy Plan Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Fatigue Level: {easyPlan.analysis?.fatigue_level || 'Low'}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {easyPlan.reasoning}
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Intensity: Beginner-Friendly
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Focus on form and consistency over intensity
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Easy Weekly Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(easyPlan.easy_plan).map(([dayName, dayPlan]) => (
                      <div key={dayName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold capitalize">{dayName}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">{dayPlan.focus}</Badge>
                            <Badge variant="secondary">{dayPlan.intensity}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{dayPlan.rationale}</p>
                        
                        <div className="space-y-2">
                          {dayPlan.exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <Play className="h-3 w-3 text-green-500" />
                              <div className="flex-1">
                                <span className="font-medium">{exercise.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {exercise.sets} sets × {exercise.reps}
                                </span>
                              </div>
                              {exercise.notes && (
                                <span className="text-xs text-gray-500">{exercise.notes}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition & Recovery */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Nutrition Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>Calories: {easyPlan.nutrition?.calorie_adjustment || '+100'}</div>
                      <div>Protein: {easyPlan.nutrition?.protein_target || '120g'}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recovery Strategies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>Sleep: {easyPlan.recovery?.sleep_target || '8-9 hours'}</div>
                      <div>Focus: Form over intensity</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Weekly Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {easyPlan.goals.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={adoptEasyPlan} 
                  disabled={isAdopting}
                  className="flex-1"
                >
                  {isAdopting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adopting Plan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Adopt This Plan
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isAdopting}
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && !easyPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Error Generating Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  There was an error generating your easy plan. Please try again.
                </p>
                <Button onClick={generateEasyPlan} className="mt-3">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
