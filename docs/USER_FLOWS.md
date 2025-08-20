
# User Flow Diagrams
## Hashim - AI-Powered Personal Fitness Trainer

### User Onboarding Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Register Screen]
    Auth -->|Yes| Profile{Profile Complete?}
    
    Login --> Register[Create Account]
    Login --> SignIn[Sign In]
    Register --> Assessment[Fitness Assessment]
    SignIn --> Profile
    
    Profile -->|No| Assessment
    Profile -->|Yes| Dashboard[Main Dashboard]
    
    Assessment --> Questions[Assessment Questions]
    Questions --> Goals[Set Fitness Goals]
    Goals --> Equipment[Select Equipment]
    Equipment --> AI[AI Analysis]
    AI --> Plans[Generate Workout Plans]
    Plans --> Schedule[Create Weekly Schedule]
    Schedule --> Welcome[Welcome & Tutorial]
    Welcome --> Dashboard
    
    Dashboard --> End([Ready to Use App])
    
    style Start fill:#e8f5e8
    style End fill:#e8f5e8
    style Assessment fill:#fff3e0
    style AI fill:#f3e5f5
```

### Daily Dashboard Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> QuickActions[Quick Actions at Top]
    QuickActions --> MealPhoto{Take Meal Photo?}
    QuickActions --> VoiceLog{Voice Log Workout?}
    
    MealPhoto -->|Yes| Camera[Open Camera]
    Camera --> TakePhoto[Capture Meal]
    TakePhoto --> AnalyzeMeal[AI Meal Analysis]
    AnalyzeMeal --> NutritionData[Show Nutrition Data]
    NutritionData --> Dashboard
    
    VoiceLog -->|Yes| VoiceInput[Activate Voice Input]
    VoiceInput --> SpeakExercise[Speak Exercise Details]
    SpeakExercise --> ProcessVoice[AI Voice Processing]
    ProcessVoice --> UpdateWorkout[Update Workout Log]
    UpdateWorkout --> Dashboard
    
    Dashboard --> DashboardCards[View Dashboard Cards]
    DashboardCards --> WorkoutSummary[Daily Workout Summary]
    DashboardCards --> NutritionProgress[Nutrition Progress]
    DashboardCards --> TDEEBalance[TDEE Balance]
    DashboardCards --> HabitStreak[Habit Streak]
    DashboardCards --> AIInsights[AI Coach Insights]
    
    DashboardCards --> WeeklyView[Weekly Calendar]
    WeeklyView --> SelectDay[Select Day]
    SelectDay --> ViewWorkout[View Day's Workout]
    ViewWorkout --> StartWorkout[Start Workout]
    
    style Dashboard fill:#e3f2fd
    style QuickActions fill:#e8f5e8
    style VoiceLog fill:#fff3e0
    style MealPhoto fill:#fff8e1
```

### Voice Workout Logging Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> VoiceButton[Tap Voice Input Button]
    VoiceButton --> Permission{Microphone Permission?}
    Permission -->|No| RequestPerm[Request Permission]
    RequestPerm --> Permission
    Permission -->|Yes| StartRecord[Start Recording]
    
    StartRecord --> Speaking[User Speaks Exercise]
    Speaking --> Examples["Examples:<br/>- I did 3 sets of 10 push-ups<br/>- Just finished 5 sets of squats<br/>- Completed 20 minutes of running"]
    Examples --> StopRecord[Stop Recording]
    
    StopRecord --> ProcessAudio[Process Audio]
    ProcessAudio --> Transcribe[Whisper Transcription]
    Transcribe --> ParseData[GPT-4 Exercise Parsing]
    
    ParseData --> Success{Parsing Success?}
    Success -->|Yes| ShowParsed[Show Parsed Exercise Data]
    Success -->|No| Error[Show Error Message]
    
    ShowParsed --> Confirm{User Confirms?}
    Confirm -->|Yes| SaveExercise[Save to Workout Log]
    Confirm -->|No| TryAgain[Try Again]
    
    SaveExercise --> UpdateDashboard[Update Dashboard]
    UpdateDashboard --> Success([Voice Log Complete])
    
    Error --> TryAgain
    TryAgain --> VoiceButton
    
    style VoiceButton fill:#e8f5e8
    style ProcessAudio fill:#fff3e0
    style ShowParsed fill:#e3f2fd
    style Error fill:#ffebee
