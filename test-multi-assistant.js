import { createClient } from '@supabase/supabase-js'

// Test configuration
const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwicm9sZSI6ImFub24iLCJleHAiOjE5MzI5NzY4MDB9.6a4d8cca5a79a644ee7a65db208693713a853a307b12ba3c0d04abb3084fd513'

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testMultiAssistant() {
  console.log('🧪 Testing Multi-Assistant Edge Function...')
  
  try {
    // Test assessment data
    const assessmentData = {
      name: "Test User",
      age: 30,
      gender: "male",
      height: 175,
      weight: 75,
      fitnessGoal: "general_fitness",
      workoutFrequency: 3,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["basketball"],
      allergies: ["nuts"]
    }

    console.log('📋 Assessment data:', assessmentData)

    // Call the Edge Function
    const response = await fetch('http://localhost:54321/functions/v1/generate-workout-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(assessmentData)
    })

    const result = await response.json()
    
    console.log('✅ Response status:', response.status)
    console.log('📊 Response data:', result)
    
    if (result.success) {
      console.log('🎉 Multi-assistant test completed successfully!')
      console.log('- Workout plans created:', result.data.workout_plans)
      console.log('- Nutrition plan created:', result.data.nutrition_plan)
      console.log('- Recommendations generated:', result.data.recommendations)
      
      if (result.warning) {
        console.log('⚠️  Warning:', result.warning)
      }
    } else {
      console.error('❌ Test failed:', result.error)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Run the test
testMultiAssistant() 