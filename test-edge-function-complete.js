import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwicm9sZSI6ImFub24iLCJleHAiOjE5MzI5NzY4MDB9.6a4d8cca5a79a644ee7a65db208693713a853a307b12ba3c0d04abb3084fd513'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testEdgeFunctionComplete() {
  console.log('🧪 Testing Edge Function with complete assessment data...')
  
  try {
    // Step 1: Create a test user account
    console.log('📝 Step 1: Creating test user account...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (signUpError) {
      console.error('❌ Sign up error:', signUpError)
      return
    }

    console.log('✅ Test user created:', user?.id)

    // Step 2: Sign in to get JWT token
    console.log('🔐 Step 2: Signing in to get JWT token...')
    
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError || !session) {
      console.error('❌ Sign in error:', signInError)
      return
    }

    const jwt = session.access_token
    console.log('✅ Got JWT token for user:', user?.id)

    // Step 3: Prepare mock assessment data (simulating real user input)
    console.log('📋 Step 3: Preparing mock assessment data...')
    
    const mockAssessmentData = {
      name: "John Fitness",
      age: 28,
      gender: "male",
      height: 180,
      weight: 80,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 4,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["basketball", "swimming"],
      allergies: ["peanuts"]
    }

    console.log('📋 Mock assessment data:', mockAssessmentData)

    // Step 4: Call the Edge Function with real authentication
    console.log('🚀 Step 4: Calling Edge Function with assessment data...')
    
    const startTime = Date.now()
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout-plan`, {
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
    
    // Step 5: Parse and analyze the response
    try {
      const jsonResult = JSON.parse(result)
      console.log('✅ Parsed JSON response:', jsonResult)
      
      if (jsonResult.success) {
        console.log('🎉 Edge Function completed successfully!')
        console.log('📊 Response data:', jsonResult.data)
        
        if (jsonResult.warning) {
          console.log('⚠️  Warning:', jsonResult.warning)
        }
      } else {
        console.log('❌ Edge Function returned error:', jsonResult.error)
      }
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:', parseError.message)
      console.log('📄 Raw response:', result)
    }

    // Step 6: Verify database population
    console.log('🔍 Step 5: Verifying database population...')
    
    // Check if profile was updated
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError)
    } else {
      console.log('✅ Profile updated:', {
        has_completed_assessment: profile.has_completed_assessment,
        name: profile.name,
        fitness_goal: profile.fitness_goal,
        workout_frequency: profile.workout_frequency
      })
    }

    // Check if assessment data was stored
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessment_data')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError) {
      console.error('❌ Error fetching assessment data:', assessmentError)
    } else {
      console.log('✅ Assessment data stored:', {
        age: assessmentData.age,
        gender: assessmentData.gender,
        fitness_goal: assessmentData.fitness_goal,
        workout_frequency: assessmentData.workout_frequency
      })
    }

    // Check if workout plans were created
    const { data: workoutPlans, error: workoutError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user?.id)

    if (workoutError) {
      console.error('❌ Error fetching workout plans:', workoutError)
    } else {
      console.log('✅ Workout plans created:', workoutPlans?.length || 0)
      if (workoutPlans && workoutPlans.length > 0) {
        console.log('📋 Sample workout plan:', {
          title: workoutPlans[0].title,
          category: workoutPlans[0].category,
          difficulty: workoutPlans[0].difficulty
        })
      }
    }

    // Check if nutrition plan was created
    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', user?.id)

    if (nutritionError) {
      console.error('❌ Error fetching nutrition plans:', nutritionError)
    } else {
      console.log('✅ Nutrition plans created:', nutritionPlans?.length || 0)
      if (nutritionPlans && nutritionPlans.length > 0) {
        console.log('📋 Sample nutrition plan:', {
          title: nutritionPlans[0].title,
          daily_calories: nutritionPlans[0].daily_calories,
          protein_g: nutritionPlans[0].protein_g
        })
      }
    }

    // Step 7: Clean up test user (optional)
    console.log('🧹 Step 6: Cleaning up test user...')
    
    // Note: In a real test, you might want to keep the data for inspection
    // For now, we'll just log the user ID for manual cleanup if needed
    console.log('📝 Test user ID for cleanup:', user?.id)
    console.log('📝 Test user email:', testEmail)

    console.log('✅ Test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Run the complete test
testEdgeFunctionComplete() 