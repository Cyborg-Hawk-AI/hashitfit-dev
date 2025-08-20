# Edge Functions Documentation
## Hashim - AI-Powered Personal Fitness Trainer

### Overview

This document provides comprehensive documentation for all Supabase Edge Functions used in the Hashim fitness application. Edge Functions provide serverless AI processing, external API integration, and secure backend operations.

### Edge Function Architecture

#### Security Model
- **JWT Authentication**: All edge functions require valid user authentication
- **CORS Support**: Proper CORS headers for web application integration
- **Error Handling**: Comprehensive error handling with fallback responses
- **Logging**: Detailed logging for debugging and monitoring

#### Environment Variables
All edge functions require the following Supabase-managed environment variables:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key for authentication
- `OPENAI_API_KEY`: OpenAI API key for AI processing
- `OPENAI_ASSISTANT_ID`: OpenAI Assistant ID for chat functionality

### Edge Function Implementations

## 1. AI Chat Assistant (`ai-chat`)

### Purpose
Provides conversational AI assistance for fitness questions using OpenAI's Assistant API with persistent conversation threads.

### Technical Specifications
- **Model**: OpenAI Assistant API with GPT-4o
- **Authentication**: Required (JWT verification enabled)
- **CORS**: Enabled for web application access
- **Response Format**: JSON with assistant message content

### API Specification

#### Request
```typescript
POST /functions/v1/ai-chat
Headers:
  Authorization: Bearer <supabase_jwt_token>
  Content-Type: application/json

Body:
{
  "message": "What exercises should I do for upper body strength?"
}
```

#### Response
```typescript
{
  "message": "Based on your fitness goals, I recommend..."
}
```

#### Error Response
```typescript
{
  "error": "Error message description"
}
```

### Implementation Details

#### Thread Management
- **User Thread Persistence**: Each user has a persistent OpenAI thread stored in `user_assistant_threads` table
- **Thread Creation**: New threads created automatically for first-time users
- **Thread Retrieval**: Existing threads retrieved and reused for conversation continuity

#### Message Processing Flow
1. **Authentication**: Verify user JWT token and extract user ID
2. **Thread Management**: Retrieve or create OpenAI thread for user
3. **Message Addition**: Add user message to OpenAI thread
4. **Assistant Run**: Execute assistant on thread with configured parameters
5. **Response Polling**: Poll run status until completion (max 60 seconds)
6. **Message Retrieval**: Extract assistant response from thread
7. **Database Logging**: Store both user and assistant messages in database
8. **Response Return**: Send assistant message back to client

#### Database Integration
- **User Messages**: Logged to `chat_messages` table with role='user'
- **Assistant Messages**: Logged to `chat_messages` table with role='assistant'
- **Metadata**: Thread ID and run ID stored for debugging and analytics

### Error Handling
- **Missing Authentication**: Returns 400 with authentication error
- **OpenAI API Errors**: Proper error propagation with status codes
- **Timeout Handling**: 60-second maximum wait for assistant responses
- **Database Errors**: Transaction rollback and error reporting

### Usage Examples

```typescript
// Client-side usage
const response = await supabase.functions.invoke('ai-chat', {
  body: { message: 'How many sets should I do for bicep curls?' }
});

const assistantMessage = response.data.message;
```

---

## 2. Workout Plan Generator (`generate-workout`)

### Purpose
Creates personalized workout plans based on user preferences and profile data using OpenAI GPT-4o with structured JSON responses.

### Technical Specifications
- **Model**: OpenAI GPT-4o with JSON response format
- **Authentication**: Required (JWT verification enabled)
- **Database Integration**: Automatic workout plan and exercise storage
- **Profile Integration**: Uses user profile data for personalization

### API Specification

#### Request
```typescript
POST /functions/v1/generate-workout
Headers:
  Authorization: Bearer <supabase_jwt_token>
  Content-Type: application/json

Body:
{
  "goal": "muscle_gain",
  "equipment": "full_gym",
  "duration": "45-60",
  "focus": "upper_body",
  "experience_level": "intermediate"
}
```

