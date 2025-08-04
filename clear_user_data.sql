-- Clear all user data for testing assessment flow
-- User ID: c5c9c517-7c45-4744-a9c2-bbf629eb888c

-- Start transaction for safety
BEGIN;

-- Clear assessment data
DELETE FROM assessment_data 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear fitness assessments
DELETE FROM fitness_assessments 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear progress metrics
DELETE FROM progress_metrics 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear chat messages
DELETE FROM chat_messages 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear user assistant threads
DELETE FROM user_assistant_threads 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear meal logs (delete in correct order due to foreign keys)
DELETE FROM meal_logs 
WHERE nutrition_log_id IN (
    SELECT id FROM nutrition_logs 
    WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
);

-- Clear nutrition logs
DELETE FROM nutrition_logs 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear meal plans (delete in correct order due to foreign keys)
DELETE FROM meal_plans 
WHERE nutrition_plan_id IN (
    SELECT id FROM nutrition_plans 
    WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
);

-- Clear nutrition plans
DELETE FROM nutrition_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear exercise logs (delete in correct order due to foreign keys)
DELETE FROM exercise_logs 
WHERE workout_log_id IN (
    SELECT id FROM workout_logs 
    WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
);

-- Clear workout logs
DELETE FROM workout_logs 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear workout exercises (delete in correct order due to foreign keys)
DELETE FROM workout_exercises 
WHERE workout_plan_id IN (
    SELECT id FROM workout_plans 
    WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
);

-- Clear workout plans
DELETE FROM workout_plans 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Clear workout schedule
DELETE FROM workout_schedule 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Reset profile to not completed assessment
UPDATE profiles 
SET has_completed_assessment = false,
    age = NULL,
    gender = NULL,
    height = NULL,
    weight = NULL,
    fitness_goal = NULL,
    workout_frequency = NULL,
    diet = NULL,
    equipment = NULL,
    target_weight = NULL,
    sports_played = NULL,
    allergies = NULL,
    updated_at = NOW()
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Commit the transaction
COMMIT;

-- Verify the cleanup (optional - you can run this to check)
-- SELECT 
--     'profiles' as table_name, COUNT(*) as record_count 
-- FROM profiles 
-- WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
-- UNION ALL
-- SELECT 
--     'assessment_data' as table_name, COUNT(*) as record_count 
-- FROM assessment_data 
-- WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
-- UNION ALL
-- SELECT 
--     'workout_plans' as table_name, COUNT(*) as record_count 
-- FROM workout_plans 
-- WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
-- UNION ALL
-- SELECT 
--     'nutrition_plans' as table_name, COUNT(*) as record_count 
-- FROM nutrition_plans 
-- WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'; 