
# System Design Document
## Hashim - AI-Powered Personal Fitness Trainer

### High-Level Architecture

The Hashim application follows a modern web architecture pattern with a React frontend, Supabase backend-as-a-service, and integrated AI services. The system is designed for scalability, security, and maintainability with a focus on real-time interactions and AI-powered personalization.

#### Architecture Principles
- **Mobile-First**: Responsive design optimized for mobile devices with compact UI components
- **Real-Time**: Live updates for workout progress, chat interactions, and voice logging
- **Serverless**: Edge functions for scalable AI processing and voice recognition
- **Secure**: Row-Level Security (RLS) and JWT authentication with user data isolation
- **Extensible**: Modular dashboard design for easy feature additions
- **Voice-Enabled**: Natural language workout logging and interaction capabilities

### Key Components and Services

#### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React Context for app state
- **Routing**: React Router for navigation
- **Build Tool**: Vite for fast development and optimized builds
- **Voice Processing**: Web Audio API for voice input capture and processing

#### Backend (Supabase)
- **Database**: PostgreSQL with real-time subscriptions and Row-Level Security
- **Authentication**: Built-in auth with JWT tokens and session management
- **Storage**: File storage for meal images and audio files
- **Edge Functions**: Serverless functions for AI processing and voice transcription
- **Real-time**: WebSocket connections for live updates and chat

#### AI Services
- **OpenAI GPT-4**: Workout plan generation, nutrition analysis, chat assistant, exercise parsing
- **OpenAI Whisper**: Voice-to-text transcription for workout logging
- **AWS Rekognition**: Food detection and image analysis
- **Custom Prompts**: Specialized prompts for fitness and nutrition domains

#### External Integrations
- **AWS S3/Rekognition**: Image processing and food recognition
- **OpenAI API**: Natural language processing, generation, and transcription
- **Supabase Storage**: Secure file uploads and management

### Data Flow

#### User Onboarding Flow
1. User creates account via Supabase Auth
2. Comprehensive fitness assessment with goal setting
3. Assessment data sent to OpenAI via Edge Function
4. AI generates personalized workout plans based on user profile
5. Weekly workout schedules created and stored
6. User dashboard populated with personalized content

#### Daily Workout Tracking Flow
1. User views dashboard with scheduled workouts for the week
2. Selects specific day to view workout details
3. Can log exercises through voice input or manual tracking
4. Progress tracked in real-time with exercise completion
5. AI assistant provides feedback and motivation
6. Weekly analytics and progress visualization

#### Voice Workout Logging Flow
1. User activates voice input on dashboard
2. Speaks exercise details (e.g., "I did 3 sets of 10 push-ups")
3. Audio captured and sent to Supabase Storage
4. Edge Function processes audio with OpenAI Whisper
5. Transcript parsed by GPT-4 to extract exercise data
6. Structured data stored in workout logs
7. Dashboard updates in real-time with logged exercises

#### Nutrition Tracking Flow
1. User captures meal photo via compact camera interface
2. Image uploaded to Supabase Storage
3. Edge Function processes image with AWS Rekognition
4. Food items detected and sent to OpenAI for nutrition analysis
5. Comprehensive nutrition data calculated and returned
6. Results stored in nutrition logs with daily totals
7. Progress tracking updated with macro and calorie information

#### AI Chat Flow
1. User accesses chat via floating action button
2. Message sent with enriched user context (goals, progress, preferences)
3. Edge Function processes request with OpenAI GPT-4
4. Context-aware response generated based on fitness expertise
5. Response streamed back to user in real-time
6. Conversation history maintained for personalized interactions

### Scalability Considerations

#### Database Scaling
- **Read Replicas**: For handling read-heavy workout and nutrition queries
- **Connection Pooling**: PgBouncer for efficient connection management
- **Indexing Strategy**: Optimized indexes for user-based queries and date ranges
- **Partitioning**: Time-based partitioning for workout logs and nutrition data
- **Real-time Subscriptions**: Efficient change data capture for live updates

#### API Scaling
- **Edge Functions**: Auto-scaling serverless compute for AI processing
- **Rate Limiting**: Protection against abuse with user-based quotas
- **Caching**: Strategic caching for workout plans and user profiles
- **CDN**: Global content delivery for static assets and images
- **Request Optimization**: Batched queries and efficient data fetching

