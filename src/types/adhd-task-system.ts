/**
 * ADHD-Optimized Task System Types
 * Comprehensive type definitions for the advanced task management system
 */

export type DependencyType = 'BLOCKS' | 'SUGGESTS' | 'REQUIRES';
export type RelationshipType = 'ACCOUNTABILITY_PARTNER' | 'TASK_COLLABORATOR' | 'PROGRESS_VIEWER';
export type CaptureMethod = 'voice' | 'photo' | 'email' | 'text';
export type BoardColumn = 'todo' | 'in-progress' | 'done';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type Weather = 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'foggy';
export type EmotionalState = 'overwhelmed' | 'anxious' | 'unmotivated' | 'energized' | 'calm' | 'frustrated';
export type InterventionType = 'break_suggestion' | 'task_breakdown' | 'accountability_ping' | 'energy_boost' | 'micro_win';

// Micro-step structure for AI-generated task breakdown
export interface MicroStep {
  id: string;
  step: string;
  description?: string;
  estimatedTime: number; // in minutes
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  order: number;
  executiveFunctionChallenge?: string; // planning, working-memory, etc.
  transitionBuffer?: number; // minutes needed before/after
}

// Task tree node for visual tree structure
export interface TaskTreeNode {
  id: string;
  title: string;
  microSteps: MicroStep[];
  subTasks: TaskTreeNode[];
  energyCost: number; // 1-5 scale
  estimatedTime: number;
  completed: boolean;
  collapsed?: boolean; // For UI tree expansion
}

// Task template for recurring patterns
export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  taskStructure: TaskTreeNode;
  defaultEnergy: 'LOW' | 'MEDIUM' | 'HIGH';
  defaultDuration?: number;
  defaultTags: string[];
  useCount: number;
  lastUsed?: Date;
  bestTimeOfDay?: TimeOfDay;
  requiredEnergy?: number; // 1-5
}

// Task dependency relationship
export interface TaskRelationship {
  id: string;
  taskId: string;
  dependsOnId: string;
  type: DependencyType;
  createdAt: Date;
}

// Energy pattern for ML predictions
export interface EnergyPattern {
  id: string;
  userId: string;
  hourOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  reportedEnergy: number; // 1-5
  actualEnergy?: number; // Derived from performance
  weather?: Weather;
  temperature?: number;
  sleepQuality?: number; // 1-5
  focusQuality?: number; // 0-100
  tasksCompleted: number;
  recordedAt: Date;
}

// Time estimation with learning
export interface TimeEstimate {
  id: string;
  userId: string;
  taskId: string;
  estimatedTime: number;
  actualTime?: number;
  accuracyScore?: number; // 0-1
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeOfDay?: TimeOfDay;
  userExperience: number; // Number of similar tasks completed
  aiSuggested: boolean;
  userAdjusted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// Collaboration and accountability
export interface CollaborationLink {
  id: string;
  userId: string;
  partnerId: string;
  partnerName?: string;
  partnerEmail?: string;
  type: RelationshipType;
  canViewProgress: boolean;
  canEditTasks: boolean;
  canAssignTasks: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  invitedAt: Date;
  acceptedAt?: Date;
}

export interface SharedTask {
  id: string;
  taskId: string;
  collaborationId: string;
  assignedBy?: string;
  assignedTo?: string;
  assignedAt?: Date;
  acceptedAt?: Date;
  lastProgressUpdate?: Date;
  progressPercentage: number;
}

// Procrastination tracking and intervention
export interface ProcrastinationEvent {
  id: string;
  userId: string;
  taskId: string;
  eventType: 'defer' | 'skip' | 'distraction_shield' | 'context_switch';
  reason?: string;
  emotionalState?: EmotionalState;
  timeOfDay: TimeOfDay;
  energyLevel?: number;
  previousStreak: number;
  interventionShown: boolean;
  interventionType?: InterventionType;
  interventionAccepted: boolean;
  recordedAt: Date;
}

// Task history for change tracking
export interface TaskHistory {
  id: string;
  taskId: string;
  changeType: 'created' | 'updated' | 'status_change' | 'priority_change' | 'moved' | 'shared';
  oldValue?: any;
  newValue?: any;
  changedBy?: string; // userId
  recordedAt: Date;
}

// Quick capture for voice/photo/email
export interface QuickCapture {
  id: string;
  userId: string;
  captureMethod: CaptureMethod;
  rawContent: string;
  mediaUrl?: string;
  parsedTitle?: string;
  parsedDescription?: string;
  parsedDueDate?: Date;
  parsedTags: string[];
  parsedPriority?: number;
  processed: boolean;
  convertedToTask: boolean;
  taskId?: string;
  capturedAt: Date;
  processedAt?: Date;
}

// Context-aware prioritization inputs
export interface PrioritizationContext {
  currentEnergy: number; // 1-5
  timeOfDay: TimeOfDay;
  weather?: Weather;
  temperature?: number;
  upcomingDeadlines: Array<{
    taskId: string;
    dueDate: Date;
    hoursUntilDue: number;
  }>;
  recentProcrastination: ProcrastinationEvent[];
  streakAtRisk: boolean;
  calendarEvents?: Array<{
    title: string;
    start: Date;
    end: Date;
  }>;
}

// Prioritized task with AI scoring
export interface PrioritizedTask {
  taskId: string;
  title: string;
  priorityScore: number; // 0-100
  reasoning: string;
  suggestedTime?: Date;
  energyMatch: number; // How well task energy matches current energy
  urgencyScore: number;
  importanceScore: number;
  procrastinationRisk: number; // 0-1
  confidenceInterval?: {
    estimatedTime: number;
    minTime: number;
    maxTime: number;
  };
}

// Kanban board task card
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  boardColumn: BoardColumn;
  boardPosition: number;
  energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTime?: number;
  dueDate?: Date;
  tags: string[];
  priority: number;
  age: number; // Days since creation
  dependencies: string[]; // Task IDs
  hasBlockers: boolean;
  collaborators?: string[];
  microStepsCompleted?: number;
  microStepsTotal?: number;
}

