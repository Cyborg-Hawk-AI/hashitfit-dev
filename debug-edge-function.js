// Debug script to check Edge Function configuration
const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'

async function debugEdgeFunction() {
  console.log('🔍 Debugging Edge Function configuration...')
  
  try {
    // Test the Edge Function endpoint directly
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        name: "Debug Test",
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
    
    // Try to parse as JSON
    try {
      const jsonResult = JSON.parse(result)
      console.log('✅ Parsed response:', jsonResult)
      
      if (jsonResult.error) {
        console.log('❌ Error details:', jsonResult.error)
      }
    } catch (parseError) {
      console.log('⚠️  Not JSON response:', result)
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error)
  }
}

// Run debug
debugEdgeFunction() 