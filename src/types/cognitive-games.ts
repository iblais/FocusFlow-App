/**
 * Cognitive Training Games Types
 * Scientifically-backed mini-games for executive function training
 */

// ===== COMMON TYPES =====

export type GameType = 'working-memory-matrix' | 'inhibition-racer' | 'flexibility-puzzle';
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'adaptive';
export type PowerUpType = 'slow-motion' | 'hint' | 'skip' | 'shield' | 'magnet' | 'double-points';

export interface GameScore {
  id: string;
  userId: string;
  gameType: GameType;
  score: number;
  accuracy: number; // 0-1
  level: number;
  duration: number; // seconds
  powerUpsUsed: PowerUpType[];
  completedAt: Date;
  isValid: boolean; // Anti-cheat validation
  metadata?: Record<string, any>;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  highScore: number;
  averageAccuracy: number;
  totalPlayTime: number; // seconds
  streak: number;
  lastPlayed?: Date;
  achievements: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  accuracy: number;
  level: number;
  isGhost?: boolean; // Ghost data from other players
  completedAt: Date;
}

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cost: number; // coins
  cooldown: number; // seconds
  duration?: number; // seconds (if temporary)
  isActive: boolean;
  lastUsed?: Date;
}

export interface DailyChallenge {
  id: string;
  gameType: GameType;
  title: string;
  description: string;
  rules: Record<string, any>;
  reward: {
    coins: number;
    xp: number;
  };
  expiresAt: Date;
  completed: boolean;
}

export interface GameCustomization {
  character?: {
    id: string;
    name: string;
    sprite: string;
    unlocked: boolean;
  };
  theme?: {
    id: string;
    name: string;
    colors: Record<string, string>;
    unlocked: boolean;
  };
  effects?: {
    particles: boolean;
    soundEffects: boolean;
    screenShake: boolean;
  };
}

// ===== WORKING MEMORY MATRIX =====

export interface MatrixCell {
  x: number;
  y: number;
  symbol: string;
  revealed: boolean;
  correct?: boolean;
}

export interface MatrixGameState {
  gridSize: number; // 2-6
  cells: MatrixCell[];
  sequence: MatrixCell[];
  currentSequenceIndex: number;
  phase: 'memorize' | 'recall' | 'feedback' | 'complete';
  flashDuration: number; // ms
  timeRemaining: number; // ms
  score: number;
  level: number;
  lives: number;
  streak: number;
  powerUps: PowerUp[];
}

export interface MatrixConfig {
  startGridSize: number;
  maxGridSize: number;
  startFlashDuration: number;
  minFlashDuration: number;
  sequenceLength: number;
  symbols: string[];
  lives: number;
  pointsPerCorrect: number;
  streakMultiplier: number;
}

// ===== INHIBITION RACER =====

export interface GameObject {
  id: string;
  type: 'player' | 'target' | 'distractor' | 'obstacle' | 'power-up';
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  sprite: string;
  collectible: boolean;
  shouldAvoid: boolean;
  points: number;
}

export interface RacerGameState {
  player: GameObject;
  objects: GameObject[];
  score: number;
  level: number;
  speed: number;
  distance: number;
  streak: number;
  lives: number;
  coins: number;
  phase: 'ready' | 'playing' | 'paused' | 'game-over';
  powerUps: PowerUp[];
  currentRule: string; // "Collect green circles, avoid red squares"
}

export interface RacerConfig {
  startSpeed: number;
  maxSpeed: number;
  speedIncrease: number;
  laneCount: number;
  objectSpawnRate: number;
  distractorSimilarity: number; // 0-1 (how similar distractors look to targets)
  lives: number;
  pointsPerTarget: number;
  pointsPerAvoid: number;
  streakMultiplier: number;
}

// ===== FLEXIBILITY PUZZLE =====

export interface PuzzlePiece {
  id: string;
  type: string;
  shape: string;
  color: string;
  size: number;
  x: number;
  y: number;
  rotation: number;
  locked: boolean;
  group?: string;
}

export interface PuzzleRule {
  id: string;
  description: string;
  validator: (pieces: PuzzlePiece[]) => boolean;
  hint?: string;
  active: boolean;
}

export interface FlexibilityGameState {
  pieces: PuzzlePiece[];
  rules: PuzzleRule[];
  currentRuleIndex: number;
  phase: 'setup' | 'playing' | 'rule-change' | 'victory' | 'review';
  score: number;
  level: number;
  moves: number;
  optimalMoves: number;
  timeRemaining: number;
  hintsUsed: number;
  hintsAvailable: number;
  solutions: string[]; // JSON-serialized piece configurations
}

export interface FlexibilityConfig {
  startPieceCount: number;
  maxPieceCount: number;
  ruleChangeInterval: number; // moves
  timeLimit: number; // seconds
  hintsPerLevel: number;
  pointsPerSolution: number;
  efficiencyBonus: number; // Bonus for completing under optimal moves
}

// ===== GAME ENGINE =====

export interface GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  running: boolean;
  paused: boolean;
  fps: number;
  lastFrameTime: number;
  deltaTime: number;
}

export interface InputState {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    down: boolean;
    clicked: boolean;
  };
  touch: {
    x: number;
    y: number;
    active: boolean;
    started: boolean;
    ended: boolean;
  };
  gestures: {
    swipeDirection?: 'up' | 'down' | 'left' | 'right';
    pinchScale?: number;
  };
}

export interface GameSaveState {
  id: string;
  userId: string;
  gameType: GameType;
  state: any; // MatrixGameState | RacerGameState | FlexibilityGameState
  timestamp: Date;
  synced: boolean;
}

// ===== ANALYTICS =====

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  actions: GameAction[];
  finalScore: number;
  completed: boolean;
}

export interface GameAction {
  timestamp: number; // ms since session start
  type: string;
  data: any;
}

export interface CognitiveMetrics {
  workingMemoryCapacity: number; // 0-100
  inhibitionControl: number; // 0-100
  cognitiveFlexibility: number; // 0-100
  processingSpeed: number; // 0-100
  attentionSpan: number; // seconds
  errorRate: number; // 0-1
  improvementRate: number; // % per week
  lastAssessed: Date;
}

// ===== ANTI-CHEAT =====

export interface GameValidation {
  sessionId: string;
  expectedTimings: number[];
  actualTimings: number[];
  inputSequence: string;
  checksumValid: boolean;
  anomaliesDetected: string[];
  trustScore: number; // 0-1
}

export interface AchievementDefinition {
  id: string;
  gameType?: GameType;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'score' | 'accuracy' | 'streak' | 'level' | 'games-played' | 'perfect-run';
    threshold: number;
    comparison: 'gte' | 'lte' | 'eq';
  };
  reward: {
    coins: number;
    xp: number;
    unlocks?: string[];
  };
}
