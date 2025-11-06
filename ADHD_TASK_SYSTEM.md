# ADHD-Optimized Task Management System

## Overview

A comprehensive, AI-powered task management system designed specifically for ADHD users. This system predicts, adapts, and provides gentle support to help users stay on track with their goals.

## Key Features

### 1. AI Task Breakdown 2.0

**Component:** `src/components/tasks/ai-task-breakdown-2.tsx`

**Features:**
- **Visual Tree Structure**: Hierarchical view of tasks and subtasks
- **Drag-and-Drop Reordering**: Physics-based dragging with Framer Motion
- **Auto-Suggest Next Step**: AI suggests the next logical micro-step
- **Time Estimation Learning**: Improves accuracy based on historical data
- **Energy Cost Indicators**: Visual representation of task energy requirements
- **Executive Function Awareness**: Considers user's EF scores for personalization

**API Endpoints:**
- `POST /api/ai/breakdown-v2` - Enhanced task breakdown with ML predictions
- `POST /api/ai/suggest-next-step` - Auto-suggest next micro-step

**Key Types:**
- `TaskTreeNode` - Tree structure for visual hierarchy
- `MicroStep` - Individual actionable steps (5-15 min each)
- `TaskCompletionPrediction` - ML-based time estimates

---

### 2. Context-Aware Prioritization

**Service:** `src/lib/services/prioritization-engine.ts`

**Features:**
- **Energy-Based Sorting**: Matches tasks to current energy levels
- **Time-of-Day Optimization**: Suggests tasks based on circadian rhythms
- **Weather Integration**: Adapts recommendations based on weather
- **Deadline Awareness**: Urgency scoring with calendar integration
- **Procrastination Prediction**: Identifies high-risk tasks
- **Streak Protection**: Prioritizes quick wins to maintain momentum

**Scoring Algorithm:**
```typescript
priorityScore =
  energyMatch * 0.25 +
  urgency * 0.30 +
  importance * 0.20 +
  (1 - procrastinationRisk) * 0.10 +
  timeOfDay * 0.10 +
  weather * 0.05 +
  streakProtection * 0.10
```

**Key Methods:**
- `prioritizeTasks(tasks, context)` - Returns sorted task list
- `buildContext(userId, tasks)` - Gathers all contextual data
- `suggestOptimalTime(task)` - Recommends best time to work

---

### 3. Visual Kanban Board

**Component:** `src/components/tasks/kanban-board.tsx`

**Features:**
- **Physics-Based Dragging**: Natural momentum and elasticity
- **Task Aging Visualization**: Color-coded borders based on age
  - < 3 days: Gray (normal)
  - 3-7 days: Yellow (aging)
  - 7-14 days: Orange (stale)
  - 14+ days: Red with pulse (urgent)
- **Embedded Mini-Timers**: Track time per task
- **Quick Actions**: Swipe/hover for Start, Complete, Delete
- **Dependency Visualization**: Connection lines between related tasks
- **Urgency Glow**: Shadow effects for approaching deadlines

**Columns:**
- **To Do**: Tasks not yet started
- **In Progress**: Active work
- **Done**: Completed tasks with celebration

**Offline Support:**
- IndexedDB storage via `tasksDB`
- Sync flag for online/offline mode
- Change log for conflict resolution

---

### 4. Quick Capture System

**Component:** `src/components/tasks/quick-capture.tsx`

**Features:**

#### Voice-to-Task
- Browser-based audio recording
- Transcription via OpenAI Whisper (API)
- Natural language parsing for:
  - Task title
  - Due date ("tomorrow at 2pm", "next Friday")
  - Tags (auto-detected)
  - Priority (from urgency keywords)

#### Photo-to-Task (OCR)
- Camera capture or file upload
- OCR text extraction
- Checkbox detection
- Multi-task parsing from lists

#### Text-to-Task (NLP)
- Natural language understanding
- Relative date parsing
- Context extraction
- Smart defaults

