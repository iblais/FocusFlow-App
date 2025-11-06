/**
 * ADHD Analytics Engine
 * Personal data scientist for pattern recognition and insights
 */

import type {
  RecognizedPattern,
  TaskPattern,
  EnergyPattern,
  ProductivityCondition,
  EnergyForecast,
  BurnoutRisk,
  OptimalSchedule,
  BreakRecommendation,
  WeeklyStats,
  UserComparison,
  ProgressComparison,
  GoalTrajectory,
  FocusHeatmapData,
  EnergyProductivityPoint,
} from '@/types/analytics';

export class AnalyticsEngine {
  private userId: string;
  private cacheExpiration: number = 1; // hours

  constructor(userId: string) {
    this.userId = userId;
  }

  // ===== PATTERN RECOGNITION =====

  /**
   * Discover optimal focus times based on historical data
   */
  async findOptimalFocusTimes(data: FocusHeatmapData[]): Promise<RecognizedPattern[]> {
    const patterns: RecognizedPattern[] = [];

    // Group by day of week and hour
    const groupedByDayHour: Record<string, FocusHeatmapData[]> = {};

    data.forEach(point => {
      const dayOfWeek = point.date.getDay();
      const hour = point.hour;
      const key = `${dayOfWeek}-${hour}`;

      if (!groupedByDayHour[key]) {
        groupedByDayHour[key] = [];
      }
      groupedByDayHour[key].push(point);
    });

    // Find top 3 most productive time slots
    const avgQuality: Array<{ key: string; avgQuality: number; count: number }> = [];

    Object.entries(groupedByDayHour).forEach(([key, points]) => {
      const avg = points.reduce((sum, p) => sum + p.quality, 0) / points.length;
      avgQuality.push({ key, avgQuality: avg, count: points.length });
    });

    avgQuality
      .sort((a, b) => b.avgQuality - a.avgQuality)
      .slice(0, 3)
      .forEach((slot, index) => {
        const [dayOfWeek, hour] = slot.key.split('-').map(Number);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        const timeStr = `${hour}:00`;

        patterns.push({
          id: `optimal-time-${index}`,
          type: 'time-of-day',
          confidence: Math.min(slot.count / 10, 1),
          insight: `You focus best at ${timeStr} on ${dayName}s`,
          data: {
            metric: 'focus-quality',
            value: Math.round(slot.avgQuality),
            context: `Based on ${slot.count} sessions`,
          },
          actionable: {
            recommendation: `Schedule your most important tasks for ${dayName}s at ${timeStr}`,
            impact: 'high',
          },
          discoveredAt: new Date(),
        });
      });

    return patterns;
  }

