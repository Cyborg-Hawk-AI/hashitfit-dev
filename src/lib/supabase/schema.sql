-- FITNESS APP DATABASE SCHEMA

-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Note: You don't need to manually set the JWT secret as Supabase manages this for you
-- The following line should be removed or commented out in production:
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- PROFILES TABLE
-- Stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create index on profiles
CREATE INDEX idx_profiles_has_completed_assessment ON profiles(has_completed_assessment);

-- FITNESS ASSESSMENTS TABLE
-- Stores fitness assessment results
CREATE TABLE IF NOT EXISTS fitness_assessments (
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

-- Create indexes on fitness_assessments
CREATE INDEX idx_fitness_assessments_user_id ON fitness_assessments(user_id);
CREATE INDEX idx_fitness_assessments_assessment_date ON fitness_assessments(assessment_date);

-- ASSESSMENT DATA TABLE
-- Stores the detailed assessment data collected from users
CREATE TABLE IF NOT EXISTS assessment_data (
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

-- Create indexes on assessment_data
CREATE INDEX idx_assessment_data_user_id ON assessment_data(user_id);
CREATE INDEX idx_assessment_data_created_at ON assessment_data(created_at);

-- PROGRESS METRICS TABLE
-- Tracks body measurements and other progress metrics
CREATE TABLE IF NOT EXISTS progress_metrics (
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

-- Create indexes on progress_metrics
CREATE INDEX idx_progress_metrics_user_id ON progress_metrics(user_id);
CREATE INDEX idx_progress_metrics_measurement_date ON progress_metrics(measurement_date);

-- WORKOUT PLANS TABLE
-- Stores workout plan templates
CREATE TABLE IF NOT EXISTS workout_plans (
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

-- Create indexes on workout_plans
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_plans_category ON workout_plans(category);

-- WORKOUT EXERCISES TABLE
-- Links exercises to workout plans
CREATE TABLE IF NOT EXISTS workout_exercises (
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

-- Create indexes on workout_exercises
CREATE INDEX idx_workout_exercises_workout_plan_id ON workout_exercises(workout_plan_id);

-- WORKOUT LOGS TABLE
-- Records completed workouts
CREATE TABLE IF NOT EXISTS workout_logs (
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

-- Create indexes on workout_logs
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_start_time ON workout_logs(start_time);

-- EXERCISE LOGS TABLE
-- Records individual exercises within a workout
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER NOT NULL,
  reps_completed TEXT NOT NULL,
  weight_used TEXT,
  rest_time INTERVAL,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on exercise_logs
CREATE INDEX idx_exercise_logs_workout_log_id ON exercise_logs(workout_log_id);

-- WORKOUT SCHEDULE TABLE
-- Scheduled workout sessions
CREATE TABLE IF NOT EXISTS workout_schedule (
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

-- Create indexes on workout_schedule
CREATE INDEX idx_workout_schedule_user_id ON workout_schedule(user_id);
CREATE INDEX idx_workout_schedule_scheduled_date ON workout_schedule(scheduled_date);
CREATE INDEX idx_workout_schedule_is_completed ON workout_schedule(is_completed);

-- NUTRITION PLANS TABLE
-- Stores nutrition plan templates
CREATE TABLE IF NOT EXISTS nutrition_plans (
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

-- Create indexes on nutrition_plans
CREATE INDEX idx_nutrition_plans_user_id ON nutrition_plans(user_id);

-- MEAL PLANS TABLE
-- Stores individual meals within nutrition plans
CREATE TABLE IF NOT EXISTS meal_plans (
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

-- Create indexes on meal_plans
CREATE INDEX idx_meal_plans_nutrition_plan_id ON meal_plans(nutrition_plan_id);

-- NUTRITION LOGS TABLE
-- Records daily nutrition logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
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

-- Create indexes on nutrition_logs
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_log_date ON nutrition_logs(log_date);

-- MEAL LOGS TABLE
-- Records individual meals within a nutrition log
CREATE TABLE IF NOT EXISTS meal_logs (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on meal_logs
CREATE INDEX idx_meal_logs_nutrition_log_id ON meal_logs(nutrition_log_id);
CREATE INDEX idx_meal_logs_consumed_at ON meal_logs(consumed_at);

-- CHAT MESSAGES TABLE
-- Stores chat history between user and AI
CREATE TABLE IF NOT EXISTS chat_messages (
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

-- Create indexes on chat_messages
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- APP CONFIGURATIONS TABLE
-- Stores application-wide settings and secrets
CREATE TABLE IF NOT EXISTS app_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on app_configurations
CREATE INDEX idx_app_configurations_key ON app_configurations(key);

-- USER SETTINGS TABLE
-- Stores user-specific settings
CREATE TABLE IF NOT EXISTS user_settings (
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

-- Create index on user_settings
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_data ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security Policies
-- Users can only view and modify their own data

-- Profiles RLS
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Fitness Assessments RLS
CREATE POLICY "Users can view own fitness assessments" 
  ON fitness_assessments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness assessments" 
  ON fitness_assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fitness assessments" 
  ON fitness_assessments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fitness assessments" 
  ON fitness_assessments FOR DELETE 
  USING (auth.uid() = user_id);

-- Assessment Data RLS
CREATE POLICY "Users can view own assessment data" 
  ON assessment_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment data" 
  ON assessment_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment data" 
  ON assessment_data FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessment data" 
  ON assessment_data FOR DELETE 
  USING (auth.uid() = user_id);

-- Progress Metrics RLS
CREATE POLICY "Users can view own progress metrics" 
  ON progress_metrics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress metrics" 
  ON progress_metrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress metrics" 
  ON progress_metrics FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress metrics" 
  ON progress_metrics FOR DELETE 
  USING (auth.uid() = user_id);

-- Workout Plans RLS
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

-- Workout Exercises RLS
CREATE POLICY "Users can view own workout exercises" 
  ON workout_exercises FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_plans wp WHERE wp.id = workout_exercises.workout_plan_id
  ));

CREATE POLICY "Users can insert own workout exercises" 
  ON workout_exercises FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM workout_plans wp WHERE wp.id = workout_exercises.workout_plan_id
  ));

CREATE POLICY "Users can update own workout exercises" 
  ON workout_exercises FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_plans wp WHERE wp.id = workout_exercises.workout_plan_id
  ));

CREATE POLICY "Users can delete own workout exercises" 
  ON workout_exercises FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_plans wp WHERE wp.id = workout_exercises.workout_plan_id
  ));

-- Workout Logs RLS
CREATE POLICY "Users can view own workout logs" 
  ON workout_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" 
  ON workout_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" 
  ON workout_logs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" 
  ON workout_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- Exercise Logs RLS
CREATE POLICY "Users can view own exercise logs" 
  ON exercise_logs FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id
  ));

CREATE POLICY "Users can insert own exercise logs" 
  ON exercise_logs FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id
  ));