#### Response
```typescript
{
  "workout": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Upper Body Strength Training",
    "description": "Comprehensive upper body workout...",
    "category": "strength",
    "difficulty": 3,
    "estimated_duration": "45-60 minutes",
    "ai_generated": true,
    "exercises": [
      {
        "id": "uuid",
        "name": "Bench Press",
        "sets": 3,
        "reps": "8-10",
        "weight": "60kg",
        "rest_time": "90 seconds",
        "notes": "Focus on controlled movement",
        "order_index": 0
      }
    ]
  }
}
```

### Implementation Details

#### Personalization Engine
- **Profile Integration**: Automatically fetches user profile for age, gender, fitness goals
- **Equipment Consideration**: Adapts exercises based on available equipment
- **Experience Level**: Adjusts difficulty and complexity based on user experience
- **Goal Alignment**: Tailors workout structure to user's fitness objectives

#### AI Prompt Engineering
The function uses a comprehensive prompt that includes:
- User demographic information (age, gender)
- Fitness goals and experience level
- Available equipment and time constraints
- Structured JSON output requirements
- Safety and progression guidelines

#### Database Operations
1. **Workout Plan Creation**: Inserts new workout plan into `workout_plans` table
2. **Exercise Generation**: Inserts all exercises into `workout_exercises` table
3. **Relationship Management**: Maintains foreign key relationships
4. **Transaction Safety**: Ensures data consistency with proper error handling

### Supported Parameters

#### Goal Types
- `muscle_gain`: Hypertrophy-focused workouts
- `weight_loss`: High-intensity, calorie-burning workouts
- `endurance`: Cardiovascular and muscular endurance
- `sport_specific`: Sport-specific training adaptations

#### Equipment Types
- `full_gym`: Complete gym equipment access
- `home_gym`: Home gym setup with basic equipment
- `minimal`: Resistance bands, dumbbells, bodyweight
- `bodyweight_only`: No equipment required

#### Focus Areas
- `full_body`: Comprehensive training
- `upper_body`: Chest, shoulders, arms, back
- `lower_body`: Legs, glutes, calves
- `core`: Abdominal and core stability
- `cardio`: Cardiovascular training

### Error Handling
- **Profile Access**: Handles missing or incomplete user profiles
- **OpenAI Integration**: Robust error handling for API failures
- **JSON Parsing**: Validates and handles malformed AI responses
- **Database Constraints**: Proper error handling for database operations

---

## 3. Fitness Assessment Analyzer (`analyze-fitness-assessment`)

### Purpose
Processes comprehensive fitness assessments to generate complete fitness plans including workout schedules, nutrition plans, and personalized recommendations.

### Technical Specifications
- **Model**: OpenAI GPT-4o-mini with JSON structured output
- **Authentication**: Required (JWT verification enabled)
- **Fallback System**: Mock data for development and API failures
- **Comprehensive Output**: Complete fitness ecosystem generation

### API Specification

#### Request
```typescript
POST /functions/v1/analyze-fitness-assessment
Headers:
  Authorization: Bearer <supabase_jwt_token>
  Content-Type: application/json

Body:
{
  "user_id": "uuid",
  "assessment": {
    "age": 28,
    "gender": "male",
    "height": 175,
    "weight": 75,
    "fitnessGoal": "muscle_gain",
    "workoutFrequency": 4,
    "diet": "standard",
    "equipment": "full_gym",
    "sportsPlayed": ["basketball"],
    "allergies": ["nuts"]
  }
}
```

#### Response
```typescript
{
  "workout_plans": [
    {
      "day": "Monday",
      "title": "Upper Body Strength",
      "description": "Focus on building upper body strength",
      "category": "strength",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 3,
          "reps": "8-10",
          "weight": "60kg",
          "rest_time": 90
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
        "description": "Oats with protein powder and fruit",
        "calories": 450,
        "protein_g": 35,
        "carbs_g": 50,
        "fat_g": 10
      }
    ]
  },
  "recommendations": [
    "Stay hydrated throughout the day",
    "Get 7-9 hours of sleep for optimal recovery"
  ]
}
```

### Implementation Details

#### Comprehensive Analysis Engine
The function performs multi-dimensional analysis:
- **Anthropometric Analysis**: Height, weight, age considerations
- **Goal-Specific Programming**: Customized approach based on fitness goals
- **Dietary Adaptation**: Nutrition plans adapted to dietary preferences and restrictions
- **Equipment Optimization**: Exercise selection based on available equipment
- **Recovery Planning**: Rest day scheduling and recovery recommendations

