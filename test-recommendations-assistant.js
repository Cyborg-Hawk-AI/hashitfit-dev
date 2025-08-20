import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample assessment data
const testAssessmentData = {
  user_id: "test-user-123",
  assessment: {
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
    allergies: []
  }
};

async function testRecommendationsAssistant() {
  console.log('Testing recommendations-assistant function...');
  console.log('Assessment data:', JSON.stringify(testAssessmentData, null, 2));
  
  try {
    const { data, error } = await supabase.functions.invoke('recommendations-assistant', {
      body: testAssessmentData
    });
    
    if (error) {
      console.error('Function invocation error:', error);
      return;
    }
    
    console.log('Function response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Function executed successfully!');
      console.log('Recommendations:', data.data?.recommendations_data);
    } else {
      console.log('❌ Function failed:', data.error);
    }
    
  } catch (error) {
    console.error('Error invoking function:', error);
  }
}

testRecommendationsAssistant();
