import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using the actual anon key from the project
const supabaseUrl = 'https://haxiwqgajhanpapvicbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c';

async function debugUserData() {
  console.log('🔍 Starting debug for user:', userId);
  console.log('=====================================');

  try {
    // 1. Check user authentication
    console.log('\n1. Checking user authentication...');
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, last_sign_in_at, email_confirmed_at')
      .eq('id', userId)
      .single();
    
    if (authError) {
      console.log('❌ Auth user query error:', authError);
    } else {
      console.log('✅ Auth user data:', authUser);
    }

    // 2. Check profile data
    console.log('\n2. Checking profile data...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile query error:', profileError);
    } else {
      console.log('✅ Profile data:', profile);
    }

    // 3. Check assessment data
    console.log('\n3. Checking assessment data...');
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessment_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (assessmentError) {
      console.log('❌ Assessment data query error:', assessmentError);
    } else {
      console.log('✅ Assessment data count:', assessmentData?.length || 0);
      if (assessmentData && assessmentData.length > 0) {
        console.log('✅ Latest assessment data:', assessmentData[0]);
      }
    }

    // 4. Check workout plans
    console.log('\n4. Checking workout plans...');
    const { data: workoutPlans, error: workoutError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (workoutError) {
      console.log('❌ Workout plans query error:', workoutError);
    } else {
      console.log('✅ Workout plans count:', workoutPlans?.length || 0);
      if (workoutPlans && workoutPlans.length > 0) {
        console.log('✅ Latest workout plan:', workoutPlans[0]);
      }
    }

    // 5. Check nutrition plans
    console.log('\n5. Checking nutrition plans...');
    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (nutritionError) {
      console.log('❌ Nutrition plans query error:', nutritionError);
    } else {
      console.log('✅ Nutrition plans count:', nutritionPlans?.length || 0);
      if (nutritionPlans && nutritionPlans.length > 0) {
        console.log('✅ Latest nutrition plan:', nutritionPlans[0]);
      }
    }

    // 6. Check workout exercises
    console.log('\n6. Checking workout exercises...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        workout_plans!inner(user_id)
      `)
      .eq('workout_plans.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (exercisesError) {
      console.log('❌ Workout exercises query error:', exercisesError);
    } else {
      console.log('✅ Workout exercises count:', exercises?.length || 0);
      if (exercises && exercises.length > 0) {
        console.log('✅ Sample exercise:', exercises[0]);
      }
    }

    // 7. Check meal plans
    console.log('\n7. Checking meal plans...');
    const { data: mealPlans, error: mealError } = await supabase
      .from('meal_plans')
      .select(`
        *,
        nutrition_plans!inner(user_id)
      `)
      .eq('nutrition_plans.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (mealError) {
      console.log('❌ Meal plans query error:', mealError);
    } else {
      console.log('✅ Meal plans count:', mealPlans?.length || 0);
      if (mealPlans && mealPlans.length > 0) {
        console.log('✅ Sample meal plan:', mealPlans[0]);
      }
    }

    // 8. Check workout schedule
    console.log('\n8. Checking workout schedule...');
    const { data: schedule, error: scheduleError } = await supabase
      .from('workout_schedule')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false });
    
    if (scheduleError) {
      console.log('❌ Workout schedule query error:', scheduleError);
    } else {
      console.log('✅ Workout schedule count:', schedule?.length || 0);
      if (schedule && schedule.length > 0) {
        console.log('✅ Sample schedule item:', schedule[0]);
      }
    }

    // 9. Check chat messages
    console.log('\n9. Checking chat messages...');
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (chatError) {
      console.log('❌ Chat messages query error:', chatError);
    } else {
      console.log('✅ Chat messages count:', chatMessages?.length || 0);
      if (chatMessages && chatMessages.length > 0) {
        console.log('✅ Latest chat message:', chatMessages[0]);
      }
    }

    // 10. Check user assistant threads
    console.log('\n10. Checking user assistant threads...');
    const { data: threads, error: threadsError } = await supabase
      .from('user_assistant_threads')
      .select('*')
      .eq('user_id', userId);
    
    if (threadsError) {
      console.log('❌ User assistant threads query error:', threadsError);
    } else {
      console.log('✅ User assistant threads count:', threads?.length || 0);
      if (threads && threads.length > 0) {
        console.log('✅ Thread data:', threads[0]);
      }
    }

    // Summary
    console.log('\n=====================================');
    console.log('📊 SUMMARY:');
    console.log(`- Profile exists: ${profile ? 'YES' : 'NO'}`);
    console.log(`- Assessment data: ${assessmentData?.length || 0} records`);
    console.log(`- Workout plans: ${workoutPlans?.length || 0} records`);
    console.log(`- Nutrition plans: ${nutritionPlans?.length || 0} records`);
    console.log(`- Workout exercises: ${exercises?.length || 0} records`);
    console.log(`- Meal plans: ${mealPlans?.length || 0} records`);
    console.log(`- Workout schedule: ${schedule?.length || 0} records`);
    console.log(`- Chat messages: ${chatMessages?.length || 0} records`);
    console.log(`- Assistant threads: ${threads?.length || 0} records`);

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugUserData(); 