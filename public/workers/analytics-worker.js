/**
 * Analytics Web Worker
 * Handles heavy analytics computations off the main thread
 */

self.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;

  try {
    let result;

    switch (type) {
      case 'CALCULATE_PATTERNS':
        result = await calculatePatterns(data);
        break;

      case 'GENERATE_HEATMAP':
        result = await generateHeatmap(data);
        break;

      case 'COMPUTE_STATS':
        result = await computeStats(data);
        break;

      case 'FORECAST_ENERGY':
        result = await forecastEnergy(data);
        break;

      case 'CALCULATE_BURNOUT':
        result = await calculateBurnoutRisk(data);
        break;

      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({
      id,
      type: 'SUCCESS',
      result,
    });
  } catch (error) {
    self.postMessage({
      id,
      type: 'ERROR',
      error: error.message,
    });
  }
});

// ===== COMPUTATION FUNCTIONS =====

async function calculatePatterns(data) {
  const { focusData, taskData, energyData } = data;

  // Simulate heavy computation
  const patterns = [];

  // Find peak focus times
  const hourlyFocus = {};
  focusData.forEach((point) => {
    const hour = new Date(point.timestamp).getHours();
    if (!hourlyFocus[hour]) {
      hourlyFocus[hour] = { total: 0, count: 0 };
    }
    hourlyFocus[hour].total += point.quality;
    hourlyFocus[hour].count++;
  });

  // Find top 3 hours
  const topHours = Object.entries(hourlyFocus)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgQuality: data.total / data.count,
    }))
    .sort((a, b) => b.avgQuality - a.avgQuality)
    .slice(0, 3);

  topHours.forEach((slot, i) => {
    patterns.push({
      id: `peak-time-${i}`,
      type: 'time-of-day',
      insight: `Peak focus at ${slot.hour}:00`,
      confidence: 0.8,
    });
  });

  return patterns;
}

async function generateHeatmap(data) {
  const { startDate, endDate, focusData } = data;

  const heatmap = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    for (let hour = 0; hour < 24; hour++) {
      const cellData = focusData.filter((point) => {
        const pointDate = new Date(point.timestamp);
        return (
          pointDate.toDateString() === d.toDateString() &&
          pointDate.getHours() === hour
        );
      });

      const avgQuality =
        cellData.length > 0
          ? cellData.reduce((sum, p) => sum + p.quality, 0) / cellData.length
          : 0;

      heatmap.push({
        date: new Date(d),
        hour,
        value: Math.round(avgQuality),
      });
    }
  }

  return heatmap;
}

async function computeStats(data) {
  const { focusData, taskData, energyData } = data;

  const stats = {
    totalFocusTime: focusData.reduce((sum, p) => sum + p.duration, 0),
    avgFocusQuality:
      focusData.reduce((sum, p) => sum + p.quality, 0) / focusData.length || 0,
    tasksCompleted: taskData.filter((t) => t.completed).length,
    avgEnergyLevel:
      energyData.reduce((sum, p) => sum + p.level, 0) / energyData.length || 0,
  };

  return stats;
}

async function forecastEnergy(data) {
  const { historicalData } = data;

  // Simple moving average prediction
  const recentAvg =
    historicalData.slice(-7).reduce((sum, p) => sum + p.level, 0) / 7;

  const forecast = [];
  for (let hour = 6; hour < 24; hour++) {
    forecast.push({
      hour,
      predictedEnergy: Math.max(
        1,
        Math.min(5, recentAvg + (Math.random() - 0.5))
      ),
      confidence: 0.6,
    });
  }

  return forecast;
}

async function calculateBurnoutRisk(data) {
  const { focusHours, energyLevels } = data;

  const avgFocusHours =
    focusHours.reduce((a, b) => a + b, 0) / focusHours.length;
  const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

  let score = 0;

  if (avgFocusHours > 8) score += 30;
  if (avgEnergy < 3) score += 40;

  const riskLevel =
    score > 70 ? 'critical' : score > 50 ? 'high' : score > 30 ? 'moderate' : 'low';

  return {
    riskLevel,
    score,
    factors: [
      { factor: 'Work hours', contribution: avgFocusHours > 8 ? 0.4 : 0.1 },
      { factor: 'Energy levels', contribution: avgEnergy < 3 ? 0.4 : 0.1 },
    ],
  };
}
