import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test assessment data
const testAssessmentData = {
  user_id: "a9811305-1d4d-4719-b691-2f0132c6420b",
  assessment: {
    name: "Test User",
    age: 30,
    gender: "male",
    height: 175,
    weight: 75,
    fitnessGoal: "muscle_gain",
    workoutFrequency: 4,
    diet: "standard",
    equipment: "full_gym",
    sportsPlayed: [],
    allergies: []
  }
};

async function testNutritionAssistant() {
  console.log('🧪 Testing nutrition-assistant function...');
  console.log('Assessment data:', JSON.stringify(testAssessmentData, null, 2));
  
  try {
    console.log('📞 Invoking nutrition-assistant function...');
    const { data, error } = await supabase.functions.invoke('nutrition-assistant', {
      body: testAssessmentData
    });
    
    if (error) {
      console.error('❌ Function invocation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Function response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('🎉 Function executed successfully!');
      console.log('📊 Nutrition plan ID:', data.data?.nutrition_plan);
      console.log('🍽️ Nutrition data structure:', JSON.stringify(data.data?.nutrition_data, null, 2));
      
      // Check if meals were generated
      if (data.data?.nutrition_data?.meals) {
        console.log('✅ Meals were generated!');
        console.log('📋 Number of meals:', data.data.nutrition_data.meals.length);
        console.log('🍳 First meal:', JSON.stringify(data.data.nutrition_data.meals[0], null, 2));
      } else {
        console.log('❌ No meals were generated in the response');
      }
    } else {
      console.log('❌ Function failed:', data.error);
      console.log('📝 Error details:', data.details);
    }
    
  } catch (error) {
    console.error('💥 Error invoking function:', error);
    console.error('Error stack:', error.stack);
  }
}

testNutritionAssistant();
