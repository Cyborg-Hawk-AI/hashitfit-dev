
# Profile Page Documentation

## 1. Overview

The Profile page serves as the comprehensive user account management interface, displaying personal information, fitness preferences, app settings, and providing access to user statistics and AI coaching features. It acts as the central hub for user customization and account management.

**User Interactions:**
- Personal information editing
- Fitness preference updates
- App settings configuration
- User statistics viewing
- AI coaching interaction
- Account management

## 2. UI Components & Layout

**Major Components:**
- `ProfileOverviewCard` - Basic user information display
- `BodyMetricsCard` - Physical measurements and stats
- `FitnessPreferencesCard` - Workout and goal preferences
- `NutritionPreferencesCard` - Diet and nutrition settings
- `PersonalJourneyCard` - Fitness journey timeline (data-driven)
- `AppSettingsCard` - Application configuration
- `AICoachSuggestionsCard` - Personalized AI recommendations (data-driven)
- `UserStatsModal` - Detailed user statistics (data-driven)

**Layout Patterns:**
- Card-based information organization
- Sectioned preference management
- Modal overlays for detailed views
- Settings hierarchy with expandable sections

**Responsiveness:**
- Mobile-first design with touch-optimized controls
- Responsive card layouts
- Accessible form controls
- Smooth transitions between sections

## 3. User Actions

**Profile Management:**
- **Edit Personal Info**: Update name, age, physical stats
- **Modify Preferences**: Adjust fitness goals and workout preferences
- **Update Settings**: Configure app behavior and notifications
- **View Statistics**: Access detailed user analytics
- **Manage Photos**: Update profile and progress photos

**Preference Configuration:**
- **Fitness Goals**: Set and modify fitness objectives
- **Equipment Access**: Specify available workout equipment
- **Nutrition Preferences**: Set dietary restrictions and goals
- **App Behavior**: Configure notifications and display preferences

## 4. Data Sources

**Supabase Tables:**
- `profiles` - Core user profile information
- `user_settings` - Application preferences and configuration
- `assessment_data` - Initial fitness assessment results
- `progress_metrics` - Latest body measurements and stats
- `workout_logs` - Historical workout performance for statistics

**Aggregated Data:**
- User statistics calculations
- Progress summaries
- Achievement tracking
- Activity analytics

## 5. Data Submission

**Profile Updates:**
- Target: `profiles` table
- Data: name, age, height, weight, fitness goals, equipment access
- Validation: Client-side and server-side data validation

**Settings Updates:**
- Target: `user_settings` table
- Data: theme preferences, notification settings, units system
- Sync: Real-time preference application

**Assessment Updates:**
- Target: `assessment_data` table
- Data: Updated fitness preferences, goals, and capabilities
- Integration: Triggers AI recommendation updates

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- **Profile Changes**: Immediate reflection across the app
- **Settings Sync**: Real-time preference updates
- **Statistics Updates**: Live calculation of user metrics
- **Photo Updates**: Instant profile image changes

**Cross-App Integration:**
- Profile changes update Dashboard displays
- Preference changes affect workout recommendations
- Settings changes apply immediately to app behavior

## 7. AI Assistant & OpenAI Integration

**AI Coach Suggestions:**
- **Function**: Personalized coaching recommendations
- **Data Source**: User profile, progress data, workout history
- **Process**: OpenAI analysis of user patterns and preferences
- **Output**: Tailored fitness advice, goal adjustments, program modifications

**Integration Features:**
- Profile-based AI personalization
- Progress-driven recommendation updates
- Goal-oriented coaching suggestions
- Adaptive program modifications based on user changes

## Technical Implementation Notes

**Data Validation:**
- Comprehensive form validation for profile updates
- Real-time validation feedback
- Server-side data integrity checks
- Error handling with user-friendly messages

**State Management:**
- TanStack Query for profile data management
- Local state for form handling
- Optimistic updates for immediate feedback
- Synchronization with global user context

**Privacy & Security:**
- Secure handling of personal information
- Data encryption for sensitive metrics
- Privacy controls for data sharing
- GDPR compliance considerations

**Performance Optimizations:**
- Lazy loading of statistics data
- Image optimization for profile photos
- Efficient data fetching strategies
- Minimal re-renders on preference changes

**Data-Driven Components:**
- All profile components now use prop-based data
- Empty states for components without data
- Loading states during data operations
- Error handling for failed requests
- No mock data in production code
