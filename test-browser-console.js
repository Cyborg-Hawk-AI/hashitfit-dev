// Test script to run in browser console
// Copy and paste this into your browser's developer console while logged into the app

async function testEdgeFunctionInBrowser() {
  console.log('🧪 Testing Edge Function in browser...')
  
  try {
    // Get the current user's JWT token from localStorage
    const supabaseKey = 'sb-haxiwqgajhanpapvicbm-auth-token'
    const authData = localStorage.getItem(supabaseKey)
    
    if (!authData) {
      console.error('❌ No auth data found. Please make sure you are logged in.')
      return
    }
    
    const auth = JSON.parse(authData)
    const jwt = auth.access_token
    
    if (!jwt) {
      console.error('❌ No JWT token found. Please make sure you are logged in.')
      return
    }
    
    console.log('✅ Found JWT token')
    
    // Mock assessment data
    const mockAssessmentData = {
      name: "Browser Test User",
      age: 33,
      gender: "male",
      height: 177,
      weight: 79,
      fitnessGoal: "endurance",
      workoutFrequency: 5,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["running", "swimming"],
      allergies: ["nuts"]
    }
    
    console.log('📋 Mock assessment data:', mockAssessmentData)
    
    // Call the Edge Function
    console.log('🚀 Calling Edge Function...')
    
    const startTime = Date.now()
    
    const response = await fetch('https://haxiwqgajhanpapvicbm.supabase.co/functions/v1/generate-workout-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
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
        
        // Performance analysis
        console.log('📈 Performance Analysis:')
        console.log('- Request duration:', duration + 'ms')
        console.log('- Success status:', jsonResult.success)
        console.log('- Workout plans created:', jsonResult.data?.workout_plans || 0)
        console.log('- Nutrition plan created:', jsonResult.data?.nutrition_plan ? 'Yes' : 'No')
        console.log('- Recommendations generated:', jsonResult.data?.recommendations ? 'Yes' : 'No')
        
        // Database verification
        console.log('🔍 To verify database population:')
        console.log('1. Check the Supabase dashboard')
        console.log('2. Look for new records in:')
        console.log('   - profiles table (has_completed_assessment = true)')
        console.log('   - assessment_data table (new assessment record)')
        console.log('   - workout_plans table (new workout plans)')
        console.log('   - nutrition_plans table (new nutrition plan)')
        
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

// Instructions for running this test:
console.log('📝 Instructions:')
console.log('1. Make sure you are logged into the app')
console.log('2. Open Developer Tools (F12)')
console.log('3. Go to Console tab')
console.log('4. Copy and paste this entire script')
console.log('5. Press Enter to run the test')
console.log('')
console.log('Or run: testEdgeFunctionInBrowser()')

// Run the test
testEdgeFunctionInBrowser() 