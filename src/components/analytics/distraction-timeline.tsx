'use client';

/**
 * Distraction Frequency Timeline
 * Tracks and visualizes when distractions occur
 */

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import type { DistractionEvent } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';

interface DistractionTimelineProps {
  userId: string;
  distractions: DistractionEvent[];
  onDistractionClick?: (distraction: DistractionEvent) => void;
}

interface TimelineDataPoint {
  hour: number;
  count: number;
  totalDuration: number;
  avgDuration: number;
  types: Record<string, number>;
}

interface DistractionStats {
  totalDistractions: number;
  totalTime: number;
  avgDuration: number;
  peakHour: number;
  mostCommonType: string;
  topTriggers: Array<{ type: string; count: number; percentage: number }>;
}

const DISTRACTION_COLORS: Record<string, string> = {
  notification: '#EF4444',
  'social-media': '#F59E0B',
  email: '#3B82F6',
  'context-switch': '#8B5CF6',
  'meeting-interruption': '#EC4899',
  'noise-disturbance': '#14B8A6',
  other: '#6B7280',
};

export function DistractionTimeline({ userId, distractions, onDistractionClick }: DistractionTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [stats, setStats] = useState<DistractionStats | null>(null);
  const [viewMode, setViewMode] = useState<'hourly' | 'daily' | 'types'>('hourly');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const processTimelineData = useCallback(() => {
    // Group by hour
    const hourlyData: Record<number, DistractionEvent[]> = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = [];
    }

    distractions.forEach((distraction) => {
      const hour = new Date(distraction.timestamp).getHours();
      hourlyData[hour].push(distraction);
    });

    // Process into timeline points
    const timeline: TimelineDataPoint[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourDistractions = hourlyData[hour];
      const count = hourDistractions.length;
      const totalDuration = hourDistractions.reduce((sum, d) => sum + d.duration, 0);
      const avgDuration = count > 0 ? totalDuration / count : 0;

      const types: Record<string, number> = {};
      hourDistractions.forEach((d) => {
        types[d.type] = (types[d.type] || 0) + 1;
      });

      timeline.push({
        hour,
        count,
        totalDuration,
        avgDuration,
        types,
      });
    }

    setTimelineData(timeline);

    // Calculate stats
    const totalDistractions = distractions.length;
    const totalTime = distractions.reduce((sum, d) => sum + d.duration, 0);
    const avgDuration = totalDistractions > 0 ? totalTime / totalDistractions : 0;

    const peakHourData = timeline.reduce((max, point) =>
      point.count > max.count ? point : max
    );
    const peakHour = peakHourData.hour;

    const typeCount: Record<string, number> = {};
    distractions.forEach((d) => {
      typeCount[d.type] = (typeCount[d.type] || 0) + 1;
    });

    const mostCommonType = Object.entries(typeCount).reduce((max, [type, count]) =>
      count > max.count ? { type, count } : max
    , { type: 'none', count: 0 }).type;

    const topTriggers = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalDistractions) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalDistractions,
      totalTime,
      avgDuration,
      peakHour,
      mostCommonType,
      topTriggers,
    });
  }, [distractions]);

  useEffect(() => {
    if (distractions.length > 0) {
      processTimelineData();
    }
  }, [distractions, processTimelineData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: TimelineDataPoint = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-sm text-white font-medium mb-2">
            {data.hour}:00 - {data.hour + 1}:00
          </p>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">
              Distractions: <span className="text-red-400 font-medium">{data.count}</span>
            </p>
            <p className="text-xs text-gray-400">
              Total Time: <span className="text-orange-400 font-medium">{Math.round(data.totalDuration / 60)}m</span>
            </p>
            <p className="text-xs text-gray-400">
              Avg Duration: <span className="text-yellow-400 font-medium">{Math.round(data.avgDuration)}s</span>
            </p>
            {Object.entries(data.types).length > 0 && (
              <>
                <p className="text-xs text-gray-500 mt-2 mb-1">Types:</p>
                {Object.entries(data.types).map(([type, count]) => (
                  <p key={type} className="text-xs text-gray-400 pl-2">
                    {type}: <span className="font-medium">{count}</span>
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderHourlyChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDistractions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="hour"
          stroke="#9CA3AF"
          tickFormatter={(hour) => `${hour}:00`}
        />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#EF4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorDistractions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderTypeBreakdown = () => {
    const typeData = stats?.topTriggers.map((trigger) => ({
      name: trigger.type,
      count: trigger.count,
      percentage: trigger.percentage,
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={typeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
                    <p className="text-sm text-white font-medium mb-2">{data.name}</p>
                    <p className="text-xs text-gray-400">
                      Count: <span className="text-red-400 font-medium">{data.count}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Percentage: <span className="text-orange-400 font-medium">{data.percentage.toFixed(1)}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {typeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={DISTRACTION_COLORS[entry.name] || DISTRACTION_COLORS.other}
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Distraction Timeline</h3>
            <p className="text-sm text-gray-400 mt-1">
              When and how you get distracted
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('hourly')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'hourly'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setViewMode('types')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'types'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              By Type
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Distractions</p>
              <p className="text-2xl font-bold text-red-400">{stats.totalDistractions}</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Time Lost</p>
              <p className="text-2xl font-bold text-orange-400">{formatDuration(stats.totalTime)}</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Peak Hour</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.peakHour}:00</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-400">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="mt-4">
          {viewMode === 'hourly' && renderHourlyChart()}
          {viewMode === 'types' && renderTypeBreakdown()}
        </div>

        {/* Top Triggers */}
        {stats && stats.topTriggers.length > 0 && (
          <div className="mt-4 bg-gradient-to-br from-red-900/10 to-orange-900/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Most Common Distractions</h4>
            <div className="space-y-2">
              {stats.topTriggers.map((trigger, index) => (
                <motion.div
                  key={trigger.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: DISTRACTION_COLORS[trigger.type] || DISTRACTION_COLORS.other }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{trigger.type}</p>
                    <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${trigger.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">{trigger.count}</p>
                    <p className="text-xs text-gray-400">{trigger.percentage.toFixed(1)}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {stats && (
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">💡 Insights</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>
                • Your peak distraction time is around <strong className="text-red-400">{stats.peakHour}:00</strong>
              </li>
              <li>
                • <strong className="text-orange-400">{stats.mostCommonType}</strong> is your most frequent distraction
              </li>
              <li>
                • You lose an average of <strong className="text-yellow-400">{formatDuration(stats.avgDuration)}</strong> per distraction
              </li>
              {stats.totalTime > 3600 && (
                <li className="text-red-400">
                  • ⚠️ You've lost over <strong>{Math.round(stats.totalTime / 3600)} hours</strong> to distractions
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
