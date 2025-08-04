import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://haxiwqgajhanpapvicbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hheGl3cWdhamhhbnBhcHZpY2JtLnN1cGFiYXNlLmNvIiwicm9sZSI6ImFub24iLCJleHAiOjE5MzI5NzY4MDB9.6a4d8cca5a79a644ee7a65db208693713a853a307b12ba3c0d04abb3084fd513'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testEdgeFunctionFresh() {
  console.log('🧪 Testing Edge Function with fresh JWT token...')
  
  try {
    // Sign in with existing user to get fresh JWT
    console.log('🔐 Signing in to get fresh JWT token...')
    
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'ygbarakat247@gmail.com',
      password: 'testpassword123'
    })

    if (signInError || !session) {
      console.error('❌ Sign in error:', signInError)
      return
    }

    const jwt = session.access_token
    const userId = session.user.id
    console.log('✅ Got fresh JWT token for user:', userId)

    // Mock assessment data (simulating real user input)
    const mockAssessmentData = {
      name: "Test User Fresh",
      age: 29,
      gender: "male",
      height: 178,
      weight: 78,
      fitnessGoal: "muscle_gain",
      workoutFrequency: 4,
      diet: "standard",
      equipment: "minimal",
      sportsPlayed: ["basketball"],
      allergies: ["dairy"]
    }

    console.log('📋 Mock assessment data:', mockAssessmentData)

    // Call the Edge Function
    console.log('🚀 Calling Edge Function...')
    
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
        
        // Verify database population
        console.log('🔍 Verifying database population...')
        
        // Check profile update
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('has_completed_assessment, name, fitness_goal')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError)
        } else {
          console.log('✅ Profile updated:', {
            has_completed_assessment: profile.has_completed_assessment,
            name: profile.name,
            fitness_goal: profile.fitness_goal
          })
        }

        // Check assessment data
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessment_data')
          .select('age, gender, fitness_goal, workout_frequency')
          .eq('user_id', userId)
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

        // Check workout plans
        const { data: workoutPlans, error: workoutError } = await supabase
          .from('workout_plans')
          .select('title, category, difficulty')
          .eq('user_id', userId)

        if (workoutError) {
          console.error('❌ Error fetching workout plans:', workoutError)
        } else {
          console.log('✅ Workout plans created:', workoutPlans?.length || 0)
          if (workoutPlans && workoutPlans.length > 0) {
            console.log('📋 Sample workout plan:', workoutPlans[0])
          }
        }

        // Check nutrition plans
        const { data: nutritionPlans, error: nutritionError } = await supabase
          .from('nutrition_plans')
          .select('title, daily_calories, protein_g')
          .eq('user_id', userId)

        if (nutritionError) {
          console.error('❌ Error fetching nutrition plans:', nutritionError)
        } else {
          console.log('✅ Nutrition plans created:', nutritionPlans?.length || 0)
          if (nutritionPlans && nutritionPlans.length > 0) {
            console.log('📋 Sample nutrition plan:', nutritionPlans[0])
          }
        }
        
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
testEdgeFunctionFresh() 