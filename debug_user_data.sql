-- Comprehensive Debug Query for User: c5c9c517-7c45-4744-a9c2-bbf629eb888c
-- Run this in Supabase SQL Editor to get all user data

-- 1. Check user authentication
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- 2. Check profile data
SELECT 
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
FROM profiles 
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- 3. Check assessment data
SELECT 
  id,
  user_id,
  age,
  gender,
  height,
  weight,
  fitness_goal,
  workout_frequency,
  diet,
  equipment,
  sports_played,
  allergies,
  created_at,
  updated_at
FROM assessment_data 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY created_at DESC;

-- 4. Check workout plans
SELECT 
  id,
  user_id,
  title,
  description,
  duration_weeks,
  difficulty_level,
  ai_generated,
  created_at,
  updated_at
FROM workout_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY created_at DESC;

-- 5. Check nutrition plans
SELECT 
  id,
  user_id,
  title,
  description,
  daily_calories,
  protein_g,
  carbs_g,
  fat_g,
  diet_type,
  ai_generated,
  created_at,
  updated_at
FROM nutrition_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY created_at DESC;

-- 6. Check workout exercises
SELECT 
  we.id,
  we.workout_plan_id,
  wp.title as workout_plan_title,
  we.exercise_name,
  we.sets,
  we.reps,
  we.weight,
  we.duration,
  we.rest_time,
  we.notes,
  we.created_at
FROM workout_exercises we
JOIN workout_plans wp ON we.workout_plan_id = wp.id
WHERE wp.user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY we.created_at DESC;

-- 7. Check meal plans
SELECT 
  mp.id,
  mp.nutrition_plan_id,
  np.title as nutrition_plan_title,
  mp.meal_type,
  mp.meal_title,
  mp.description,
  mp.calories,
  mp.protein_g,
  mp.carbs_g,
  mp.fat_g,
  mp.order_index,
  mp.created_at
FROM meal_plans mp
JOIN nutrition_plans np ON mp.nutrition_plan_id = np.id
WHERE np.user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY mp.created_at DESC;

-- 8. Check workout schedule
SELECT 
  id,
  user_id,
  workout_plan_id,
  scheduled_date,
  is_completed,
  created_at,
  updated_at
FROM workout_schedule 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY scheduled_date DESC;

-- 9. Check chat messages (last 10)
SELECT 
  id,
  user_id,
  role,
  content,
  created_at
FROM chat_messages 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY created_at DESC
LIMIT 10;

-- 10. Check user assistant threads
SELECT 
  id,
  user_id,
  thread_id,
  created_at,
  updated_at
FROM user_assistant_threads 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- 11. Summary counts
SELECT 
  'profiles' as table_name,
  COUNT(*) as count
FROM profiles 
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'assessment_data' as table_name,
  COUNT(*) as count
FROM assessment_data 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'workout_plans' as table_name,
  COUNT(*) as count
FROM workout_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'nutrition_plans' as table_name,
  COUNT(*) as count
FROM nutrition_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'workout_exercises' as table_name,
  COUNT(*) as count
FROM workout_exercises we
JOIN workout_plans wp ON we.workout_plan_id = wp.id
WHERE wp.user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'meal_plans' as table_name,
  COUNT(*) as count
FROM meal_plans mp
JOIN nutrition_plans np ON mp.nutrition_plan_id = np.id
WHERE np.user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'; 