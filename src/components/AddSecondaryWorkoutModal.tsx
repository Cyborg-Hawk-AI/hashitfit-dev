import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Plus, 
  Clock, 
  Target, 
  Zap, 
  Dumbbell, 
  Search,
  Loader2,
  CheckCircle
} from "lucide-react";

interface AddSecondaryWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onWorkoutAdded: () => void;
}

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimated_duration: string;
  target_muscles: string[];
  ai_generated: boolean;
  created_at: string;
}

interface PublicWorkout {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimated_duration: string;
  target_muscles: string[];
}

export function AddSecondaryWorkoutModal({ 
  isOpen, 
  onClose, 
  selectedDate,
  onWorkoutAdded 
}: AddSecondaryWorkoutModalProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [userWorkouts, setUserWorkouts] = useState<WorkoutPlan[]>([]);
  const [publicWorkouts, setPublicWorkouts] = useState<PublicWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("user");

  // Load available workouts
  useEffect(() => {
    if (isOpen && userId) {
      loadWorkouts();
    }
  }, [isOpen, userId]);

  const loadWorkouts = async () => {
    setIsLoading(true);
    try {
      // Load user's workout plans
      const { data: userWorkoutData, error: userError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUserWorkouts(userWorkoutData || []);

      // Load public workout templates (you can create these or use a predefined list)
      const publicWorkoutTemplates: PublicWorkout[] = [
        {
          id: 'public-1',
          title: 'Quick Cardio Session',
          description: 'Fast-paced cardio workout for energy boost',
          category: 'cardio',
          difficulty: 2,
          estimated_duration: '00:20:00',
          target_muscles: ['full_body']
        },
        {
          id: 'public-2',
          title: 'Core Strengthening',
          description: 'Focused core and stability exercises',
          category: 'strength',
          difficulty: 2,
          estimated_duration: '00:25:00',
          target_muscles: ['core', 'abs']
        },
        {
          id: 'public-3',
          title: 'Flexibility & Mobility',
          description: 'Stretching and mobility routine',
          category: 'recovery',
          difficulty: 1,
          estimated_duration: '00:15:00',
          target_muscles: ['full_body']
        },
        {
          id: 'public-4',
          title: 'Upper Body Focus',
          description: 'Targeted upper body strength training',
          category: 'strength',
          difficulty: 3,
          estimated_duration: '00:35:00',
          target_muscles: ['chest', 'back', 'shoulders', 'arms']
        },
        {
          id: 'public-5',
          title: 'Lower Body Power',
          description: 'Lower body strength and power exercises',
          category: 'strength',
          difficulty: 3,
          estimated_duration: '00:30:00',
          target_muscles: ['legs', 'glutes']
        }
      ];

      setPublicWorkouts(publicWorkoutTemplates);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast({
        title: "Error",
        description: "Failed to load available workouts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorkout = async (workout: WorkoutPlan | PublicWorkout) => {
    if (!userId) return;

    try {
      let workoutPlanId = workout.id;
      
      // If it's a public template (starts with 'public-'), create a new workout plan
      if (workout.id.startsWith('public-')) {
        console.log('Creating workout plan from public template...');
        
        // Create the workout plan from template
        const { data: newWorkoutPlan, error: createError } = await supabase
          .from('workout_plans')
          .insert({
            user_id: userId,
            title: workout.title,
            description: workout.description,
            category: workout.category,
            difficulty: workout.difficulty,
            estimated_duration: workout.estimated_duration,
            target_muscles: workout.target_muscles,
            ai_generated: false
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating workout plan from template:', createError);
          toast({
            title: "Error",
            description: "Failed to create workout plan from template",
            variant: "destructive"
          });
          return;
        }
        
        workoutPlanId = newWorkoutPlan.id;
      }

      // Schedule the workout for the selected date
      const { error } = await supabase
        .from('workout_schedule')
        .insert({
          user_id: userId,
          workout_plan_id: workoutPlanId,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          is_completed: false
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${workout.title} has been added to ${format(selectedDate, 'MMM d')}`,
        variant: "default"
      });

      onWorkoutAdded();
      onClose();
    } catch (error) {
      console.error('Error adding workout:', error);
      toast({
        title: "Error",
        description: "Failed to add workout to schedule",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-green-100 text-green-700";
      case 2: return "bg-yellow-100 text-yellow-700";
      case 3: return "bg-orange-100 text-orange-700";
      case 4: return "bg-red-100 text-red-700";
      case 5: return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return "bg-blue-100 text-blue-700";
      case 'cardio': return "bg-green-100 text-green-700";
      case 'hiit': return "bg-red-100 text-red-700";
      case 'recovery': return "bg-purple-100 text-purple-700";
      case 'sport_specific': return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUserWorkouts = userWorkouts.filter(workout =>
    workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublicWorkouts = publicWorkouts.filter(workout =>
    workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add Secondary Workout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">My Workouts</TabsTrigger>
              <TabsTrigger value="public">Public Templates</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading workouts...</span>
              </div>
            ) : (
              <>
                <TabsContent value="user" className="space-y-3">
                  {filteredUserWorkouts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Dumbbell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No workouts found</p>
                      <p className="text-sm">Create your first workout to get started</p>
                    </div>
                  ) : (
                    filteredUserWorkouts.map((workout) => (
                      <Card key={workout.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{workout.title}</h3>
                                {workout.ai_generated && (
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={getCategoryColor(workout.category)}>
                                  {workout.category}
                                </Badge>
                                <Badge className={getDifficultyColor(workout.difficulty)}>
                                  Level {workout.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {workout.estimated_duration}
                                </div>
                              </div>

                              {workout.target_muscles && workout.target_muscles.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {workout.target_muscles.map((muscle, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {muscle}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => handleAddWorkout(workout)}
                              size="sm"
                              className="ml-4"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="public" className="space-y-3">
                  {filteredPublicWorkouts.map((workout) => (
                    <Card key={workout.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{workout.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                Template
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getCategoryColor(workout.category)}>
                                {workout.category}
                              </Badge>
                              <Badge className={getDifficultyColor(workout.difficulty)}>
                                Level {workout.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                {workout.estimated_duration}
                              </div>
                            </div>

                            {workout.target_muscles && workout.target_muscles.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {workout.target_muscles.map((muscle, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {muscle}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleAddWorkout(workout)}
                            size="sm"
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
