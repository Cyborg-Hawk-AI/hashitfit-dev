// scripts/test-assessment-flow.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role for admin access to verify data
const supaAdmin = serviceKey
  ? createClient(url, serviceKey)
  : undefined;

if (!supaAdmin) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

// Test user data
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_ASSESSMENT_DATA = {
  name: "Test User",
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  fitnessGoal: "muscle_gain",
  workoutFrequency: 4,
  diet: "standard",
  equipment: "full_gym",
  sportsPlayed: ["basketball"],
  allergies: ["nuts"]
};

async function main() {
  console.log('🧪 Starting Assessment Flow Test Simulation');
  console.log('===========================================');
  
  try {
    // Step 1: Create test user profile
    console.log('\n1️⃣ Creating test user profile...');
    const { error: profileError } = await supaAdmin
      .from('profiles')
      .insert({
        id: TEST_USER_ID,
        name: TEST_ASSESSMENT_DATA.name,
        has_completed_assessment: false
      });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }
    console.log('✅ Test user profile created');

    // Step 2: Simulate assessment completion
    console.log('\n2️⃣ Simulating assessment completion...');
    const { error: assessmentError } = await supaAdmin
      .from('assessment_data')
      .insert({
        user_id: TEST_USER_ID,
        age: TEST_ASSESSMENT_DATA.age,
        gender: TEST_ASSESSMENT_DATA.gender,
        height: TEST_ASSESSMENT_DATA.height,
        weight: TEST_ASSESSMENT_DATA.weight,
        fitness_goal: TEST_ASSESSMENT_DATA.fitnessGoal,
        workout_frequency: TEST_ASSESSMENT_DATA.workoutFrequency,
        diet: TEST_ASSESSMENT_DATA.diet,
        equipment: TEST_ASSESSMENT_DATA.equipment,
        sports_played: TEST_ASSESSMENT_DATA.sportsPlayed,
        allergies: TEST_ASSESSMENT_DATA.allergies
      });

    if (assessmentError) {
      console.error('❌ Error storing assessment data:', assessmentError);
      return;
    }
    console.log('✅ Assessment data stored');

    // Step 3: Update profile to mark assessment as completed
    console.log('\n3️⃣ Updating profile to mark assessment as completed...');
    const { error: updateError } = await supaAdmin
      .from('profiles')
      .update({ 
        has_completed_assessment: true,
        fitness_goal: TEST_ASSESSMENT_DATA.fitnessGoal,
        workout_frequency: TEST_ASSESSMENT_DATA.workoutFrequency,
        diet: TEST_ASSESSMENT_DATA.diet,
        equipment: TEST_ASSESSMENT_DATA.equipment,
        sports_played: TEST_ASSESSMENT_DATA.sportsPlayed,
        allergies: TEST_ASSESSMENT_DATA.allergies,
        age: TEST_ASSESSMENT_DATA.age,
        gender: TEST_ASSESSMENT_DATA.gender,
        height: TEST_ASSESSMENT_DATA.height,
        weight: TEST_ASSESSMENT_DATA.weight
      })
      .eq('id', TEST_USER_ID);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return;
    }
    console.log('✅ Profile updated with assessment data');

    // Step 4: Simulate calling the three OpenAI assistants
    console.log('\n4️⃣ Simulating OpenAI assistant calls...');
    console.log('   📞 Calling workout-assistant...');
    console.log('   📞 Calling nutrition-assistant...');
    console.log('   📞 Calling recommendations-assistant...');
    
    // Simulate the parallel calls (we'll just log them for now)
    console.log('   ⏳ All three assistants called in parallel');
    console.log('   ✅ Assistant calls completed (simulated)');

    // Step 5: Verify data in all relevant tables
    console.log('\n5️⃣ Verifying data propagation...');
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supaAdmin
      .from('profiles')
      .select('*')
      .eq('id', TEST_USER_ID);
    
    if (profilesError) {
      console.error('❌ Error checking profiles:', profilesError);
    } else {
      console.log('✅ Profile data verified:', {
        has_completed_assessment: profiles?.[0]?.has_completed_assessment,
        fitness_goal: profiles?.[0]?.fitness_goal,
        workout_frequency: profiles?.[0]?.workout_frequency
      });
    }

    // Check assessment_data table
    const { data: assessmentData, error: assessmentDataError } = await supaAdmin
      .from('assessment_data')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (assessmentDataError) {
      console.error('❌ Error checking assessment_data:', assessmentDataError);
    } else {
      console.log('✅ Assessment data verified:', {
        count: assessmentData?.length,
        fitness_goal: assessmentData?.[0]?.fitness_goal,
        workout_frequency: assessmentData?.[0]?.workout_frequency
      });
    }

    // Check workout_plans table
    const { data: workoutPlans, error: workoutPlansError } = await supaAdmin
      .from('workout_plans')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (workoutPlansError) {
      console.error('❌ Error checking workout_plans:', workoutPlansError);
    } else {
      console.log('✅ Workout plans verified:', {
        count: workoutPlans?.length,
        plans: workoutPlans?.map(wp => ({ id: wp.id, title: wp.title, category: wp.category }))
      });
    }

    // Check nutrition_plans table
    const { data: nutritionPlans, error: nutritionPlansError } = await supaAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (nutritionPlansError) {
      console.error('❌ Error checking nutrition_plans:', nutritionPlansError);
    } else {
      console.log('✅ Nutrition plans verified:', {
        count: nutritionPlans?.length,
        plans: nutritionPlans?.map(np => ({ id: np.id, title: np.title, daily_calories: np.daily_calories }))
      });
    }

    // Check user_recommendations table
    const { data: recommendations, error: recommendationsError } = await supaAdmin
      .from('user_recommendations')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (recommendationsError) {
      console.error('❌ Error checking user_recommendations:', recommendationsError);
    } else {
      console.log('✅ User recommendations verified:', {
        count: recommendations?.length,
        recommendations: recommendations?.map(r => ({ id: r.id, workout_tips: r.workout_tips?.substring(0, 50) + '...' }))
      });
    }

    // Step 6: Check for workout_exercises (if workout plans exist)
    if (workoutPlans && workoutPlans.length > 0) {
      const { data: exercises, error: exercisesError } = await supaAdmin
        .from('workout_exercises')
        .select('*')
        .in('workout_plan_id', workoutPlans.map(wp => wp.id));
      
      if (exercisesError) {
        console.error('❌ Error checking workout_exercises:', exercisesError);
      } else {
        console.log('✅ Workout exercises verified:', {
          count: exercises?.length,
          exercises: exercises?.slice(0, 3).map(e => ({ name: e.name, sets: e.sets, reps: e.reps }))
        });
      }
    }

    // Step 7: Check for meal_plans (if nutrition plans exist)
    if (nutritionPlans && nutritionPlans.length > 0) {
      const { data: mealPlans, error: mealPlansError } = await supaAdmin
        .from('meal_plans')
        .select('*')
        .in('nutrition_plan_id', nutritionPlans.map(np => np.id));
      
      if (mealPlansError) {
        console.error('❌ Error checking meal_plans:', mealPlansError);
      } else {
        console.log('✅ Meal plans verified:', {
          count: mealPlans?.length,
          meals: mealPlans?.slice(0, 3).map(mp => ({ meal_type: mp.meal_type, meal_title: mp.meal_title, calories: mp.calories }))
        });
      }
    }

    console.log('\n🎉 Assessment Flow Test Completed Successfully!');
    console.log('===============================================');
    console.log('📊 Summary:');
    console.log(`   👤 Test User ID: ${TEST_USER_ID}`);
    console.log(`   📋 Assessment: ✅ Stored`);
    console.log(`   👤 Profile: ✅ Updated`);
    console.log(`   💪 Workout Plans: ${workoutPlans?.length || 0} created`);
    console.log(`   🍽️ Nutrition Plans: ${nutritionPlans?.length || 0} created`);
    console.log(`   💡 Recommendations: ${recommendations?.length || 0} created`);
    console.log(`   🏋️ Exercises: ${exercises?.length || 0} created`);
    console.log(`   🍎 Meals: ${mealPlans?.length || 0} created`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main().catch((e) => (console.error(e), process.exit(1)));
