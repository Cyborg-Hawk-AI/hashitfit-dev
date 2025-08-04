
# Chat Assistant Documentation

## 1. Overview

The Chat Assistant provides users with an AI-powered fitness coach accessible throughout the app via a floating action button. It offers personalized fitness advice, workout guidance, nutrition insights, and general fitness support using OpenAI's GPT models.

**User Interactions:**
- Real-time chat with AI fitness coach
- Context-aware fitness advice
- Workout guidance and form tips
- Nutrition and meal planning support
- Progress analysis and motivation

## 2. UI Components & Layout

**Major Components:**
- `ChatFAB` - Floating action button for chat access
- `ChatInterface` - Main chat modal interface
- Message display system with user/assistant distinction
- Real-time typing indicators
- Message history persistence

**Layout Patterns:**
- Full-screen modal on mobile
- Floating chat interface
- Message threading with clear user/assistant separation
- Responsive text input with send controls

**Responsiveness:**
- Mobile-optimized chat interface
- Touch-friendly input controls
- Adaptive modal sizing
- Smooth animations and transitions

## 3. User Actions

**Chat Interactions:**
- **Send Messages**: Ask fitness-related questions
- **View History**: Access previous conversations
- **Get Recommendations**: Receive personalized advice
- **Context Sharing**: Reference current workouts or progress
- **Voice Input**: Speak questions (future enhancement)

**Assistant Capabilities:**
- Workout guidance and exercise explanations
- Nutrition advice and meal planning
- Progress analysis and goal setting
- Motivation and accountability support
- Form tips and safety guidance

## 4. Data Sources

**Supabase Tables:**
- `chat_messages` - Message history and conversation data
- `profiles` - User context for personalized responses
- `workout_logs` - Recent activity for context-aware advice
- `progress_metrics` - Current stats for relevant recommendations
- `assessment_data` - User goals and preferences for targeting advice

**Context Integration:**
- Current workout data for real-time guidance
- User progress for motivational messaging
- Fitness goals for targeted advice
- Recent activity for relevant suggestions

## 5. Data Submission

**Message Storage:**
- Target: `chat_messages` table
- Data: user_id, content, role (user/assistant), timestamp
- Process: Real-time message persistence with conversation threading

**AI Processing:**
- Target: `ai-chat` Edge Function
- Input: User message + conversation context + user profile data
- Process: OpenAI API call with fitness-specific prompting
- Output: Contextual fitness advice and responses

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- **Message Sync**: Live message updates across devices
- **Typing Indicators**: Real-time conversation feedback
- **Context Updates**: Live integration with current app state
- **Response Streaming**: Real-time AI response display

**Supabase Realtime Integration:**
- Real-time subscription to new messages
- Live conversation synchronization
- Multi-device chat continuity
- Immediate message delivery

## 7. AI Assistant & OpenAI Integration

**Core AI Implementation:**
- **Model**: GPT-4o-mini for fast, cost-effective responses
- **System Prompt**: Fitness coach persona with expertise in exercise, nutrition, and motivation
- **Context Injection**: User profile, recent activities, and current goals
- **Response Processing**: Structured fitness advice with actionable recommendations

**Edge Function: `ai-chat`**
- **Input**: User message, conversation history, user context
- **Processing**: 
  - Context building from user profile and recent activity
  - Fitness-specific prompt engineering
  - OpenAI API integration with conversation threading
  - Response filtering and safety checks
- **Output**: Personalized fitness coaching responses

**Advanced Features:**
- **Context Awareness**: References current workouts and progress
- **Personalization**: Tailored advice based on user goals and history
- **Safety Guidelines**: Exercise safety and injury prevention focus
- **Motivational Support**: Encouragement based on user progress patterns

## Technical Implementation Details

**Real-Time Architecture:**
- Supabase Realtime subscriptions for live messaging
- WebSocket connections for immediate updates
- Message queuing for reliable delivery
- Optimistic UI updates for responsive feel

**AI Integration:**
- OpenAI API integration via Supabase Edge Functions
- Conversation context management
- Rate limiting and usage tracking
- Error handling and fallback responses

**Performance Optimizations:**
- Message pagination for chat history
- Efficient re-rendering with React optimization
- Background message synchronization
- Optimistic message sending

**Security & Privacy:**
- Secure message transmission
- User data privacy protection
- Content filtering and moderation
- Rate limiting to prevent abuse

**Conversation Management:**
- Persistent chat history
- Context-aware responses
- Conversation threading
- Message search capabilities (future enhancement)
