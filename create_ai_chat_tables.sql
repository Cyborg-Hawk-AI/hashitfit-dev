-- AI Chat Assistant Database Tables

-- USER MEMORIES TABLE
-- Stores durable user memories (facts, preferences, summaries, notes)
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('fact', 'preference', 'summary', 'note')),
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),
  embedding_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on user_memories
CREATE INDEX idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX idx_user_memories_kind ON user_memories(kind);
CREATE INDEX idx_user_memories_importance ON user_memories(importance);
CREATE INDEX idx_user_memories_created_at ON user_memories(created_at);

-- DOCUMENTS TABLE
-- Stores fitness documents, guides, and knowledge base content
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('workout', 'nutrition', 'recovery', 'general', 'safety')),
  embedding_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on documents
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- EMBEDDINGS TABLE
-- Stores vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL CHECK (collection IN ('memories', 'documents')),
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on embeddings
CREATE INDEX idx_embeddings_collection ON embeddings(collection);
CREATE INDEX idx_embeddings_created_at ON embeddings(created_at);

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- DATA SOURCE REGISTRY TABLE
-- Registry of available data sources for the AI assistant
CREATE TABLE IF NOT EXISTS data_source_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  user_scoped BOOLEAN DEFAULT TRUE,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes on data_source_registry
CREATE INDEX idx_data_source_registry_key ON data_source_registry(key);
CREATE INDEX idx_data_source_registry_active ON data_source_registry(is_active);

-- USER ASSISTANT THREADS TABLE
-- Maps users to OpenAI assistant threads
CREATE TABLE IF NOT EXISTS user_assistant_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thread_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Create indexes on user_assistant_threads
CREATE INDEX idx_user_assistant_threads_user_id ON user_assistant_threads(user_id);
CREATE INDEX idx_user_assistant_threads_thread_id ON user_assistant_threads(thread_id);

-- Enable Row Level Security
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assistant_threads ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- User Memories RLS
CREATE POLICY "Users can view own memories" 
  ON user_memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" 
  ON user_memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" 
  ON user_memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" 
  ON user_memories FOR DELETE 
  USING (auth.uid() = user_id);

-- Documents RLS (public read, admin write)
CREATE POLICY "Anyone can view documents" 
  ON documents FOR SELECT 
  USING (true);

-- Embeddings RLS (public read, admin write)
CREATE POLICY "Anyone can view embeddings" 
  ON embeddings FOR SELECT 
  USING (true);

-- Data Source Registry RLS (public read, admin write)
CREATE POLICY "Anyone can view data source registry" 
  ON data_source_registry FOR SELECT 
  USING (true);

-- User Assistant Threads RLS
CREATE POLICY "Users can view own assistant threads" 
  ON user_assistant_threads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant threads" 
  ON user_assistant_threads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assistant threads" 
  ON user_assistant_threads FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assistant threads" 
  ON user_assistant_threads FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert default data sources
