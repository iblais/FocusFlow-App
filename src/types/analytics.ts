/**
 * ADHD Analytics Types
 * Comprehensive data structures for personal data science dashboard
 */

// ===== TIME SERIES DATA =====

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface FocusHeatmapData {
  date: Date;
  hour: number;
  focusMinutes: number;
  quality: number; // 0-100
  distractionCount: number;
}

export interface EnergyProductivityPoint {
  timestamp: Date;
  energyLevel: number; // 1-5
  tasksCompleted: number;
  focusQuality: number; // 0-100
  workingMemoryScore?: number;
}

export interface DistractionEvent {
  timestamp: Date;
  type: string;
  duration: number; // seconds
  context: {
    taskId?: string;
    timeOfDay: string;
    energyLevel: number;
  };
}

// ===== PATTERN RECOGNITION =====

export interface RecognizedPattern {
  id: string;
  type: 'time-of-day' | 'task-type' | 'energy-crash' | 'productivity-spike' | 'distraction-trigger';
  confidence: number; // 0-1
  insight: string;
  data: {
    metric: string;
    value: number;
    comparison?: number;
    context: string;
  };
  actionable: {
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
  };
  discoveredAt: Date;
}

export interface TaskPattern {
  keyword: string;
  avgEstimatedTime: number;
  avgActualTime: number;
  accuracyDelta: number; // % difference
  sampleSize: number;
  confidence: number;
}

export interface EnergyPattern {
  trigger: string;
  beforeEnergy: number;
  afterEnergy: number;
  timeDelta: number; // minutes
  occurrences: number;
  confidence: number;
}

export interface ProductivityCondition {
  condition: string;
  productivityMultiplier: number;
  sampleSize: number;
  contexts: string[];
  confidence: number;
}

// ===== PREDICTIVE ANALYTICS =====

export interface EnergyForecast {
  date: Date;
  hourlyPredictions: Array<{
    hour: number;
    predictedEnergy: number; // 1-5
    confidence: number; // 0-1
    factors: string[];
  }>;
  overallTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface BurnoutRisk {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  score: number; // 0-100
  factors: Array<{
    factor: string;
    contribution: number; // 0-1
    trend: 'improving' | 'stable' | 'worsening';
  }>;
  recommendation: string;
  nextCheckIn: Date;
}

export interface OptimalSchedule {
  date: Date;
  slots: Array<{
    startTime: Date;
    endTime: Date;
    taskType: string;
    reason: string;
    energyLevel: number;
    confidence: number;
  }>;
}

export interface BreakRecommendation {
  suggestedTime: Date;
  duration: number; // minutes
  type: 'micro' | 'short' | 'long';
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

// ===== WEEKLY REPORT CARD =====

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  focusTime: {
    total: number; // minutes
    average: number;
    trend: number; // % change from last week
    bestDay: Date;
  };
  tasksCompleted: {
    total: number;
    average: number;
    trend: number;
    breakdown: Record<string, number>;
  };
  energy: {
    average: number;
    trend: number;
    bestTime: string;
    worstTime: string;
  };
  distractions: {
    total: number;
    average: number;
    trend: number;
    topTriggers: Array<{ trigger: string; count: number }>;
  };
  achievements: Achievement[];
  improvements: Improvement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  celebration: {
    animation: string;
    sound?: string;
    confetti: boolean;
  };
}

export interface Improvement {
  area: string;
  currentScore: number;
  previousScore: number;
  percentChange: number;
  tips: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface VictoryCard {
  id: string;
  userId: string;
  weekStart: Date;
  highlights: {
    stat: string;
    value: string;
    emoji: string;
  }[];
  achievement?: Achievement;
  gradient: string;
  shareUrl: string;
  imageUrl?: string; // Generated card image
}

// ===== COMPARATIVE ANALYTICS =====

export interface UserComparison {
  metric: string;
  userValue: number;
  percentile: number; // 0-100 (your rank among similar users)
  similarUsersAverage: number;
  interpretation: string;
}

export interface ProgressComparison {
  metric: string;
  current: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  threeMonthsAgo: number;
  trend: 'improving' | 'stable' | 'declining';
  growthRate: number; // % per week
}

export interface GoalTrajectory {
  goalId: string;
  goalName: string;
  target: number;
  current: number;
  progress: number; // 0-1
  projectedCompletion: Date;
  onTrack: boolean;
  history: Array<{ date: Date; value: number }>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  value: number;
  achieved: boolean;
  achievedAt?: Date;
  celebration: {
    message: string;
    reward: string;
  };
}

// ===== ANALYTICS PROCESSING =====

export interface AnalyticsJob {
  id: string;
  type: 'pattern-recognition' | 'prediction' | 'report-generation' | 'comparison';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-1
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface AnalyticsCache {
  key: string;
  data: any;
  computedAt: Date;
  expiresAt: Date;
  version: number;
}

export interface DataAggregation {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: Record<string, number>;
  samples: number;
}

// ===== VISUALIZATION DATA =====

export interface HeatmapCell {
  x: number | string;
  y: number | string;
  value: number;
  label?: string;
  color?: string;
}

export interface SunburstNode {
  name: string;
  value: number;
  children?: SunburstNode[];
  color?: string;
  percentage?: number;
}

export interface ProductivityLandscape3D {
  points: Array<{
    x: number; // hour of day
    y: number; // day of week
    z: number; // productivity score
    color: string;
  }>;
  peaks: Array<{ x: number; y: number; z: number; label: string }>;
  valleys: Array<{ x: number; y: number; z: number; label: string }>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

// ===== REPORT EXPORT =====

export interface PDFReport {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  sections: Array<{
    title: string;
    type: 'stats' | 'chart' | 'insights' | 'recommendations';
    content: any;
  }>;
  generatedAt: Date;
  format: 'therapist' | 'coach' | 'personal';
}

export interface TherapistReport extends PDFReport {
  format: 'therapist';
  clinicalMetrics: {
    executiveFunctionScores: Record<string, number>;
    symptomSeverity: Record<string, number>;
    medicationEffectiveness?: number;
    lifestyleFactors: string[];
  };
  concerningPatterns: string[];
  recommendations: string[];
}

// ===== ANALYTICS CONFIG =====

export interface AnalyticsConfig {
  enablePatternRecognition: boolean;
  enablePredictions: boolean;
  enableComparisons: boolean;
  minSampleSize: number;
  confidenceThreshold: number;
  cacheExpiration: number; // hours
  workerThreads: number;
  updateInterval: number; // minutes
}
