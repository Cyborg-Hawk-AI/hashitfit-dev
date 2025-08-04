
# Dashboard Page Documentation

## 1. Overview

The Dashboard serves as the main hub of the HashimFit app, providing users with a comprehensive view of their daily fitness activities, progress, and quick access to key features. It's designed as a mobile-first experience that displays today's workout, nutrition progress, and AI-powered insights.

**User Interactions:**
- Quick meal logging via photo capture
- Voice workout logging
- Starting/continuing scheduled workouts
- Viewing daily progress summaries
- Accessing collapsible insight cards

## 2. UI Components & Layout

**Major Components:**
- `MealCaptureCard` - Photo-based meal logging
- `VoiceInput` - Voice-activated workout logging
- `DailyWorkoutSummaryCard` - Today's workout progress (data-driven)
- `NutritionProgressCard` - Daily macro tracking (data-driven)
- `TDEEBalanceCard` - Calorie balance insights (data-driven)
- `HabitStreakCard` - Habit tracking streaks (data-driven)
- `AICoachInsightCard` - AI-generated fitness insights (data-driven)
- `DayTab` - Weekly calendar navigation
- `WorkoutCard` - Detailed workout display
- `AddWorkoutModal` - Workout scheduling interface

**Layout Patterns:**
- Mobile-first design with max-width container (max-w-lg)
- Grid layout for action buttons (2-column grid)
- Collapsible card system for information density
- Horizontal scrolling week view
- Sticky header with logo and navigation

**Responsiveness:**
- Optimized for mobile with touch-friendly targets
- Smooth animations and transitions
- Scrollable areas with hidden scrollbars

## 3. User Actions

**Primary Actions:**
- **Snap a Snack**: Take photo → AI meal analysis → nutrition logging
- **Log Workout**: Voice input → exercise parsing → workout logging
- **Day Selection**: Navigate between days in current week
- **Exercise Completion**: Toggle exercise completion status
- **Workout Management**: Add new workouts, start sessions
- **Card Interaction**: Collapse/expand information cards

**State Changes:**
- Day selection updates workout and progress data
- Exercise completion triggers progress recalculation
- Meal/workout logging refreshes related displays
- Real-time updates from voice logging

## 4. Data Sources

**Supabase Tables:**
- `workout_schedule` - Scheduled workouts for selected dates
- `workout_plans` - Available workout templates
- `workout_exercises` - Exercise details within plans
- `exercise_logs` - Completed exercise records
- `profiles` - User profile information
- `assessment_data` - User fitness assessment results

**Derived Data:**
- Weekly workout summary from `AssessmentService.getWeeklyWorkouts()`
- Daily workout details with completion status
- Exercise completion tracking with voice-logged additions

**Edge Functions:**
- Meal photo analysis via `analyze-meal-photo`
- Voice workout parsing via `voice-workout-parser`

## 5. Data Submission

**Workout Scheduling:**
- Target: `workout_schedule` table
- Data: user_id, workout_plan_id, scheduled_date, completion status

**Exercise Completion:**
- Target: `exercise_logs` table via `workout_logs`
- Data: exercise_name, sets/reps/weight, completion timestamp
- Process: Creates workout_log if none exists, updates schedule completion

**Voice Logging:**
- Target: `exercise_logs` table
- Data: Real-time exercise tracking with sets, reps, weight
- Integration: Merges with planned exercises in display

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- Workout progress updates via TanStack Query invalidation
- Voice logging results appear immediately
- Exercise completion syncs across sessions
- Workout scheduling updates calendar view

**Query Invalidation Triggers:**
- Exercise completion → `['selectedWorkout', 'workoutSchedules', 'weeklyWorkouts']`
- Voice logging → `handleWorkoutUpdated()` callback
- Workout scheduling → All workout-related queries

**Visual Feedback:**
- Loading spinners during data fetching
- Toast notifications for successful actions
- Optimistic UI updates for exercise completion

## 7. AI Assistant & OpenAI Integration

**Meal Analysis:**
- **Function**: `analyze-meal-photo` Edge Function
- **Process**: Photo upload → OpenAI Vision API → nutrition extraction
- **Output**: Structured nutrition data with food items and macros

**Voice Workout Parsing:**
- **Function**: `voice-workout-parser` Edge Function
- **Process**: Voice transcription → exercise recognition → structured logging
- **Integration**: Real-time addition to current workout session

**AI Coach Insights:**
- **Component**: `AICoachInsightCard`
- **Data Source**: Aggregated user data + OpenAI analysis
- **Content**: Personalized fitness recommendations and progress insights

## Technical Implementation Notes

**State Management:**
- TanStack Query for server state management
- Local state for UI interactions and form data
- Optimistic updates for immediate user feedback

**Performance Optimizations:**
- Query stale time configuration (5 minutes)
- Conditional query execution based on authentication
- Efficient re-rendering with proper key management

**Error Handling:**
- Comprehensive try-catch blocks
- User-friendly error messages via toast system
- Graceful fallbacks for failed operations

**Data-Driven Design:**
- All dashboard cards now use prop-based data
- Empty states displayed when no data is available
- Loading states for improved user experience
- No mock data used in production components
