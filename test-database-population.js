// Test script to verify database population by Edge Functions
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock assessment data
const mockAssessmentData = {
  name: "Database Test User",
  age: 28,
  gender: "female",
  height: 165,
  weight: 60,
  fitnessGoal: "weight_loss",
  workoutFrequency: 4,
  diet: "vegetarian",
  equipment: "home_gym",
  sportsPlayed: ["yoga", "running"],
  allergies: ["dairy"]
}

// Test database population
async function testDatabasePopulation() {
  console.log('🧪 Testing database population by Edge Functions...')
  console.log('Assessment data:', mockAssessmentData)
  
  const testUserId = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c' // Use existing test user ID
  
  try {
    // Use existing profile
    console.log('\n📋 Using existing test profile...')
    console.log('✅ Test profile ready')
    
    // Call all three Edge Functions
    console.log('\n🚀 Calling all three Edge Functions...')
    
    const [workoutResponse, nutritionResponse, recommendationsResponse] = await Promise.allSettled([
      supabase.functions.invoke('workout-assistant', {
        body: {
          user_id: testUserId,
          assessment: mockAssessmentData
        }
      }),
      supabase.functions.invoke('nutrition-assistant', {
        body: {
          user_id: testUserId,
          assessment: mockAssessmentData
        }
      }),
      supabase.functions.invoke('recommendations-assistant', {
        body: {
          user_id: testUserId,
          assessment: mockAssessmentData
        }
      })
    ])
    
    console.log('✅ All Edge Functions completed')
    
    // Wait a moment for database operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check database population
    console.log('\n📊 Checking database population...')
    
    // Check profiles table
    console.log('\n👤 Checking profiles table...')
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (profileCheckError) {
      console.error('❌ Error checking profile:', profileCheckError)
    } else {
      console.log('✅ Profile updated successfully:')
      console.log('   - has_completed_assessment:', profile.has_completed_assessment)
      console.log('   - name:', profile.name)
      console.log('   - fitness_goal:', profile.fitness_goal)
      console.log('   - workout_frequency:', profile.workout_frequency)
    }
    
    // Check assessment_data table
    console.log('\n📋 Checking assessment_data table...')
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessment_data')
      .select('*')
      .eq('user_id', testUserId)
    
    if (assessmentError) {
      console.error('❌ Error checking assessment data:', assessmentError)
    } else {
      console.log('✅ Assessment data stored successfully:')
      console.log('   - Records found:', assessmentData?.length || 0)
      if (assessmentData && assessmentData.length > 0) {
        console.log('   - First record:', assessmentData[0])
      }
    }
    
    // Check workout_plans table
    console.log('\n🏋️ Checking workout_plans table...')
    const { data: workoutPlans, error: workoutError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', testUserId)
    
    if (workoutError) {
      console.error('❌ Error checking workout plans:', workoutError)
    } else {
      console.log('✅ Workout plans stored successfully:')
      console.log('   - Plans created:', workoutPlans?.length || 0)
      if (workoutPlans && workoutPlans.length > 0) {
        console.log('   - First plan:', workoutPlans[0])
      }
    }
    
    // Check workout_exercises table
    console.log('\n💪 Checking workout_exercises table...')
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('workout_plan_id', workoutPlans?.map(wp => wp.id) || [])
    
    if (exercisesError) {
      console.error('❌ Error checking exercises:', exercisesError)
    } else {
      console.log('✅ Workout exercises stored successfully:')
      console.log('   - Exercises created:', exercises?.length || 0)
      if (exercises && exercises.length > 0) {
        console.log('   - First exercise:', exercises[0])
      }
    }
    
    // Check workout_schedule table
    console.log('\n📅 Checking workout_schedule table...')
    const { data: schedule, error: scheduleError } = await supabase
      .from('workout_schedule')
      .select('*')
      .eq('user_id', testUserId)
    
    if (scheduleError) {
      console.error('❌ Error checking workout schedule:', scheduleError)
    } else {
      console.log('✅ Workout schedule stored successfully:')
      console.log('   - Scheduled workouts:', schedule?.length || 0)
      if (schedule && schedule.length > 0) {
        console.log('   - First scheduled workout:', schedule[0])
      }
    }
    
    // Check nutrition_plans table
    console.log('\n🍽️ Checking nutrition_plans table...')
    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', testUserId)
    
    if (nutritionError) {
      console.error('❌ Error checking nutrition plans:', nutritionError)
    } else {
      console.log('✅ Nutrition plans stored successfully:')
      console.log('   - Plans created:', nutritionPlans?.length || 0)
      if (nutritionPlans && nutritionPlans.length > 0) {
        console.log('   - First plan:', nutritionPlans[0])
      }
    }
    
    // Check meal_plans table
    console.log('\n🍳 Checking meal_plans table...')
    const { data: mealPlans, error: mealError } = await supabase
      .from('meal_plans')
      .select('*')
      .in('nutrition_plan_id', nutritionPlans?.map(np => np.id) || [])
    
    if (mealError) {
      console.error('❌ Error checking meal plans:', mealError)
    } else {
      console.log('✅ Meal plans stored successfully:')
      console.log('   - Meals created:', mealPlans?.length || 0)
      if (mealPlans && mealPlans.length > 0) {
        console.log('   - First meal:', mealPlans[0])
      }
    }
    
    // Check user_recommendations table
    console.log('\n💡 Checking user_recommendations table...')
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('user_recommendations')
      .select('*')
      .eq('user_id', testUserId)
    
    if (recommendationsError) {
      console.error('❌ Error checking recommendations:', recommendationsError)
    } else {
      console.log('✅ Recommendations stored successfully:')
      console.log('   - Recommendations created:', recommendations?.length || 0)
      if (recommendations && recommendations.length > 0) {
        console.log('   - First recommendation:', recommendations[0])
      }
    }
    
    // Summary
    console.log('\n📊 Database Population Summary:')
    console.log('='.repeat(50))
    console.log('👤 Profile updated:', profile?.has_completed_assessment ? '✅' : '❌')
    console.log('📋 Assessment data:', assessmentData?.length > 0 ? '✅' : '❌')
    console.log('🏋️ Workout plans:', workoutPlans?.length > 0 ? '✅' : '❌')
    console.log('💪 Workout exercises:', exercises?.length > 0 ? '✅' : '❌')
    console.log('📅 Workout schedule:', schedule?.length > 0 ? '✅' : '❌')
    console.log('🍽️ Nutrition plans:', nutritionPlans?.length > 0 ? '✅' : '❌')
    console.log('🍳 Meal plans:', mealPlans?.length > 0 ? '✅' : '❌')
    console.log('💡 Recommendations:', recommendations?.length > 0 ? '✅' : '❌')
    
    const successCount = [
      profile?.has_completed_assessment,
      assessmentData?.length > 0,
      workoutPlans?.length > 0,
      exercises?.length > 0,
      schedule?.length > 0,
      nutritionPlans?.length > 0,
      mealPlans?.length > 0,
      recommendations?.length > 0
    ].filter(Boolean).length
    
    console.log(`\n🎯 Overall: ${successCount}/8 database operations successful`)
    
    if (successCount === 8) {
      console.log('🎉 All database operations completed successfully!')
    } else if (successCount >= 6) {
      console.log('⚠️ Most database operations completed, but some need attention.')
    } else {
      console.log('❌ Multiple database operations failed.')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDatabasePopulation() 