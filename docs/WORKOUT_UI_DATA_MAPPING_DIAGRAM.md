# Workout UI Data Mapping Diagram

## 📊 Database Tables → UI Components Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE TABLES                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

workout_schedule              workout_plans                workout_exercises
├── user_id                  ├── user_id                  ├── workout_plan_id
├── workout_plan_id          ├── title                    ├── name
├── scheduled_date           ├── category                 ├── sets
├── is_completed             ├── difficulty               ├── reps
├── completion_date          ├── estimated_duration       ├── weight
└── workout_log_id           └── target_muscles           ├── rest_time
                                                          └── order_index

workout_logs                 exercise_logs
├── user_id                  ├── workout_log_id
├── workout_plan_id          ├── exercise_name
├── start_time               ├── sets_completed
├── end_time                 ├── reps_completed
├── duration                 ├── weight_used
├── calories_burned          ├── rest_time
├── rating                   ├── order_index
└── notes                    └── position_in_workout
```

## 📱 UI Components Data Mapping

### **Workouts Page - List View**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              WORKOUTS LIST VIEW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

WorkoutSummaryCard            CalendarStrip                WorkoutFilters
├── workoutData               ├── selectedDate             ├── activeFilters
│   └── workout_schedule      │   └── date selection        └── filter categories
├── isCompleted               │                           │
│   └── workout_schedule      │                           │
├── estimatedDuration         │                           │
│   └── workout_plans         │                           │
└── onStartWorkout            │                           │
    └── workout_schedule      │                           │
```

### **Workouts Page - Session View**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              WORKOUT SESSION VIEW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

EnhancedWorkoutSessionCard    CompactExerciseCard          ProgressIndicator
├── workoutData               ├── exercise                 ├── completedCount
│   └── workout_plans         │   └── workout_exercises    ├── totalCount
├── exercises                 ├── isCompleted              └── percentage
│   └── workout_exercises     │   └── calculated           │
├── onToggleComplete          ├── onToggleComplete         │
│   └── exercise state        │   └── exercise state       │
└── onCompleteWorkout         └── onFormTips               │
    └── workout completion    │   └── exercise name        │
                             │                           │
RestTimerOverlay             StickyFooterBar              CollapsibleCoachInsight
├── restDuration             ├── currentState             ├── workout_tips
│   └── workout_exercises    │   └── session state        ├── nutrition_tips
├── isActive                 ├── onComplete               └── weekly_goals
│   └── exercise completion  │   └── workout completion   │
└── onComplete               └── onPause                  └── user_recommendations
    └── timer completion     │   └── session pause
```

### **Workouts Page - Completion View**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            WORKOUT COMPLETION VIEW                              │
└─────────────────────────────────────────────────────────────────────────────────┘

WorkoutCompletionSummary      PostWorkoutFeedbackModal     Performance Metrics
├── workout                   ├── rating                   ├── duration
│   └── workout_logs          │   └── user input           ├── calories_burned
├── duration                  ├── notes                    ├── exercise_count
│   └── calculated            │   └── user input           ├── completion_rate
├── caloriesBurned            ├── onComplete               └── performance_trend
│   └── workout_logs          │   └── final submission     │
├── muscleGroups              │                           │
│   └── workout_plans         │                           │
├── performanceTrend          │                           │
│   └── calculated            │                           │
└── onComplete                │                           │
    └── final submission      │                           │
```

## 🔄 Data Flow Summary

### **Workout Execution Flow:**

1. **Page Load** → `workout_schedule` + `workout_plans` + `workout_exercises`
2. **Start Session** → UI state transition (no database changes)
3. **Exercise Completion** → Real-time UI updates (local state)
4. **Complete Workout** → `workout_logs` + `exercise_logs` + `workout_schedule` updates
5. **Post-Feedback** → `workout_logs` rating and notes updates

### **Real-time Data Updates:**
- Exercise completion states (local state)
- Progress indicators (calculated from local state)
- Rest timers (local state)
- Session duration tracking (local state)

### **Persistent Data Creation:**
- Workout logs (session summary)
- Exercise logs (detailed completion data)
- Schedule updates (completion status)
- Performance metrics (calculated analytics)

### **Data Relationships:**
- `workout_schedule` → `workout_plans` → `workout_exercises`
- `workout_logs` → `exercise_logs` (one-to-many)
- `workout_schedule` → `workout_logs` (one-to-one when completed)

### **UI State Management:**
- React Query for server state
- Local state for session progress
- Optimistic updates for better UX
- Real-time synchronization across components
