# API Integration Documentation
## Hashim - AI-Powered Personal Fitness Trainer

### Overview

This document provides comprehensive documentation for all external API integrations and internal service communications within the Hashim fitness application. The application leverages multiple AI and cloud services to deliver personalized fitness coaching capabilities.

---

## OpenAI API Integration

### OpenAI Services Overview

The application integrates with multiple OpenAI services for different AI-powered features:

#### 1. OpenAI Assistant API
- **Purpose**: Conversational AI chat assistant for fitness guidance
- **Model**: Custom GPT-4o assistant with fitness domain expertise
- **Features**: Thread management, context awareness, domain-specific responses

#### 2. OpenAI Chat Completions API
- **Purpose**: Workout plan generation and fitness assessment analysis
- **Models**: GPT-4o, GPT-4o-mini for different use cases
- **Features**: Structured JSON responses, function calling, prompt engineering

#### 3. OpenAI Whisper API (Planned)
- **Purpose**: Voice-to-text transcription for workout logging
- **Model**: Whisper-1 for audio transcription
- **Features**: Real-time audio processing, exercise command parsing

#### 4. OpenAI Vision API (Planned)
- **Purpose**: Meal photo analysis for nutrition tracking
- **Model**: GPT-4 Vision for image analysis
- **Features**: Food identification, nutrition estimation, meal categorization

### API Configuration & Authentication

#### Environment Variables
```typescript
// Required OpenAI configuration
OPENAI_API_KEY: string           // Primary API key for all OpenAI services
OPENAI_ASSISTANT_ID: string      // Specific assistant ID for chat functionality
OPENAI_API_KEY_ASSESSMENTS: string // Optional dedicated key for assessments
OPENAI_ASSISTANT_ASSESSMENT_ID: string // Dedicated assistant for assessments
```

#### Authentication Pattern
```typescript
// Standard authentication header
headers: {
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v1' // For Assistant API calls
}
```

### Service Implementations

#### Chat Assistant Integration

**Endpoint**: `https://api.openai.com/v1/threads`

**Implementation Pattern**:
```typescript
// Thread creation
const threadResponse = await fetch('https://api.openai.com/v1/threads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v1'
  },
  body: JSON.stringify({})
});

// Message addition
const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    role: 'user',
    content: message
  })
});

// Assistant run
const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    assistant_id: assistantId,
  })
});
```

**Features**:
- **Thread Persistence**: User-specific conversation threads stored in database
- **Context Awareness**: Maintains conversation context across sessions
- **Error Handling**: Comprehensive error handling with fallback responses
- **Rate Limiting**: Built-in rate limiting and timeout management

#### Workout Plan Generation

**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Implementation Pattern**:
```typescript
const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a professional fitness coach...' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: \"json_object\" }
  }),
});
```

**Prompt Engineering**:
```typescript
const prompt = `Generate a personalized workout plan with the following parameters:
    
User Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Fitness Goal: ${goal || profile.fitness_goal}
- Available Equipment: ${equipment || profile.equipment}
- Experience Level: ${experience_level || 'intermediate'}

Workout Parameters:
- Duration: ${duration || '45-60'} minutes
- Focus Area: ${focus || 'full body'}

Generate a structured workout with exercises, sets, reps, and rest periods...`;
```

#### Assessment Analysis

**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Features**:
- **Comprehensive Analysis**: Multi-dimensional fitness assessment processing
- **Structured Output**: JSON-formatted responses for database integration
- **Personalization**: User-specific recommendations based on assessment data
- **Fallback System**: Mock data generation for development and error scenarios

### Error Handling & Fallbacks

#### Error Response Patterns
```typescript
// Standard error handling
try {
  const response = await fetch(openaiEndpoint, requestConfig);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('OpenAI API error:', error);
  // Implement fallback logic
  return generateFallbackResponse();
}
```

#### Fallback Strategies
- **Mock Data**: Comprehensive mock responses for development
- **Graceful Degradation**: Reduced functionality when AI services unavailable
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breaker**: Prevent cascade failures during extended outages

### Rate Limiting & Usage Management

#### Current Limits
- **Chat Completions**: Standard OpenAI rate limits apply
- **Assistant API**: Thread-based rate limiting
- **Token Management**: Monitoring and optimization of token usage

#### Usage Optimization
```typescript
// Token usage tracking
const { prompt_tokens, completion_tokens } = response.usage;

// Store for analytics and billing
await supabaseClient.from('chat_messages').insert({
  ai_prompt_tokens: prompt_tokens,
  ai_completion_tokens: completion_tokens,
  // ... other fields
});
```

---

## AWS Services Integration (Planned)

### AWS Rekognition
**Purpose**: Food detection and analysis in meal photos

#### Configuration
```typescript
// AWS configuration
AWS_ACCESS_KEY_ID: string
AWS_SECRET_ACCESS_KEY: string
AWS_REGION: string (default: us-east-1)
```

