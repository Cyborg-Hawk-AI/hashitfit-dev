// scripts/test-edge-functions.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

// Use anon key for Edge Function calls (as they would be called from the frontend)
const supabase = createClient(url, anonKey);

// Test user data
const TEST_USER_ID = 'test-user-edge-' + Date.now();
const TEST_ASSESSMENT_DATA = {
  name: "Edge Test User",
  age: 28,
  gender: "female",
  height: 165,
  weight: 60,
  fitnessGoal: "weight_loss",
  workoutFrequency: 3,
  diet: "vegetarian",
  equipment: "minimal",
  sportsPlayed: ["yoga"],
  allergies: ["dairy"]
};

async function main() {
  console.log('🧪 Starting Edge Function Test');
  console.log('==============================');
  
  try {
    // Step 1: Test workout-assistant
    console.log('\n1️⃣ Testing workout-assistant...');
    const workoutResponse = await supabase.functions.invoke('workout-assistant', {
      body: {
        user_id: TEST_USER_ID,
        assessment: TEST_ASSESSMENT_DATA
      }
    });

    console.log('Workout Assistant Response:', {
      status: workoutResponse.status,
      success: workoutResponse.data?.success,
      error: workoutResponse.error,
      data: workoutResponse.data?.data
    });

    // Step 2: Test nutrition-assistant
    console.log('\n2️⃣ Testing nutrition-assistant...');
    const nutritionResponse = await supabase.functions.invoke('nutrition-assistant', {
      body: {
        user_id: TEST_USER_ID,
        assessment: TEST_ASSESSMENT_DATA
      }
    });

    console.log('Nutrition Assistant Response:', {
      status: nutritionResponse.status,
      success: nutritionResponse.data?.success,
      error: nutritionResponse.error,
      data: nutritionResponse.data?.data
    });

    // Step 3: Test recommendations-assistant
    console.log('\n3️⃣ Testing recommendations-assistant...');
    const recommendationsResponse = await supabase.functions.invoke('recommendations-assistant', {
      body: {
        user_id: TEST_USER_ID,
        assessment: TEST_ASSESSMENT_DATA
      }
    });

    console.log('Recommendations Assistant Response:', {
      status: recommendationsResponse.status,
      success: recommendationsResponse.data?.success,
      error: recommendationsResponse.error,
      data: recommendationsResponse.data?.data
    });

    // Step 4: Test parallel execution (like the real PlanGenerationService)
    console.log('\n4️⃣ Testing parallel execution...');
    const startTime = Date.now();
    
    const [parallelWorkout, parallelNutrition, parallelRecommendations] = await Promise.allSettled([
      supabase.functions.invoke('workout-assistant', {
        body: {
          user_id: TEST_USER_ID + '-parallel',
          assessment: TEST_ASSESSMENT_DATA
        }
      }),
      supabase.functions.invoke('nutrition-assistant', {
        body: {
          user_id: TEST_USER_ID + '-parallel',
          assessment: TEST_ASSESSMENT_DATA
        }
      }),
      supabase.functions.invoke('recommendations-assistant', {
        body: {
          user_id: TEST_USER_ID + '-parallel',
          assessment: TEST_ASSESSMENT_DATA
        }
      })
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Parallel Execution Results:', {
      duration: `${duration}ms`,
      workout: {
        status: parallelWorkout.status,
        success: parallelWorkout.status === 'fulfilled' ? parallelWorkout.value.data?.success : false,
        error: parallelWorkout.status === 'rejected' ? parallelWorkout.reason : parallelWorkout.value?.error
      },
      nutrition: {
        status: parallelNutrition.status,
        success: parallelNutrition.status === 'fulfilled' ? parallelNutrition.value.data?.success : false,
        error: parallelNutrition.status === 'rejected' ? parallelNutrition.reason : parallelNutrition.value?.error
      },
      recommendations: {
        status: parallelRecommendations.status,
        success: parallelRecommendations.status === 'fulfilled' ? parallelRecommendations.value.data?.success : false,
        error: parallelRecommendations.status === 'rejected' ? parallelRecommendations.reason : parallelRecommendations.value?.error
      }
    });

    console.log('\n🎉 Edge Function Test Completed!');
    console.log('=================================');
    console.log('📊 Summary:');
    console.log(`   💪 Workout Assistant: ${workoutResponse.data?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   🍽️ Nutrition Assistant: ${nutritionResponse.data?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   💡 Recommendations Assistant: ${recommendationsResponse.data?.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   ⚡ Parallel Execution: ${duration}ms`);

  } catch (error) {
    console.error('❌ Edge Function test failed:', error);
  }
}

main().catch((e) => (console.error(e), process.exit(1)));
