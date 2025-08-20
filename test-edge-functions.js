// Comprehensive test script for all three Edge Functions
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock assessment data
const mockAssessmentData = {
  name: "Test User",
  age: 30,
  gender: "male",
  height: 175,
  weight: 75,
  fitnessGoal: "muscle_gain",
  workoutFrequency: 3,
  diet: "standard",
  equipment: "minimal",
  sportsPlayed: ["basketball"],
  allergies: ["nuts"]
}

// Use a proper UUID for testing
const testUserId = 'c5c9c517-7c45-4744-a9c2-bbf629eb888c'

// Test workout assistant
async function testWorkoutAssistant() {
  console.log('\n🏋️ Testing workout-assistant...')
  console.log('='.repeat(50))
  
  try {
    const startTime = Date.now()
    const response = await supabase.functions.invoke('workout-assistant', {
      body: {
        user_id: testUserId,
        assessment: mockAssessmentData
      }
    })
    const endTime = Date.now()
    
    console.log('⏱️ Response time:', endTime - startTime, 'ms')
    console.log('📊 Response status:', response.error ? 'ERROR' : 'SUCCESS')
    
    if (response.error) {
      console.error('❌ Error:', response.error)
      return false
    }
    
    console.log('✅ Success response:')
    console.log('   - success:', response.data?.success)
    console.log('   - message:', response.data?.message)
    console.log('   - workout_plans:', response.data?.data?.workout_plans)
    console.log('   - workout_schedule length:', response.data?.data?.workout_schedule?.length || 0)
    
    // Validate workout schedule structure
    if (response.data?.data?.workout_schedule) {
      const schedule = response.data.data.workout_schedule
      console.log('📋 Workout schedule validation:')
      console.log('   - Total workouts:', schedule.length)
      
      if (schedule.length > 0) {
        const firstWorkout = schedule[0]
        console.log('   - First workout structure:')
        console.log('     * week:', firstWorkout.week)
        console.log('     * day:', firstWorkout.day)
        console.log('     * workout_title:', firstWorkout.workout_title)
        console.log('     * category:', firstWorkout.category)
        console.log('     * difficulty:', firstWorkout.difficulty)
        console.log('     * exercises count:', firstWorkout.exercises?.length || 0)
        
        if (firstWorkout.exercises && firstWorkout.exercises.length > 0) {
          const firstExercise = firstWorkout.exercises[0]
          console.log('   - First exercise structure:')
          console.log('     * name:', firstExercise.name)
          console.log('     * sets:', firstExercise.sets)
          console.log('     * reps:', firstExercise.reps)
          console.log('     * weight:', firstExercise.weight)
          console.log('     * rest_seconds:', firstExercise.rest_seconds)
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Test nutrition assistant
async function testNutritionAssistant() {
  console.log('\n🍽️ Testing nutrition-assistant...')
  console.log('='.repeat(50))
  
  try {
    const startTime = Date.now()
    const response = await supabase.functions.invoke('nutrition-assistant', {
      body: {
        user_id: testUserId,
        assessment: mockAssessmentData
      }
    })
    const endTime = Date.now()
    
    console.log('⏱️ Response time:', endTime - startTime, 'ms')
    console.log('📊 Response status:', response.error ? 'ERROR' : 'SUCCESS')
    
    if (response.error) {
      console.error('❌ Error:', response.error)
      return false
    }
    
    console.log('✅ Success response:')
    console.log('   - success:', response.data?.success)
    console.log('   - message:', response.data?.message)
    console.log('   - nutrition_plan:', response.data?.data?.nutrition_plan)
    
    // Validate nutrition plan structure
    if (response.data?.data?.nutrition_data) {
      const nutritionPlan = response.data.data.nutrition_data
      console.log('📋 Nutrition plan validation:')
      console.log('   - daily_calories:', nutritionPlan.daily_calories)
      console.log('   - protein_g:', nutritionPlan.protein_g)
      console.log('   - carbs_g:', nutritionPlan.carbs_g)
      console.log('   - fat_g:', nutritionPlan.fat_g)
      console.log('   - diet_type:', nutritionPlan.diet_type)
      console.log('   - meals count:', nutritionPlan.meals?.length || 0)
      
      if (nutritionPlan.meals && nutritionPlan.meals.length > 0) {
        const firstMeal = nutritionPlan.meals[0]
        console.log('   - First meal structure:')
        console.log('     * meal_type:', firstMeal.meal_type)
        console.log('     * meal_title:', firstMeal.meal_title)
        console.log('     * calories:', firstMeal.calories)
        console.log('     * protein_g:', firstMeal.protein_g)
        console.log('     * carbs_g:', firstMeal.carbs_g)
        console.log('     * fat_g:', firstMeal.fat_g)
        console.log('     * day:', firstMeal.day)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Test recommendations assistant
async function testRecommendationsAssistant() {
  console.log('\n💡 Testing recommendations-assistant...')
  console.log('='.repeat(50))
  
  try {
    const startTime = Date.now()
    const response = await supabase.functions.invoke('recommendations-assistant', {
      body: {
        user_id: testUserId,
        assessment: mockAssessmentData
      }
    })
    const endTime = Date.now()
    
    console.log('⏱️ Response time:', endTime - startTime, 'ms')
    console.log('📊 Response status:', response.error ? 'ERROR' : 'SUCCESS')
    
    if (response.error) {
      console.error('❌ Error:', response.error)
      return false
    }
    
    console.log('✅ Success response:')
    console.log('   - success:', response.data?.success)
    console.log('   - message:', response.data?.message)
    console.log('   - recommendations:', response.data?.data?.recommendations)
    
    // Validate recommendations structure
    if (response.data?.data?.recommendations_data) {
      const recommendations = response.data.data.recommendations_data
      console.log('📋 Recommendations validation:')
      console.log('   - workout_tips:', recommendations.workout_tips?.substring(0, 100) + '...')
      console.log('   - nutrition_tips:', recommendations.nutrition_tips?.substring(0, 100) + '...')
      console.log('   - weekly_goals:', recommendations.weekly_goals?.substring(0, 100) + '...')
    }
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Testing all three Edge Functions...')
  console.log('Assessment data:', mockAssessmentData)
  
  const results = {
    workout: await testWorkoutAssistant(),
    nutrition: await testNutritionAssistant(),
    recommendations: await testRecommendationsAssistant()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('='.repeat(50))
  console.log('🏋️ Workout Assistant:', results.workout ? '✅ PASS' : '❌ FAIL')
  console.log('🍽️ Nutrition Assistant:', results.nutrition ? '✅ PASS' : '❌ FAIL')
  console.log('💡 Recommendations Assistant:', results.recommendations ? '✅ PASS' : '❌ FAIL')
  
  const passCount = Object.values(results).filter(Boolean).length
  console.log(`\n🎯 Overall: ${passCount}/3 assistants working correctly`)
  
  if (passCount === 3) {
    console.log('🎉 All Edge Functions are working perfectly!')
  } else if (passCount >= 2) {
    console.log('⚠️ Most Edge Functions are working, but some need attention.')
  } else {
    console.log('❌ Multiple Edge Functions need debugging.')
  }
}

runAllTests() 