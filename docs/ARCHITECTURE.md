
# Architecture Diagram
## Hashim - AI-Powered Personal Fitness Trainer

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend]
        PWA[Progressive Web App]
        Camera[Device Camera]
        Microphone[Voice Input]
    end
    
    subgraph "API Gateway"
        Router[React Router]
        Auth[Auth Guard]
        Query[TanStack Query]
    end
    
    subgraph "Supabase Backend"
        AuthS[Supabase Auth]
        DB[(PostgreSQL)]
        Storage[Supabase Storage]
        RT[Real-time Engine]
        EdgeFn[Edge Functions]
    end
    
    subgraph "AI Services"
        OpenAI[OpenAI GPT-4]
        Whisper[OpenAI Whisper]
        AWS[AWS Rekognition]
    end
    
    subgraph "External APIs"
        Nutrition[Nutrition APIs]
        Exercise[Exercise APIs]
    end
    
    UI --> Router
    Router --> Auth
    Auth --> Query
    Query --> AuthS
    Query --> DB
    Query --> Storage
    Query --> RT
    
    Camera --> Storage
    Microphone --> EdgeFn
    Storage --> EdgeFn
    EdgeFn --> OpenAI
    EdgeFn --> Whisper
    EdgeFn --> AWS
    EdgeFn --> DB
    
    OpenAI --> Nutrition
    OpenAI --> Exercise
    
    DB --> RT
    RT --> UI
    
    style UI fill:#e1f5fe
    style DB fill:#f3e5f5
    style OpenAI fill:#fff3e0
    style AWS fill:#e8f5e8
    style Whisper fill:#e8f5e8
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase
    participant E as Edge Function
    participant AI as OpenAI/AWS
    
    Note over U,AI: Workout Plan Generation
    U->>F: Complete Assessment
    F->>S: Store Assessment Data
    S->>E: Trigger Analysis
    E->>AI: Generate Workout Plan
    AI->>E: Return Plan Data
    E->>S: Store Workout Plan
    S->>F: Update UI
    F->>U: Display Personalized Plan
    
    Note over U,AI: Voice Workout Logging
    U->>F: Voice Input (Microphone)
    F->>S: Upload Audio
    S->>E: Process Audio
    E->>AI: Transcribe with Whisper
    AI->>E: Return Transcript
    E->>AI: Parse Exercise Data
    AI->>E: Return Structured Data
    E->>S: Store Exercise Log
    S->>F: Real-time Update
    F->>U: Show Updated Workout
    
    Note over U,AI: Meal Photo Analysis
    U->>F: Capture Meal Photo
    F->>S: Upload Image
    S->>E: Process Image
    E->>AI: Analyze Food Items
    AI->>E: Return Nutrition Data
    E->>S: Store Meal Log
    S->>F: Real-time Update
    F->>U: Show Analysis Results
    
    Note over U,AI: AI Chat Interaction
    U->>F: Send Chat Message
    F->>S: Store Message
    S->>E: Process with Context
    E->>AI: Generate Response
    AI->>E: Return AI Response
    E->>S: Store Response
    S->>F: Stream Response
    F->>U: Display AI Message
```

### Component Architecture

```mermaid
graph LR
    subgraph "Pages"
        Login[Login]
        Dashboard[Dashboard]
        Assessment[Assessment]
        Profile[Profile]
        Workouts[Workouts]
        Progress[Progress]
        Planner[Planner]
    end
    
    subgraph "Dashboard Components"
        DashCards[Dashboard Cards]
        MealCapture[MealCaptureCard]
        VoiceInput[VoiceInput]
        WorkoutCard[WorkoutCard]
        DayTabs[DayTab]
    end
    
    subgraph "Modular Dashboard"
        WorkoutSummary[DailyWorkoutSummaryCard]
        NutritionProgress[NutritionProgressCard]
        TDEEBalance[TDEEBalanceCard]
        HabitStreak[HabitStreakCard]
        AIInsights[AICoachInsightCard]
    end
    
    subgraph "Chat & Voice"
        ChatFAB[ChatFAB]
        ChatInterface[ChatInterface]
        VoiceProcessor[Voice Processing]
    end
    
    subgraph "Hooks"
        Auth[useAuth]
        Query[useQuery]
        Mutation[useMutation]
    end
    
    subgraph "Services"
        WorkoutSvc[WorkoutService]
        NutritionSvc[NutritionService]
        ChatSvc[ChatService]
        AssessmentSvc[AssessmentService]
    end
    
    subgraph "Context"
        UserCtx[UserContext]
        ThemeCtx[ThemeContext]
    end
    
    Pages --> DashCards
    Pages --> ModularDash
    DashCards --> MealCapture
    DashCards --> VoiceInput
    ModularDash --> WorkoutSummary
    ModularDash --> NutritionProgress
    Chat --> ChatInterface
    Pages --> Hooks
    Hooks --> Services
    Components --> Context
    
    style Pages fill:#e3f2fd
    style DashCards fill:#f1f8e9
    style ModularDash fill:#fff8e1
    style Chat fill:#fce4ec
    style Services fill:#f3e5f5
