
-- Create a storage bucket for meal images if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'meal-images', 'meal-images'
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'meal-images');

-- Set the bucket to public
UPDATE storage.buckets
SET public = true
WHERE id = 'meal-images';

-- Create policy to allow authenticated users to upload objects
CREATE POLICY "Allow users to upload meal images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own objects
CREATE POLICY "Allow users to update their own meal images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
) 
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read their own objects
CREATE POLICY "Allow users to read their own meal images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own objects
CREATE POLICY "Allow users to delete their own meal images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to meal images
CREATE POLICY "Allow public read access to meal images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'meal-images'
);

-- Add user exercise notes table
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
