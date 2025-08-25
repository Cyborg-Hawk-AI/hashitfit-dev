-- Create user_exercise_notes table
CREATE TABLE IF NOT EXISTS user_exercise_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_exercise_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_exercise_notes_user_id ON user_exercise_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_notes_exercise_id ON user_exercise_notes(workout_exercise_id);

-- Add RLS policies for user_exercise_notes
ALTER TABLE user_exercise_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own exercise notes
CREATE POLICY "Users can view their own exercise notes" ON user_exercise_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own exercise notes
CREATE POLICY "Users can insert their own exercise notes" ON user_exercise_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own exercise notes
CREATE POLICY "Users can update their own exercise notes" ON user_exercise_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own exercise notes
CREATE POLICY "Users can delete their own exercise notes" ON user_exercise_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_exercise_notes_modtime
  BEFORE UPDATE ON user_exercise_notes
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