#### Implementation Pattern
```typescript
const rekognitionResponse = await fetch('https://rekognition.us-east-1.amazonaws.com/', {
  method: 'POST',
  headers: {
    'Authorization': `AWS4-HMAC-SHA256 ${authString}`,
    'Content-Type': 'application/x-amz-json-1.1',
    'X-Amz-Target': 'RekognitionService.DetectLabels'
  },
  body: JSON.stringify({
    Image: {
      Bytes: base64ImageData
    },
    MaxLabels: 10,
    MinConfidence: 70
  })
});
```

#### Features
- **Food Detection**: Identify food items in uploaded photos
- **Confidence Scoring**: Quality assessment of detection results
- **Label Classification**: Categorize food items for nutrition analysis

---

## Supabase Backend Services

### Database Integration

#### Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  "https://haxiwqgajhanpapvicbm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);
```

#### Service Patterns
All database interactions follow a consistent service pattern:

```typescript
export class WorkoutService {
  static async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as WorkoutPlan[];
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      return [];
    }
  }
}
```

### Real-time Subscriptions

#### Chat Message Subscriptions
```typescript
const channel = supabase
  .channel('chat_messages')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages', 
      filter: `user_id=eq.${userId}` 
    },
    (payload) => {
      callback(payload.new as ChatMessage);
    }
  )
  .subscribe();
```

#### Progress Updates
```typescript
// Real-time progress metric updates
const progressChannel = supabase
  .channel('progress_updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'progress_metrics',
    filter: `user_id=eq.${userId}`
  }, handleProgressUpdate)
  .subscribe();
```

### Storage Integration

#### File Upload Pattern
```typescript
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  return data;
};
```

#### Supported Storage Buckets
- **meal-images**: Meal photo storage with user-specific access
- **profile-images**: User profile pictures
- **workout-media**: Workout-related media files

### Edge Functions Integration

#### Function Invocation Pattern
```typescript
const invokeEdgeFunction = async (functionName: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });
  
  if (error) throw new Error(error.message);
  return data;
};
```

#### Error Handling
```typescript
// Edge function error handling with fallback
try {
  const result = await supabase.functions.invoke('ai-chat', {
    body: { message: userMessage }
  });
  
  return result.data;
} catch (edgeFunctionError) {
  console.error('Edge function error:', edgeFunctionError);
  
  // Fallback to direct API call or mock data
  return fallbackResponse;
}
```

---

## Internal Service Architecture

### Service Layer Organization

#### Core Services
```typescript
// Service structure
src/lib/supabase/services/
├── AssessmentService.ts     # Fitness assessments and analysis
├── WorkoutService.ts        # Workout management and logging
├── ChatService.ts           # Chat and messaging
├── ProfileService.ts        # User profiles and settings
├── NutritionService.ts      # Nutrition tracking and analysis
├── ProgressService.ts       # Progress metrics and analytics
└── PlanGenerationService.ts # AI plan generation coordination
```

#### Service Integration Pattern
```typescript
// Cross-service communication
export class AssessmentService {
  static async analyzeAssessment(userId: string, assessmentData: any): Promise<boolean> {
    // 1. Generate plans using AI service
    const planResult = await PlanGenerationService.generateFitnessPlan(assessmentData);
    
    // 2. Store results using other services
    if (planResult.success) {
      await WorkoutService.createWorkoutPlans(userId, planResult.data.workout_plans);
      await NutritionService.createNutritionPlan(userId, planResult.data.nutrition_plan);
    }
    
    return planResult.success;
  }
}
```

### Data Flow Architecture

#### Request Flow Pattern
1. **Frontend Component** → triggers action
2. **Service Layer** → handles business logic
3. **Database/API** → data persistence/retrieval
4. **Edge Function** → AI processing (if needed)
5. **Response Processing** → data transformation
6. **State Update** → UI refresh

#### Error Propagation
```typescript
// Consistent error handling across services
try {
  const result = await service.operation();
  return { success: true, data: result };
} catch (error) {
  console.error(`Service error in ${operation}:`, error);
  return { 
    success: false, 
    error: error.message,
    fallback: generateFallbackData()
  };
}
```

---

## API Security & Authentication

### Authentication Flow

#### JWT Token Management
```typescript
// Automatic token refresh
const { data: { session } } = await supabase.auth.getSession();

if (session?.expires_at && session.expires_at < Date.now() / 1000) {
  const { data: refreshed } = await supabase.auth.refreshSession();
  // Use refreshed session
}
```

#### Row-Level Security Integration
```typescript
// All API calls automatically include user context
const { data, error } = await supabase
  .from('workout_plans')
  .select('*')
  .eq('user_id', userId); // RLS policies automatically enforce user isolation
