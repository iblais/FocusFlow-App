/**
 * Context-Aware Prioritization Engine
 * Uses ML-style scoring to auto-sort tasks based on:
 * - Current energy level and time of day
 * - Weather conditions
 * - Calendar deadlines
 * - Procrastination patterns
 * - Historical completion data
 */

import type {
  KanbanCard,
  PrioritizationContext,
  PrioritizedTask,
  EnergyPattern,
  TimeOfDay,
  Weather,
} from '@/types/adhd-task-system';

interface TaskWithContext extends KanbanCard {
  procrastinationEvents?: number;
  completionRate?: number;
}

export class PrioritizationEngine {
  private energyPatterns: EnergyPattern[] = [];
  private weatherData: { weather: Weather; temperature: number } | null = null;

  constructor() {}

  /**
   * Load historical energy patterns for predictions
   */
  async loadEnergyPatterns(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/analytics/energy-patterns?userId=${userId}`);
      if (response.ok) {
        this.energyPatterns = await response.json();
      }
    } catch (error) {
      console.error('Failed to load energy patterns:', error);
    }
  }

  /**
   * Fetch current weather data
   */
  async loadWeatherData(lat?: number, lon?: number): Promise<void> {
    try {
      // Use geolocation or default location
      const coords = lat && lon ? { lat, lon } : await this.getLocation();

      const response = await fetch(
        `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
      );

