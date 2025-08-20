# Data Connections Diagram: Edge Functions → Database → UI Components

## 🔗 Specific Data Flow Connections

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EDGE FUNCTIONS OUTPUT                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🏋️ WORKOUT ASSISTANT                    │  🍽️ NUTRITION ASSISTANT          │  💡 RECOMMENDATIONS ASSISTANT │
│                                          │                                 │                           │
│  Returns: {                              │  Returns: {                    │  Returns: {                │
│    success: true,                        │    success: true,              │    success: true,          │
│    data: {                               │    data: {                     │    data: {                 │
│      workout_plans: 4,                   │      nutrition_plan: "uuid",   │      recommendations: "uuid",│
│      workout_schedule: [...]             │      nutrition_data: {...}     │      recommendations_data: {...}│
│    }                                     │    }                           │    }                       │
│  }                                       │  }                             │  }                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE TABLES                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 WORKOUT DATA                         │  🍎 NUTRITION DATA               │  💭 RECOMMENDATIONS DATA   │
│                                          │                                 │                           │
│  ┌─────────────────────────────────────┐ │  ┌─────────────────────────────┐ │  ┌─────────────────────┐ │
│  │ workout_plans                       │ │  │ nutrition_plans             │ │  │ user_recommendations │ │
│  │ ├─ id: uuid                         │ │  │ ├─ id: uuid                 │ │  │ ├─ id: uuid         │ │
│  │ ├─ user_id: uuid                    │ │  │ ├─ user_id: uuid            │ │  │ ├─ user_id: uuid    │ │
│  │ ├─ title: string                    │ │  │ ├─ daily_calories: number   │ │  │ ├─ workout_tips: text│ │
│  │ ├─ category: string                 │ │  │ ├─ protein_g: number        │ │  │ ├─ nutrition_tips: text│ │
│  │ ├─ difficulty: number               │ │  │ ├─ carbs_g: number          │ │  │ ├─ weekly_goals: text│ │
│  │ ├─ estimated_duration: string       │ │  │ ├─ fat_g: number            │ │  │ ├─ created_at: timestamp│ │
│  │ └─ ai_generated: boolean            │ │  │ ├─ diet_type: string        │ │  │ └─ updated_at: timestamp│ │
│  └─────────────────────────────────────┘ │  │ └─ ai_generated: boolean    │ │  └─────────────────────┘ │
│                                          │  └─────────────────────────────┘ │                           │
│  ┌─────────────────────────────────────┐ │  ┌─────────────────────────────┐ │                           │
│  │ workout_exercises                   │ │  │ meal_plans                  │ │                           │
│  │ ├─ workout_plan_id: uuid            │ │  │ ├─ nutrition_plan_id: uuid  │ │                           │
│  │ ├─ name: string                     │ │  │ ├─ meal_type: string        │ │                           │
│  │ ├─ sets: number                     │ │  │ ├─ meal_title: string       │ │                           │
│  │ ├─ reps: string                     │ │  │ ├─ calories: number         │ │                           │
│  │ ├─ weight: string                   │ │  │ ├─ protein_g: number        │ │                           │
│  │ ├─ rest_time: string                │ │  │ ├─ carbs_g: number          │ │                           │
│  │ ├─ notes: string                    │ │  │ ├─ fat_g: number            │ │                           │
│  │ └─ order_index: number              │ │  │ └─ order_index: number      │ │                           │
│  └─────────────────────────────────────┘ │  └─────────────────────────────┘ │                           │
│                                          │                                 │                           │
│  ┌─────────────────────────────────────┐ │                                 │                           │
│  │ workout_schedule                    │ │                                 │                           │
│  │ ├─ user_id: uuid                    │ │                                 │                           │
│  │ ├─ workout_plan_id: uuid            │ │                                 │                           │
│  │ ├─ scheduled_date: date             │ │                                 │                           │
│  │ ├─ is_completed: boolean            │ │                                 │                           │
│  │ └─ completed_at: timestamp          │ │                                 │                           │
│  └─────────────────────────────────────┘ │                                 │                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    UI COMPONENTS                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🎯 DASHBOARD COMPONENTS & DATA SOURCES                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  HeroCTACard                              │  DailySnapshotRing             │  AIInsightTile            │
│  (Today's Workout)                        │  (Nutrition Progress)          │  (Coach Insights)         │
│                                          │                                 │                           │
│  ┌─────────────────────────────────────┐ │  ┌─────────────────────────────┐ │  ┌─────────────────────┐ │
│  │ ✅ CONNECTED TO:                    │ │  │ ❌ NOT CONNECTED TO:         │ │  │ ❌ NOT CONNECTED TO: │ │
│  │ workout_schedule                    │ │  │ nutrition_plans             │ │  │ user_recommendations │ │
│  │                                     │ │  │ nutrition_logs              │ │  │                     │ │
│  │ 📊 Data Used:                       │ │  │                             │ │  │ 📊 Should Use:       │ │
│  │ • title → Display workout name      │ │  │ 📊 Currently Uses:          │ │  │ • workout_tips       │ │
│  │ • exercises.length → Exercise count │ │  │ • Hardcoded values          │ │  │ • nutrition_tips     │ │
│  │ • estimated_duration → Duration     │ │  │ • Mock data                 │ │  │ • weekly_goals       │ │
│  │ • is_completed → Completion status  │ │  │                             │ │  │                     │ │
│  │                                     │ │  │ 📊 Should Use:               │ │  │ 📊 Currently Uses:   │ │
│  │ 🎨 Visual: Large card with button   │ │  │ • daily_calories → Target   │ │  │ • Hardcoded content  │ │
│  └─────────────────────────────────────┘ │  │ • protein_g → Target        │ │  │ • Static text        │ │
│                                          │  │ • consumed_calories → Progress│ │  │                     │ │
│                                          │  │ • consumed_protein → Progress│ │  │ 🎨 Visual: Insight card│ │
│                                          │  │                             │ │  └─────────────────────┘ │
│                                          │  │ 🎨 Visual: Progress rings   │ │                           │
│                                          │  └─────────────────────────────┘ │                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WeightProgressCard                       │  WeeklyTimelineView            │  CompletedItemsList       │
│  (Progress Tracking)                      │  (Weekly Overview)             │  (Today's Activities)     │
│                                          │                                 │                           │
│  ┌─────────────────────────────────────┐ │  ┌─────────────────────────────┐ │  ┌─────────────────────┐ │
│  │ ❌ NOT CONNECTED TO:                 │ │  │ ✅ CONNECTED TO:             │ │  │ ❌ NOT CONNECTED TO: │ │
│  │ progress_metrics                    │ │  │ workout_schedule            │ │  │ workout_logs         │ │
│  │ nutrition_plans                     │ │  │ nutrition_logs              │ │  │ meal_logs            │ │
│  │                                     │ │  │                             │ │  │                     │ │
│  │ 📊 Currently Uses:                  │ │  │ 📊 Data Used:               │ │  │ 📊 Currently Uses:   │ │
│  │ • Mock weight data                  │ │  │ • scheduled_date → Dates    │ │  │ • Mock activity data │ │
│  │ • Hardcoded nutrition values        │ │  │ • is_completed → Status     │ │  │ • Static list        │ │
│  │                                     │ │  │ • log_date → Meal dates     │ │  │                     │ │
│  │ 📊 Should Use:                      │ │  │                             │ │  │ 📊 Should Use:       │ │
│  │ • weight → Current weight           │ │  │ 🎨 Visual: Weekly calendar  │ │  │ • start_time → Times │ │
│  │ • measurement_date → Weight history │ │  └─────────────────────────────┘ │  │ • workout_plan_id    │ │
│  │ • daily_calories → Nutrition context│ │                                 │  │ • consumed_at → Times │ │
│  │                                     │ │                                 │  │                     │ │
│  │ 🎨 Visual: Weight trend chart       │ │                                 │  │ 🎨 Visual: Activity list│ │
│  └─────────────────────────────────────┘ │                                 │  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

## 🔄 Data Flow Status Matrix

| Component | Data Source | Connection Status | Data Used | Should Use |
|-----------|-------------|-------------------|-----------|------------|
| **HeroCTACard** | `workout_schedule` | ✅ Connected | Real workout data | ✅ Correct |
| **DailySnapshotRing** | `nutrition_plans` + `nutrition_logs` | ❌ Not Connected | Hardcoded values | Real nutrition data |
| **AIInsightTile** | `user_recommendations` | ❌ Not Connected | Hardcoded content | Real AI recommendations |
| **WeightProgressCard** | `progress_metrics` + `nutrition_plans` | ❌ Not Connected | Mock data | Real progress data |
| **WeeklyTimelineView** | `workout_schedule` + `nutrition_logs` | ✅ Connected | Real schedule data | ✅ Correct |
| **CompletedItemsList** | `workout_logs` + `meal_logs` | ❌ Not Connected | Mock data | Real activity data |

## 🎯 Missing Data Connections

### 1. **Nutrition Data Pipeline**
```
nutrition-assistant → nutrition_plans → DailySnapshotRing ❌
nutrition-assistant → meal_plans → (not used anywhere) ❌
```

### 2. **Recommendations Data Pipeline**
```
recommendations-assistant → user_recommendations → AIInsightTile ❌
```

### 3. **Progress Data Pipeline**
```
(no edge function) → progress_metrics → WeightProgressCard ❌
```

### 4. **Activity Logging Pipeline**
```
(no edge function) → workout_logs → CompletedItemsList ❌
(no edge function) → meal_logs → CompletedItemsList ❌
```

## 🚀 Required Fixes

### **Immediate (High Priority):**
1. **Connect nutrition_plans to DailySnapshotRing**
2. **Connect user_recommendations to AIInsightTile**
3. **Create NutritionService for data fetching**
4. **Create RecommendationsService for data fetching**

### **Medium Priority:**
1. **Connect progress_metrics to WeightProgressCard**
2. **Connect workout_logs to CompletedItemsList**
3. **Add real-time subscriptions**
4. **Implement proper loading states**

### **Low Priority:**
1. **Add meal_plans visualization**
2. **Create progress tracking edge function**
3. **Add activity logging edge function**
4. **Implement advanced analytics**
