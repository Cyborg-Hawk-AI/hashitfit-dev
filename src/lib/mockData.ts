import { format, addDays, subDays } from 'date-fns';

export interface MockUser {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  fitness_goal: 'muscle_gain' | 'weight_loss' | 'endurance' | 'general_fitness';
  workout_frequency: number;
  diet: string;
  equipment: string;
  target_weight?: number;
  sports_played: string[];
  allergies: string[];
  has_completed_assessment: boolean;
}

export interface MockWorkoutPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery';
  difficulty: number;
  estimated_duration: number; // in minutes
  target_muscles: string[];
  ai_generated: boolean;
  exercises: MockExercise[];
}

export interface MockExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  order_index: number;
  notes?: string;
  completed?: boolean;
  source?: 'planned' | 'voice';
}

export interface MockWorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  is_completed: boolean;
  completion_date?: string;
  workout_log_id?: string;
}

export interface MockNutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  water_intake_ml: number;
  meals: MockMealLog[];
}

export interface MockMealLog {
  id: string;
  meal_title: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_description: string;
  consumed_at: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  food_items: any;
}

export interface MockProgressMetric {
  id: string;
  user_id: string;
  measurement_date: string;
  weight: number;
  body_fat_percentage?: number;
  chest_measurement?: number;
  waist_measurement?: number;
  arm_measurement?: number;
  notes?: string;
}

export interface MockChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