  /**
   * Identify task keywords that consistently take longer than estimated
   */
  async analyzeTaskEstimationAccuracy(tasks: Array<{
    title: string;
    estimatedTime: number;
    actualTime: number;
  }>): Promise<TaskPattern[]> {
    // Extract keywords from task titles
    const keywordData: Record<string, { estimated: number[]; actual: number[] }> = {};

    tasks.forEach(task => {
      const words = task.title.toLowerCase().split(/\s+/);

      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          if (!keywordData[word]) {
            keywordData[word] = { estimated: [], actual: [] };
          }
          keywordData[word].estimated.push(task.estimatedTime);
          keywordData[word].actual.push(task.actualTime);
        }
      });
    });

    // Calculate patterns
    const patterns: TaskPattern[] = [];

    Object.entries(keywordData).forEach(([keyword, times]) => {
      if (times.estimated.length < 3) return; // Need at least 3 samples

      const avgEstimated = times.estimated.reduce((a, b) => a + b, 0) / times.estimated.length;
      const avgActual = times.actual.reduce((a, b) => a + b, 0) / times.actual.length;
      const accuracyDelta = ((avgActual - avgEstimated) / avgEstimated) * 100;

      // Only report significant deviations (>20%)
      if (Math.abs(accuracyDelta) > 20) {
        patterns.push({
          keyword,
          avgEstimatedTime: Math.round(avgEstimated),
          avgActualTime: Math.round(avgActual),
          accuracyDelta: Math.round(accuracyDelta),
          sampleSize: times.estimated.length,
          confidence: Math.min(times.estimated.length / 10, 1),
        });
      }
    });

    return patterns.sort((a, b) => Math.abs(b.accuracyDelta) - Math.abs(a.accuracyDelta));
  }

  /**
   * Detect energy crash triggers
   */
  async detectEnergyCrashTriggers(energyData: EnergyProductivityPoint[]): Promise<EnergyPattern[]> {
    const patterns: EnergyPattern[] = [];
    const crashes: Array<{ before: EnergyProductivityPoint; after: EnergyProductivityPoint }> = [];

    // Sort by timestamp
    const sorted = [...energyData].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Find crashes (energy drop of 2+ points)
    for (let i = 1; i < sorted.length; i++) {
      const before = sorted[i - 1];
      const after = sorted[i];

      if (before.energyLevel - after.energyLevel >= 2) {
        crashes.push({ before, after });
      }
    }

    // Analyze common triggers
    const triggerCounts: Record<string, {
      count: number;
      avgBefore: number;
      avgAfter: number;
      avgTimeDelta: number;
    }> = {};

    crashes.forEach(({ before, after }) => {
      const timeDelta = (after.timestamp.getTime() - before.timestamp.getTime()) / (1000 * 60);
      const hourOfDay = before.timestamp.getHours();

      let trigger = '';
      if (hourOfDay >= 14 && hourOfDay <= 16) trigger = 'afternoon dip (2-4pm)';
      else if (before.tasksCompleted > 5) trigger = 'completing multiple tasks in succession';
      else if (timeDelta > 90) trigger = 'long work sessions without breaks';
      else trigger = 'unknown trigger';

      if (!triggerCounts[trigger]) {
        triggerCounts[trigger] = {
          count: 0,
          avgBefore: 0,
          avgAfter: 0,
          avgTimeDelta: 0,
        };
      }

      triggerCounts[trigger].count++;
      triggerCounts[trigger].avgBefore += before.energyLevel;
      triggerCounts[trigger].avgAfter += after.energyLevel;
      triggerCounts[trigger].avgTimeDelta += timeDelta;
    });

    // Convert to patterns
    Object.entries(triggerCounts).forEach(([trigger, data]) => {
      patterns.push({
        trigger,
        beforeEnergy: data.avgBefore / data.count,
        afterEnergy: data.avgAfter / data.count,
        timeDelta: Math.round(data.avgTimeDelta / data.count),
        occurrences: data.count,
        confidence: Math.min(data.count / 5, 1),
      });
    });

    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Identify high-productivity conditions
   */
  async findProductivityConditions(data: EnergyProductivityPoint[]): Promise<ProductivityCondition[]> {
    const conditions: ProductivityCondition[] = [];

    // Group by hour of day
    const morningData = data.filter(d => d.timestamp.getHours() >= 6 && d.timestamp.getHours() < 12);
    const afternoonData = data.filter(d => d.timestamp.getHours() >= 12 && d.timestamp.getHours() < 18);
    const eveningData = data.filter(d => d.timestamp.getHours() >= 18);

    const avgProductivity = data.reduce((sum, d) => sum + d.tasksCompleted, 0) / data.length;

    // Morning productivity
    if (morningData.length > 5) {
      const morningAvg = morningData.reduce((sum, d) => sum + d.tasksCompleted, 0) / morningData.length;
      const multiplier = morningAvg / avgProductivity;

      if (multiplier > 1.5) {
        conditions.push({
          condition: 'working in the morning',
          productivityMultiplier: Math.round(multiplier * 10) / 10,
          sampleSize: morningData.length,
          contexts: ['6am-12pm'],
          confidence: Math.min(morningData.length / 20, 1),
        });
      }
    }

    // High energy correlation
    const highEnergyData = data.filter(d => d.energyLevel >= 4);
    if (highEnergyData.length > 5) {
      const highEnergyAvg = highEnergyData.reduce((sum, d) => sum + d.tasksCompleted, 0) / highEnergyData.length;
      const multiplier = highEnergyAvg / avgProductivity;

      if (multiplier > 1.3) {
        conditions.push({
          condition: 'having high energy levels',
          productivityMultiplier: Math.round(multiplier * 10) / 10,
          sampleSize: highEnergyData.length,
          contexts: ['energy level 4-5'],
          confidence: Math.min(highEnergyData.length / 20, 1),
        });
      }
    }

    return conditions.sort((a, b) => b.productivityMultiplier - a.productivityMultiplier);
  }

  // ===== PREDICTIVE ANALYTICS =====

  /**
   * Forecast tomorrow's energy levels
   */
  async forecastEnergy(historicalData: EnergyProductivityPoint[]): Promise<EnergyForecast> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayOfWeek = tomorrow.getDay();

    // Group historical data by day of week and hour
    const patterns: Record<number, { sum: number; count: number }> = {};

    historicalData.forEach(point => {
      if (point.timestamp.getDay() === dayOfWeek) {
        const hour = point.timestamp.getHours();
        if (!patterns[hour]) {
          patterns[hour] = { sum: 0, count: 0 };
        }
        patterns[hour].sum += point.energyLevel;
        patterns[hour].count++;
      }
    });

    // Generate hourly predictions
    const hourlyPredictions = [];
    for (let hour = 6; hour < 24; hour++) {
      const pattern = patterns[hour];
      let predictedEnergy = 3; // Default
      let confidence = 0.3;

      if (pattern && pattern.count > 0) {
        predictedEnergy = pattern.sum / pattern.count;
        confidence = Math.min(pattern.count / 10, 0.9);
      }

      const factors = [];
      if (hour >= 6 && hour < 10) factors.push('morning boost');
      if (hour >= 14 && hour < 16) factors.push('afternoon dip');
      if (hour >= 20) factors.push('evening wind-down');

      hourlyPredictions.push({
        hour,
        predictedEnergy: Math.round(predictedEnergy * 10) / 10,
        confidence,
        factors,
      });
    }

    // Determine overall trend
    const avgFirst = hourlyPredictions.slice(0, 6).reduce((sum, p) => sum + p.predictedEnergy, 0) / 6;
    const avgLast = hourlyPredictions.slice(-6).reduce((sum, p) => sum + p.predictedEnergy, 0) / 6;

    let overallTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (avgLast > avgFirst + 0.5) overallTrend = 'increasing';
    else if (avgLast < avgFirst - 0.5) overallTrend = 'decreasing';

    return {
      date: tomorrow,
      hourlyPredictions,
      overallTrend,
    };
  }

  /**
   * Calculate burnout risk based on multiple factors
   */
  async calculateBurnoutRisk(recentData: {
    focusHours: number[];
    energyLevels: number[];
    taskCompletionRates: number[];
    streakDays: number;
  }): Promise<BurnoutRisk> {
    const factors: BurnoutRisk['factors'] = [];
    let totalScore = 0;

    // Factor 1: Excessive work hours
    const avgFocusHours = recentData.focusHours.reduce((a, b) => a + b, 0) / recentData.focusHours.length;
    if (avgFocusHours > 8) {
      const contribution = Math.min((avgFocusHours - 8) / 8, 0.4);
      factors.push({
        factor: 'Long work hours',
        contribution,
        trend: recentData.focusHours[recentData.focusHours.length - 1] > avgFocusHours ? 'worsening' : 'improving',
      });
      totalScore += contribution * 100;
    }

    // Factor 2: Declining energy
    const energyTrend = this.calculateTrend(recentData.energyLevels);
    if (energyTrend < -0.1) {
      const contribution = Math.min(Math.abs(energyTrend) / 2, 0.3);
      factors.push({
        factor: 'Declining energy levels',
        contribution,
        trend: 'worsening',
      });
      totalScore += contribution * 100;
    }

    // Factor 3: Dropping task completion
    const completionTrend = this.calculateTrend(recentData.taskCompletionRates);
    if (completionTrend < -0.1) {
      const contribution = Math.min(Math.abs(completionTrend) / 2, 0.3);
      factors.push({
        factor: 'Decreasing task completion',
        contribution,
        trend: 'worsening',
      });
      totalScore += contribution * 100;
    }

    // Determine risk level
    let riskLevel: BurnoutRisk['riskLevel'];
    let recommendation: string;

    if (totalScore > 70) {
      riskLevel = 'critical';
      recommendation = 'Take immediate action. Consider taking a day off and speaking with a healthcare provider.';
    } else if (totalScore > 50) {
      riskLevel = 'high';
      recommendation = 'Reduce your workload and prioritize rest. Schedule breaks throughout the day.';
    } else if (totalScore > 30) {
      riskLevel = 'moderate';
      recommendation = 'Be mindful of your energy. Add more self-care activities to your routine.';
    } else {
      riskLevel = 'low';
      recommendation = 'You\'re doing great! Keep maintaining healthy work-rest balance.';
    }

    const nextCheckIn = new Date();
    nextCheckIn.setDate(nextCheckIn.getDate() + (riskLevel === 'critical' ? 1 : riskLevel === 'high' ? 3 : 7));

    return {
      riskLevel,
      score: Math.round(totalScore),
      factors,
      recommendation,
      nextCheckIn,
    };
  }

  /**
   * Suggest optimal task scheduling for tomorrow
   */
  async suggestOptimalSchedule(
    energyForecast: EnergyForecast,
    tasks: Array<{ id: string; title: string; energyRequired: number; estimatedTime: number }>
  ): Promise<OptimalSchedule> {
    const slots: OptimalSchedule['slots'] = [];
    const tomorrow = energyForecast.date;

    // Sort tasks by energy requirement (high to low)
    const sortedTasks = [...tasks].sort((a, b) => b.energyRequired - a.energyRequired);

    // Match tasks to forecast slots
    sortedTasks.forEach(task => {
      // Find best time slot for this task
      const bestSlot = energyForecast.hourlyPredictions.find(
        p => p.predictedEnergy >= task.energyRequired && p.confidence > 0.5
      );

      if (bestSlot) {
        const startTime = new Date(tomorrow);
        startTime.setHours(bestSlot.hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + task.estimatedTime);

        slots.push({
          startTime,
          endTime,
          taskType: task.title,
          reason: `Your energy is predicted to be ${bestSlot.predictedEnergy.toFixed(1)}/5 at this time`,
          energyLevel: bestSlot.predictedEnergy,
          confidence: bestSlot.confidence,
        });
      }
    });

    return {
      date: tomorrow,
      slots: slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    };
  }

  /**
   * Recommend break timing
   */
  async recommendBreaks(currentFocusMinutes: number, energyLevel: number): Promise<BreakRecommendation[]> {
    const recommendations: BreakRecommendation[] = [];
    const now = new Date();

    // Micro-break (2-5 min) every 25-30 minutes
    if (currentFocusMinutes >= 25) {
      recommendations.push({
        suggestedTime: new Date(now.getTime() + 5 * 60 * 1000),
        duration: 5,
        type: 'micro',
        reason: 'You\'ve been focusing for 25+ minutes. Time for a quick stretch!',
        urgency: 'medium',
      });
    }

    // Short break (10-15 min) if energy is low
    if (energyLevel <= 2) {
      recommendations.push({
        suggestedTime: now,
        duration: 15,
        type: 'short',
        reason: 'Your energy is low. A longer break will help you recharge.',
        urgency: 'high',
      });
    }

    // Long break (30+ min) after 2+ hours
    if (currentFocusMinutes >= 120) {
      recommendations.push({
        suggestedTime: now,
        duration: 30,
        type: 'long',
        reason: 'You\'ve been working for 2+ hours. Time for a proper break!',
        urgency: 'high',
      });
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  // ===== HELPER METHODS =====

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
}