**API Endpoints:**
- `POST /api/ai/voice-to-task` - Voice transcription and parsing
- `POST /api/ai/photo-to-task` - OCR and task extraction
- `POST /api/ai/parse-text-task` - NLP parsing

**Example Inputs:**
```
Voice: "Remind me to call mom tomorrow at 2pm"
→ Task: "Call mom", Due: Tomorrow 2pm

Text: "Review project proposal by Friday urgent"
→ Task: "Review project proposal", Due: Friday, Priority: 9

Photo: [Image of whiteboard checklist]
→ Multiple tasks parsed from checkboxes
```

---

### 5. Collaborative Features

**Database Models:**
- `CollaborationLink` - Accountability partnerships
- `SharedTask` - Task sharing and delegation
- `CelebrationNotification` - Progress sharing

**Features:**
- **Accountability Partners**: Mutual support relationships
- **Task Delegation**: Assign with acceptance flow
- **Progress Visibility**: Real-time updates for partners
- **Celebration Sharing**: Automatic win notifications
- **Permission Levels**:
  - View only
  - Can edit
  - Can assign tasks

**Relationship Types:**
- `ACCOUNTABILITY_PARTNER` - Mutual support
- `TASK_COLLABORATOR` - Project-based collaboration
- `PROGRESS_VIEWER` - Family/therapist oversight

---

### 6. Procrastination Guardian

**Component:** `src/components/tasks/procrastination-guardian.tsx`

**Features:**
- **Real-Time Risk Detection**: Monitors patterns every 5 minutes
- **Gentle Interventions**: ADHD-friendly messaging
- **Emotional Check-Ins**: Asks "How are you feeling?"
- **Smart Actions**:
  - Break suggestions (5-15 min)
  - Task breakdown offers
  - Accountability partner pings
  - Energy boosters
  - Micro-win recommendations

**Intervention Types:**
```typescript
- break_suggestion: "Take a 5-minute break?"
- task_breakdown: "Want to break this into smaller steps?"
- accountability_ping: "Let your partner know you need support"
- energy_boost: "Try a quick walk or stretch"
- micro_win: "Start with just the first step"
```

**Tone Styles:**
- Encouraging 💪
- Understanding 🤗
- Celebratory 🎉
- Gentle 💙

**Risk Calculation:**
Based on:
- Historical procrastination events
- Time since task creation
- Number of deferrals
- Emotional state
- Time of day patterns

---

### 7. Time Estimation Learning

**Database Model:** `TimeEstimate`

**Features:**
- Tracks estimated vs. actual time for every task
- Calculates accuracy score (0-1)
- Learns from similar tasks
- Adjusts for:
  - Energy level
  - Time of day
  - User experience (task count)
  - AI suggestions vs. user adjustments

**Learning Algorithm:**
```typescript
accuracyScore = 1 - min(|estimated - actual| / estimated, 1)

nextEstimate =
  (userHistory * 0.4) +
  (similarTasks * 0.3) +
  (aiSuggestion * 0.2) +
  (timeOfDay * 0.1)
```

**Confidence Intervals:**
Provides min/max range based on historical variance

---

## Database Schema

### New Tables

```prisma
// Task templates for recurring patterns
model TaskTemplate {
  id, userId, name, description
  taskStructure: Json // Tree of subtasks
  defaultEnergy, defaultDuration, defaultTags
  useCount, lastUsed
  bestTimeOfDay, requiredEnergy
}

// Task dependencies
model TaskRelationship {
  id, taskId, dependsOnId
  type: DependencyType // BLOCKS, SUGGESTS, REQUIRES
}

// ML-powered energy predictions
model EnergyPattern {
  id, userId
  hourOfDay, dayOfWeek
  reportedEnergy, actualEnergy
  weather, temperature, sleepQuality
  focusQuality, tasksCompleted
  recordedAt
}

// Time estimation learning
model TimeEstimate {
  id, userId, taskId
  estimatedTime, actualTime, accuracyScore
  energyLevel, timeOfDay, userExperience
  aiSuggested, userAdjusted
}

// Collaboration
model CollaborationLink {
  id, userId, partnerId
  type: RelationshipType
  canViewProgress, canEditTasks, canAssignTasks
  status: "pending" | "accepted" | "rejected"
}

model SharedTask {
  id, taskId, collaborationId
  assignedBy, assignedTo, acceptedAt
  progressPercentage
}

// Procrastination tracking
model ProcrastinationEvent {
  id, userId, taskId
  eventType, reason, emotionalState
  timeOfDay, energyLevel
  interventionShown, interventionType, interventionAccepted
}

// Change history
model TaskHistory {
  id, taskId
  changeType, oldValue, newValue
  changedBy, recordedAt
}

// Quick captures
model QuickCapture {
  id, userId
  captureMethod: "voice" | "photo" | "email" | "text"
  rawContent, mediaUrl
  parsedTitle, parsedDescription, parsedDueDate
  processed, convertedToTask, taskId
}
```

