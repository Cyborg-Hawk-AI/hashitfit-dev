
# OpenAI Fitness Assessment Analysis Response Format

This document outlines the expected format for the OpenAI response when analyzing a fitness assessment. The AI Edge Function should return data in this structure, which will then be processed by our application to create personalized workout and nutrition plans.

```json
{
  "workout_plans": [
    {
      "day": "Monday",
      "title": "Upper Body Strength",
      "description": "Focus on chest, shoulders, and triceps",
      "category": "strength",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weight": "70kg",
          "rest_time": 90,
          "notes": "Focus on form"
        },
        {
          "name": "Shoulder Press",
          "sets": 3,
          "reps": "10-12",
          "weight": "45kg",
          "rest_time": 60,
          "notes": "Keep core tight"
        },
        {
          "name": "Tricep Pushdowns",
          "sets": 3,
          "reps": "12-15",
          "weight": "30kg",
          "rest_time": 45,
          "notes": "Squeeze at bottom"
        }
      ]
    },
    {
      "day": "Wednesday",
      "title": "Lower Body Power",
      "description": "Focus on quadriceps, hamstrings, and glutes",
      "category": "strength",
      "exercises": [
        {
          "name": "Squats",
          "sets": 4,
          "reps": "6-8",
          "weight": "100kg",
          "rest_time": 120,
          "notes": "Go below parallel"
        },
        {
          "name": "Romanian Deadlifts",
          "sets": 3,
          "reps": "8-10",
          "weight": "80kg",
          "rest_time": 90,
          "notes": "Keep back straight"
        },
        {
          "name": "Leg Press",
          "sets": 3,
          "reps": "10-12",
          "weight": "150kg",
          "rest_time": 60,
          "notes": "Full range of motion"
        }
      ]
    },
    {
      "day": "Friday",
      "title": "Full Body Circuit",
      "description": "High-intensity full body workout",
      "category": "hiit",
      "exercises": [
        {
          "name": "Burpees",
          "sets": 3,
          "reps": "15",
          "weight": "bodyweight",
          "rest_time": 30,
          "notes": "Maximum effort"
        },
        {
          "name": "Kettlebell Swings",
          "sets": 3,
          "reps": "20",
          "weight": "16kg",
          "rest_time": 30,
          "notes": "Hip drive"
        },
        {
          "name": "Mountain Climbers",
          "sets": 3,
          "reps": "30 seconds",
          "weight": "bodyweight",
          "rest_time": 30,
          "notes": "Keep core engaged"
        }
      ]
    }
  ],
  "nutrition_plan": {
    "daily_calories": 2400,
    "protein_g": 180,
    "carbs_g": 220,
    "fat_g": 80,
    "diet_type": "standard",
    "meals": [
      {
        "meal_type": "breakfast",
        "meal_title": "Protein Oatmeal",
        "description": "Oats cooked with milk, topped with whey protein and berries",
        "calories": 450,
        "protein_g": 35,
        "carbs_g": 50,
        "fat_g": 10
      },
      {
        "meal_type": "lunch",
        "meal_title": "Chicken & Quinoa Bowl",
        "description": "Grilled chicken breast with quinoa, vegetables, and olive oil dressing",
        "calories": 650,
        "protein_g": 45,
        "carbs_g": 60,
        "fat_g": 25
      },
      {
        "meal_type": "dinner",
        "meal_title": "Salmon with Sweet Potato",
        "description": "Baked salmon fillet with roasted sweet potato and steamed broccoli",
        "calories": 750,
        "protein_g": 40,
        "carbs_g": 65,
        "fat_g": 30
      },
      {
        "meal_type": "snack",
        "meal_title": "Greek Yogurt with Nuts",
        "description": "Plain Greek yogurt with mixed nuts and honey",
        "calories": 300,
        "protein_g": 20,
        "carbs_g": 15,
        "fat_g": 15
      }
    ]
  },
  "recommendations": [
    "Stay hydrated throughout the day",
    "Get 7-9 hours of sleep for optimal recovery",
    "Consider adding a 10-minute stretching routine before bed",
    "Track your progress weekly by taking measurements and photos",
    "Adjust protein intake based on workout intensity"
  ]
}
```

## Notes on Data Structure

### Workout Plans
- Each workout plan represents a day of the week
- The `day` field must be one of: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday (or abbreviated as Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- Categories should be one of: strength, cardio, hiit, recovery, sport_specific, custom
- Exercises should include appropriate weight values (use "bodyweight" for bodyweight exercises)

### Nutrition Plan
- Daily calories and macros are in grams
- Diet type should be one of: standard, vegetarian, vegan, keto, paleo, gluten_free
- Each meal should have a meal_type: breakfast, lunch, dinner, or snack

### Recommendations
- An array of strings with personalized advice for the user

## Integration with the Application
The application will process this response to:
1. Create workout plans in the database
2. Schedule these workouts for the appropriate days of the week
3. Create a nutrition plan with daily meals
4. Store user recommendations for reference

This data will be displayed in the Dashboard and Workouts screens, and users can track their progress against these AI-generated plans.
