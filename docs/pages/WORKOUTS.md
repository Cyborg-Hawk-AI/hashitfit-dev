
# Workouts Page Documentation

## 1. Overview

The Workouts page serves as the comprehensive workout management interface, displaying scheduled workouts for selected dates, providing filtering options, and enabling workout session initiation. It supports both planned and voice-logged exercises with completion tracking.

**User Interactions:**
- Date-based workout viewing
- Workout filtering and search
- Session initiation and management
- Workout scheduling and editing
- Progress tracking and completion

## 2. UI Components & Layout

**Major Components:**
- `CalendarStrip` - Date selection interface
- `WorkoutCardImproved` - Enhanced workout display cards
- `WorkoutFilters` - Category and type filtering
- `AddWorkoutModal` - Workout scheduling modal
- `WorkoutSessionCard` - Active session interface
- `WorkoutCompletionSummary` - Post-workout summary
- `RestTimerOverlay` - Global rest timer
- `ChatFAB` - AI assistant access

**Layout Patterns:**
- Header with calendar navigation
- Filterable workout list
- Modal-based detailed views
- Overlay components for timers and completion

**Responsiveness:**
- Mobile-first design with touch optimization
- Responsive grid layouts
- Swipe-enabled navigation

## 3. User Actions

**Workout Management:**
- **View Workouts**: Browse scheduled workouts by date
- **Filter Workouts**: Apply category/type filters
- **Start Session**: Initiate workout sessions
- **Schedule New**: Add workouts to calendar
- **Edit Details**: Modify workout parameters

**Session Actions:**
- **Track Progress**: Log sets, reps, weights
- **Use Rest Timer**: Manage rest intervals
- **Complete Workout**: Finish sessions with ratings
- **Save Templates**: Create workout templates

## 4. Data Sources

**Supabase Tables:**
- `workout_schedule` - Scheduled workouts by date
- `workout_plans` - Available workout templates
- `workout_exercises` - Exercise definitions
- `exercise_logs` - Completed exercise data
- `workout_logs` - Session completion records

**Derived Data:**
- Combined planned and voice-logged exercises
- Completion status tracking
- Performance analytics

## 5. Data Submission

**Workout Scheduling:**
- Target: `workout_schedule` table
- Data: workout_plan_id, scheduled_date, user preferences

**Session Completion:**
- Target: `workout_logs` and `exercise_logs` tables
- Data: completion time, performance metrics, ratings
- Process: Creates comprehensive workout records

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- Live workout progress updates
- Multi-device session synchronization
- Immediate completion status updates

**Query Management:**
- Reactive data fetching based on date selection
- Optimistic updates for user actions
- Background synchronization

## 7. AI Assistant & OpenAI Integration

**Coach Integration:**
- Accessible via `ChatFAB` during workouts
- Real-time exercise guidance
- Form and technique suggestions
- Progress analysis and recommendations
