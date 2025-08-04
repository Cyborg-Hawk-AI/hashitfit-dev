// Test script for the new separate Edge Functions system
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

// Test the new system
async function testNewSystem() {
  console.log('🧪 Testing new separate Edge Functions system...')
  
  try {
    // Test workout assistant
    console.log('\n📋 Testing workout-assistant...')
    const workoutResponse = await supabase.functions.invoke('workout-assistant', {
      body: {
        user_id: 'test-user-id',
        assessment: mockAssessmentData
      }
    })
    
    console.log('Workout assistant response:', workoutResponse)
    
    // Test recommendations assistant
    console.log('\n📋 Testing recommendations-assistant...')
    const recommendationsResponse = await supabase.functions.invoke('recommendations-assistant', {
      body: {
        user_id: 'test-user-id',
        assessment: mockAssessmentData
      }
    })
    
    console.log('Recommendations assistant response:', recommendationsResponse)
    
    console.log('\n✅ Test completed!')
    console.log('Note: nutrition-assistant deployment failed, but the system should work with the other two functions.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testNewSystem() 