class MockDataService {
  private static instance: MockDataService;
  private mockUser: MockUser;
  private workoutPlans: MockWorkoutPlan[];
  private workoutSchedules: MockWorkoutSchedule[];
  private nutritionLogs: MockNutritionLog[];
  private progressMetrics: MockProgressMetric[];
  private chatMessages: MockChatMessage[];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private initializeMockData() {
    // Use the actual user ID from the system
    const userId = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

    // Mock user profile
    this.mockUser = {
      id: userId,
      name: 'Alex Johnson',
      age: 28,
      gender: 'male',
      height: 175,
      weight: 78,
      fitness_goal: 'muscle_gain',
      workout_frequency: 4,
      diet: 'standard',
      equipment: 'full_gym',
      target_weight: 85,
      sports_played: ['Basketball', 'Swimming'],
      allergies: ['Peanuts'],
      has_completed_assessment: true
    };

    // Mock workout plans
    this.workoutPlans = [
      {
        id: 'workout-1',
        user_id: userId,
        title: 'Push Day - Chest, Shoulders & Triceps',
        description: 'A comprehensive upper body push workout focusing on chest, shoulders, and triceps development.',
        category: 'strength',
        difficulty: 6,
        estimated_duration: 45,
        target_muscles: ['Chest', 'Shoulders', 'Triceps'],
        ai_generated: true,
        exercises: [
          {
            id: 'ex-1',
            name: 'Barbell Bench Press',
            sets: 4,
            reps: '8-10',
            weight: '80kg',
            order_index: 1,
            notes: 'Focus on controlled movement and full range of motion',
            completed: true
          },
          {
            id: 'ex-2',
            name: 'Overhead Press',
            sets: 3,
            reps: '10-12',
            weight: '50kg',
            order_index: 2,
            notes: 'Keep core tight throughout the movement',
            completed: true
          },
          {
            id: 'ex-3',
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: '10-12',
            weight: '30kg',
            order_index: 3,
            notes: 'Use dumbbells for better range of motion',
            completed: false
          },
          {
            id: 'ex-4',
            name: 'Lateral Raises',
            sets: 3,
            reps: '12-15',
            weight: '12kg',
            order_index: 4,
            notes: 'Control the weight on the way down',
            completed: false
          },
          {
            id: 'ex-5',
            name: 'Tricep Dips',
            sets: 3,
            reps: '12-15',
            weight: 'bodyweight',
            order_index: 5,
            notes: 'Use assistance if needed to maintain form',
            completed: false
          },
          {
            id: 'ex-6',
            name: 'Push-ups',
            sets: 2,
            reps: '15-20',
            weight: 'bodyweight',
            order_index: 6,
            notes: 'Finisher exercise - go to failure',
            completed: false
          }
        ]
      },
      {
        id: 'workout-2',
        user_id: userId,
        title: 'Pull Day - Back & Biceps',
        description: 'Target your pulling muscles with this back and bicep focused workout.',
        category: 'strength',
        difficulty: 6,
        estimated_duration: 50,
        target_muscles: ['Back', 'Biceps', 'Rear Delts'],
        ai_generated: true,
        exercises: [
          {
            id: 'ex-7',
            name: 'Deadlifts',
            sets: 4,
            reps: '6-8',
            weight: '100kg',
            order_index: 1,
            notes: 'Focus on hip hinge movement pattern'
          },
          {
            id: 'ex-8',
            name: 'Pull-ups',
            sets: 4,
            reps: '8-12',
            weight: 'bodyweight',
            order_index: 2,
            notes: 'Use assistance if needed'
          },
          {
            id: 'ex-9',
            name: 'Barbell Rows',
            sets: 3,
            reps: '10-12',
            weight: '70kg',
            order_index: 3,
            notes: 'Keep back straight and pull to lower chest'
          },
          {
            id: 'ex-10',
            name: 'Lat Pulldowns',
            sets: 3,
            reps: '10-12',
            weight: '60kg',
            order_index: 4,
            notes: 'Focus on squeezing shoulder blades together'
          },
          {
            id: 'ex-11',
            name: 'Bicep Curls',
            sets: 3,
            reps: '12-15',
            weight: '15kg',
            order_index: 5,
            notes: 'Control the negative portion'
          },
          {
            id: 'ex-12',
            name: 'Face Pulls',
            sets: 3,
            reps: '15-20',
            weight: '20kg',
            order_index: 6,
            notes: 'Great for rear delt development'
          }
        ]
      },
      {
        id: 'workout-3',
        user_id: userId,
        title: 'Leg Day - Quads, Glutes & Hamstrings',
        description: 'A complete lower body workout targeting all major leg muscles.',
        category: 'strength',
        difficulty: 7,
        estimated_duration: 55,
        target_muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
        ai_generated: true,
        exercises: [
          {
            id: 'ex-13',
            name: 'Squats',
            sets: 4,
            reps: '8-10',
            weight: '90kg',
            order_index: 1,
            notes: 'Go deep and drive through heels'
          },
          {
            id: 'ex-14',
            name: 'Romanian Deadlifts',
            sets: 3,
            reps: '10-12',
            weight: '70kg',
            order_index: 2,
            notes: 'Focus on hamstring stretch'
          },
          {
            id: 'ex-15',
            name: 'Bulgarian Split Squats',
            sets: 3,
            reps: '12 each leg',
            weight: '20kg',
            order_index: 3,
            notes: 'Great for single leg strength'
          },
          {
            id: 'ex-16',
            name: 'Leg Press',
            sets: 3,
            reps: '15-20',
            weight: '140kg',
            order_index: 4,
            notes: 'Use full range of motion'
          },
          {
            id: 'ex-17',
            name: 'Calf Raises',
            sets: 4,
            reps: '15-20',
            weight: '40kg',
            order_index: 5,
            notes: 'Pause at the top for better contraction'
          }
        ]
      },
      {
        id: 'workout-4',
        user_id: userId,
        title: 'HIIT Cardio Blast',
        description: 'High intensity interval training for maximum calorie burn.',
        category: 'hiit',
        difficulty: 5,
        estimated_duration: 30,
        target_muscles: ['Full Body'],
        ai_generated: false,
        exercises: [
          {
            id: 'ex-18',
            name: 'Burpees',
            sets: 4,
            reps: '30 seconds',
            weight: 'bodyweight',
            order_index: 1,
            notes: '30 seconds on, 30 seconds rest'
          },
          {
            id: 'ex-19',
            name: 'Mountain Climbers',
            sets: 4,
            reps: '30 seconds',
            weight: 'bodyweight',
            order_index: 2,
            notes: 'Keep core engaged throughout'
          },
          {
            id: 'ex-20',
            name: 'Jump Squats',
            sets: 4,
            reps: '30 seconds',
            weight: 'bodyweight',
            order_index: 3,
            notes: 'Land softly to protect knees'
          },
          {
            id: 'ex-21',
            name: 'High Knees',
            sets: 4,
            reps: '30 seconds',
            weight: 'bodyweight',
            order_index: 4,
            notes: 'Drive knees up to chest level'
          }
        ]
      }
    ];

    // Mock workout schedules
    const today = new Date();
    this.workoutSchedules = [
      {
        id: 'schedule-1',
        user_id: userId,
        workout_plan_id: 'workout-1',
        scheduled_date: format(subDays(today, 2), 'yyyy-MM-dd'),
        scheduled_time: '09:00:00',
        is_completed: true,
        completion_date: format(subDays(today, 2), 'yyyy-MM-dd'),
        workout_log_id: 'log-1'
      },
      {
        id: 'schedule-2',
        user_id: userId,
        workout_plan_id: 'workout-2',
        scheduled_date: format(today, 'yyyy-MM-dd'),
        scheduled_time: '09:00:00',
        is_completed: false
      },
      {
        id: 'schedule-3',
        user_id: userId,
        workout_plan_id: 'workout-3',
        scheduled_date: format(addDays(today, 2), 'yyyy-MM-dd'),
        scheduled_time: '09:00:00',
        is_completed: false
      },
      {
        id: 'schedule-4',
        user_id: userId,
        workout_plan_id: 'workout-4',
        scheduled_date: format(addDays(today, 4), 'yyyy-MM-dd'),
        scheduled_time: '17:00:00',
        is_completed: false
      }
    ];

    // Mock nutrition logs
    this.nutritionLogs = [
      {
        id: 'nutrition-1',
        user_id: userId,
        log_date: format(subDays(today, 2), 'yyyy-MM-dd'),
        total_calories: 2750,
        total_protein_g: 175,
        total_carbs_g: 295,
        total_fat_g: 98,
        water_intake_ml: 2800,
        meals: []
      },
      {
        id: 'nutrition-2',
        user_id: userId,
        log_date: format(subDays(today, 1), 'yyyy-MM-dd'),
        total_calories: 2600,
        total_protein_g: 165,
        total_carbs_g: 280,
        total_fat_g: 95,
        water_intake_ml: 2500,
        meals: []
      },
      {
        id: 'nutrition-3',
        user_id: userId,
        log_date: format(today, 'yyyy-MM-dd'),
        total_calories: 1800,
        total_protein_g: 120,
        total_carbs_g: 200,
        total_fat_g: 70,
        water_intake_ml: 1800,
        meals: [
          {
            id: 'meal-1',
            meal_title: 'Protein Pancakes with Berries',
            meal_type: 'breakfast',
            meal_description: 'Fluffy protein pancakes topped with mixed berries and a drizzle of maple syrup',
            consumed_at: format(today, 'yyyy-MM-dd') + 'T08:00:00Z',
            calories: 450,
            protein_g: 35,
            carbs_g: 55,
            fat_g: 12,
            food_items: {
              items: [
                { name: 'Protein Powder', amount: '2 scoops' },
                { name: 'Oats', amount: '1/2 cup' },
                { name: 'Egg Whites', amount: '3 large' },
                { name: 'Mixed Berries', amount: '1 cup' }
              ]
            }
          },
          {
            id: 'meal-2',
            meal_title: 'Grilled Chicken Salad',
            meal_type: 'lunch',
            meal_description: 'Fresh garden salad with grilled chicken breast, avocado, and olive oil dressing',
            consumed_at: format(today, 'yyyy-MM-dd') + 'T13:00:00Z',
            calories: 520,
            protein_g: 42,
            carbs_g: 25,
            fat_g: 28,
            food_items: {
              items: [
                { name: 'Chicken Breast', amount: '150g' },
                { name: 'Mixed Greens', amount: '2 cups' },
                { name: 'Avocado', amount: '1/2 medium' },
                { name: 'Cherry Tomatoes', amount: '1 cup' },
                { name: 'Olive Oil', amount: '1 tbsp' }
              ]
            }
          },
          {
            id: 'meal-3',
            meal_title: 'Greek Yogurt with Granola',
            meal_type: 'snack',
            meal_description: 'High-protein Greek yogurt with homemade granola and honey',
            consumed_at: format(today, 'yyyy-MM-dd') + 'T16:00:00Z',
            calories: 280,
            protein_g: 20,
            carbs_g: 35,
            fat_g: 8,
            food_items: {
              items: [
                { name: 'Greek Yogurt', amount: '1 cup' },
                { name: 'Granola', amount: '1/4 cup' },
                { name: 'Honey', amount: '1 tbsp' }
              ]
            }
          }
        ]
      }
    ];

    // Mock progress metrics
    this.progressMetrics = [
      {
        id: 'progress-1',
        user_id: userId,
        measurement_date: format(subDays(today, 30), 'yyyy-MM-dd'),
        weight: 78.0,
        body_fat_percentage: 15.5,
        chest_measurement: 102.0,
        waist_measurement: 82.0,
        arm_measurement: 35.0,
        notes: 'Starting measurements'
      },
      {
        id: 'progress-2',
        user_id: userId,
        measurement_date: format(subDays(today, 15), 'yyyy-MM-dd'),
        weight: 78.5,
        body_fat_percentage: 15.2,
        chest_measurement: 102.5,
        waist_measurement: 81.5,
        arm_measurement: 35.2,
        notes: 'Good progress so far'
      },
      {
        id: 'progress-3',
        user_id: userId,
        measurement_date: format(today, 'yyyy-MM-dd'),
        weight: 79.2,
        body_fat_percentage: 14.8,
        chest_measurement: 103.0,
        waist_measurement: 81.0,
        arm_measurement: 35.5,
        notes: 'Muscle gain visible!'
      }
    ];

    // Mock chat messages
    this.chatMessages = [
      {
        id: 'chat-1',
        user_id: userId,
        content: 'Hi! I need help with my workout plan. I want to focus more on my shoulders.',
        role: 'user',
        created_at: format(subDays(today, 1), 'yyyy-MM-dd') + 'T10:00:00Z'
      },
      {
        id: 'chat-2',
        user_id: userId,
        content: 'I\'d be happy to help you focus more on your shoulders! Based on your current Push Day workout, you already have some great shoulder exercises like Overhead Press and Lateral Raises. Here are some suggestions to enhance your shoulder development:\n\n1. **Add more shoulder volume**: Consider adding rear delt flies or face pulls to your push day\n2. **Vary your rep ranges**: Try 8-12 reps for strength and 15-20 for endurance\n3. **Focus on form**: Shoulders respond well to controlled movements\n\nWould you like me to suggest some specific exercises or modify your current routine?',
        role: 'assistant',
        created_at: format(subDays(today, 1), 'yyyy-MM-dd') + 'T10:02:00Z'
      },
      {
        id: 'chat-3',
        user_id: userId,
        content: 'What should I eat after my workout today?',
        role: 'user',
        created_at: format(today, 'yyyy-MM-dd') + 'T14:00:00Z'
      },
      {
        id: 'chat-4',
        user_id: userId,
        content: 'Great question! Since you just completed your Pull Day workout, here\'s what I recommend for post-workout nutrition:\n\n**Within 30-60 minutes:**\n- **Protein**: 25-30g (chicken breast, protein shake, or Greek yogurt)\n- **Carbs**: 30-50g (banana, rice, or oats) to replenish glycogen\n\n**Meal ideas:**\n- Protein shake with banana and berries\n- Chicken breast with sweet potato\n- Greek yogurt with granola and fruit\n\nBased on your muscle gain goals, aim for around 500-600 calories in this post-workout meal. Don\'t forget to hydrate well too!\n\nWould you like a specific recipe recommendation?',
        role: 'assistant',
        created_at: format(today, 'yyyy-MM-dd') + 'T14:01:00Z'
      }
    ];
  }

