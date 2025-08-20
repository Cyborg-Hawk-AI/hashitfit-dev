
# Planner Page Documentation

## 1. Overview

The Planner page provides users with weekly workout scheduling and planning capabilities. It allows users to view, schedule, and manage their fitness routines across a week view, integrating with AI-generated workout recommendations and custom workout creation.

**User Interactions:**
- Weekly calendar navigation
- Workout scheduling and rescheduling
- Drag-and-drop workout planning
- AI workout generation requests
- Custom workout creation

## 2. UI Components & Layout

**Major Components:**
- `WeeklyCalendarStrip` - Week navigation interface
- `WeeklyPlannerCard` - Main planning interface
- `AddWorkoutModal` - Workout selection and scheduling
- `WorkoutCardImproved` - Enhanced workout display cards
- `PlanningFAB` - Floating action button for quick actions
- `AICoachBanner` - AI-powered planning suggestions

**Layout Patterns:**
- Weekly grid layout for workout scheduling
- Responsive card-based design
- Floating action buttons for primary actions
- Modal overlays for detailed interactions

**Responsiveness:**
- Mobile-optimized touch interfaces
- Adaptive grid layouts
- Swipe gestures for navigation

## 3. User Actions

**Planning Actions:**
- **Schedule Workouts**: Assign workouts to specific days
- **Reschedule**: Move workouts between days
- **Generate AI Plans**: Request AI-created workout schedules
- **Create Custom**: Build new workout routines
- **View Details**: Access detailed workout information

**Navigation Actions:**
- **Week Navigation**: Move between different weeks
- **Day Selection**: Focus on specific days for scheduling

## 4. Data Sources

**Supabase Tables:**
- `workout_plans` - Available workout templates
- `workout_schedule` - Scheduled workout assignments
- `workout_exercises` - Exercise details within plans
- `assessment_data` - User preferences for AI generation

**AI Integration:**
- Weekly workout generation via OpenAI
- Personalized recommendations based on user goals

## 5. Data Submission

**Workout Scheduling:**
- Target: `workout_schedule` table
- Data: workout_plan_id, scheduled_date, user_id

**AI Workout Requests:**
- Target: `generate-workout` Edge Function
- Input: User preferences, fitness goals, available equipment
- Output: New workout plans added to user's library

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- Schedule updates reflect immediately
- Multi-device synchronization
- Collaborative planning (future feature)

## 7. AI Assistant & OpenAI Integration

**Workout Generation:**
- **Function**: `generate-workout` Edge Function
- **Input**: Assessment data, fitness goals, preferences
- **Process**: OpenAI analysis → structured workout creation
- **Output**: Complete workout plans with exercises and progressions
