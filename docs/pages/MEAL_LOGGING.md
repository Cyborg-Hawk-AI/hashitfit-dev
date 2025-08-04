
# Meal Logging / Snap a Snack Documentation

## 1. Overview

The Meal Logging feature, branded as "Snap a Snack," provides users with AI-powered meal tracking through photo analysis. Users can capture or upload food photos, receive detailed nutritional breakdowns, and automatically log meals to their daily nutrition tracking.

**User Interactions:**
- Photo capture via device camera
- Image upload from gallery
- Meal description input for improved accuracy
- Meal type selection (breakfast, lunch, dinner, snack)
- Nutrition review and confirmation
- Manual meal editing and logging

## 2. UI Components & Layout

**Major Components:**
- `MealCaptureCard` - Primary meal logging interface
- Camera capture modal with live preview
- Image preview with editing controls
- Meal type selector
- Nutrition analysis display cards
- Food item breakdown interface

**Layout Patterns:**
- Mobile-first camera interface
- Card-based nutrition display
- Modal overlays for camera access
- Responsive image preview
- Touch-optimized controls

**Responsiveness:**
- Full-screen camera interface
- Adaptive image display
- Mobile-optimized input controls
- Responsive nutrition cards

## 3. User Actions

**Photo Management:**
- **Camera Capture**: Take photos using device camera
- **Image Upload**: Select from device gallery
- **Photo Preview**: Review and retake photos
- **Image Enhancement**: Basic editing controls

**Meal Documentation:**
- **Meal Description**: Add context for better AI analysis
- **Type Selection**: Categorize meal timing
- **Portion Notes**: Specify serving sizes
- **Manual Corrections**: Edit AI-generated nutrition data

**Nutrition Logging:**
- **Review Analysis**: Examine AI-generated nutrition breakdown
- **Confirm Logging**: Save meal data to nutrition logs
- **Edit Macros**: Adjust nutrition values if needed

## 4. Data Sources

**Supabase Tables:**
- `nutrition_logs` - Daily nutrition tracking
- `meal_logs` - Individual meal records
- User preferences for meal analysis

**Supabase Storage:**
- `meal-images` bucket - Photo storage with user organization
- Image metadata and access URLs

**External APIs:**
- OpenAI Vision API for food recognition
- Nutrition database integration for macro calculations

## 5. Data Submission

**Image Processing:**
- Target: `analyze-meal-photo` Edge Function
- Process: 
  1. Image upload to Supabase Storage
  2. AI vision analysis via OpenAI
  3. Nutrition calculation and food identification
  4. Structured data return with food items and macros

**Meal Logging:**
- Target: `meal_logs` and `nutrition_logs` tables
- Data: 
  - Meal metadata (title, type, description, image URL)
  - Detailed nutrition breakdown (calories, protein, carbs, fat)
  - Individual food item analysis
  - Consumption timestamp and user context

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- **Analysis Progress**: Live updates during AI processing
- **Nutrition Updates**: Immediate macro calculation updates
- **Daily Totals**: Real-time nutrition goal progress updates
- **Cross-Device Sync**: Meal logs sync across user devices

**Dashboard Integration:**
- Live updates to nutrition progress cards
- Daily macro target tracking
- Meal history integration
- Calorie balance calculations

## 7. AI Assistant & OpenAI Integration

**Core AI Implementation:**
- **Model**: GPT-4o with vision capabilities for food recognition
- **Processing**: Multi-stage analysis including:
  1. Food item identification
  2. Portion size estimation
  3. Nutrition calculation per item
  4. Total meal macro aggregation

**Edge Function: `analyze-meal-photo`**
- **Input**: 
  - Image URL from Supabase Storage
  - User description (optional)
  - Meal type context
  - User dietary preferences
- **Processing**:
  - OpenAI Vision API call with custom prompting
  - Food recognition and portion estimation
  - Nutrition database lookup and calculation
  - Structured JSON response generation
- **Output**:
  - Detailed food item breakdown
  - Individual nutrition per item
  - Total meal macros
  - Confidence scores and suggestions

**Advanced Features:**
- **Context Awareness**: User dietary restrictions and preferences
- **Accuracy Enhancement**: User description integration for better recognition
- **Portion Intelligence**: Visual cues for portion size estimation
- **Nutrition Precision**: Database-backed macro calculations

## Technical Implementation Details

**Image Processing Pipeline:**
1. **Capture**: Native camera API integration
2. **Optimization**: Image compression and optimization
3. **Upload**: Secure upload to Supabase Storage
4. **Analysis**: AI processing via Edge Function
5. **Display**: Structured nutrition presentation

**AI Vision Integration:**
- OpenAI GPT-4o Vision model
- Custom prompting for food recognition accuracy
- Structured output formatting for consistency
- Error handling for unrecognizable foods

**Data Flow:**
1. User captures/selects image
2. Image uploaded to Supabase Storage
3. Edge Function processes with OpenAI Vision
4. Nutrition data returned and displayed
5. User confirms and data saved to nutrition logs
6. Dashboard and progress tracking updated

**Performance Optimizations:**
- Image compression before upload
- Async processing with progress indicators
- Caching for repeated food items
- Optimistic UI updates

**Error Handling:**
- Network failure recovery
- AI analysis fallbacks
- User feedback for failed recognitions
- Manual entry options as backup

**Privacy & Security:**
- Secure image transmission
- Temporary processing URLs
- User data protection
- GDPR compliance for food data
