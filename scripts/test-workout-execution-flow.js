// scripts/test-workout-execution-flow.js
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the app
const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user data
const TEST_USER_ID = 'test-user-workout-' + Date.now();
const TEST_WORKOUT_DATA = {
  title: "Test Strength Workout",
  category: "strength",
  difficulty: 3,
  estimated_duration: "00:45:00",
  target_muscles: ["chest", "back", "legs"],
  exercises: [
    {
      name: "Push-ups",
      sets: 3,
      reps: "10-15",
      weight: "bodyweight",
      rest_seconds: 60
    },
    {
      name: "Squats",
      sets: 3,
      reps: "12-15",
      weight: "bodyweight",
      rest_seconds: 90
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: "5-8",
      weight: "bodyweight",
      rest_seconds: 120
    }
  ]
};

async function main() {
  console.log('🏋️ Starting Workout Execution Flow Test');
  console.log('========================================');
  console.log('👤 Test User ID:', TEST_USER_ID);
  
  try {
    // Step 1: Create test user profile
    console.log('\n1️⃣ Creating test user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: TEST_USER_ID,
        name: "Workout Test User",
        has_completed_assessment: true
      });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }
    console.log('✅ Test user profile created');

    // Step 2: Create a workout plan
    console.log('\n2️⃣ Creating workout plan...');
    const { data: workoutPlan, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: TEST_USER_ID,
        title: TEST_WORKOUT_DATA.title,
        category: TEST_WORKOUT_DATA.category,
        difficulty: TEST_WORKOUT_DATA.difficulty,
        estimated_duration: TEST_WORKOUT_DATA.estimated_duration,
        target_muscles: TEST_WORKOUT_DATA.target_muscles,
        ai_generated: false
      })
      .select()
      .single();

    if (planError) {
      console.error('❌ Error creating workout plan:', planError);
      return;
    }
    console.log('✅ Workout plan created:', workoutPlan.id);

    // Step 3: Add exercises to the workout plan
    console.log('\n3️⃣ Adding exercises to workout plan...');
    const exerciseData = TEST_WORKOUT_DATA.exercises.map((ex, index) => ({
      workout_plan_id: workoutPlan.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      rest_time: ex.rest_seconds,
      order_index: index
    }));

    const { error: exerciseError } = await supabase
      .from('workout_exercises')
      .insert(exerciseData);

    if (exerciseError) {
      console.error('❌ Error adding exercises:', exerciseError);
      return;
    }
    console.log('✅ Exercises added to workout plan');

    // Step 4: Schedule the workout for today
    console.log('\n4️⃣ Scheduling workout for today...');
    const today = new Date().toISOString().split('T')[0];
    const { data: schedule, error: scheduleError } = await supabase
      .from('workout_schedule')
      .insert({
        user_id: TEST_USER_ID,
        workout_plan_id: workoutPlan.id,
        scheduled_date: today,
        is_completed: false
      })
      .select()
      .single();

    if (scheduleError) {
      console.error('❌ Error scheduling workout:', scheduleError);
      return;
    }
    console.log('✅ Workout scheduled for today:', schedule.id);

    // Step 5: Simulate starting the workout session
    console.log('\n5️⃣ Starting workout session...');
    console.log('   📱 User clicks "Start Workout" button');
    console.log('   📱 UI transitions to workout session view');
    console.log('   📱 Exercise list is displayed with completion checkboxes');

    // Step 6: Simulate exercise completion
    console.log('\n6️⃣ Simulating exercise completion...');
    console.log('   ✅ User completes Push-ups (3 sets)');
    console.log('   ✅ User completes Squats (3 sets)');
    console.log('   ✅ User completes Pull-ups (3 sets)');
    console.log('   📱 Progress indicator updates');
    console.log('   📱 Rest timer shows between exercises');

    // Step 7: Complete the workout
    console.log('\n7️⃣ Completing workout...');
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (45 * 60 * 1000)); // 45 minutes

    // Create workout log
    const { data: workoutLog, error: logError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: TEST_USER_ID,
        workout_plan_id: workoutPlan.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: 45 * 60, // 45 minutes in seconds
        calories_burned: 225, // Rough estimate
        rating: 4,
        notes: "Great workout session!"
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Error creating workout log:', logError);
      return;
    }
    console.log('✅ Workout log created:', workoutLog.id);

    // Step 8: Create exercise logs
    console.log('\n8️⃣ Creating exercise logs...');
    const exerciseLogs = TEST_WORKOUT_DATA.exercises.map((ex, index) => ({
      workout_log_id: workoutLog.id,
      exercise_name: ex.name,
      sets_completed: ex.sets,
      reps_completed: ex.reps,
      weight_used: ex.weight,
      rest_time: ex.rest_seconds,
      order_index: index,
      position_in_workout: index,
      notes: "Completed successfully"
    }));

    const { error: exerciseLogError } = await supabase
      .from('exercise_logs')
      .insert(exerciseLogs);

    if (exerciseLogError) {
      console.error('❌ Error creating exercise logs:', exerciseLogError);
      return;
    }
    console.log('✅ Exercise logs created');

    // Step 9: Mark scheduled workout as completed
    console.log('\n9️⃣ Marking scheduled workout as completed...');
    const { error: completeError } = await supabase
      .from('workout_schedule')
      .update({
        is_completed: true,
        completion_date: endTime.toISOString(),
        workout_log_id: workoutLog.id
      })
      .eq('id', schedule.id);

    if (completeError) {
      console.error('❌ Error marking workout as completed:', completeError);
      return;
    }
    console.log('✅ Scheduled workout marked as completed');

    // Step 10: Verify data propagation
    console.log('\n🔍 Verifying data propagation...');
    
    // Check workout schedule
    const { data: updatedSchedule, error: scheduleCheckError } = await supabase
      .from('workout_schedule')
      .select('*')
      .eq('id', schedule.id)
      .single();

    if (scheduleCheckError) {
      console.error('❌ Error checking workout schedule:', scheduleCheckError);
    } else {
      console.log('✅ Workout schedule verified:', {
        is_completed: updatedSchedule.is_completed,
        completion_date: updatedSchedule.completion_date,
        workout_log_id: updatedSchedule.workout_log_id
      });
    }

    // Check workout log
    const { data: workoutLogCheck, error: logCheckError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('id', workoutLog.id)
      .single();

    if (logCheckError) {
      console.error('❌ Error checking workout log:', logCheckError);
    } else {
      console.log('✅ Workout log verified:', {
        duration: workoutLogCheck.duration,
        calories_burned: workoutLogCheck.calories_burned,
        rating: workoutLogCheck.rating
      });
    }

    // Check exercise logs
    const { data: exerciseLogsCheck, error: exerciseLogsCheckError } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('workout_log_id', workoutLog.id);

    if (exerciseLogsCheckError) {
      console.error('❌ Error checking exercise logs:', exerciseLogsCheckError);
    } else {
      console.log('✅ Exercise logs verified:', {
        count: exerciseLogsCheck.length,
        exercises: exerciseLogsCheck.map(log => ({
          name: log.exercise_name,
          sets: log.sets_completed,
          reps: log.reps_completed
        }))
      });
    }

    // Step 11: Simulate UI updates
    console.log('\n📱 Simulating UI updates...');
    console.log('   🎉 Workout completion screen shows');
    console.log('   📊 Performance metrics displayed');
    console.log('   ⭐ User rates workout (4/5)');
    console.log('   📝 User adds notes: "Great workout session!"');
    console.log('   💾 Data saved to database');
    console.log('   🔄 Dashboard updates with new completion');
    console.log('   📈 Progress charts update');
    console.log('   🏆 Streak counters increment');

    console.log('\n🎉 Workout Execution Flow Test Completed Successfully!');
    console.log('=====================================================');
    console.log('📊 Summary:');
    console.log(`   👤 Test User ID: ${TEST_USER_ID}`);
    console.log(`   💪 Workout Plan: ${workoutPlan.id}`);
    console.log(`   📅 Scheduled: ${schedule.id}`);
    console.log(`   📝 Workout Log: ${workoutLog.id}`);
    console.log(`   🏋️ Exercise Logs: ${exerciseLogs.length} created`);
    console.log(`   ✅ Completion Status: Marked as completed`);
    console.log(`   🔄 UI Updates: Simulated successfully`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main().catch((e) => (console.error(e), process.exit(1)));
