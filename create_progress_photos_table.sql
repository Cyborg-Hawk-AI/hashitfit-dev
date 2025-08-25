-- Create progress_photos table for storing user progress photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_photo_date ON progress_photos(photo_date);
CREATE INDEX IF NOT EXISTS idx_progress_photos_created_at ON progress_photos(created_at);

-- Enable Row Level Security
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress photos" ON progress_photos 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos" ON progress_photos 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" ON progress_photos 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" ON progress_photos 
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_progress_photos_updated_at 
  BEFORE UPDATE ON progress_photos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
