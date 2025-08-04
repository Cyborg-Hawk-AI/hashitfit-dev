
# Test Assessment Data for NEW MUSCLE! OpenAI Assistant

## Assessment Data Format to Send to Assistant

Use this exact JSON format to test your OpenAI assistant manually:

```json
{
  "age": 28,
  "gender": "male",
  "height": 180,
  "weight": 75,
  "fitness_goal": "muscle_gain",
  "workout_frequency": 4,
  "equipment": "full_gym",
  "diet_type": "standard",
  "sports_played": ["weightlifting", "running"],
  "allergies": []
}
```

## Required Response Format (Must be returned as **pure JSON**)

```json
{
  "workout_schedule": [
    {
      "week": 1,
      "day": "Monday",
      "workout_title": "Upper Body Strength",
      "description": "Focus on building upper body muscle",
      "category": "strength",
      "difficulty": 3,
      "estimated_duration": "45 minutes",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weight": "70kg",
          "rest_seconds": 90,
          "notes": "Focus on form"
        }
      ]
    }
  ],
  "nutrition_plan": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fat_g": 85,
    "diet_type": "standard",
    "meals": [
      {
        "meal_type": "breakfast",
        "meal_title": "Protein Oatmeal",
        "description": "Oats with protein powder and berries",
        "calories": 450,
        "protein_g": 35,
        "carbs_g": 50,
        "fat_g": 12
      }
    ]
  },
  "recommendations": {
    "workout_tips": "Start with lighter weights and focus on form",
    "nutrition_tips": "Eat protein within 30 minutes post-workout",
    "weekly_goals": "Complete all scheduled workouts and track nutrition"
  }
}
```

---

### ⚠️ Critical Format Rules

**General**
* Always return the response as strict JSON (no markdown, no additional explanation or commentary)
* Never omit required fields
* Never return empty arrays

**Field Validations**
* `workout_schedule`: must contain at least one workout
  * `week`: integer (1–4)
  * `day`: full day name (e.g., "Monday", "Tuesday")
  * `workout_title`: string (this becomes the workout plan title in database)
  * `category`: one of `strength`, `cardio`, `hiit`, `recovery`, `sport_specific`, `custom`
  * `difficulty`: integer (1–5) — **must not be a string**
  * `estimated_duration`: string (e.g., "45 minutes")
  * `exercises`: non-empty array
    * Each `exercise` must include:
      * `name`: string
      * `sets`: integer
      * `reps`: string
      * `weight`: string (e.g., "bodyweight", "70kg")
      * `rest_seconds`: integer (default to 60 if not specified)
      * `notes`: string (optional but encouraged)

* `nutrition_plan`:
  * `daily_calories`, `protein_g`, `carbs_g`, `fat_g`: integer values
  * `diet_type`: one of `standard`, `vegetarian`, `vegan`, `keto`, `paleo`, `gluten_free`
  * `meals`: must include exactly four — `breakfast`, `lunch`, `dinner`, `snack`
    * Each meal must include:
      * `meal_type`: string (must match above)
      * `meal_title`: string
      * `description`: string
      * `calories`, `protein_g`, `carbs_g`, `fat_g`: integer

* `recommendations`:
  * `workout_tips`: string
  * `nutrition_tips`: string
  * `weekly_goals`: string

---

### 🚫 Common Mistakes to Avoid
* Do not return `difficulty` as a string (must be an integer)
* Do not use invalid `category`, `diet_type`, or `meal_type` values
* Do not use lowercase or abbreviated day names
* Do not return empty `workout_schedule` or `meals` arrays
* Do not omit any required top-level or nested fields

## Alternative Test Cases

### Case 1: Weight Loss Goal
```json
{
  "age": 32,
  "gender": "female",
  "height": 165,
  "weight": 68,
  "fitness_goal": "weight_loss",
  "workout_frequency": 3,
  "equipment": "minimal",
  "diet_type": "vegetarian",
  "sports_played": ["yoga", "cycling"],
  "allergies": ["dairy"]
}
```

### Case 2: Beginner with Limited Equipment
```json
{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "fitness_goal": "general_fitness",
  "workout_frequency": 3,
  "equipment": "none",
  "diet_type": "standard",
  "sports_played": [],
  "allergies": ["nuts", "gluten"]
}
```

### Case 3: Advanced Athlete
```json
{
  "age": 30,
  "gender": "female",
  "height": 170,
  "weight": 65,
  "fitness_goal": "sport_specific",
  "workout_frequency": 6,
  "equipment": "full_gym",
  "diet_type": "paleo",
  "sports_played": ["basketball", "tennis", "swimming"],
  "allergies": []
}
```

## Instructions for Manual Testing

1. Copy one of the JSON objects above
2. Send it directly to your NEW MUSCLE! OpenAI assistant
3. The assistant should respond with the complete workout and nutrition plan in the expected format
4. Verify the response includes:
   - `workout_schedule` array with 4-week program
   - `nutrition_plan` with daily targets and meals
   - `recommendations` with tips and goals

## Expected Response Structure

The assistant should return data matching this schema:

```json
{
  "workout_schedule": [
    {
      "week": 1,
      "day": "Monday",
      "workout_title": "Upper Body Strength",
      "description": "Focus on building upper body muscle",
      "category": "strength",
      "difficulty": 3,
      "estimated_duration": "45 minutes",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weight": "70kg",
          "rest_seconds": 90,
          "notes": "Focus on form"
        }
      ]
    }
  ],
  "nutrition_plan": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fat_g": 85,
    "diet_type": "standard",
    "meals": [
      {
        "meal_type": "breakfast",
        "meal_title": "Protein Oatmeal",
        "description": "Oats with protein powder and berries",
        "calories": 450,
        "protein_g": 35,
        "carbs_g": 50,
        "fat_g": 12
      }
    ]
  },
  "recommendations": {
    "workout_tips": "Start with lighter weights and focus on form",
    "nutrition_tips": "Eat protein within 30 minutes post-workout",
    "weekly_goals": "Complete all scheduled workouts and track nutrition"
  }
}
```

## Key Validation Points

- All `difficulty` values must be integers 1-5
- All `day` values must be full day names (Monday, Tuesday, etc.)
- All `meal_type` values must be: breakfast, lunch, dinner, snack
- All `category` values must be: strength, cardio, hiit, recovery, sport_specific, custom
- All `diet_type` values must be: standard, vegetarian, vegan, keto, paleo, gluten_free
- Response must be valid JSON with no markdown formatting