```

### Database Schema Relationships

```mermaid
erDiagram
    users ||--|| profiles : has
    users ||--o{ workout_plans : creates
    users ||--o{ workout_logs : completes
    users ||--o{ workout_schedule : schedules
    users ||--o{ nutrition_logs : tracks
    users ||--o{ chat_messages : sends
    users ||--o{ progress_metrics : records
    users ||--o{ assessment_data : completes
    
    workout_plans ||--o{ workout_exercises : contains
    workout_plans ||--o{ workout_schedule : scheduled
    
    workout_schedule ||--o| workout_logs : generates
    workout_logs ||--o{ exercise_logs : contains
    
    nutrition_logs ||--o{ meal_logs : contains
    
    users {
        uuid id PK
        string email
        timestamp created_at
    }
    
    profiles {
        uuid id PK
        string name
        int age
        string gender
        float height
        float weight
        string fitness_goal
        int workout_frequency
        string diet
        string equipment
        boolean has_completed_assessment
    }
    
    workout_plans {
        uuid id PK
        uuid user_id FK
        string title
        text description
        boolean ai_generated
        string category
        int difficulty
        string estimated_duration
        string[] target_muscles
    }
    
    workout_exercises {
        uuid id PK
        uuid workout_plan_id FK
        string name
        int sets
        string reps
        string weight
        string rest_time
        text notes
        int order_index
    }
    
    workout_schedule {
        uuid id PK
        uuid user_id FK
        uuid workout_plan_id FK
        date scheduled_date
        string scheduled_time
        boolean is_completed
        uuid workout_log_id FK
        date completion_date
        string duration
        text notes
    }
    
    workout_logs {
        uuid id PK
        uuid user_id FK
        uuid workout_plan_id FK
        timestamp start_time
        timestamp end_time
        text notes
    }
    
    exercise_logs {
        uuid id PK
        uuid workout_log_id FK
        string exercise_name
        int sets_completed
        string reps_completed
        string weight_used
        string rest_time
        int order_index
        text notes
    }
    
    nutrition_logs {
        uuid id PK
        uuid user_id FK
        date log_date
        int total_calories
        int total_protein_g
        int total_carbs_g
        int total_fat_g
    }
    
    chat_messages {
        uuid id PK
        uuid user_id FK
        text message
        string role
        timestamp created_at
    }
```

### Edge Functions Architecture

```mermaid
graph TD
    subgraph "Edge Functions"
        AnalyzeFitness[analyze-fitness-assessment]
        GenerateWorkout[generate-workout]
        AnalyzeMeal[analyze-meal-photo]
        AIChat[ai-chat]
        VoiceParser[voice-workout-parser]
    end
    
    subgraph "AI Services Integration"
        GPT4[OpenAI GPT-4]
        Whisper[OpenAI Whisper]
        Rekognition[AWS Rekognition]
    end
    
    AnalyzeFitness --> GPT4
    GenerateWorkout --> GPT4
    AnalyzeMeal --> GPT4
    AnalyzeMeal --> Rekognition
    AIChat --> GPT4
    VoiceParser --> Whisper
    VoiceParser --> GPT4
    
    style AnalyzeFitness fill:#e3f2fd
    style GenerateWorkout fill:#f1f8e9
    style AnalyzeMeal fill:#fff8e1
    style AIChat fill:#fce4ec
    style VoiceParser fill:#f3e5f5
```