INSERT INTO data_source_registry (key, name, description, user_scoped, config) VALUES
('profiles', 'User Profiles', 'User profile information including age, gender, height, weight, fitness goals', true, '{"table": "profiles", "columns": ["id", "name", "age", "gender", "height", "weight", "fitness_goal", "workout_frequency", "diet", "equipment", "target_weight", "sports_played", "allergies", "dietary_restrictions"], "order_by": "updated_at desc"}'),
('progress_metrics', 'Progress Metrics', 'Body measurements and progress tracking data', true, '{"table": "progress_metrics", "columns": ["id", "measurement_date", "weight", "body_fat_percentage", "chest_measurement", "waist_measurement", "hip_measurement", "arm_measurement", "thigh_measurement", "calf_measurement", "shoulder_measurement", "notes"], "order_by": "measurement_date desc"}'),
('workout_logs', 'Workout Logs', 'Completed workout sessions and their details', true, '{"table": "workout_logs", "columns": ["id", "workout_plan_id", "start_time", "end_time", "duration", "calories_burned", "rating", "notes"], "order_by": "start_time desc"}'),
('exercise_logs', 'Exercise Logs', 'Individual exercises completed within workouts', true, '{"table": "exercise_logs", "columns": ["id", "workout_log_id", "exercise_name", "sets_completed", "reps_completed", "weight_used", "rest_time", "notes", "order_index"], "order_by": "created_at desc"}'),
('workout_schedule', 'Workout Schedule', 'Scheduled workout sessions', true, '{"table": "workout_schedule", "columns": ["id", "workout_plan_id", "scheduled_date", "scheduled_time", "duration", "is_completed", "completion_date", "notes"], "order_by": "scheduled_date desc"}'),
('nutrition_logs', 'Nutrition Logs', 'Daily nutrition tracking data', true, '{"table": "nutrition_logs", "columns": ["id", "log_date", "total_calories", "total_protein_g", "total_carbs_g", "total_fat_g", "water_intake_ml", "notes"], "order_by": "log_date desc"}'),
('meal_logs', 'Meal Logs', 'Individual meals logged within nutrition logs', true, '{"table": "meal_logs", "columns": ["id", "nutrition_log_id", "meal_type", "meal_title", "calories", "protein_g", "carbs_g", "fat_g", "consumed_at", "notes"], "order_by": "consumed_at desc"}'),
('fitness_assessments', 'Fitness Assessments', 'Fitness assessment results and measurements', true, '{"table": "fitness_assessments", "columns": ["id", "assessment_date", "pullups", "pushups", "squats", "bench_press_max", "squat_max", "deadlift_max", "mile_time", "vo2_max", "flexibility_score", "notes"], "order_by": "assessment_date desc"}'),
('assessment_data', 'Assessment Data', 'Detailed assessment data collected from users', true, '{"table": "assessment_data", "columns": ["id", "age", "gender", "height", "weight", "fitness_goal", "workout_frequency", "diet", "equipment", "sports_played", "allergies", "existing_conditions", "fitness_level", "previous_experience", "notes"], "order_by": "created_at desc"}')
ON CONFLICT (key) DO NOTHING;

-- Insert some default fitness documents
INSERT INTO documents (title, content, category) VALUES
('Workout Safety Guidelines', 'Always warm up before exercising. Start with 5-10 minutes of light cardio and dynamic stretching. Use proper form to prevent injuries. Listen to your body and stop if you feel pain. Stay hydrated throughout your workout. Cool down with static stretching after your session.', 'safety'),
('Nutrition Basics', 'A balanced diet includes protein for muscle repair, carbohydrates for energy, and healthy fats for hormone production. Aim for 0.8-1.2g of protein per kg of body weight. Stay hydrated with 8-10 glasses of water daily. Eat whole foods and limit processed foods.', 'nutrition'),
('Recovery Principles', 'Rest days are essential for muscle growth and injury prevention. Get 7-9 hours of quality sleep. Practice active recovery with light activities like walking or yoga. Consider foam rolling and stretching for muscle recovery. Listen to your body''s signals.', 'recovery'),
('Progressive Overload', 'Gradually increase the weight, reps, or sets in your workouts to continue making progress. Track your workouts to monitor improvements. Increase intensity by no more than 10% per week. Focus on proper form before increasing weight.', 'workout'),
('Cardio Guidelines', 'Aim for 150 minutes of moderate cardio or 75 minutes of vigorous cardio per week. Include both steady-state and interval training. Start with 20-30 minutes and gradually increase duration. Choose activities you enjoy to maintain consistency.', 'workout')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_memories_updated_at BEFORE UPDATE ON user_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_embeddings_updated_at BEFORE UPDATE ON embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_source_registry_updated_at BEFORE UPDATE ON data_source_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_assistant_threads_updated_at BEFORE UPDATE ON user_assistant_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
