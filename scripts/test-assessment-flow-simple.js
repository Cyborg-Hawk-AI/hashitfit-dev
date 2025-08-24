// scripts/test-assessment-flow-simple.js
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the app
const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI";

// For admin access, we'll need the service role key
// For now, let's test with the anon key to see what we can access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('👤 Test User ID:', TEST_USER_ID);
  
  try {
    // Step 1: Check what tables exist and their structure
    console.log('\n1️⃣ Checking database structure...');
    
    // Try to query different tables to see what's accessible
    const tables = ['profiles', 'assessment_data', 'workout_plans', 'nutrition_plans', 'user_recommendations'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible (${data?.length || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Step 2: Test Edge Functions
    console.log('\n2️⃣ Testing Edge Functions...');
    
    // Test workout-assistant
    console.log('   📞 Testing workout-assistant...');
    try {
      const workoutResponse = await supabase.functions.invoke('workout-assistant', {
        body: {
          user_id: TEST_USER_ID,
          assessment: TEST_ASSESSMENT_DATA
        }
      });
      
      console.log('   ✅ Workout Assistant Response:', {
        status: workoutResponse.status,
        success: workoutResponse.data?.success,
        error: workoutResponse.error,
        data: workoutResponse.data?.data
      });
    } catch (error) {
      console.log('   ❌ Workout Assistant Error:', error.message);
    }

    // Test nutrition-assistant
    console.log('   📞 Testing nutrition-assistant...');
    try {
      const nutritionResponse = await supabase.functions.invoke('nutrition-assistant', {
        body: {
          user_id: TEST_USER_ID,
          assessment: TEST_ASSESSMENT_DATA
        }
      });
      
      console.log('   ✅ Nutrition Assistant Response:', {
        status: nutritionResponse.status,
        success: nutritionResponse.data?.success,
        error: nutritionResponse.error,
        data: nutritionResponse.data?.data
      });
    } catch (error) {
      console.log('   ❌ Nutrition Assistant Error:', error.message);
    }

    // Test recommendations-assistant
    console.log('   📞 Testing recommendations-assistant...');
    try {
      const recommendationsResponse = await supabase.functions.invoke('recommendations-assistant', {
        body: {
          user_id: TEST_USER_ID,
          assessment: TEST_ASSESSMENT_DATA
        }
      });
      
      console.log('   ✅ Recommendations Assistant Response:', {
        status: recommendationsResponse.status,
        success: recommendationsResponse.data?.success,
        error: recommendationsResponse.error,
        data: recommendationsResponse.data?.data
      });
    } catch (error) {
      console.log('   ❌ Recommendations Assistant Error:', error.message);
    }

    // Step 3: Test parallel execution
    console.log('\n3️⃣ Testing parallel execution...');
    const startTime = Date.now();
    
    try {
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

      console.log('   ⚡ Parallel Execution Results:', {
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
    } catch (error) {
      console.log('   ❌ Parallel Execution Error:', error.message);
    }

    console.log('\n🎉 Assessment Flow Test Completed!');
    console.log('=================================');
    console.log('📊 Summary:');
    console.log(`   👤 Test User ID: ${TEST_USER_ID}`);
    console.log(`   🔗 Supabase: Connected`);
    console.log(`   📞 Edge Functions: Tested`);
    console.log(`   ⚡ Parallel Execution: Tested`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main().catch((e) => (console.error(e), process.exit(1)));