      if (response.ok) {
        this.weatherData = await response.json();
      }
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  }

  private async getLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          () => {
            // Default to a generic location if denied
            resolve({ lat: 40.7128, lon: -74.006 }); // New York
          }
        );
      } else {
        resolve({ lat: 40.7128, lon: -74.006 });
      }
    });
  }

  /**
   * Main prioritization function
   */
  async prioritizeTasks(
    tasks: TaskWithContext[],
    context: PrioritizationContext
  ): Promise<PrioritizedTask[]> {
    const prioritized = tasks.map((task) => {
      const scores = {
        energy: this.calculateEnergyMatch(task, context.currentEnergy),
        urgency: this.calculateUrgency(task, context.upcomingDeadlines),
        importance: this.calculateImportance(task),
        procrastination: this.calculateProcrastinationRisk(
          task,
          context.recentProcrastination
        ),
        timeOfDay: this.calculateTimeOfDayScore(task, context.timeOfDay),
        weather: this.calculateWeatherScore(task, context.weather),
        streak: context.streakAtRisk ? this.calculateStreakProtection(task) : 0,
      };

      // Weighted scoring
      const priorityScore =
        scores.energy * 0.25 +
        scores.urgency * 0.3 +
        scores.importance * 0.2 +
        (1 - scores.procrastination) * 0.1 +
        scores.timeOfDay * 0.1 +
        scores.weather * 0.05 +
        scores.streak * 0.1;

      // Generate reasoning
      const reasoning = this.generateReasoning(task, scores, context);

      // Suggest optimal time
      const suggestedTime = this.suggestOptimalTime(task, context);

      return {
        taskId: task.id,
        title: task.title,
        priorityScore: Math.round(priorityScore * 100),
        reasoning,
        suggestedTime,
        energyMatch: scores.energy,
        urgencyScore: scores.urgency,
        importanceScore: scores.importance,
        procrastinationRisk: scores.procrastination,
      };
    });

    // Sort by priority score (descending)
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    return prioritized;
  }

  /**
   * Calculate energy match score (0-1)
   */
  private calculateEnergyMatch(
    task: TaskWithContext,
    currentEnergy: number
  ): number {
    const energyMap = { LOW: 2, MEDIUM: 3, HIGH: 4 };
    const taskEnergy = energyMap[task.energyLevel];

    // Perfect match = 1.0, complete mismatch = 0.0
    const diff = Math.abs(taskEnergy - currentEnergy);
    return 1 - diff / 4;
  }

  /**
   * Calculate urgency score based on deadlines (0-1)
   */
  private calculateUrgency(
    task: TaskWithContext,
    upcomingDeadlines: PrioritizationContext['upcomingDeadlines']
  ): number {
    if (!task.dueDate) return 0.3; // Low urgency if no deadline

    const deadline = upcomingDeadlines.find((d) => d.taskId === task.id);
    if (!deadline) return 0.3;

    const hoursUntilDue = deadline.hoursUntilDue;

    if (hoursUntilDue < 0) return 1.0; // Overdue = max urgency
    if (hoursUntilDue < 2) return 0.95;
    if (hoursUntilDue < 6) return 0.9;
    if (hoursUntilDue < 24) return 0.8;
    if (hoursUntilDue < 72) return 0.6;
    if (hoursUntilDue < 168) return 0.4;

    return 0.2;
  }

  /**
   * Calculate importance score (0-1)
   */
  private calculateImportance(task: TaskWithContext): number {
    // Based on user-set priority (0-10 scale)
    const basePriority = task.priority / 10;

    // Boost for tasks with dependencies
    const dependencyBoost = task.dependencies && task.dependencies.length > 0 ? 0.1 : 0;

    // Boost for collaborative tasks
    const collaborationBoost =
      task.collaborators && task.collaborators.length > 0 ? 0.15 : 0;

    return Math.min(basePriority + dependencyBoost + collaborationBoost, 1.0);
  }

  /**
   * Calculate procrastination risk (0-1)
   */
  private calculateProcrastinationRisk(
    task: TaskWithContext,
    recentProcrastination: PrioritizationContext['recentProcrastination']
  ): number {
    const taskEvents = recentProcrastination.filter((e) => e.taskId === task.id);

    if (taskEvents.length === 0) return 0.3; // Default low risk

    const eventCount = taskEvents.length;
    const recencyWeight = taskEvents.some(
      (e) => new Date().getTime() - new Date(e.recordedAt).getTime() < 24 * 60 * 60 * 1000
    )
      ? 0.3
      : 0;

    // More events = higher risk
    const baseRisk = Math.min(eventCount * 0.2, 0.7);

    return Math.min(baseRisk + recencyWeight, 1.0);
  }

  /**
   * Calculate time of day score (0-1)
   */
  private calculateTimeOfDayScore(task: TaskWithContext, timeOfDay: TimeOfDay): number {
    // Match task energy to typical energy patterns by time of day
    const timeEnergyMap: Record<TimeOfDay, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      morning: 'HIGH',
      afternoon: 'MEDIUM',
      evening: 'LOW',
      night: 'LOW',
    };

    const optimalEnergy = timeEnergyMap[timeOfDay];

    return task.energyLevel === optimalEnergy ? 1.0 : 0.5;
  }

  /**
   * Calculate weather-based score (0-1)
   */
  private calculateWeatherScore(task: TaskWithContext, weather?: Weather): number {
    if (!weather || !this.weatherData) return 0.5; // Neutral if no weather data

    // Rainy/cloudy weather → favor low-energy indoor tasks
    // Sunny weather → can handle higher-energy tasks
    const weatherEnergyMap: Record<Weather, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      sunny: 'HIGH',
      cloudy: 'MEDIUM',
      rainy: 'LOW',
      stormy: 'LOW',
      foggy: 'LOW',
    };

    const weatherEnergy = weatherEnergyMap[weather];

    return task.energyLevel === weatherEnergy ? 1.0 : 0.6;
  }

  /**
   * Calculate streak protection score (0-1)
   */
  private calculateStreakProtection(task: TaskWithContext): number {
    // Prioritize quick, easy wins to maintain streak
    const isQuick = (task.estimatedTime || 60) <= 15;
    const isEasy = task.difficulty ? task.difficulty <= 3 : false;

    if (isQuick && isEasy) return 1.0;
    if (isQuick || isEasy) return 0.7;

    return 0.3;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    task: TaskWithContext,
    scores: Record<string, number>,
    context: PrioritizationContext
  ): string {
    const reasons: string[] = [];

    if (scores.urgency > 0.8) {
      reasons.push('⏰ Due very soon');
    } else if (scores.urgency > 0.6) {
      reasons.push('📅 Approaching deadline');
    }

    if (scores.energy > 0.8) {
      reasons.push('⚡ Perfect energy match');
    } else if (scores.energy < 0.4) {
      reasons.push('⚠️ Energy mismatch - consider later');
    }

    if (scores.importance > 0.8) {
      reasons.push('🎯 High importance');
    }

    if (scores.procrastination > 0.7) {
      reasons.push('🚨 High procrastination risk - tackle early');
    }

    if (context.streakAtRisk && scores.streak > 0.7) {
      reasons.push('🔥 Streak saver');
    }

    if (task.hasBlockers) {
      reasons.push('🚧 Has blockers');
    }

    if (task.collaborators && task.collaborators.length > 0) {
      reasons.push('👥 Team is waiting');
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Standard priority';
  }

  /**
   * Suggest optimal time to work on task
   */
  private suggestOptimalTime(
    task: TaskWithContext,
    context: PrioritizationContext
  ): Date | undefined {
    // If there's a deadline, suggest working on it with buffer time
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const bufferHours = 4; // 4-hour buffer before deadline
      const suggestedTime = new Date(dueDate.getTime() - bufferHours * 60 * 60 * 1000);

      if (suggestedTime > new Date()) {
        return suggestedTime;
      }
    }

    // Otherwise, suggest based on energy patterns
    const energyMap = { LOW: 2, MEDIUM: 3, HIGH: 4 };
    const taskEnergy = energyMap[task.energyLevel];

    // Find next time slot with matching energy
    const now = new Date();
    const currentHour = now.getHours();

    // Predicted peak hours by energy level
    const peakHours: Record<number, number[]> = {
      2: [21, 22, 23, 0], // Low energy → evening/night
      3: [13, 14, 15, 16], // Medium → afternoon
      4: [9, 10, 11], // High → morning
    };

    const optimalHours = peakHours[taskEnergy] || [currentHour + 1];
    const nextOptimalHour = optimalHours.find((h) => h > currentHour) || optimalHours[0];

    const suggested = new Date(now);
    suggested.setHours(nextOptimalHour, 0, 0, 0);

    if (suggested < now) {
      suggested.setDate(suggested.getDate() + 1);
    }

    return suggested;
  }

  /**
   * Get current time of day category
   */
  static getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';

    return 'night';
  }

  /**
   * Build prioritization context from current state
   */
  static async buildContext(
    userId: string,
    tasks: TaskWithContext[]
  ): Promise<PrioritizationContext> {
    // Calculate current energy (would normally come from user input or biometric data)
    const currentEnergy = 3; // Default medium energy

    // Get time of day
    const timeOfDay = PrioritizationEngine.getCurrentTimeOfDay();

    // Calculate upcoming deadlines
    const upcomingDeadlines = tasks
      .filter((t) => t.dueDate)
      .map((t) => {
        const dueDate = new Date(t.dueDate!);
        const hoursUntilDue =
          (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);

        return {
          taskId: t.id,
          dueDate,
          hoursUntilDue,
        };
      })
      .sort((a, b) => a.hoursUntilDue - b.hoursUntilDue);

    // Fetch recent procrastination events
    const recentProcrastination = await fetch(
      `/api/analytics/procrastination?userId=${userId}&days=7`
    )
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);

    // Check if streak is at risk
    const profile = await fetch(`/api/users/${userId}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    const streakAtRisk = profile
      ? profile.currentStreak > 0 &&
        tasks.filter((t) => t.boardColumn === 'done').length === 0
      : false;

    return {
      currentEnergy,
      timeOfDay,
      upcomingDeadlines,
      recentProcrastination,
      streakAtRisk,
    };
  }
}
