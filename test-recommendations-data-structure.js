// Test script to verify recommendations data structure

// Sample response from the AI assistant (what we're actually getting)
const sampleRecommendationsData = {
  workout_tips: "Focus on compound movements like squats, push-ups, and rows to maximize the effectiveness of your minimal equipment. Aim for 8-12 reps per set and include 3-4 sets of each exercise. Incorporate bodyweight exercises if weights are not available, and prioritize your form to prevent injuries. Remember to warm up before starting your workout to prepare your muscles and cool down afterward to aid recovery.",
  nutrition_tips: "To support muscle gain, include high-quality protein sources in every meal, such as lean meats, eggs, dairy, beans, and nuts. Aim for a total protein intake of about 1.6-2.2 grams per kg of body weight daily. Don't forget to include plenty of fruits, vegetables, and whole grains for vitamins, minerals, and energy. Stay hydrated and consider having a protein-rich snack after your workouts for optimal recovery.",
  weekly_goals: "Complete at least 3 workouts this week, focusing on progressive overload. Ensure you are consuming adequate protein with each meal. Track your meals to stay aligned with your nutrition goals, and aim for 7-8 hours of sleep each night to enhance muscle recovery. Practice your basketball skills for at least 30 minutes twice this week to maintain your athleticism."
};

console.log('Testing recommendations data structure...');
console.log('Sample data:', JSON.stringify(sampleRecommendationsData, null, 2));

// Test the condition that was failing
const oldCondition = sampleRecommendationsData?.recommendations;
const newCondition = sampleRecommendationsData?.workout_tips || sampleRecommendationsData?.nutrition_tips || sampleRecommendationsData?.weekly_goals;

console.log('\nOld condition (recommendationsData?.recommendations):', oldCondition);
console.log('New condition (recommendationsData?.workout_tips || ...):', newCondition);

console.log('\n✅ The issue was that the function was looking for recommendationsData.recommendations.workout_tips');
console.log('   but the AI assistant returns recommendationsData.workout_tips directly.');
console.log('\n✅ The fix is to access the properties directly from recommendationsData instead of recommendationsData.recommendations');

// Test the database insert structure
const insertData = {
  user_id: "test-user-123",
  workout_tips: sampleRecommendationsData.workout_tips,
  nutrition_tips: sampleRecommendationsData.nutrition_tips,
  weekly_goals: sampleRecommendationsData.weekly_goals
};

console.log('\nDatabase insert data:', JSON.stringify(insertData, null, 2));