### Enhanced Task Model

```prisma
model Task {
  // ... existing fields
  boardColumn: String // "todo" | "in-progress" | "done"
  boardPosition: Int

  // New relations
  dependencies: TaskRelationship[] @relation("TaskDependencies")
  dependents: TaskRelationship[] @relation("TaskDependents")
  sharedWith: SharedTask[]
  procrastinationEvents: ProcrastinationEvent[]
  history: TaskHistory[]
  timeEstimates: TimeEstimate[]
}
```

---

## IndexedDB Offline Storage

**Database:** `focusflow-tasks-db`

**Stores:**
1. **tasks** - Full task data with sync status
2. **quick-captures** - Unprocessed voice/photo/text captures
3. **task-templates** - Frequently used patterns
4. **energy-patterns** - Local energy tracking

**Key Features:**
- Offline-first architecture
- Change logs for sync conflict resolution
- Retry logic for failed syncs
- Query optimization with indexes

**Usage:**
```typescript
import { tasksDB } from '@/lib/db/tasks-db';

// Add task offline
await tasksDB.addTask(task, userId);

// Get unsynced tasks
const unsynced = await tasksDB.getUnsyncedTasks();

// Bulk update
await tasksDB.bulkUpdateTasks(updates);
```

---

## API Routes

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/breakdown-v2` | POST | Enhanced task breakdown with ML |
| `/api/ai/suggest-next-step` | POST | Auto-suggest next micro-step |
| `/api/ai/voice-to-task` | POST | Voice transcription + parsing |
| `/api/ai/photo-to-task` | POST | OCR + task extraction |
| `/api/ai/parse-text-task` | POST | NLP task parsing |
| `/api/ai/generate-intervention` | POST | Procrastination interventions |

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/energy-patterns` | GET | User's energy patterns |
| `/api/analytics/procrastination` | GET | Procrastination history |
| `/api/analytics/procrastination-risk` | POST | Calculate risk score |
| `/api/analytics/procrastination-event` | POST | Log event |

### Task Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/learning-data` | GET | Time estimation history |
| `/api/weather` | GET | Current weather data |

---

## Usage Examples

### 1. Create Task with AI Breakdown

```typescript
import { AITaskBreakdown2 } from '@/components/tasks/ai-task-breakdown-2';

<AITaskBreakdown2
  taskTitle="Write blog post"
  taskDescription="Technical tutorial on React hooks"
  estimatedTime={60}
  energyLevel="MEDIUM"
  difficulty={6}
  userId={session.user.id}
  executiveFunctionScores={profile.efScores}
  onSave={(tree) => {
    // Save tree to database
    createTask({
      ...taskData,
      microSteps: tree.microSteps,
      subTasks: tree.subTasks
    });
  }}
/>
```

### 2. Display Kanban Board

```typescript
import { KanbanBoard } from '@/components/tasks/kanban-board';

<KanbanBoard
  userId={session.user.id}
  onTaskClick={(id) => router.push(`/tasks/${id}`)}
  onTaskStart={(id) => startFocusSession(id)}
  onTaskComplete={(id) => celebrateCompletion(id)}
/>
```