  // Public methods to access mock data
  public getMockUser(): MockUser {
    return this.mockUser;
  }

  public getWorkoutPlans(): MockWorkoutPlan[] {
    return this.workoutPlans;
  }

  public getWorkoutSchedules(): MockWorkoutSchedule[] {
    return this.workoutSchedules;
  }

  public getWeeklyWorkouts(): Record<string, any> {
    const today = new Date();
    const weeklyData: Record<string, any> = {};
    
    // Generate data for the current week
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i - 3); // 3 days before to 3 days after
      const dateString = format(date, 'yyyy-MM-dd');
      const schedule = this.workoutSchedules.find(s => s.scheduled_date === dateString);
      
      if (schedule) {
        const workoutPlan = this.workoutPlans.find(w => w.id === schedule.workout_plan_id);
        weeklyData[dateString] = {
          ...workoutPlan,
          is_completed: schedule.is_completed,
          schedule_id: schedule.id
        };
      }
    }
    
    return weeklyData;
  }

  public getNutritionLogs(): MockNutritionLog[] {
    return this.nutritionLogs;
  }

  public getProgressMetrics(): MockProgressMetric[] {
    return this.progressMetrics;
  }

  public getChatMessages(): MockChatMessage[] {
    return this.chatMessages;
  }

  public getSelectedWorkout(selectedDate: string): any {
    const schedule = this.workoutSchedules.find(s => s.scheduled_date === selectedDate);
    if (!schedule) return null;

    const workoutPlan = this.workoutPlans.find(w => w.id === schedule.workout_plan_id);
    if (!workoutPlan) return null;

    return {
      schedule_id: schedule.id,
      id: workoutPlan.id,
      title: workoutPlan.title,
      exercises: workoutPlan.exercises.map(ex => ({
        ...ex,
        completed: schedule.is_completed ? Math.random() > 0.3 : false // Randomly complete some exercises for completed workouts
      })),
      is_completed: schedule.is_completed,
      workout_log_id: schedule.workout_log_id,
      category: workoutPlan.category,
      estimatedDuration: workoutPlan.estimated_duration,
      targetMuscles: workoutPlan.target_muscles,
      difficulty: workoutPlan.difficulty,
      aiGenerated: workoutPlan.ai_generated
    };
  }

  // Method to simulate completing an exercise
  public completeExercise(scheduleId: string, exerciseId: string, completed: boolean): void {
    const schedule = this.workoutSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      const workoutPlan = this.workoutPlans.find(w => w.id === schedule.workout_plan_id);
      if (workoutPlan) {
        const exercise = workoutPlan.exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
          exercise.completed = completed;
        }
      }
    }
  }

  // Method to get today's nutrition progress
  public getTodayNutrition(): MockNutritionLog | null {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.nutritionLogs.find(log => log.log_date === today) || null;
  }

  // Method to get latest progress metrics
  public getLatestProgress(): MockProgressMetric | null {
    return this.progressMetrics[this.progressMetrics.length - 1] || null;
  }
}

export const mockDataService = MockDataService.getInstance();