CREATE POLICY "Users can update own exercise logs" 
  ON exercise_logs FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id
  ));

CREATE POLICY "Users can delete own exercise logs" 
  ON exercise_logs FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM workout_logs wl WHERE wl.id = exercise_logs.workout_log_id
  ));

-- Workout Schedule RLS
CREATE POLICY "Users can view own workout schedule" 
  ON workout_schedule FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout schedule" 
  ON workout_schedule FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout schedule" 
  ON workout_schedule FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout schedule" 
  ON workout_schedule FOR DELETE 
  USING (auth.uid() = user_id);

-- Nutrition Plans RLS
CREATE POLICY "Users can view own nutrition plans" 
  ON nutrition_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans" 
  ON nutrition_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans" 
  ON nutrition_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition plans" 
  ON nutrition_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Meal Plans RLS
CREATE POLICY "Users can view own meal plans" 
  ON meal_plans FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id
  ));

CREATE POLICY "Users can insert own meal plans" 
  ON meal_plans FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id
  ));

CREATE POLICY "Users can update own meal plans" 
  ON meal_plans FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id
  ));

CREATE POLICY "Users can delete own meal plans" 
  ON meal_plans FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_plans np WHERE np.id = meal_plans.nutrition_plan_id
  ));

-- Nutrition Logs RLS
CREATE POLICY "Users can view own nutrition logs" 
  ON nutrition_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" 
  ON nutrition_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" 
  ON nutrition_logs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" 
  ON nutrition_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- Meal Logs RLS
CREATE POLICY "Users can view own meal logs" 
  ON meal_logs FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_logs nl WHERE nl.id = meal_logs.nutrition_log_id
  ));

CREATE POLICY "Users can insert own meal logs" 
  ON meal_logs FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM nutrition_logs nl WHERE nl.id = meal_logs.nutrition_log_id
  ));

CREATE POLICY "Users can update own meal logs" 
  ON meal_logs FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_logs nl WHERE nl.id = meal_logs.nutrition_log_id
  ));

CREATE POLICY "Users can delete own meal logs" 
  ON meal_logs FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM nutrition_logs nl WHERE nl.id = meal_logs.nutrition_log_id
  ));

-- Chat Messages RLS
CREATE POLICY "Users can view own chat messages" 
  ON chat_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- User Settings RLS
CREATE POLICY "Users can view own settings" 
  ON user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
  ON user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc', NOW());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_fitness_assessments_modtime
  BEFORE UPDATE ON fitness_assessments
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_progress_metrics_modtime
  BEFORE UPDATE ON progress_metrics
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_workout_plans_modtime
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_workout_exercises_modtime
  BEFORE UPDATE ON workout_exercises
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_workout_logs_modtime
  BEFORE UPDATE ON workout_logs
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_exercise_logs_modtime
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_workout_schedule_modtime
  BEFORE UPDATE ON workout_schedule
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_nutrition_plans_modtime
  BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_meal_plans_modtime
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_nutrition_logs_modtime
  BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_meal_logs_modtime
  BEFORE UPDATE ON meal_logs
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_app_configurations_modtime
  BEFORE UPDATE ON app_configurations
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_settings_modtime
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_assessment_data_modtime
  BEFORE UPDATE ON assessment_data
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, age, gender, height, weight, fitness_goal, workout_frequency, diet, equipment, has_completed_assessment)
  VALUES (NEW.id, '', 30, 'male', 175, 75, 'muscle_gain', 3, 'standard', 'full_gym', FALSE);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
