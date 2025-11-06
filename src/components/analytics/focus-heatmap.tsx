'use client';

/**
 * Focus Heatmap Calendar
 * Visualizes focus quality across days and hours with color-coded cells
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FocusHeatmapData } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';

interface FocusHeatmapProps {
  userId: string;
  startDate: Date;
  endDate: Date;
  focusData: FocusHeatmapData[];
  onCellClick?: (data: FocusHeatmapData) => void;
}

interface HeatmapCell {
  date: string;
  hour: number;
  quality: number;
  focusMinutes: number;
  distractionCount: number;
  color: string;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function FocusHeatmap({ userId, startDate, endDate, focusData, onCellClick }: FocusHeatmapProps) {
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'quality' | 'minutes' | 'distractions'>('quality');

  const getQualityColor = useCallback((quality: number): string => {
    if (quality === 0) return 'bg-gray-800/30';
    if (quality < 20) return 'bg-red-900/60';
    if (quality < 40) return 'bg-orange-900/60';
    if (quality < 60) return 'bg-yellow-900/60';
    if (quality < 80) return 'bg-green-900/60';
    return 'bg-emerald-500/80';
  }, []);

  const getMinutesColor = useCallback((minutes: number): string => {
    if (minutes === 0) return 'bg-gray-800/30';
    if (minutes < 15) return 'bg-blue-900/40';
    if (minutes < 30) return 'bg-blue-800/50';
    if (minutes < 60) return 'bg-blue-700/60';
    if (minutes < 120) return 'bg-blue-600/70';
    return 'bg-blue-500/80';
  }, []);

  const getDistractionColor = useCallback((count: number): string => {
    if (count === 0) return 'bg-emerald-500/80';
    if (count < 3) return 'bg-yellow-900/60';
    if (count < 6) return 'bg-orange-900/60';
    return 'bg-red-900/60';
  }, []);

  const getCellColor = useCallback((cell: HeatmapCell): string => {
    switch (selectedMetric) {
      case 'quality':
        return getQualityColor(cell.quality);
      case 'minutes':
        return getMinutesColor(cell.focusMinutes);
      case 'distractions':
        return getDistractionColor(cell.distractionCount);
      default:
        return getQualityColor(cell.quality);
    }
  }, [selectedMetric, getQualityColor, getMinutesColor, getDistractionColor]);

  const processHeatmapData = useCallback(() => {
    const cells: HeatmapCell[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (const hour of HOURS) {
        const cellData = focusData.filter((point) => {
          const pointDate = new Date(point.date);
          return (
            pointDate.toDateString() === d.toDateString() &&
            point.hour === hour
          );
        });

        const avgQuality = cellData.length > 0
          ? cellData.reduce((sum, p) => sum + p.quality, 0) / cellData.length
          : 0;

        const totalMinutes = cellData.reduce((sum, p) => sum + p.focusMinutes, 0);
        const totalDistractions = cellData.reduce((sum, p) => sum + p.distractionCount, 0);

        const cell: HeatmapCell = {
          date: d.toDateString(),
          hour,
          quality: Math.round(avgQuality),
          focusMinutes: totalMinutes,
          distractionCount: totalDistractions,
          color: getQualityColor(Math.round(avgQuality)),
        };

        cells.push(cell);
      }
    }

    setHeatmapCells(cells);
  }, [startDate, endDate, focusData, getQualityColor]);

  useEffect(() => {
    processHeatmapData();
  }, [processHeatmapData]);

  const getDaysInRange = () => {
    const days: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const days = getDaysInRange();

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Focus Heatmap</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your focus patterns across time and day
            </p>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('quality')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'quality'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              Quality
            </button>
            <button
              onClick={() => setSelectedMetric('minutes')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'minutes'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setSelectedMetric('distractions')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'distractions'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              Distractions
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour Labels */}
            <div className="flex">
              <div className="w-16" /> {/* Spacer for day labels */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-shrink-0 w-12 text-center text-xs text-gray-500 mb-1"
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Days and Cells */}
            {days.map((day, dayIndex) => (
              <div key={day.toDateString()} className="flex items-center">
                {/* Day Label */}
                <div className="w-16 text-sm text-gray-400 pr-2 text-right">
                  <div>{DAYS[day.getDay()]}</div>
                  <div className="text-xs text-gray-600">
                    {day.getMonth() + 1}/{day.getDate()}
                  </div>
                </div>

                {/* Hour Cells */}
                {HOURS.map((hour) => {
                  const cell = heatmapCells.find(
                    (c) => c.date === day.toDateString() && c.hour === hour
                  );

                  if (!cell) return <div key={hour} className="w-12 h-12" />;

                  return (
                    <motion.div
                      key={`${day.toDateString()}-${hour}`}
                      className="relative"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: dayIndex * 0.05 + (hour - 6) * 0.01 }}
                    >
                      <div
                        className={`w-10 h-10 m-1 rounded-md cursor-pointer transition-all ${getCellColor(
                          cell
                        )} hover:scale-110 hover:shadow-lg hover:border hover:border-white/30`}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onCellClick?.(focusData.find(d =>
                          new Date(d.date).toDateString() === cell.date && d.hour === cell.hour
                        )!)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {selectedMetric === 'quality' && 'Focus Quality:'}
              {selectedMetric === 'minutes' && 'Focus Time:'}
              {selectedMetric === 'distractions' && 'Distractions:'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-800/30" />
              <span className="text-xs text-gray-500">None</span>
              <div className="w-6 h-6 rounded bg-red-900/60 ml-2" />
              <span className="text-xs text-gray-500">Low</span>
              <div className="w-6 h-6 rounded bg-yellow-900/60 ml-2" />
              <span className="text-xs text-gray-500">Medium</span>
              <div className="w-6 h-6 rounded bg-emerald-500/80 ml-2" />
              <span className="text-xs text-gray-500">High</span>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-xl"
            >
              <div className="text-sm text-white font-medium mb-1">
                {hoveredCell.date} at {hoveredCell.hour}:00
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">
                  Quality: <span className="text-emerald-400 font-medium">{hoveredCell.quality}%</span>
                </div>
                <div className="text-xs text-gray-400">
                  Focus Time: <span className="text-blue-400 font-medium">{hoveredCell.focusMinutes}m</span>
                </div>
                <div className="text-xs text-gray-400">
                  Distractions: <span className="text-orange-400 font-medium">{hoveredCell.distractionCount}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
