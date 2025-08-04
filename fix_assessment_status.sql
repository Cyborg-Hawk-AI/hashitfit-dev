-- Fix assessment completion status for user c5c9c517-7c45-4744-a9c2-bbf629eb888c
-- This user has completed assessment and has generated plans, but profile wasn't updated

-- Update the profile to mark assessment as completed
UPDATE profiles 
SET has_completed_assessment = true,
    updated_at = NOW()
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Verify the update
SELECT 
  id,
  has_completed_assessment,
  created_at,
  updated_at
FROM profiles 
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

-- Show summary of user data
SELECT 
  'Profile' as table_name,
  has_completed_assessment as status,
  created_at
FROM profiles 
WHERE id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
UNION ALL
SELECT 
  'Assessment Data' as table_name,
  'COMPLETED' as status,
  created_at
FROM assessment_data 
WHERE user_id = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'
ORDER BY created_at DESC
LIMIT 1; 