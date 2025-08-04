import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://haxiwqgajhanpapvicbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

async function fixAssessmentStatus() {
  console.log('🔧 Fixing assessment completion status for user:', userId);
  console.log('=====================================');

  try {
    // 1. Check current profile status
    console.log('\n1. Checking current profile status...');
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('has_completed_assessment, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile query error:', profileError);
      return;
    }
    
    console.log('✅ Current profile status:', currentProfile);

    // 2. Check if assessment data exists
    console.log('\n2. Checking assessment data...');
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessment_data')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (assessmentError) {
      console.log('❌ Assessment data query error:', assessmentError);
      return;
    }
    
    console.log('✅ Assessment data exists:', assessmentData?.length > 0);

    // 3. Check if workout plans exist
    console.log('\n3. Checking workout plans...');
    const { data: workoutPlans, error: workoutError } = await supabase
      .from('workout_plans')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (workoutError) {
      console.log('❌ Workout plans query error:', workoutError);
      return;
    }
    
    console.log('✅ Workout plans exist:', workoutPlans?.length > 0);

    // 4. Update profile if assessment is completed but profile shows false
    if (currentProfile.has_completed_assessment === false && assessmentData?.length > 0) {
      console.log('\n4. Updating profile to mark assessment as completed...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          has_completed_assessment: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('has_completed_assessment, updated_at')
        .single();

      if (updateError) {
        console.log('❌ Profile update error:', updateError);
        return;
      }
      
      console.log('✅ Profile updated successfully:', updatedProfile);
    } else {
      console.log('\n4. No update needed - assessment status is correct');
    }

    // 5. Verify the fix
    console.log('\n5. Verifying the fix...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('has_completed_assessment, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (finalError) {
      console.log('❌ Final verification error:', finalError);
      return;
    }
    
    console.log('✅ Final profile status:', finalProfile);

    // 6. Summary
    console.log('\n=====================================');
    console.log('📊 FIX SUMMARY:');
    console.log(`- Assessment data exists: ${assessmentData?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`- Workout plans exist: ${workoutPlans?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`- Profile updated: ${finalProfile.has_completed_assessment ? 'YES' : 'NO'}`);
    console.log(`- User can now access dashboard: ${finalProfile.has_completed_assessment ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Fix script error:', error);
  }
}

fixAssessmentStatus(); 