#### AI Prompt Engineering
The assessment analyzer uses sophisticated prompting:
- **Multi-Domain Expertise**: Combines exercise science, nutrition, and behavioral coaching
- **Structured Output**: Enforces consistent JSON structure for database integration
- **Safety Considerations**: Includes contraindications and safety guidelines
- **Progressive Planning**: Creates adaptive programs that can evolve with user progress

#### Fallback System
- **Mock Data Generation**: Comprehensive mock responses for development
- **Error Recovery**: Graceful degradation when AI services are unavailable
- **Development Support**: Consistent testing data for frontend development

### Output Specifications

#### Workout Plans Structure
- **Day-Based Programming**: Specific workout assignments for each training day
- **Exercise Details**: Complete exercise specifications with sets, reps, weights
- **Category Classification**: Proper categorization for filtering and organization
- **Progressive Loading**: Built-in progression principles

#### Nutrition Plan Structure
- **Macro Distribution**: Calculated protein, carbohydrate, and fat targets
- **Meal Planning**: Complete meal suggestions with nutritional breakdowns
- **Dietary Compliance**: Adherence to specified dietary restrictions
- **Caloric Targeting**: Goal-appropriate calorie recommendations

#### Recommendation System
- **Behavioral Coaching**: Lifestyle and habit recommendations
- **Recovery Guidance**: Sleep, hydration, and stress management advice
- **Progress Monitoring**: Tracking and assessment recommendations
- **Safety Protocols**: Injury prevention and exercise safety guidelines

### Validation & Quality Control
- **Input Validation**: Comprehensive validation of assessment data
- **Output Validation**: JSON structure verification and content validation
- **Nutritional Accuracy**: Verified macro and calorie calculations
- **Exercise Safety**: Evidence-based exercise selection and prescription

---

## 4. Planned Edge Functions

### Meal Photo Analyzer (`analyze-meal-photo`)

#### Purpose
Analyze food photos to extract nutritional information using computer vision and AI.

#### Technical Stack
- **Computer Vision**: AWS Rekognition for food identification
- **AI Analysis**: OpenAI GPT-4 Vision for nutrition calculation
- **Image Processing**: Automated image optimization and analysis

#### Features
- Food item identification and quantity estimation
- Nutritional content calculation
- Meal categorization and suggestions
- Integration with nutrition logging system

### Voice Workout Parser (`voice-workout-parser`)

#### Purpose
Convert voice input to structured workout logs for hands-free operation.

#### Technical Stack
- **Speech Recognition**: OpenAI Whisper for audio transcription
- **Natural Language Processing**: GPT-4 for exercise data extraction
- **Audio Processing**: Real-time audio capture and processing

#### Features
- Natural language exercise logging
- Set, rep, and weight extraction
- Exercise name normalization
- Progress tracking integration

---

## Development & Deployment

### Local Development
1. **Supabase CLI Setup**: Install and configure Supabase CLI
2. **Function Development**: Create functions in `supabase/functions/` directory
3. **Environment Variables**: Configure local environment with required secrets
4. **Testing**: Use local Supabase instance for function testing

### Deployment Process
1. **Automatic Deployment**: Functions deploy automatically with code changes
2. **Secret Management**: Configure secrets through Supabase dashboard
3. **Monitoring**: Use Supabase dashboard for function logs and metrics
4. **Version Control**: All functions version controlled in repository

### Monitoring & Debugging
- **Function Logs**: Real-time logs available in Supabase dashboard
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and success rate monitoring
- **Usage Analytics**: Function invocation and usage statistics

### Best Practices
1. **Error Handling**: Always include comprehensive error handling
2. **CORS Configuration**: Proper CORS headers for web application integration
3. **Authentication**: Verify JWT tokens for all protected functions
4. **Logging**: Include detailed logging for debugging and monitoring
5. **Timeout Management**: Implement appropriate timeout handling for external APIs
6. **Fallback Responses**: Provide graceful degradation for service failures

### Security Considerations
- **Input Validation**: Validate all input parameters
- **Rate Limiting**: Implement rate limiting for resource-intensive operations
- **Secret Management**: Secure handling of API keys and sensitive data
- **User Isolation**: Ensure user data isolation and privacy
- **Audit Logging**: Log all significant operations for security auditing