#### Frontend Scaling
- **Code Splitting**: Lazy loading for dashboard components and pages
- **Image Optimization**: WebP format and responsive images for meal photos
- **Service Worker**: Offline capability and intelligent caching
- **Progressive Web App**: Native-like mobile experience with push notifications
- **Component Modularity**: Reusable dashboard cards and UI components

### Security Considerations

#### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication with automatic refresh
- **Row-Level Security**: Database-level access control for all user data
- **Role-Based Access**: Granular permission system for different user types
- **Session Management**: Secure token refresh and automatic logout
- **API Key Protection**: Secure storage of AI service credentials

#### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **Input Validation**: Comprehensive sanitization of user inputs and file uploads
- **HTTPS Only**: SSL/TLS for all communications
- **Audio Processing**: Secure handling of voice data with automatic cleanup
- **Image Security**: Safe processing of meal photos with content validation

#### Privacy & Compliance
- **Data Minimization**: Collect only necessary user data for personalization
- **User Consent**: Clear privacy policy and data usage agreements
- **Data Retention**: Automated cleanup of old logs and temporary files
- **Export/Delete**: User control over personal data and account deletion
- **Anonymization**: Option to anonymize data for analytics while preserving privacy

### Fault Tolerance

#### Error Handling
- **Graceful Degradation**: Fallback for failed AI services and voice processing
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breakers**: Prevent cascade failures in AI service calls
- **Error Boundaries**: React error boundaries for UI crashes
- **Offline Mode**: Limited functionality when network is unavailable

#### Monitoring & Alerting
- **Health Checks**: Automated system health monitoring for all services
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Centralized error logging and alerting
- **User Analytics**: Usage patterns and feature adoption metrics
- **AI Service Monitoring**: Track AI API usage and response quality

#### Backup & Recovery
- **Database Backups**: Automated daily backups with point-in-time recovery
- **File Storage**: Redundant storage across multiple regions
- **Disaster Recovery**: Documented procedures for major outages
- **Data Migration**: Tools for database schema changes and updates
- **Edge Function Deployment**: Versioned deployments with rollback capability

### Performance Optimization

#### Frontend Performance
- **Lazy Loading**: On-demand loading of dashboard components
- **Memoization**: React.memo and useMemo for expensive computations
- **Virtual Scrolling**: For large lists of workouts and exercises
- **Image Optimization**: Compressed images with lazy loading
- **Bundle Optimization**: Tree shaking and code splitting

#### Backend Performance
- **Query Optimization**: Efficient database queries with proper indexing
- **Caching Strategy**: Redis for frequently accessed data
- **Connection Pooling**: Optimized database connection management
- **Edge Function Optimization**: Efficient AI processing and response caching
- **Real-time Optimization**: Selective subscriptions for live updates

### Mobile Experience

#### Responsive Design
- **Mobile-First**: UI components designed for mobile interaction
- **Touch Optimization**: Large touch targets and gesture support
- **Compact Layout**: Efficient use of screen space with collapsible cards
- **Quick Actions**: Prominent placement of camera and voice input
- **Navigation**: Bottom navigation bar for easy thumb access

#### Native Features
- **Camera Integration**: Seamless meal photo capture
- **Microphone Access**: Voice workout logging with permission handling
- **Push Notifications**: Workout reminders and progress updates
- **Offline Support**: Limited functionality without internet connection
- **App-like Experience**: PWA installation and native-like behavior

### AI Integration Architecture

#### Voice Processing Pipeline
1. **Audio Capture**: Web Audio API for high-quality recording
2. **Format Conversion**: WebM to compatible format for Whisper
3. **Transcription**: OpenAI Whisper for accurate speech-to-text
4. **Parsing**: GPT-4 for extracting structured exercise data
5. **Validation**: Data validation and error handling
6. **Storage**: Structured data storage in workout logs

#### Image Analysis Pipeline
1. **Image Capture**: Device camera with quality optimization
2. **Upload**: Secure upload to Supabase Storage
3. **Recognition**: AWS Rekognition for food detection
4. **Analysis**: OpenAI GPT-4 for nutrition calculation
5. **Validation**: Nutrition data validation and user confirmation
6. **Storage**: Meal logs with comprehensive nutrition data

#### Chat Intelligence
1. **Context Enrichment**: User profile, goals, and recent activity
2. **Intent Recognition**: Understanding user questions and needs
3. **Knowledge Base**: Fitness and nutrition expertise
4. **Response Generation**: Personalized and actionable advice
5. **Conversation Memory**: Context maintenance across sessions
