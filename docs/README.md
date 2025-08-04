
# HashimFit Documentation

## Overview

This documentation directory contains comprehensive technical specifications for all pages and features of the HashimFit mobile-first fitness application. HashimFit is built using React, Tailwind CSS, shadcn/ui components, Supabase for backend services, and OpenAI for AI-powered features.

## Documentation Structure

### Core Pages
- **[Dashboard](./pages/DASHBOARD.md)** - Main hub with daily workout summary, nutrition tracking, and quick actions
- **[Planner](./pages/PLANNER.md)** - Weekly workout scheduling and AI-powered planning
- **[Workouts](./pages/WORKOUTS.md)** - Workout management, filtering, and session initiation
- **[Workout Session](./pages/WORKOUT_SESSION.md)** - Active workout interface with real-time tracking and modifications
- **[Progress](./pages/PROGRESS.md)** - Comprehensive fitness tracking and analytics
- **[Profile](./pages/PROFILE.md)** - User account management and preferences
- **[Settings](./pages/SETTINGS.md)** - Application configuration and privacy controls

### Feature-Specific Pages
- **[Chat Assistant](./pages/CHAT_ASSISTANT.md)** - AI-powered fitness coaching interface
- **[Meal Logging](./pages/MEAL_LOGGING.md)** - Photo-based nutrition tracking with AI analysis

### Development Documentation
- **[Architecture](./ARCHITECTURE.md)** - System architecture and component design
- **[System Design](./SYSTEM_DESIGN.md)** - Technical implementation details
- **[User Flows](./USER_FLOWS.md)** - User interaction patterns and workflows
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines and contribution process
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## Technology Stack

### Frontend
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **TanStack Query** - Server state management
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management
  - Real-time subscriptions
  - File storage for images
  - Edge Functions for serverless computing

### AI & External Services
- **OpenAI GPT-4o** - AI coaching and conversation
- **OpenAI Vision API** - Food recognition and analysis
- **Supabase Edge Functions** - Serverless AI processing

## Key Features

### Real-Time Capabilities
- Live workout progress tracking
- Real-time chat with AI assistant
- Cross-device data synchronization
- Instant UI updates on data changes

### AI-Powered Features
- **Meal Analysis** - Photo-based nutrition tracking with AI food recognition
- **Workout Generation** - AI-created personalized workout plans
- **Chat Assistant** - Context-aware fitness coaching
- **Voice Logging** - Speech-to-text workout tracking

### Mobile-First Design
- Touch-optimized interfaces
- Responsive layouts for all screen sizes
- Progressive Web App (PWA) capabilities
- Offline-first data architecture

## Database Schema Overview

### Core Tables
- `profiles` - User profile information and preferences
- `workout_plans` - Structured workout templates
- `workout_schedule` - Scheduled workout assignments
- `exercise_logs` - Individual exercise performance tracking
- `nutrition_logs` - Daily nutrition tracking
- `meal_logs` - Individual meal records with AI analysis
- `progress_metrics` - Body measurements and fitness assessments
- `chat_messages` - AI assistant conversation history

### Key Relationships
- Users have profiles and settings
- Workout plans contain exercises
- Scheduled workouts link to plans and generate logs
- Nutrition logs aggregate meal data
- Progress metrics track user development over time

## Development Guidelines

### Code Organization
- Component-based architecture with reusable UI elements
- Custom hooks for business logic and state management
- Service layer for API interactions
- Type-safe interfaces for all data structures

### Performance Optimization
- TanStack Query for efficient data fetching and caching
- Optimistic UI updates for immediate user feedback
- Image optimization and lazy loading
- Debounced API calls for real-time features

### Security & Privacy
- Row Level Security (RLS) for data protection
- Secure file upload and storage
- User data encryption
- GDPR compliance considerations

## API Integration Patterns

### Supabase Integration
- Direct database access via Supabase client
- Real-time subscriptions for live updates
- Edge Functions for complex business logic
- Storage integration for file management

### OpenAI Integration
- Edge Function proxying for secure API access
- Context-aware prompting for personalized responses
- Vision API integration for image analysis
- Usage tracking and rate limiting

## Contributing

When extending or modifying HashimFit features:

1. **Update Documentation** - Ensure all changes are reflected in relevant documentation
2. **Follow Patterns** - Maintain consistency with existing code patterns and conventions
3. **Test Thoroughly** - Verify all integrations work across devices and scenarios
4. **Consider Performance** - Optimize for mobile and ensure smooth user experience
5. **Maintain Security** - Follow established security patterns and data protection guidelines

## Future Enhancements

### Planned Features
- Offline mode with local data storage
- Social features and community challenges
- Advanced analytics and machine learning insights
- Wearable device integration
- Nutrition barcode scanning
- Video exercise demonstrations

### Technical Improvements
- Enhanced PWA capabilities
- Advanced caching strategies
- Performance monitoring and optimization
- Accessibility improvements
- Multi-language support

This documentation serves as the single source of truth for HashimFit's architecture, features, and implementation details. Keep it updated as the application evolves to ensure all team members have access to current and accurate information.
