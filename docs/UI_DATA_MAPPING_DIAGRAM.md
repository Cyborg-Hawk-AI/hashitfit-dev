# UI Data Mapping Diagram

## 📊 Database Tables → UI Components Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE TABLES                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

profiles                    assessment_data              workout_plans
├── user_id                ├── user_id                  ├── user_id
├── has_completed_assessment├── fitness_goal            ├── title
├── fitness_goal           ├── workout_frequency        ├── category
├── workout_frequency      ├── diet                     ├── difficulty
├── diet                   ├── equipment                └── target_muscles
└── equipment              └── allergies                │
                                                       │
nutrition_plans            user_recommendations         workout_exercises
├── user_id                ├── user_id                  ├── workout_plan_id
├── title                  ├── workout_tips             ├── name
├── daily_calories         ├── nutrition_tips           ├── sets
├── protein_g              └── weekly_goals             ├── reps
├── carbs_g                                               └── weight
└── fat_g

workout_schedule           nutrition_logs               meal_logs
├── user_id                ├── user_id                  ├── nutrition_log_id
├── workout_plan_id        ├── log_date                 ├── meal_type
├── scheduled_date         ├── total_calories           ├── meal_title
├── is_completed           ├── total_protein_g          ├── calories
└── completion_date        └── total_carbs_g            └── protein_g
```

## 📱 UI Components Data Mapping

### **Dashboard Page Components**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD UI                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

HeroCTACard                    DailyItemsList              DailySnapshotRing
├── selectedWorkout            ├── completedItems          ├── caloriesConsumed
│   └── workout_schedule       │   └── workout_logs        ├── caloriesTarget
├── nextWorkout                ├── pendingItems            ├── proteinConsumed
│   └── workout_schedule       │   └── workout_schedule    └── proteinTarget
└── onStartWorkout             └── onCompleteItem          │
                                                           │
GamificationCard              WeightProgressCard          AIInsightTile
├── streakDays                ├── currentWeight           ├── workout_tips
│   └── workout_logs          │   └── progress_metrics     ├── nutrition_tips
├── nutritionStreak           ├── startWeight             └── weekly_goals
│   └── nutrition_logs        └── weightData              │
└── longestWorkoutStreak      │                           │
    └── calculated            └── progress_metrics        └── user_recommendations
```

### **Planner Page Components**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PLANNER UI                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

EnhancedDailySummaryCard      PrescriptiveWeeklySummary   InteractiveAssistantPanel
├── workout                   ├── weeklyGoals             ├── workout_tips
│   └── workout_schedule      │   └── calculated          ├── nutrition_tips
├── meals                     ├── mostConsistentHabit     └── weekly_goals
│   └── meal_logs             │   └── calculated          │
├── habits                    ├── calorieBalance          └── user_recommendations
│   └── calculated            │   └── nutrition_logs
└── onSwapWorkout             └── momentumState
    └── workout_schedule          └── calculated
```

### **Workouts Page Components**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              WORKOUTS UI                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

WorkoutSummaryCard            Exercise List               ProgressIndicator
├── workoutData               ├── exercises               ├── completionStatus
│   └── workout_plans         │   └── workout_exercises   └── workout_schedule
├── isCompleted               ├── sets                    │
│   └── workout_schedule      ├── reps                    │
└── onStartWorkout            └── weight                  └── calculated
    └── workout_schedule          └── workout_exercises
```

## 🔄 Data Flow Summary

### **Assessment → AI → Database → UI Flow:**

1. **User Assessment** → `profiles` + `assessment_data`
2. **OpenAI Assistants** (Parallel):
   - `workout-assistant` → `workout_plans` + `workout_exercises`
   - `nutrition-assistant` → `nutrition_plans` + `meal_plans`
   - `recommendations-assistant` → `user_recommendations`
3. **UI Components** fetch data via:
   - React Query hooks (`useDashboardData`, `useSelectedWorkout`)
   - Service layer (`WorkoutService`, `NutritionService`)
   - Direct Supabase queries

### **Real-time Updates:**
- React Query handles data synchronization
- UI components automatically re-render when data changes
- Optimistic updates for better UX

### **Data Relationships:**
- `profiles` is the central user table
- `workout_plans` → `workout_exercises` → `workout_schedule`
- `nutrition_plans` → `meal_plans` → `nutrition_logs` → `meal_logs`
- `user_recommendations` provides AI-generated insights
