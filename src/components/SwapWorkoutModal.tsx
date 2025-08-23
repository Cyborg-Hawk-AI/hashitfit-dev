import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Clock, 
  Target, 
  Zap, 
  Dumbbell, 
  Search,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface SwapWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  currentWorkout?: any;
  onWorkoutSwapped: () => void;
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

export function SwapWorkoutModal({ 
  isOpen, 
  onClose, 
  selectedDate,
  currentWorkout,
  onWorkoutSwapped 
}: SwapWorkoutModalProps) {
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

      // Load public workout templates
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
        },
        {
          id: 'public-6',
          title: 'HIIT Circuit',
          description: 'High-intensity interval training circuit',
          category: 'hiit',
          difficulty: 4,
          estimated_duration: '00:25:00',
          target_muscles: ['full_body']
        },
        {
          id: 'public-7',
          title: 'Yoga Flow',
          description: 'Gentle yoga sequence for flexibility and relaxation',
          category: 'recovery',
          difficulty: 1,
          estimated_duration: '00:30:00',
          target_muscles: ['full_body']
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

  const handleSwapWorkout = async (newWorkout: WorkoutPlan | PublicWorkout) => {
    console.log('🔍 SwapWorkoutModal: handleSwapWorkout called with newWorkout:', newWorkout);
    console.log('👤 User ID:', userId);
    console.log('📅 Selected date:', format(selectedDate, 'yyyy-MM-dd'));
    console.log('🏋️ Current workout to replace:', currentWorkout);
    
    if (!userId) {
      console.log('❌ No userId, returning early');
      return;
    }

    try {
      let workoutPlanId = newWorkout.id;
      console.log('🏋️ Initial new workout plan ID:', workoutPlanId);
      
      // If it's a public template (starts with 'public-'), create a new workout plan
      if (newWorkout.id.startsWith('public-')) {
        console.log('🆕 Creating workout plan from public template for swap...');
        console.log('📝 Template data:', {
          user_id: userId,
          title: newWorkout.title,
          description: newWorkout.description,
          category: newWorkout.category,
          difficulty: newWorkout.difficulty,
          estimated_duration: newWorkout.estimated_duration,
          target_muscles: newWorkout.target_muscles,
          ai_generated: false
        });
        
        // Create the workout plan from template
        const { data: newWorkoutPlan, error: createError } = await supabase
          .from('workout_plans')
          .insert({
            user_id: userId,
            title: newWorkout.title,
            description: newWorkout.description,
            category: newWorkout.category,
            difficulty: newWorkout.difficulty,
            estimated_duration: newWorkout.estimated_duration,
            target_muscles: newWorkout.target_muscles,
            ai_generated: false
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Error creating workout plan from template:', createError);
          toast({
            title: "Error",
            description: "Failed to create workout plan from template",
            variant: "destructive"
          });
          return;
        }
        
        console.log('✅ Workout plan created from template:', newWorkoutPlan);
        workoutPlanId = newWorkoutPlan.id;
        console.log('🆔 New workout plan ID:', workoutPlanId);
      } else {
        console.log('🔄 Using existing workout plan ID:', workoutPlanId);
      }

      // First, remove the current workout from the schedule
      if (currentWorkout) {
        console.log('🗑️ Removing current workout from schedule:', currentWorkout.id);
        console.log('📝 Delete query params:', {
          user_id: userId,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          workout_plan_id: currentWorkout.id
        });
        
        const { error: deleteError } = await supabase
          .from('workout_schedule')
          .delete()
          .eq('user_id', userId)
          .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
          .eq('workout_plan_id', currentWorkout.id);

        if (deleteError) {
          console.error('❌ Error deleting current workout:', deleteError);
          throw deleteError;
        }
        
        console.log('✅ Current workout removed from schedule');
      } else {
        console.log('📭 No current workout to remove');
      }

      // Then, add the new workout to the schedule
      console.log('📅 Adding new workout to schedule');
      console.log('📝 Insert data:', {
        user_id: userId,
        workout_plan_id: workoutPlanId,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        is_completed: false
      });
      
      const { error: insertError } = await supabase
        .from('workout_schedule')
        .insert({
          user_id: userId,
          workout_plan_id: workoutPlanId,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          is_completed: false
        });

      if (insertError) {
        console.error('❌ Error inserting new workout:', insertError);
        throw insertError;
      }

      console.log('✅ New workout added to schedule successfully');

      toast({
        title: "Workout Swapped!",
        description: `${currentWorkout?.title || 'Previous workout'} has been replaced with ${newWorkout.title}`,
        variant: "default"
      });

      console.log('🔄 Calling onWorkoutSwapped callback');
      onWorkoutSwapped();
      console.log('✅ Closing modal');
      onClose();
    } catch (error) {
      console.error('❌ Error swapping workout:', error);
      toast({
        title: "Error",
        description: "Failed to swap workout",
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
            <RefreshCw className="h-5 w-5 text-orange-600" />
            Swap Workout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Workout Info */}
          {currentWorkout && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Current Workout</h3>
                </div>
                <p className="text-sm text-orange-700">{currentWorkout.title}</p>
                <p className="text-xs text-orange-600">This will be replaced with your selection</p>
              </CardContent>
            </Card>
          )}

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
                              onClick={() => handleSwapWorkout(workout)}
                              size="sm"
                              variant="outline"
                              className="ml-4"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Swap
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
                            onClick={() => handleSwapWorkout(workout)}
                            size="sm"
                            variant="outline"
                            className="ml-4"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Swap
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
