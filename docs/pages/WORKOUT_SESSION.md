
# Workout Session Page Documentation

## 1. Overview

The Workout Session page provides an immersive, focused interface for users actively performing workouts. It features real-time exercise tracking, dynamic modifications, rest timer management, and progressive logging capabilities with enhanced user interaction features.

**User Interactions:**
- Real-time exercise completion tracking
- Inline editing of sets, reps, and weights
- Drag-and-drop exercise reordering
- Rest timer management
- Superset creation and management
- RPE (Rate of Perceived Exertion) logging

## 2. UI Components & Layout

**Major Components:**
- `EnhancedWorkoutSessionCard` - Main session interface with drag-and-drop
- `RestTimerOverlay` - Global rest timer with controls
- `DragDropContext` - Drag-and-drop functionality for exercise reordering
- Inline editing controls for exercise parameters
- RPE rating system
- Superset management interface

**Layout Patterns:**
- Full-screen session focus
- Drag-and-drop enabled exercise list
- Floating rest timer overlay
- Modal-based completion summary
- Touch-optimized controls for mobile

**Responsiveness:**
- Mobile-first design with large touch targets
- Optimized for single-handed operation
- Swipe gestures for navigation
- Responsive timer display

## 3. User Actions

**Exercise Management:**
- **Reorder Exercises**: Drag-and-drop to change exercise sequence
- **Edit Parameters**: Inline editing of sets, reps, weights
- **Track Completion**: Mark sets and exercises as complete
- **Rate Effort**: Log RPE for each set
- **Create Supersets**: Group exercises for circuit training
- **Manage Rest**: Start, pause, adjust rest timers

**Session Control:**
- **Progress Tracking**: Real-time completion percentage
- **Timer Management**: Automatic and manual rest timer control
- **Session Completion**: Comprehensive workout summary
- **Template Saving**: Save modifications as new templates

## 4. Data Sources

**Supabase Tables:**
- `workout_logs` - Active session data
- `exercise_logs` - Real-time exercise completion data
- `workout_exercises` - Planned exercise parameters
- Current session state from parent components

**Real-Time Data:**
- Live exercise completion status
- Dynamic exercise order updates
- Rest timer state management
- Superset grouping information

## 5. Data Submission

**Exercise Updates:**
- Target: `exercise_logs` table
- Data: sets_completed, reps_completed, weight_used, notes (RPE)
- Frequency: Real-time updates on parameter changes

**Exercise Reordering:**
- Target: `reorder_workout_exercises` database function
- Data: exercise_id and new_position mappings
- Process: Batch update of exercise positions

**Superset Management:**
- Target: `manage_superset` and `remove_from_superset` functions
- Data: exercise_ids and superset_group_id
- Process: Group/ungroup exercises for circuit training

**Rest Timer Data:**
- Target: `exercise_logs.rest_seconds` field
- Data: Custom rest intervals per exercise
- Integration: Persistent across sessions

## 6. Live Sync / Real-Time Updates

**Real-Time Features:**
- **Exercise Progress**: Immediate UI updates on completion
- **Parameter Changes**: Live sync of sets, reps, weight modifications
- **Order Changes**: Real-time exercise reordering
- **Timer State**: Synchronized rest timer across devices
- **Superset Updates**: Live grouping/ungrouping of exercises

**Performance Optimizations:**
- Debounced parameter updates to reduce API calls
- Optimistic UI updates for immediate feedback
- Batch operations for multiple changes
- Query invalidation for dependent components

## 7. AI Assistant & OpenAI Integration

**Session Intelligence:**
- **Exercise Recognition**: AI-powered exercise identification from voice input
- **Form Analysis**: Potential integration for movement quality assessment
- **Progress Insights**: Real-time performance analysis and suggestions
- **Adaptive Programming**: AI-driven workout modifications based on performance

**Integration Points:**
- Voice logging integration with `voice-workout-parser`
- Real-time chat assistance during workouts
- Performance pattern recognition
- Automated progression suggestions

## Technical Implementation Details

**Drag-and-Drop Implementation:**
- `react-beautiful-dnd` library for smooth reordering
- Touch-optimized drag handles
- Visual feedback during drag operations
- Accessibility support for keyboard navigation

**State Management:**
- Local state for immediate UI responsiveness
- React Query for server state synchronization
- Optimistic updates with rollback on failure
- Debounced saves for performance

**Error Handling:**
- Graceful failure handling for network issues
- User feedback via toast notifications
- Data persistence strategies
- Offline mode considerations (future enhancement)

**Performance Considerations:**
- Minimal re-renders during active sessions
- Efficient update batching
- Memory management for long sessions
- Background sync optimization
