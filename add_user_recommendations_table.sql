-- Add missing user_recommendations table
-- This table stores AI-generated recommendations for users

-- USER RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_tips TEXT,
  nutrition_tips TEXT,
  weekly_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on user_recommendations
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);

-- Enable Row Level Security
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- User Recommendations RLS Policies
CREATE POLICY "Users can view own recommendations" 
  ON user_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" 
  ON user_recommendations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" 
  ON user_recommendations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" 
  ON user_recommendations FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_user_recommendations_modtime
  BEFORE UPDATE ON user_recommendations
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
