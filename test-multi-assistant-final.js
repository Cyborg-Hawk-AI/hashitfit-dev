// Test script for multi-assistant architecture
// This script tests the generate-workout-plan Edge Function with the correct assistant IDs

const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testMultiAssistantArchitecture() {
  console.log('🧪 Testing Multi-Assistant Architecture...')
  
  try {
    // Mock assessment data
    const assessmentData = {
      name: "Multi-Assistant Test User",
      age: 30,
      gender: "male",
      height: 175,
      weight: 75,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 4,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["basketball"],
      allergies: ["peanuts"]
    }
    
    console.log('📋 Assessment Data:', assessmentData)
    
    // Call the Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Client-Info': 'supabase-js/2.21.0'
      },
      body: JSON.stringify({
        assessmentData: assessmentData
      })
    })
    
    const responseText = await response.text()
    console.log('📊 Response Status:', response.status)
    console.log('📊 Response Body:', responseText)
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ Edge Function completed successfully!')
      console.log('📈 Performance Analysis:')
      console.log('- Success status:', result.success)
      console.log('- Message:', result.message)
      console.log('- Warning:', result.warning)
      
      if (result.data) {
        console.log('- Workout plans created:', result.data.workout_plans || 0)
        console.log('- Nutrition plan created:', result.data.nutrition_plan ? 'Yes' : 'No')
        console.log('- Recommendations generated:', result.data.recommendations ? 'Yes' : 'No')
      }
      
      // Check if multi-assistant was used
      if (result.warning && result.warning.includes('3/3 assistants completed')) {
        console.log('🎉 Multi-Assistant Architecture Working!')
      } else if (result.warning && result.warning.includes('0/3 assistants completed')) {
        console.log('⚠️  Multi-Assistant IDs may not be configured correctly')
      } else {
        console.log('ℹ️  Single assistant fallback used')
      }
    } else {
      console.error('❌ Edge Function failed:', response.status, responseText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testMultiAssistantArchitecture() 