```

### Workout Tracking Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> WeekView[Weekly Calendar View]
    WeekView --> SelectDay[Select Day]
    SelectDay --> Schedule{Workout Scheduled?}
    
    Schedule -->|Yes| ViewWorkout[View Scheduled Workout]
    Schedule -->|No| AddWorkout[Add Workout Button]
    
    AddWorkout --> SelectPlan[Select Workout Plan]
    SelectPlan --> ScheduleIt[Schedule for Day]
    ScheduleIt --> ViewWorkout
    
    ViewWorkout --> WorkoutDetails[View Exercise List]
    WorkoutDetails --> StartWorkout[Start Workout]
    StartWorkout --> Exercise[Exercise Tracking]
    
    Exercise --> LogMethod{How to Log?}
    LogMethod -->|Manual| ManualLog[Check Off Sets/Reps]
    LogMethod -->|Voice| VoiceLog[Voice Log Exercise]
    
    ManualLog --> NextEx{More Exercises?}
    VoiceLog --> NextEx
    
    NextEx -->|Yes| Exercise
    NextEx -->|No| WorkoutComplete[Workout Complete]
    
    WorkoutComplete --> Summary[View Summary]
    Summary --> Achievements[Show Achievements]
    Achievements --> Dashboard
    
    style Dashboard fill:#e3f2fd
    style WorkoutComplete fill:#e8f5e8
    style VoiceLog fill:#fff3e0
    style Summary fill:#fff8e1
```

### Meal Logging Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> MealCard[Compact Meal Capture Card]
    MealCard --> Method{Capture Method}
    
    Method -->|Camera| OpenCamera[Open Device Camera]
    Method -->|Gallery| SelectFile[Select from Gallery]
    
    OpenCamera --> Tips[Show Photo Tips:<br/>- Good lighting<br/>- Full meal visible<br/>- Include size reference]
    Tips --> TakePhoto[Take Photo]
    SelectFile --> Preview[Image Preview]
    TakePhoto --> Preview
    
    Preview --> MealType[Select Meal Type:<br/>Breakfast/Lunch/Dinner/Snack]
    MealType --> Analyze[AI Analysis Processing]
    
    Analyze --> FoodDetection[AWS Rekognition<br/>Food Detection]
    FoodDetection --> NutritionCalc[OpenAI GPT-4<br/>Nutrition Calculation]
    
    NutritionCalc --> Results{Analysis Success?}
    Results -->|Yes| ShowResults[Show Detected Foods:<br/>- Food items<br/>- Portion sizes<br/>- Calories<br/>- Macros]
    Results -->|No| Error[Show Error Message]
    
    ShowResults --> UserReview[User Reviews Results]
    UserReview --> Confirm{Confirm Results?}
    Confirm -->|Yes| SaveMeal[Save to Nutrition Log]
    Confirm -->|No| EditResults[Edit/Correct Items]
    
    EditResults --> SaveMeal
    SaveMeal --> UpdateDaily[Update Daily Totals]
    UpdateDaily --> UpdateDashboard[Update Dashboard Cards]
    UpdateDashboard --> Dashboard
    
    Error --> Retry[Try Again]
    Retry --> Method
    
    style Dashboard fill:#e3f2fd
    style MealCard fill:#e8f5e8
    style Analyze fill:#fff3e0
    style ShowResults fill:#f1f8e9
    style Error fill:#ffebee
```

### AI Chat Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> ChatFAB[Chat Floating Action Button]
    ChatFAB --> ChatInterface[Chat Interface Opens]
    ChatInterface --> Context[Load User Context:<br/>- Current goals<br/>- Recent workouts<br/>- Nutrition data<br/>- Progress metrics]
    
    Context --> Message[User Types Message]
    Message --> Examples["Example Questions:<br/>- Why am I not losing weight?<br/>- How to modify workout for knee pain?<br/>- What should I eat for breakfast?<br/>- How am I progressing?"]
    
    Examples --> Send[Send Message]
    Send --> EnrichContext[Enrich with User Data]
    EnrichContext --> AI[Process with GPT-4]
    
    AI --> Response{AI Response Ready?}
    Response -->|Processing| Loading[Show Typing Indicator]
    Loading --> Response
    Response -->|Ready| Display[Display Response]
    
    Display --> ActionSuggestion{Action Suggested?}
    ActionSuggestion -->|Yes| ActionPrompt[Show Action Options:<br/>- Modify workout<br/>- Set new goal<br/>- Schedule meal<br/>- Track progress]
    ActionSuggestion -->|No| Continue[Continue Conversation]
    
    ActionPrompt --> Execute{Execute Action?}
    Execute -->|Yes| PerformAction[Perform Suggested Action]
    Execute -->|No| Continue
    
    PerformAction --> UpdateApp[Update App State]
    UpdateApp --> Continue
    Continue --> More{More Questions?}
    More -->|Yes| Message
    More -->|No| End([End Chat Session])
    
    style ChatFAB fill:#e8f5e8
    style AI fill:#f3e5f5
    style ActionPrompt fill:#fff3e0
    style PerformAction fill:#e3f2fd
    style End fill:#e8f5e8
```

### Dashboard Card Interaction Flow

