// Simple test using existing user credentials
const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'

async function testEdgeFunctionSimple() {
  console.log('🧪 Testing Edge Function with existing user...')
  
  try {
    // Use existing user credentials (you can replace with a real user's JWT)
    const existingJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwic3ViIjoiMzU3YzZiYzAtYjU2Yi00N2JiLWFkM2QtMjBiYmU3Y2VlNTIzIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MTc1NDI5MDUxMiwiaWF0IjoxNzU0Mjg2OTEyLCJlbWFpbCI6InlnYmFyYWthdDI0N0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoieWdiYXJha2F0MjQ3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjM1N2M2YmMwLWI1NmItNDdiYi1hZDNkLTIwYmJlN2NlZTUyMyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU0Mjg2OTEyfV0sInNlc3Npb25faWQiOiI0NDk4ZTIyNC1jYzk0LTQ5NDgtOGQyNC1lNTJhNDQ2MWI4NDMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.6bclTMdgPgLaw1R7G5xtqaoN1M5gj3nCN0DQc9tsDTY'

    // Mock assessment data (simulating real user input)
    const mockAssessmentData = {
      name: "Test User Complete",
      age: 32,
      gender: "male",
      height: 175,
      weight: 75,
      fitnessGoal: "general_fitness",
      workoutFrequency: 3,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["running"],
      allergies: []
    }

    console.log('📋 Mock assessment data:', mockAssessmentData)

    // Call the Edge Function
    console.log('🚀 Calling Edge Function...')
    
    const startTime = Date.now()
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${existingJWT}`
      },
      body: JSON.stringify(mockAssessmentData)
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('📊 Response status:', response.status)
    console.log('⏱️  Request duration:', duration + 'ms')
    
    const result = await response.text()
    console.log('📊 Response body:', result)
    
    // Parse and analyze the response
    try {
      const jsonResult = JSON.parse(result)
      console.log('✅ Parsed JSON response:', jsonResult)
      
      if (jsonResult.success) {
        console.log('🎉 Edge Function completed successfully!')
        console.log('📊 Response data:', jsonResult.data)
        
        if (jsonResult.warning) {
          console.log('⚠️  Warning:', jsonResult.warning)
        }
        
        // Additional analysis
        console.log('📈 Performance Analysis:')
        console.log('- Request duration:', duration + 'ms')
        console.log('- Success status:', jsonResult.success)
        console.log('- Workout plans created:', jsonResult.data?.workout_plans || 0)
        console.log('- Nutrition plan created:', jsonResult.data?.nutrition_plan ? 'Yes' : 'No')
        console.log('- Recommendations generated:', jsonResult.data?.recommendations ? 'Yes' : 'No')
        
      } else {
        console.log('❌ Edge Function returned error:', jsonResult.error)
      }
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:', parseError.message)
      console.log('📄 Raw response:', result)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Run the test
testEdgeFunctionSimple() 