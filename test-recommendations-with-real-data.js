import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exact assessment data from the logs
const realAssessmentData = {
  user_id: "a9811305-1d4d-4719-b691-2f0132c6420b",
  assessment: {
    name: "aaaa",
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
};

async function testRecommendationsWithRealData() {
  console.log('🧪 Testing recommendations-assistant with REAL assessment data...');
  console.log('Assessment data:', JSON.stringify(realAssessmentData, null, 2));
  
  try {
    console.log('📞 Invoking recommendations-assistant function...');
    const { data, error } = await supabase.functions.invoke('recommendations-assistant', {
      body: realAssessmentData
    });
    
    if (error) {
      console.error('❌ Function invocation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Function response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('🎉 Function executed successfully!');
      console.log('📊 Recommendations data:', data.data?.recommendations_data);
      console.log('💾 Database record ID:', data.data?.recommendations);
    } else {
      console.log('❌ Function failed:', data.error);
      console.log('📝 Error details:', data.details);
    }
    
  } catch (error) {
    console.error('💥 Error invoking function:', error);
    console.error('Error stack:', error.stack);
  }
}

testRecommendationsWithRealData();