```mermaid
flowchart TD
    Dashboard[Dashboard] --> CardView[View Dashboard Cards]
    CardView --> CardTypes[Card Types:<br/>- Daily Workout Summary<br/>- Nutrition Progress<br/>- TDEE Balance<br/>- Habit Streak<br/>- AI Coach Insights]
    
    CardTypes --> CardAction{Card Interaction}
    CardAction -->|Collapse| CollapseCard[Collapse Card]
    CardAction -->|Expand| ExpandCard[Expand Card Details]
    CardAction -->|Navigate| GoToDetail[Navigate to Detail Page]
    
    CollapseCard --> UpdateLayout[Update Dashboard Layout]
    ExpandCard --> ShowDetail[Show Detailed Information]
    GoToDetail --> DetailPage[Open Dedicated Page]
    
    UpdateLayout --> Dashboard
    ShowDetail --> Dashboard
    DetailPage --> BackToDash[Back to Dashboard]
    BackToDash --> Dashboard
    
    style Dashboard fill:#e3f2fd
    style CardTypes fill:#f1f8e9
    style ShowDetail fill:#fff8e1
```

### Error Handling Flow

```mermaid
flowchart TD
    Error([Error Occurs]) --> Type{Error Type}
    
    Type -->|Network| NetworkError[Network Connection Error]
    Type -->|Auth| AuthError[Authentication Error]
    Type -->|Validation| ValidationError[Data Validation Error]
    Type -->|AI Service| AIError[AI Service Error]
    Type -->|Voice| VoiceError[Voice Processing Error]
    Type -->|Camera| CameraError[Camera Access Error]
    
    NetworkError --> Retry{Auto Retry?}
    Retry -->|Yes| RetryAction[Retry Request]
    Retry -->|No| Offline[Show Offline Mode]
    
    AuthError --> Logout[Force Logout]
    Logout --> Login[Redirect to Login]
    
    ValidationError --> ShowError[Show Validation Message]
    ShowError --> UserAction[User Corrects Input]
    
    AIError --> Fallback{Fallback Available?}
    Fallback -->|Yes| UseFallback[Use Fallback Service]
    Fallback -->|No| GracefulFail[Graceful Degradation]
    
    VoiceError --> VoiceFallback[Suggest Manual Input]
    CameraError --> CameraFallback[Suggest Gallery Upload]
    
    RetryAction --> Success{Success?}
    Success -->|Yes| Continue[Continue Normal Flow]
    Success -->|No| Offline
    
    UseFallback --> Continue
    GracefulFail --> ShowError
    VoiceFallback --> Continue
    CameraFallback --> Continue
    UserAction --> Continue
    Offline --> Sync[Sync When Online]
    
    style Error fill:#ffebee
    style Continue fill:#e8f5e8
    style Offline fill:#fff3e0
    style VoiceFallback fill:#f3e5f5
```

### Key User Journeys Summary

#### New User Journey
1. **Discovery**: User finds app through marketing or referral
2. **Registration**: Creates account with email/password
3. **Assessment**: Completes comprehensive fitness questionnaire with goals
4. **Personalization**: AI generates customized workout plans and schedules
5. **First Interaction**: Guided through dashboard and quick actions
6. **First Workout**: Experiences voice logging or manual tracking
7. **First Meal**: Uses camera for meal analysis
8. **Habit Formation**: Daily engagement with compact dashboard interface

#### Daily Active User Journey
1. **Quick Check-in**: Opens app to compact dashboard view
2. **Quick Actions**: Uses top-placed meal capture or voice logging
3. **Dashboard Review**: Checks collapsible cards for progress
4. **Workout Execution**: Completes scheduled workout with real-time tracking
5. **Progress Tracking**: Reviews weekly analytics and achievements
6. **AI Interaction**: Asks questions or seeks guidance through chat

#### Voice-First User Journey
1. **Voice Workout Logging**: Primary method for exercise tracking
2. **Natural Language**: Speaks exercises in conversational format
3. **Instant Feedback**: Sees parsed data and confirmation
4. **Continuous Logging**: Builds habit of voice-based interaction
5. **Progress Visualization**: Tracks voice-logged exercises in dashboard

#### Re-engagement Journey
1. **Push Notification**: Receives workout reminder or progress update
2. **Quick Return**: Uses compact interface for fast interaction
3. **AI Motivation**: Receives encouraging message and adjusted plan
4. **Flexible Restart**: Uses voice logging for quick workout updates
5. **Consistency Building**: Maintains regular usage with minimal friction

#### Power User Journey
1. **Advanced Planning**: Uses weekly planner for workout scheduling
2. **Detailed Tracking**: Combines voice, manual, and photo logging
3. **Analytics Deep Dive**: Reviews comprehensive progress metrics
4. **AI Coaching**: Regular interaction with AI assistant for optimization
5. **Goal Evolution**: Adjusts goals and plans based on progress data