// Physics-based drag state
export interface DragState {
  isDragging: boolean;
  draggedId?: string;
  startPosition?: { x: number; y: number };
  currentPosition?: { x: number; y: number };
  velocity?: { x: number; y: number };
  targetColumn?: BoardColumn;
  targetPosition?: number;
}

// AI prediction models
export interface EnergyPrediction {
  hour: number;
  predictedEnergy: number; // 1-5
  confidence: number; // 0-1
  baselineEnergy: number;
  weatherAdjustment?: number;
  sleepAdjustment?: number;
  historicalAverage: number;
}

export interface TaskCompletionPrediction {
  taskId: string;
  estimatedCompletionTime: number; // minutes
  confidence: number; // 0-1
  similarTasksData: {
    count: number;
    averageTime: number;
    userAccuracyScore: number;
  };
  adjustmentFactors: {
    energyLevel: number;
    timeOfDay: number;
    taskComplexity: number;
    userExperience: number;
  };
}

// Gentle intervention messages
export interface InterventionMessage {
  id: string;
  type: InterventionType;
  title: string;
  message: string;
  actions: Array<{
    label: string;
    action: 'break' | 'breakdown' | 'notify_partner' | 'defer' | 'simplify' | 'dismiss';
    data?: any;
  }>;
  tone: 'encouraging' | 'understanding' | 'celebratory' | 'gentle';
  displayDuration?: number; // ms
}

// Voice-to-task parsing
export interface VoiceTaskData {
  transcript: string;
  confidence: number; // 0-1
  parsedIntent: {
    action: 'create' | 'defer' | 'complete' | 'update';
    taskTitle?: string;
    dueDate?: Date;
    priority?: number;
    tags?: string[];
    duration?: number;
  };
  ambiguities?: string[];
}

// Photo-to-task OCR result
export interface PhotoTaskData {
  imageUrl: string;
  ocrText: string;
  confidence: number; // 0-1
  detectedItems: Array<{
    text: string;
    isCheckbox: boolean;
    isChecked: boolean;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  suggestedTasks: Array<{
    title: string;
    confidence: number;
  }>;
}

// Celebration notification
export interface CelebrationNotification {
  id: string;
  userId: string;
  partnerId?: string;
  achievement: string;
  message: string;
  xpEarned?: number;
  levelUp?: boolean;
  shareWithPartner: boolean;
  sentAt: Date;
}

// Task analytics for ML
export interface TaskAnalytics {
  userId: string;
  totalTasksCreated: number;
  totalTasksCompleted: number;
  averageCompletionTime: number; // minutes
  estimationAccuracy: number; // 0-1
  mostProductiveHour: number;
  mostProductiveDay: number;
  preferredEnergyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  procrastinationRate: number; // 0-1
  streakAverage: number;
  collaborationEngagement: number; // 0-1
}

// IndexedDB schema for offline support
export interface TaskOfflineRecord {
  id: string;
  data: KanbanCard;
  synced: boolean;
  lastModified: Date;
  changeLog: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: Date;
  }>;
}

export interface QuickCaptureOfflineRecord {
  id: string;
  data: QuickCapture;
  synced: boolean;
  retryCount: number;
  lastAttempt?: Date;
}
