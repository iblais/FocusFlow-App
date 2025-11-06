'use client';

/**
 * Energy/Productivity Correlation Chart
 * Visualizes the relationship between energy levels and productivity
 */

import { useEffect, useState, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Line,
  ComposedChart,
  Area,
} from 'recharts';
import type { EnergyProductivityPoint } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';

interface EnergyProductivityChartProps {
  userId: string;
  data: EnergyProductivityPoint[];
  showTrendline?: boolean;
  chartType?: 'scatter' | 'timeline' | 'area';
}

interface ProcessedDataPoint {
  timestamp: number;
  energyLevel: number;
  tasksCompleted: number;
  focusQuality: number;
  workingMemoryScore?: number;
  dateLabel: string;
  timeLabel: string;
}

interface CorrelationStats {
  energyTasksCorrelation: number;
  energyFocusCorrelation: number;
  averageProductivityByEnergy: Record<number, number>;
  optimalEnergyRange: { min: number; max: number };
  insight: string;
}

export function EnergyProductivityChart({
  userId,
  data,
  showTrendline = true,
  chartType = 'scatter',
}: EnergyProductivityChartProps) {
  const [processedData, setProcessedData] = useState<ProcessedDataPoint[]>([]);
  const [correlationStats, setCorrelationStats] = useState<CorrelationStats | null>(null);
  const [selectedView, setSelectedView] = useState<'tasks' | 'focus' | 'both'>('both');

  const calculateCorrelation = useCallback((x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }, []);

  const processChartData = useCallback(() => {
    const processed: ProcessedDataPoint[] = data.map((point) => {
      const date = new Date(point.timestamp);
      return {
        timestamp: date.getTime(),
        energyLevel: point.energyLevel,
        tasksCompleted: point.tasksCompleted,
        focusQuality: point.focusQuality,
        workingMemoryScore: point.workingMemoryScore,
        dateLabel: date.toLocaleDateString(),
        timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });

    setProcessedData(processed);

    // Calculate correlation statistics
    const energyLevels = data.map((p) => p.energyLevel);
    const tasks = data.map((p) => p.tasksCompleted);
    const focus = data.map((p) => p.focusQuality);

    const energyTasksCorr = calculateCorrelation(energyLevels, tasks);
    const energyFocusCorr = calculateCorrelation(energyLevels, focus);

    // Average productivity by energy level
    const productivityByEnergy: Record<number, { totalTasks: number; count: number }> = {};
    data.forEach((point) => {
      if (!productivityByEnergy[point.energyLevel]) {
        productivityByEnergy[point.energyLevel] = { totalTasks: 0, count: 0 };
      }
      productivityByEnergy[point.energyLevel].totalTasks += point.tasksCompleted;
      productivityByEnergy[point.energyLevel].count++;
    });

    const avgProductivityByEnergy: Record<number, number> = {};
    Object.entries(productivityByEnergy).forEach(([energy, stats]) => {
      avgProductivityByEnergy[Number(energy)] = stats.totalTasks / stats.count;
    });

    // Find optimal energy range
    const sortedByProductivity = Object.entries(avgProductivityByEnergy)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    const optimalEnergies = sortedByProductivity.map(([e]) => Number(e));
    const optimalRange = {
      min: Math.min(...optimalEnergies),
      max: Math.max(...optimalEnergies),
    };

    // Generate insight
    let insight = '';
    if (energyTasksCorr > 0.6) {
      insight = `Strong positive correlation! Your productivity increases significantly with higher energy (${(energyTasksCorr * 100).toFixed(0)}% correlation).`;
    } else if (energyTasksCorr > 0.3) {
      insight = `Moderate correlation between energy and productivity. You complete ${avgProductivityByEnergy[5]?.toFixed(1) || 'more'} tasks on high-energy days vs ${avgProductivityByEnergy[1]?.toFixed(1) || 'fewer'} on low-energy days.`;
    } else if (energyTasksCorr < -0.3) {
      insight = `Interesting! You're sometimes more productive at lower energy levels. This might indicate you tackle easier tasks when tired.`;
    } else {
      insight = `Your productivity is fairly consistent across energy levels. Quality routines may be helping!`;
    }

    setCorrelationStats({
      energyTasksCorrelation: energyTasksCorr,
      energyFocusCorrelation: energyFocusCorr,
      averageProductivityByEnergy: avgProductivityByEnergy,
      optimalEnergyRange: optimalRange,
      insight,
    });
  }, [data, calculateCorrelation]);

  useEffect(() => {
    if (data.length > 0) {
      processChartData();
    }
  }, [data, processChartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-sm text-white font-medium mb-2">
            {data.dateLabel} {data.timeLabel}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">
              Energy: <span className="text-purple-400 font-medium">{data.energyLevel}/5</span>
            </p>
            {(selectedView === 'tasks' || selectedView === 'both') && (
              <p className="text-xs text-gray-400">
                Tasks: <span className="text-emerald-400 font-medium">{data.tasksCompleted}</span>
              </p>
            )}
            {(selectedView === 'focus' || selectedView === 'both') && (
              <p className="text-xs text-gray-400">
                Focus: <span className="text-blue-400 font-medium">{data.focusQuality}%</span>
              </p>
            )}
            {data.workingMemoryScore && (
              <p className="text-xs text-gray-400">
                Memory: <span className="text-orange-400 font-medium">{data.workingMemoryScore}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          type="number"
          dataKey="energyLevel"
          name="Energy Level"
          domain={[0, 6]}
          ticks={[1, 2, 3, 4, 5]}
          stroke="#9CA3AF"
          label={{ value: 'Energy Level', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
        />
        <YAxis
          type="number"
          dataKey={selectedView === 'focus' ? 'focusQuality' : 'tasksCompleted'}
          name={selectedView === 'focus' ? 'Focus Quality' : 'Tasks Completed'}
          stroke="#9CA3AF"
          label={{
            value: selectedView === 'focus' ? 'Focus Quality (%)' : 'Tasks Completed',
            angle: -90,
            position: 'insideLeft',
            fill: '#9CA3AF',
          }}
        />
        <ZAxis range={[50, 400]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {(selectedView === 'tasks' || selectedView === 'both') && (
          <Scatter
            name="Tasks Completed"
            data={processedData}
            fill="#10B981"
            fillOpacity={0.6}
            dataKey="tasksCompleted"
          />
        )}

        {(selectedView === 'focus' || selectedView === 'both') && (
          <Scatter
            name="Focus Quality"
            data={processedData}
            fill="#3B82F6"
            fillOpacity={0.6}
            dataKey="focusQuality"
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderTimelineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={processedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          stroke="#9CA3AF"
        />
        <YAxis yAxisId="left" stroke="#9CA3AF" />
        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        <Area
          yAxisId="left"
          type="monotone"
          dataKey="energyLevel"
          fill="#8B5CF6"
          stroke="#8B5CF6"
          fillOpacity={0.2}
          name="Energy Level"
        />

        {(selectedView === 'tasks' || selectedView === 'both') && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tasksCompleted"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 4 }}
            name="Tasks Completed"
          />
        )}

        {(selectedView === 'focus' || selectedView === 'both') && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="focusQuality"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            name="Focus Quality"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Energy × Productivity</h3>
            <p className="text-sm text-gray-400 mt-1">
              How your energy levels impact your output
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <select
              value={chartType}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="both">Both Metrics</option>
              <option value="tasks">Tasks Only</option>
              <option value="focus">Focus Only</option>
            </select>
          </div>
        </div>

        {/* Correlation Stats */}
        {correlationStats && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-3">{correlationStats.insight}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tasks Correlation</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {(correlationStats.energyTasksCorrelation * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Focus Correlation</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(correlationStats.energyFocusCorrelation * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Optimal Energy</p>
                <p className="text-2xl font-bold text-purple-400">
                  {correlationStats.optimalEnergyRange.min === correlationStats.optimalEnergyRange.max
                    ? `${correlationStats.optimalEnergyRange.min}/5`
                    : `${correlationStats.optimalEnergyRange.min}-${correlationStats.optimalEnergyRange.max}/5`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="mt-4">
          {chartType === 'scatter' && renderScatterChart()}
          {chartType === 'timeline' && renderTimelineChart()}
        </div>

        {/* Energy Level Breakdown */}
        {correlationStats && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((energy) => {
              const avgTasks = correlationStats.averageProductivityByEnergy[energy] || 0;
              const isOptimal =
                energy >= correlationStats.optimalEnergyRange.min &&
                energy <= correlationStats.optimalEnergyRange.max;

              return (
                <div
                  key={energy}
                  className={`p-3 rounded-lg border ${
                    isOptimal
                      ? 'bg-purple-900/20 border-purple-500/50'
                      : 'bg-gray-800/30 border-gray-700/50'
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">Energy {energy}</p>
                  <p className="text-lg font-semibold text-white">{avgTasks.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">avg tasks</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
