# Database Schema Documentation
## Hashim - AI-Powered Personal Fitness Trainer

### Overview

This document provides comprehensive documentation for the PostgreSQL database schema used in the Hashim fitness application. The schema is designed to support a complete fitness tracking ecosystem with user management, workout planning, nutrition logging, progress tracking, and AI-powered assistance.

### Schema Design Principles

#### Core Principles
- **User Data Isolation**: Row-Level Security (RLS) ensures users can only access their own data
- **Data Integrity**: Foreign key constraints maintain referential integrity
- **Performance Optimization**: Strategic indexing for frequently queried columns
- **Scalability**: Designed to handle millions of records with proper partitioning strategies
- **Audit Trail**: Created/updated timestamps on all tables for change tracking

#### Security Model
- **Authentication Integration**: Tables reference Supabase Auth users table
- **Row-Level Security**: Comprehensive RLS policies on all user-facing tables
- **Data Privacy**: Personal data encrypted at rest and in transit
- **Access Control**: Granular permissions for different data types

### Core Schema Structure

## User Management Tables

### `profiles`
Extended user information beyond Supabase authentication.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  age INTEGER CHECK (age > 0 AND age < 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC CHECK (height > 0),
  weight NUMERIC CHECK (weight > 0),
  fitness_goal TEXT CHECK (fitness_goal IN ('muscle_gain', 'weight_loss', 'endurance', 'sport_specific')),
  workout_frequency INTEGER CHECK (workout_frequency BETWEEN 1 AND 7),
  diet TEXT CHECK (diet IN ('standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free')),
  equipment TEXT CHECK (equipment IN ('full_gym', 'home_gym', 'minimal', 'bodyweight_only')),
  target_weight NUMERIC,
  sports_played TEXT[],
  profile_image_url TEXT,
  allergies TEXT[],
  dietary_restrictions TEXT[],
  has_completed_assessment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Relationships
- **Primary**: Direct reference to `auth.users` table
- **Dependent Tables**: Referenced by all user-specific tables

#### Indexes
- `idx_profiles_has_completed_assessment`: Optimizes assessment status queries

#### RLS Policies
- Users can view and update their own profile only
- No insert/delete permissions (managed by auth triggers)

---

### `user_settings`
User-specific application preferences and configuration.

```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  units_system TEXT CHECK (units_system IN ('metric', 'imperial')) DEFAULT 'metric',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);
```

#### Features
- **Theme Management**: Light/dark mode preferences
- **Notification Controls**: Granular notification settings
- **Measurement Units**: Metric/Imperial system selection
- **User Isolation**: One settings record per user (UNIQUE constraint)

---

### `assessment_data`
Comprehensive fitness assessment responses for personalized planning.

```sql
CREATE TABLE assessment_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC NOT NULL CHECK (height > 0),
  weight NUMERIC NOT NULL CHECK (weight > 0),
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN ('weight_loss', 'muscle_gain', 'endurance', 'general_fitness')),
  workout_frequency INTEGER NOT NULL CHECK (workout_frequency BETWEEN 1 AND 7),
  diet TEXT NOT NULL CHECK (diet IN ('standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free')),
  equipment TEXT NOT NULL CHECK (equipment IN ('none', 'minimal', 'full_gym')),
  sports_played TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  existing_conditions TEXT[] DEFAULT '{}',
  fitness_level TEXT,
  previous_experience TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Purpose
- Stores detailed fitness assessment responses
- Used by AI systems for personalized plan generation
- Supports multiple assessments over time for progress tracking

---

## Workout Management System

### `workout_plans`
Template workout plans (AI-generated or user-created).

```sql
CREATE TABLE workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('strength', 'cardio', 'hiit', 'recovery', 'sport_specific', 'custom')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  estimated_duration INTERVAL,
  target_muscles TEXT[],
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Features
- **Categorization**: Structured workout categories for filtering
- **Difficulty Scaling**: 1-5 difficulty rating system
- **AI Integration**: Tracks AI-generated vs. user-created plans
- **Muscle Targeting**: Array of target muscle groups

#### Indexes
- `idx_workout_plans_user_id`: User-specific plan queries
- `idx_workout_plans_category`: Category-based filtering

---

### `workout_exercises`
Individual exercises within workout plans.

```sql
CREATE TABLE workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  weight TEXT,
  rest_time INTERVAL,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Design Features
- **Flexible Reps**: Text field supports ranges (e.g., "8-10", "to failure")
- **Weight Specification**: Text field supports various formats (kg, lbs, bodyweight)
- **Ordering**: Sequential ordering within workout plans
- **Cascade Deletion**: Exercises deleted when parent workout plan is removed

---

### `workout_logs`
Records of completed workout sessions.

```sql
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_plan_id UUID REFERENCES workout_plans(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTERVAL,
  calories_burned INTEGER,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Analytics Support
- **Duration Tracking**: Automatic duration calculation
- **Performance Metrics**: Calories burned and user rating
- **Plan Association**: Optional link to workout plan (supports custom workouts)

---

### `exercise_logs`
Individual exercise performance records within workout sessions.

```sql
CREATE TABLE exercise_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps_completed TEXT NOT NULL,
  weight_used TEXT,
  rest_time INTERVAL,
  notes TEXT,
  order_index INTEGER NOT NULL,
  superset_group_id UUID,
  rest_seconds INTEGER DEFAULT 60,
  position_in_workout INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Advanced Features
- **Superset Support**: Grouping exercises with `superset_group_id`
- **Workout Positioning**: Flexible exercise ordering and reordering
- **Performance Tracking**: Detailed set, rep, and weight logging

---

### `workout_schedule`
Scheduled workout sessions with completion tracking.

```sql
CREATE TABLE workout_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration INTERVAL,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  workout_log_id UUID REFERENCES workout_logs(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Scheduling Features
- **Future Planning**: Support for advance workout scheduling
- **Completion Tracking**: Links scheduled workouts to actual completion
- **Flexible Timing**: Optional time specification for scheduled workouts

---

## Nutrition Management System

### `nutrition_plans`
Template nutrition plans with daily macro targets.

```sql
CREATE TABLE nutrition_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  daily_calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL,
  diet_type TEXT CHECK (diet_type IN ('standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free')),
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Nutritional Framework
- **Macro Targeting**: Complete macronutrient distribution planning
- **Diet Compliance**: Support for various dietary approaches
- **AI Integration**: AI-generated nutrition plan tracking

---

### `meal_plans`
Individual meal templates within nutrition plans.

```sql
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrition_plan_id UUID REFERENCES nutrition_plans(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_title TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Meal Structure
- **Meal Categorization**: Standard meal types with flexible timing
- **Nutritional Breakdown**: Complete macro and calorie information
- **Template System**: Reusable meal suggestions

---

### `nutrition_logs`
Daily nutrition tracking summaries.

```sql
CREATE TABLE nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  total_calories INTEGER,
  total_protein_g INTEGER,
  total_carbs_g INTEGER,
  total_fat_g INTEGER,
  water_intake_ml INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Daily Tracking
- **Aggregate Tracking**: Daily macro and calorie summaries
- **Hydration Monitoring**: Water intake tracking
- **Progress Analysis**: Historical nutrition data for trend analysis

---

### `meal_logs`
Individual meal entries with photo analysis support.

```sql
CREATE TABLE meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutrition_log_id UUID REFERENCES nutrition_logs(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_title TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL,
  consumed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  meal_image_url TEXT,
  meal_description TEXT,
  food_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Advanced Features
- **Photo Integration**: Meal image storage and analysis
- **Flexible Data**: JSONB field for complex food item data
- **Timestamp Tracking**: Precise meal timing for pattern analysis

---

## Progress & Analytics System

### `progress_metrics`
Body measurements and fitness metrics tracking.

```sql
CREATE TABLE progress_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  weight NUMERIC CHECK (weight > 0),
  body_fat_percentage NUMERIC,
  chest_measurement NUMERIC,
  waist_measurement NUMERIC,
  hip_measurement NUMERIC,
  arm_measurement NUMERIC,
  thigh_measurement NUMERIC,
  calf_measurement NUMERIC,
  shoulder_measurement NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Comprehensive Tracking
- **Body Composition**: Weight and body fat percentage
- **Circumference Measurements**: Complete body measurement tracking
- **Progress Visualization**: Historical data for trend analysis

---

### `fitness_assessments`
Periodic fitness test results and performance benchmarks.

```sql
CREATE TABLE fitness_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  pullups INTEGER,
  pushups INTEGER,
  squats INTEGER,
  bench_press_max NUMERIC,
  squat_max NUMERIC,
  deadlift_max NUMERIC,
  mile_time INTERVAL,
  vo2_max NUMERIC,
  flexibility_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Performance Metrics
- **Strength Testing**: One-rep max tracking for major lifts
- **Endurance Testing**: Cardiovascular fitness assessments
- **Functional Movement**: Bodyweight exercise performance

---

## AI & Communication System

### `chat_messages`
Conversation history with AI assistant.

```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  referenced_workout_id UUID REFERENCES workout_logs(id),
  referenced_nutrition_id UUID REFERENCES nutrition_logs(id),
  referenced_metric_id UUID REFERENCES progress_metrics(id),
  referenced_assessment_id UUID REFERENCES fitness_assessments(id),
  ai_response_id TEXT,
  ai_prompt_tokens INTEGER,
  ai_completion_tokens INTEGER
);
```

#### Context Integration
- **Reference System**: Links chat messages to relevant data entities
- **Token Tracking**: AI usage monitoring and analytics
- **Conversation Flow**: Chronological message ordering

---

### `app_configurations`
System-wide settings and configuration management.

```sql
CREATE TABLE app_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Configuration Management
- **Key-Value Storage**: Flexible configuration parameter storage
- **Security Handling**: Secret vs. public configuration separation
- **Documentation**: Built-in description field for configuration parameters

---

## Database Functions & Triggers

### Custom Functions

#### `update_modified_column()`
Automatic timestamp update trigger function.

```sql
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.updated_at = TIMEZONE('utc', NOW());
   RETURN NEW;
END;
$function$
```

#### `manage_superset()`
Workout superset management function.

```sql
CREATE OR REPLACE FUNCTION public.manage_superset(
  p_workout_log_id uuid, 
  p_exercise_ids uuid[], 
  p_superset_group_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
```

#### `reorder_workout_exercises()`
Exercise reordering within workouts.

```sql
CREATE OR REPLACE FUNCTION public.reorder_workout_exercises(
  p_workout_log_id uuid, 
  p_exercise_positions jsonb
)
RETURNS boolean
LANGUAGE plpgsql
```

#### `handle_new_user()`
Automatic user setup trigger for new registrations.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
```

### Triggers
- **Automatic Timestamps**: Update `updated_at` on all table modifications
- **User Initialization**: Automatic profile and settings creation for new users

---

## Storage Buckets

### Configured Storage Buckets

#### `meal-images`
- **Purpose**: Meal photo storage for nutrition analysis
- **Access**: Private with user-specific folder structure
- **Policies**: Users can upload, read, update, and delete their own images

#### `profile-images`
- **Purpose**: User profile picture storage
- **Access**: Private with user authentication required
- **Policies**: User-specific access control

#### `workout-media`
- **Purpose**: Workout-related media (videos, images)
- **Access**: Private with user authentication required
- **Policies**: User-specific access control

---

## Row-Level Security (RLS) Policies

### Security Model
All user-facing tables implement comprehensive RLS policies ensuring:
- Users can only access their own data
- Proper authentication verification
- Granular permissions for different operations

### Policy Examples

#### Standard User Data Access
```sql
-- Example: workout_plans table policies
CREATE POLICY "Users can view own workout plans" 
  ON workout_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" 
  ON workout_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" 
  ON workout_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" 
  ON workout_plans FOR DELETE 
  USING (auth.uid() = user_id);
```

#### Relationship-Based Access
```sql
-- Example: exercise_logs access through workout_logs
CREATE POLICY "Users can view own exercise logs" 
  ON exercise_logs FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_logs 
    WHERE workout_logs.id = exercise_logs.workout_log_id
  ));
```

---

## Performance Optimization

### Indexing Strategy

#### Primary Indexes
- **User-based queries**: All user_id columns indexed
- **Date-based queries**: Timestamp columns indexed for analytics
- **Relationship queries**: Foreign key columns indexed

#### Composite Indexes
- **Time-series data**: (user_id, date) composite indexes
- **Category filtering**: (user_id, category) for workout/nutrition plans

### Query Optimization
- **Selective queries**: RLS policies optimized for performance
- **Proper joins**: Efficient join strategies for related data
- **Pagination support**: LIMIT/OFFSET optimization for large datasets

### Partitioning Strategy
Future partitioning considerations:
- **Logs tables**: Time-based partitioning for workout_logs, exercise_logs
- **Analytics data**: Monthly partitioning for historical data
- **Archive strategy**: Old data archival for performance

---

## Data Migration & Versioning

### Migration Strategy
- **Schema versioning**: All changes tracked in version control
- **Backward compatibility**: Careful consideration of breaking changes
- **Data preservation**: Migration scripts preserve existing data

### Backup & Recovery
- **Automated backups**: Daily automated backups with point-in-time recovery
- **Testing procedures**: Regular backup restoration testing
- **Disaster recovery**: Documented recovery procedures

---

## Monitoring & Maintenance

### Performance Monitoring
- **Query performance**: Slow query identification and optimization
- **Index usage**: Regular analysis of index effectiveness
- **Connection monitoring**: Database connection pool monitoring

### Data Quality
- **Constraint enforcement**: CHECK constraints for data validation
- **Referential integrity**: Foreign key constraints maintain relationships
- **Data cleanup**: Regular cleanup of orphaned or invalid data

### Growth Planning
- **Storage monitoring**: Database size and growth rate tracking
- **Scaling preparation**: Read replica and sharding planning
- **Performance benchmarks**: Regular performance testing and optimization