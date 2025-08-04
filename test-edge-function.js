// Simple test for the Edge Function
const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwicm9sZSI6ImFub24iLCJleHAiOjE5MzI5NzY4MDB9.6a4d8cca5a79a644ee7a65db208693713a853a307b12ba3c0d04abb3084fd513'

async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function...')
  
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
      sportsPlayed: [],
      allergies: []
    }

    console.log('📋 Assessment data:', assessmentData)

    // Call the Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(assessmentData)
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    const result = await response.text()
    console.log('📊 Response body:', result)
    
    try {
      const jsonResult = JSON.parse(result)
      console.log('✅ Parsed JSON response:', jsonResult)
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:', parseError.message)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Run the test
testEdgeFunction() 