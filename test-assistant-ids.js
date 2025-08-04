// Test script to verify assistant IDs
const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwicm9sZSI6ImFub24iLCJleHAiOjE5MzI5NzY4MDB9.6a4d8cca5a79a644ee7a65db208693713a853a307b12ba3c0d04abb3084fd513'

async function testAssistantIds() {
  console.log('🔍 Testing Assistant ID configuration...')
  
  try {
    // Test the Edge Function with a simple request to see what assistant IDs are being used
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-for-testing'
      },
      body: JSON.stringify({
        name: "Test",
        age: 30,
        gender: "male",
        height: 175,
        weight: 75,
        fitnessGoal: "general_fitness",
        workoutFrequency: 3,
        diet: "standard",
        equipment: "minimal",
        sportsPlayed: [],
        allergies: []
      })
    })

    console.log('📊 Response status:', response.status)
    
    const result = await response.text()
    console.log('📊 Response body:', result)
    
    // The response should show us if the assistant IDs are being detected correctly
    try {
      const jsonResult = JSON.parse(result)
      console.log('✅ Parsed response:', jsonResult)
    } catch (parseError) {
      console.log('⚠️  Not JSON response:', result)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Run test
testAssistantIds() 