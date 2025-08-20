# Assessment Data Flow Chart: Edge Functions to UI Visualization

## 📊 Detailed Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ASSESSMENT COMPLETION FLOW                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────────────────────────────────────┐
│   User Input    │───▶│ PlanGenerationService│───▶│           Three Edge Functions (Parallel)           │
│                 │    │                     │    │                                                     │
│ • Name: "aaaa"  │    │ • Update Profile    │    │  ┌─────────────────┐  ┌─────────────────┐  ┌──────┐ │
│ • Age: 30       │    │ • Store Assessment  │    │  │ workout-assistant│  │nutrition-assistant│  │recommendations│ │
│ • Gender: male  │    │ • Call Edge Funcs   │    │  │                 │  │                 │  │assistant│ │
│ • Height: 175   │    │ • Process Results   │    │  │                 │  │                 │  │        │ │
│ • Weight: 75    │    │                     │    │  └─────────────────┘  └─────────────────┘  └────────┘ │
│ • Goal: fitness │    └─────────────────────┘    └─────────────────────────────────────────────────────┘
└─────────────────┘                                                                                        │
                                                                                                           │
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE STORAGE                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WORKOUT ASSISTANT OUTPUT                    │  NUTRITION ASSISTANT OUTPUT    │  RECOMMENDATIONS OUTPUT  │
│                                              │                               │                         │
│ ┌─────────────────────────────────────────┐  │  ┌─────────────────────────┐  │  ┌─────────────────────┐ │
│ │ workout_plans                           │  │  │ nutrition_plans          │  │  │ user_recommendations │ │
│ │ • id: uuid                              │  │  │ • id: uuid               │  │  │ • id: uuid           │ │
│ │ • user_id: uuid                         │  │  │ • user_id: uuid          │  │  │ • user_id: uuid      │ │
│ │ • title: "Upper Body Strength"          │  │  │ • daily_calories: 2100   │  │  │ • workout_tips: text │ │
│ │ • category: "strength"                  │  │  │ • protein_g: 140         │  │  │ • nutrition_tips: text│ │
│ │ • difficulty: 3                         │  │  │ • carbs_g: 210           │  │  │ • weekly_goals: text │ │
│ │ • estimated_duration: "45 minutes"      │  │  │ • fat_g: 70              │  │  │ • created_at: timestamp│ │
│ │ • ai_generated: true                    │  │  │ • diet_type: "standard"  │  │  │ • updated_at: timestamp│ │
│ └─────────────────────────────────────────┘  │  │ • ai_generated: true     │  │  └─────────────────────┘ │
│                                              │  └─────────────────────────┘  │                         │
│ ┌─────────────────────────────────────────┐  │  ┌─────────────────────────┐  │                         │
│ │ workout_exercises                       │  │  │ meal_plans              │  │                         │
│ │ • workout_plan_id: uuid                 │  │  │ • nutrition_plan_id: uuid│  │                         │
│ │ • name: "Push-ups"                      │  │  │ • meal_type: "breakfast" │  │                         │
│ │ • sets: 3                               │  │  │ • meal_title: "Smoothie" │  │                         │
│ │ • reps: "10-15"                         │  │  │ • calories: 450          │  │                         │
│ │ • weight: "bodyweight"                  │  │  │ • protein_g: 25          │  │                         │
│ │ • rest_time: "60 seconds"               │  │  │ • carbs_g: 45            │  │                         │
│ │ • notes: "Keep proper form"             │  │  │ • fat_g: 15              │  │                         │
│ │ • order_index: 0                        │  │  │ • order_index: 0         │  │                         │
│ └─────────────────────────────────────────┘  │  └─────────────────────────┘  │                         │
│                                              │                               │                         │
│ ┌─────────────────────────────────────────┐  │                               │                         │
│ │ workout_schedule                        │  │                               │                         │
│ │ • user_id: uuid                         │  │                               │                         │
│ │ • workout_plan_id: uuid                 │  │                               │                         │
│ │ • scheduled_date: "2025-01-20"          │  │                               │                         │
│ │ • is_completed: false                   │  │                               │                         │
│ │ • completed_at: null                    │  │                               │                         │
│ └─────────────────────────────────────────┘  │                               │                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    UI DATA FETCHING                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  useDashboardData Hook                     │  WorkoutService                │  AssessmentService        │
│                                            │                               │                           │
│ ┌───────────────────────────────────────┐  │  ┌─────────────────────────┐  │  ┌─────────────────────┐ │
│ │ • weeklyWorkouts                      │  │  │ • getWorkoutSchedule()   │  │  │ • getWeeklyWorkouts()│ │
│ │ • workoutSchedules                    │  │  │ • getWorkoutPlans()      │  │  │ • getAssessmentData()│ │
│ │ • isLoadingWeekly                     │  │  │ • getWorkoutExercises()  │  │  │ • getUserProfile()   │ │
│ │ • isLoadingSchedules                  │  │  │ • getCompletedWorkouts() │  │  │ • getProgressMetrics()│ │
│ │ • startOfCurrentWeek                  │  │  └─────────────────────────┘  │  └─────────────────────┘ │
│ │ • today                               │  │                               │                           │
│ └───────────────────────────────────────┘  │                               │                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DASHBOARD COMPONENTS                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  HeroCTACard                              │  DailySnapshotRing             │  AIInsightTile            │
│  (Today's Workout)                        │  (Nutrition Progress)          │  (Coach Insights)         │
│                                            │                               │                           │
│ ┌───────────────────────────────────────┐  │  ┌─────────────────────────┐  │  ┌─────────────────────┐ │
│ │ Data Source: workout_schedule         │  │  │ Data Source: nutrition_plans│  │  │ Data Source: user_recommendations│ │
│ │                                        │  │  │ + nutrition_logs         │  │  │                     │ │
│ │ • workout.title → "Upper Body Strength"│  │  │                         │  │  │ • workout_tips → "Focus on compound movements..."│ │
│ │ • workout.exercises.length → 8         │  │  │ • daily_calories → 2100  │  │  │ • nutrition_tips → "Prioritize protein..."│ │
│ │ • workout.estimatedDuration → 45       │  │  │ • protein_g → 140        │  │  │ • weekly_goals → "Complete 3 workouts..."│ │
│ │ • workout.isCompleted → false          │  │  │ • consumed_calories → 1200│  │  │                     │ │
│ │                                        │  │  │ • consumed_protein → 85   │  │  │                     │ │
│ │ Visual: Large card with start button   │  │  │                         │  │  │ Visual: Collapsible insight card│ │
│ └───────────────────────────────────────┘  │  │ Visual: Circular progress rings│  │  └─────────────────────┘ │
│                                            │  └─────────────────────────┘  │                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WeightProgressCard                       │  WeeklyTimelineView            │  CompletedItemsList       │
│  (Progress Tracking)                      │  (Weekly Overview)             │  (Today's Activities)     │
│                                            │                               │                           │
│ ┌───────────────────────────────────────┐  │  ┌─────────────────────────┐  │  ┌─────────────────────┐ │
│ │ Data Source: progress_metrics         │  │  │ Data Source: workout_schedule│  │  │ Data Source: workout_logs│ │
│ │                                        │  │  │ + nutrition_logs         │  │  │ + meal_logs          │ │
│ │ • current_weight → 75                 │  │  │                         │  │  │                     │ │
│ │ • start_weight → 78                   │  │  │ • scheduled_date → dates │  │  │ • start_time → timestamps│ │
│ │ • weight_data → [{date, value}]       │  │  │ • is_completed → boolean │  │  │ • workout_plan_id → uuid│ │
│ │ • nutrition_context → nutrition_plans │  │  │ • log_date → dates       │  │  │ • consumed_at → timestamps│ │
│ │                                        │  │  │                         │  │  │                     │ │
│ │ Visual: Weight trend chart            │  │  │ Visual: Weekly calendar  │  │  │ Visual: Activity list │ │
│ └───────────────────────────────────────┘  │  └─────────────────────────┘  │  └─────────────────────┘ │
│                                            │                               │                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CURRENT STATUS                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

✅ WORKING:
├── Assessment completion flow
├── Edge function data generation
├── Database storage (workout_plans, workout_exercises, workout_schedule)
├── HeroCTACard (shows today's workout)
├── WeeklyTimelineView (shows scheduled workouts)

❌ BROKEN/MISSING:
├── DailySnapshotRing (uses hardcoded values, not nutrition_plans)
├── AIInsightTile (uses hardcoded content, not user_recommendations)
├── WeightProgressCard (uses mock data, not progress_metrics)
├── CompletedItemsList (uses mock data, not actual logs)
├── Real-time updates (not implemented)
├── Nutrition data fetching (not connected)
├── Recommendations data fetching (not connected)

🔄 PARTIALLY WORKING:
├── Workout data visualization (basic functionality works)
├── Database queries (some components fetch data)
├── User actions (workout completion, meal logging)

## 🎯 Key Data Flow Issues

### 1. **Data Generation vs. Visualization Gap**
- Edge functions generate rich, structured data ✅
- UI components use hardcoded/mock data ❌
- Database storage works correctly ✅
- Data fetching is incomplete ❌

### 2. **Missing Service Connections**
- `NutritionService` not used in dashboard
- `RecommendationsService` not implemented
- `ProgressService` not connected to UI

### 3. **Real-time Updates Missing**
- No Supabase real-time subscriptions
- UI doesn't update when data changes
- User actions don't trigger UI updates

### 4. **Error Handling**
- No loading states for missing data
- No fallback UI for failed data fetching
- No error boundaries for broken components
