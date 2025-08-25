-- Create exercises table for available exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('strength', 'cardio', 'flexibility', 'bodyweight', 'sport')),
  muscle_groups TEXT[],
  equipment TEXT[],
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
  description TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);

-- Insert exercises only if they don't already exist
INSERT INTO exercises (name, category, muscle_groups, equipment, difficulty, description) VALUES
('Squat Jumps', 'cardio', ARRAY['legs', 'glutes'], ARRAY['bodyweight'], 4, 'Explosive jump from squat position'),
('Hollow Body Hold', 'strength', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 6, 'Gymnastics-style core exercise'),
('Push-ups', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 3, 'Classic upper body exercise'),
('Pull-ups', 'strength', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 7, 'Upper body pulling exercise'),
('Plank', 'strength', ARRAY['core'], ARRAY['bodyweight'], 2, 'Static core exercise'),
('Burpees', 'cardio', ARRAY['full body'], ARRAY['bodyweight'], 8, 'High-intensity full body exercise'),
('Lunges', 'strength', ARRAY['legs', 'glutes'], ARRAY['bodyweight'], 3, 'Unilateral leg exercise'),
('Mountain Climbers', 'cardio', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 4, 'Dynamic core exercise'),
('Jump Rope', 'cardio', ARRAY['legs', 'shoulders'], ARRAY['jump rope'], 3, 'Cardiovascular exercise'),
('Deadlift', 'strength', ARRAY['back', 'legs', 'glutes'], ARRAY['barbell'], 8, 'Compound posterior chain exercise'),
('Bench Press', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 7, 'Compound pushing exercise'),
('Overhead Press', 'strength', ARRAY['shoulders', 'triceps'], ARRAY['barbell', 'dumbbells'], 6, 'Vertical pushing exercise'),
('Rows', 'strength', ARRAY['back', 'biceps'], ARRAY['barbell', 'dumbbells'], 5, 'Horizontal pulling exercise'),
('Dips', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dip bars'], 6, 'Bodyweight pushing exercise'),
('Wall Balls', 'cardio', ARRAY['legs', 'shoulders'], ARRAY['medicine ball'], 5, 'Dynamic full body exercise')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (read-only for all users)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exercises
CREATE POLICY "Users can view all exercises" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_exercises_modtime
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