### 3. Quick Capture Widget

```typescript
import { QuickCaptureWidget } from '@/components/tasks/quick-capture';

<QuickCaptureWidget
  userId={session.user.id}
  onTaskCreated={(taskId) => {
    showNotification('Task created!');
    refreshTasks();
  }}
/>
```

### 4. Prioritization

```typescript
import { PrioritizationEngine } from '@/lib/services/prioritization-engine';

const engine = new PrioritizationEngine();
await engine.loadEnergyPatterns(userId);
await engine.loadWeatherData();

const context = await PrioritizationEngine.buildContext(userId, tasks);
const prioritized = await engine.prioritizeTasks(tasks, context);

// Display sorted tasks
prioritized.forEach(task => {
  console.log(`${task.title}: ${task.priorityScore}/100`);
  console.log(`Reasoning: ${task.reasoning}`);
});
```

### 5. Procrastination Guardian

```typescript
import { ProcrastinationGuardian } from '@/components/tasks/procrastination-guardian';

<ProcrastinationGuardian
  userId={session.user.id}
  taskId={task.id}
  taskTitle={task.title}
  onAction={(action, data) => {
    switch (action) {
      case 'take_break':
        startBreakTimer(data.duration);
        break;
      case 'show_breakdown':
        setShowBreakdown(true);
        break;
      // ... handle other actions
    }
  }}
/>
```

---

## Migration Guide

### Running Migrations

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create migration
npx prisma migrate dev --name adhd-task-system

# Apply to production
npx prisma migrate deploy
```

### Data Migration Scripts

Run these to populate initial data:

```typescript
// 1. Create default task templates
await createDefaultTemplates(userId);

// 2. Migrate existing tasks to Kanban board
await migrateTasksToKanban(userId);

// 3. Generate initial energy patterns from focus sessions
await generateEnergyPatterns(userId);
```

---

## Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...

# Optional
WEATHER_API_KEY=...  # For weather integration
TWILIO_ACCOUNT_SID=... # For SMS notifications
TWILIO_AUTH_TOKEN=...
```

### OpenAI Usage

**Models:**
- `gpt-4-turbo-preview` - Task breakdown, suggestions, interventions
- `whisper-1` - Voice transcription (if implemented)

**Estimated Costs:**
- Task breakdown: ~$0.02 per task
- Next step suggestion: ~$0.005 per suggestion
- Voice transcription: ~$0.006 per minute
- Text parsing: ~$0.003 per task

---

## Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode compatibility
- Reduced motion support

---

## Performance Optimization

1. **Lazy Loading**: Components load on-demand
2. **IndexedDB Caching**: Offline-first architecture
3. **Debounced API Calls**: Prevents excessive requests
4. **Optimistic Updates**: Instant UI feedback
5. **Virtual Scrolling**: For large task lists

---

## Testing

### Unit Tests
```bash
npm test -- ai-task-breakdown-2.test.tsx
npm test -- prioritization-engine.test.ts
```

### Integration Tests
```bash
npm test -- kanban-board.integration.test.tsx
```

### E2E Tests
```bash
npm run test:e2e -- task-flow.spec.ts
```

---

## Roadmap

### Phase 1 (Current)
- ✅ AI Task Breakdown 2.0
- ✅ Kanban Board
- ✅ Quick Capture (Voice/Text)
- ✅ Prioritization Engine
- ✅ Procrastination Guardian

### Phase 2 (Upcoming)
- 🔄 Photo-to-Task OCR implementation
- 🔄 Calendar integration (Google/Outlook)
- 🔄 Email forwarding for task creation
- 🔄 Mobile app (Capacitor)

### Phase 3 (Future)
- 📋 Biometric integration (Apple Watch, Fitbit)
- 📋 Advanced ML models for prediction
- 📋 Voice assistant integration (Alexa, Google)
- 📋 Social features and public accountability

---

## Support

For issues or questions:
1. Check the GitHub Issues
2. Review the documentation
3. Contact support@focusflow.app

---

## License

Proprietary - FocusFlow App © 2025
