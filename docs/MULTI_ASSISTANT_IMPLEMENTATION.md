# Multi-Assistant Edge Function Implementation

## Overview

The `generate-workout-plan` Edge Function has been updated to support a multi-assistant architecture that calls three specialized OpenAI assistants in parallel, significantly improving performance and reliability.

## Architecture Changes

### Before (Single Assistant)
- One OpenAI Assistant handled all tasks
- Sequential processing
- Single point of failure
- Longer response times (45+ seconds)

### After (Multi-Assistant)
- Three specialized assistants run in parallel
- Parallel processing reduces total time
- Graceful degradation if one assistant fails
- Better error handling and recovery

## Assistant Specialization

### 1. HashimFit Workout Planner
- **Purpose**: Generate 4-week workout schedules with exercises
- **Output**: `workout_schedule` array with detailed exercise plans
- **Response Format**: JSON object with workout structure

### 2. HashimFit Nutrition Planner
- **Purpose**: Create personalized nutrition plans with meals
- **Output**: `nutrition_plan` with daily macros and meal breakdowns
- **Response Format**: JSON object with nutrition structure

### 3. HashimFit Recommendations Engine
- **Purpose**: Provide personalized tips and weekly goals
- **Output**: `recommendations` with workout and nutrition advice
- **Response Format**: JSON object with recommendations structure

## Implementation Details

### Parallel Processing
```typescript
const assistantCalls = [
  callAssistant(workoutAssistantId, openaiApiKey, rawAssessmentData, 'workout'),
  callAssistant(nutritionAssistantId, openaiApiKey, rawAssessmentData, 'nutrition'),
  callAssistant(recommendationsAssistantId, openaiApiKey, rawAssessmentData, 'recommendations')
]

await Promise.allSettled(assistantCalls)
```

### Graceful Error Handling
- Each assistant runs independently
- If one fails, others continue
- Partial success is still considered successful
- User can access dashboard even with partial data

### Backward Compatibility
- Falls back to single assistant if multi-assistant IDs not configured
- Maintains same database structure
- Same response format for frontend

## Configuration

### Required Environment Variables

#### Multi-Assistant Setup (Recommended)
```bash
OPENAI_API_KEY_ASSESSMENTS=your_openai_api_key
OPENAI_ASSISTANT_WORKOUT_ID=asst_workout_id
OPENAI_ASSISTANT_NUTRITION_ID=asst_nutrition_id
OPENAI_ASSISTANT_RECOMMENDATIONS_ID=asst_recommendations_id
```

#### Single Assistant Setup (Fallback)
```bash
OPENAI_API_KEY_ASSESSMENTS=your_openai_api_key
OPENAI_ASSISTANT_ASSESSMENT_ID=asst_single_id
```

### Assistant Configuration
1. Create three specialized assistants in OpenAI
2. Set response format to `json_object`
3. Attach the "Comprehensive Fitness Guide PDF"
4. Use system instructions from `docs/assistants/` files

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "HashimFit fitness plan generated and stored successfully",
  "warning": "Some components may be incomplete. 2/3 assistants completed successfully.",
  "data": {
    "workout_plans": 4,
    "nutrition_plan": "uuid",
    "recommendations": "generated"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Performance Improvements

### Expected Performance Gains
- **Response Time**: 15-25 seconds (vs 45+ seconds)
- **Reliability**: 99%+ success rate with partial fallbacks
- **Scalability**: Better handling of concurrent requests

### Monitoring
- Detailed logging for each assistant
- Success/failure tracking per component
- Performance metrics in logs

## Database Integration

### Workout Plans
- Creates `workout_plans` records
- Generates `workout_exercises` for each plan
- Schedules workouts in `workout_schedule`

### Nutrition Plans
- Creates `nutrition_plans` records
- Generates `meal_plans` for daily meals
- Stores macro breakdowns

### Assessment Data
- Stores raw assessment data
- Updates user profile with completion status
- Maintains backward compatibility

## Error Handling

### Assistant Failures
- Individual assistant failures don't stop others
- Partial data is still stored
- User gets access to dashboard regardless

### Network Issues
- Timeout handling (30 seconds per assistant)
- Retry logic for transient failures
- Graceful degradation

### JSON Parsing
- Enhanced JSON cleaning
- Multiple parsing attempts
- Regex fallback for malformed responses

## Testing

### Local Testing
```bash
# Start Supabase Functions
supabase functions serve --debug

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-workout-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test","age":30,"gender":"male",...}'
```

### Production Testing
1. Deploy Edge Function
2. Create test user account
3. Complete assessment flow
4. Verify data population
5. Check performance metrics

## Migration Guide

### From Single Assistant
1. Create three new OpenAI assistants
2. Add assistant IDs to Supabase secrets
3. Deploy updated Edge Function
4. Test with existing users

### Rollback Plan
- Keep single assistant ID as fallback
- Edge Function automatically detects configuration
- No downtime during migration

## Monitoring and Debugging

### Log Analysis
```bash
# View Edge Function logs
supabase functions logs generate-workout-plan

# Key log messages to monitor:
# - "Calling X assistant"
# - "X assistant completed successfully"
# - "X assistant failed"
# - "All assistants completed"
```

### Common Issues
1. **Missing Assistant IDs**: Check Supabase secrets
2. **Timeout Errors**: Increase timeout or optimize prompts
3. **JSON Parsing Errors**: Check assistant response format
4. **Database Errors**: Verify RLS policies

## Future Enhancements

### Planned Improvements
- Caching for repeated assessments
- A/B testing different assistant configurations
- Real-time progress updates
- Advanced error recovery

### Scalability Considerations
- Assistant response time monitoring
- Load balancing across assistants
- Rate limiting and quotas
- Cost optimization

## Security Considerations

### API Key Management
- Use separate API keys for different environments
- Rotate keys regularly
- Monitor usage and costs

### Data Privacy
- Assessment data is user-specific
- RLS policies enforce access control
- No sensitive data in logs

## Cost Optimization

### OpenAI Usage
- Parallel processing reduces total tokens
- Specialized assistants are more efficient
- Monitor usage per assistant type

### Recommendations
- Set usage limits per assistant
- Monitor response quality vs cost
- Optimize prompts for efficiency

---

## Quick Start Checklist

- [ ] Create three OpenAI assistants with specialized system instructions
- [ ] Set response format to `json_object` for all assistants
- [ ] Attach "Comprehensive Fitness Guide PDF" to each assistant
- [ ] Add assistant IDs to Supabase secrets
- [ ] Deploy updated Edge Function
- [ ] Test with assessment flow
- [ ] Monitor performance and logs
- [ ] Verify data population in database 