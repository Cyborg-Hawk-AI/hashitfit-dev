# HashimFit Multi-Assistant Setup Guide

## Overview
This guide explains how to set up the HashimFit multi-assistant system in Supabase, replacing the single assistant with three specialized assistants for improved performance and reliability.

## 🎯 Architecture
- **Workout Planner Assistant**: Generates workout schedules and exercises
- **Nutrition Planner Assistant**: Creates nutrition plans and meal suggestions
- **Recommendations Engine**: Provides personalized tips and weekly goals

## 📋 Prerequisites
1. Access to Supabase project dashboard
2. OpenAI API key (same key used for all assistants)
3. Three OpenAI Assistant IDs (one for each specialized assistant)

## 🔧 Step 1: Create OpenAI Assistants

### Workout Planner Assistant
1. Go to [OpenAI Assistants](https://platform.openai.com/assistants)
2. Create new assistant with name: `HashimFit Workout Planner`
3. Use the system instructions from `docs/assistants/workout-planner.md`
4. Attach the Comprehensive Fitness Guide PDF
5. Set response format to **JSON** (recommended) or **Text**
6. Copy the Assistant ID

### Nutrition Planner Assistant
1. Create new assistant with name: `HashimFit Nutrition Planner`
2. Use the system instructions from `docs/assistants/nutrition-planner.md`
3. Attach the Comprehensive Fitness Guide PDF
4. Set response format to **JSON** (recommended) or **Text**
5. Copy the Assistant ID

### Recommendations Engine Assistant
1. Create new assistant with name: `HashimFit Recommendations Engine`
2. Use the system instructions from `docs/assistants/recommendations-engine.md`
3. Attach the Comprehensive Fitness Guide PDF
4. Set response format to **JSON** (recommended) or **Text**
5. Copy the Assistant ID

## 🔐 Step 2: Add Assistant IDs to Supabase Secrets

### Using Supabase CLI
```bash
# Add Workout Planner Assistant ID
supabase secrets set OPENAI_ASSISTANT_WORKOUT_ID=your_workout_assistant_id_here

# Add Nutrition Planner Assistant ID
supabase secrets set OPENAI_ASSISTANT_NUTRITION_ID=your_nutrition_assistant_id_here

# Add Recommendations Engine Assistant ID
supabase secrets set OPENAI_ASSISTANT_RECOMMENDATIONS_ID=your_recommendations_assistant_id_here
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click on **Secrets**
4. Add the following secrets:
   - `OPENAI_ASSISTANT_WORKOUT_ID`: Your workout planner assistant ID
   - `OPENAI_ASSISTANT_NUTRITION_ID`: Your nutrition planner assistant ID
   - `OPENAI_ASSISTANT_RECOMMENDATIONS_ID`: Your recommendations engine assistant ID

## 🔄 Step 3: Update Edge Function

### Current Secrets (to be replaced):
- `OPENAI_ASSISTANT_ASSESSMENT_ID` (single assistant)

### New Secrets (to be added):
- `OPENAI_ASSISTANT_WORKOUT_ID`
- `OPENAI_ASSISTANT_NUTRITION_ID`
- `OPENAI_ASSISTANT_RECOMMENDATIONS_ID`

### API Key (unchanged):
- `OPENAI_API_KEY_ASSESSMENTS` (same key for all assistants)

## 📊 Step 4: Verify Setup

### Check Current Secrets
```bash
supabase secrets list
```

You should see:
```
OPENAI_API_KEY_ASSESSMENTS          │ [existing_key]
OPENAI_ASSISTANT_WORKOUT_ID         │ [new_workout_id]
OPENAI_ASSISTANT_NUTRITION_ID       │ [new_nutrition_id]
OPENAI_ASSISTANT_RECOMMENDATIONS_ID │ [new_recommendations_id]
```

### Test Assistant Responses
Each assistant should return properly formatted JSON:

#### Workout Planner Response:
```json
{
  "workout_schedule": [
    {
      "week": 1,
      "day": "Monday",
      "workout_title": "Upper Body Strength",
      "description": "Focus on chest, shoulders, and triceps",
      "category": "strength",
      "difficulty": 3,
      "estimated_duration": "45 minutes",
      "exercises": [...]
    }
  ]
}
```

#### Nutrition Planner Response:
```json
{
  "nutrition_plan": {
    "daily_calories": 2000,
    "protein_g": 150,
    "carbs_g": 200,
    "fat_g": 70,
    "diet_type": "standard",
    "meals": [...]
  }
}
```

#### Recommendations Engine Response:
```json
{
  "recommendations": {
    "workout_tips": "...",
    "nutrition_tips": "...",
    "weekly_goals": "..."
  }
}
```

## 🚀 Step 5: Performance Benefits

### Expected Response Times:
- **Current Single Assistant**: 30-45 seconds
- **New Multi-Assistant**: 10-15 seconds

### Reliability Improvements:
- **Parallel Processing**: All assistants run simultaneously
- **Fault Tolerance**: If one assistant fails, others succeed
- **Specialized Quality**: Each assistant optimized for its domain

## 🔧 Step 6: Edge Function Updates

The Edge Function will need to be updated to:
1. Call all three assistants in parallel
2. Aggregate responses into the final format
3. Handle partial failures gracefully
4. Maintain backward compatibility

## 📝 Notes

### Response Format Options:
- **JSON**: Recommended for better parsing reliability
- **Text**: Alternative if JSON parsing issues occur

### Assistant Configuration:
- All assistants use the same API key
- Each assistant has specialized system instructions
- All assistants have the Comprehensive Fitness Guide PDF attached
- Response format should be consistent across all assistants

### Fallback Strategy:
If any assistant fails:
1. Use cached/default data for that component
2. Continue with successful assistant responses
3. Log the failure for debugging
4. Still mark assessment as completed

## 🎯 Final Checklist

- [ ] Create three OpenAI assistants with specialized instructions
- [ ] Attach Comprehensive Fitness Guide PDF to each assistant
- [ ] Set consistent response format (JSON recommended)
- [ ] Add assistant IDs to Supabase secrets
- [ ] Update Edge Function to use multi-assistant architecture
- [ ] Test parallel processing and error handling
- [ ] Verify response aggregation works correctly
- [ ] Monitor performance improvements

## 📞 Support

If you encounter issues:
1. Check assistant IDs are correctly added to secrets
2. Verify system instructions are properly formatted
3. Test each assistant individually before parallel processing
4. Monitor Edge Function logs for detailed error information 