```

### API Key Security

#### Environment Variable Management
```typescript
// Secure API key handling in Edge Functions
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) {
  throw new Error('Missing OpenAI API Key');
}
```

#### Secret Rotation
- **Automated Rotation**: Support for API key rotation without downtime
- **Multiple Keys**: Support for multiple API keys for load balancing
- **Monitoring**: API key usage monitoring and alerting

### Rate Limiting & Abuse Prevention

#### Client-Side Rate Limiting
```typescript
// Debounced API calls
const debouncedAPICall = useCallback(
  debounce(async (params) => {
    return await apiService.call(params);
  }, 300),
  []
);
```

#### Server-Side Protection
- **Edge Function Limits**: Built-in Supabase rate limiting
- **User-Based Limits**: Per-user API call restrictions
- **Circuit Breakers**: Automatic service protection during high load

---

## Monitoring & Analytics

### API Performance Monitoring

#### Response Time Tracking
```typescript
// Performance monitoring in services
const startTime = performance.now();
try {
  const result = await apiCall();
  const duration = performance.now() - startTime;
  
  // Log performance metrics
  analytics.track('api_call_performance', {
    service: 'openai',
    operation: 'chat_completion',
    duration,
    success: true
  });
  
  return result;
} catch (error) {
  analytics.track('api_call_error', {
    service: 'openai',
    error: error.message,
    duration: performance.now() - startTime
  });
  throw error;
}
```

#### Usage Analytics
```typescript
// API usage tracking
interface APIUsageMetrics {
  service: 'openai' | 'supabase' | 'aws';
  operation: string;
  tokens_used?: number;
  response_time: number;
  user_id: string;
  timestamp: Date;
}
```

### Error Tracking & Alerting

#### Error Categorization
```typescript
// Structured error tracking
enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'auth',
  API_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

const trackError = (error: Error, category: ErrorCategory) => {
  console.error(`[${category}] ${error.message}`, error);
  
  // Send to monitoring service
  errorTracker.report(error, {
    category,
    timestamp: new Date(),
    user_context: getCurrentUserContext()
  });
};
```

### Health Checks & Status Monitoring

#### Service Health Endpoints
```typescript
// Health check for external services
const checkServiceHealth = async () => {
  const services = {
    openai: await checkOpenAIHealth(),
    supabase: await checkSupabaseHealth(),
    aws: await checkAWSHealth()
  };
  
  return {
    status: Object.values(services).every(s => s.healthy) ? 'healthy' : 'degraded',
    services,
    timestamp: new Date()
  };
};
```

---

## Development & Testing

### API Testing Strategy

#### Unit Testing
```typescript
// Service testing with mocks
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      })
    })
  }
}));
```

#### Integration Testing
```typescript
// End-to-end API testing
describe('Workout Plan Generation', () => {
  it('should generate valid workout plan', async () => {
    const result = await PlanGenerationService.generateFitnessPlan(testAssessment);
    
    expect(result.success).toBe(true);
    expect(result.data.workout_plans).toHaveLength(3);
    expect(result.data.nutrition_plan).toBeDefined();
  });
});
```

### Development Environment

#### Local Development Setup
```typescript
// Local API configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export const apiConfig = {
  openai: {
    baseURL: isDevelopment ? 'http://localhost:3000/api/openai' : 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  }
};
```

#### Mock Data Generation
```typescript
// Comprehensive mock data for development
export const generateMockWorkoutPlan = (): WorkoutPlan => ({
  id: uuidv4(),
  user_id: 'test-user',
  title: 'Upper Body Strength',
  description: 'Comprehensive upper body workout',
  category: 'strength',
  difficulty: 3,
  estimated_duration: '45-60 minutes',
  ai_generated: true,
  exercises: generateMockExercises()
});
```

---

## Future API Integrations

### Planned Integrations

#### Wearable Device APIs
- **Apple HealthKit**: iOS health data integration
- **Google Fit**: Android fitness data sync
- **Fitbit API**: Activity tracking integration
- **Garmin Connect**: Advanced fitness metrics

#### Nutrition APIs
- **USDA FoodData Central**: Comprehensive nutrition database
- **Edamam Nutrition Analysis**: Recipe and meal analysis
- **MyFitnessPal API**: Food database integration

#### Payment Processing
- **Stripe API**: Subscription and payment processing
- **PayPal API**: Alternative payment methods
- **Apple Pay/Google Pay**: Mobile payment integration

### API Evolution Strategy

#### Versioning Strategy
```typescript
// API versioning support
const apiVersion = 'v1';
const endpoint = `${baseURL}/${apiVersion}/chat/completions`;
```

#### Backward Compatibility
- **Graceful Degradation**: Support for older API versions
- **Feature Flags**: Gradual rollout of new integrations
- **Migration Tools**: Automated data migration for API changes

---

## Best Practices & Guidelines

### API Integration Standards

#### Error Handling
1. **Consistent Error Format**: Standardized error response structure
2. **Logging**: Comprehensive error logging with context
3. **User Communication**: User-friendly error messages
4. **Fallback Strategies**: Graceful degradation plans

#### Performance Optimization
1. **Caching**: Intelligent caching of API responses
2. **Batching**: Batch API calls where possible
3. **Pagination**: Efficient handling of large datasets
4. **Compression**: Request/response compression

#### Security Best Practices
1. **API Key Management**: Secure storage and rotation
2. **Input Validation**: Comprehensive validation of all inputs
3. **Rate Limiting**: Protect against abuse and overuse
4. **Audit Logging**: Track all API interactions for security

This comprehensive API integration documentation provides a complete overview of how the Hashim application interacts with external services and manages internal communications, ensuring scalable, secure, and maintainable integrations.
