-- Create missing profile for user c5c9c517-7c45-4744-a9c2-bbf629eb888c
-- This script should be run in the Supabase SQL Editor

-- First, let's check if the profile already exists
SELECT * FROM profiles WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- If no profile exists, create one
INSERT INTO profiles (
  id,
  name,
  age,
  gender,
  height,
  weight,
  fitness_goal,
  workout_frequency,
  diet,
  equipment,
  has_completed_assessment,
  created_at,
  updated_at
) VALUES (
  'c5c9c517-7c45-4744-a9c2-bbf629eb888c',
  '',
  30,
  'male',
  175,
  75,
  'muscle_gain',
  3,
  'standard',
  'full_gym',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the profile was created
SELECT * FROM profiles WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'; 