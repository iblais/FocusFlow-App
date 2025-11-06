'use client';

/**
 * Task Completion Sunburst Diagram
 * Hierarchical visualization of task categories and completion rates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SunburstNode } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';

interface TaskCompletionSunburstProps {
  userId: string;
  data: SunburstNode;
  onSegmentClick?: (node: SunburstNode) => void;
}

interface SunburstSegment {
  node: SunburstNode;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  level: number;
  path: string;
  color: string;
}

const COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#EC4899', // pink
  '#84CC16', // lime
];

export function TaskCompletionSunburst({ userId, data, onSegmentClick }: TaskCompletionSunburstProps) {
  const [segments, setSegments] = useState<SunburstSegment[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<SunburstSegment | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SunburstSegment | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const SIZE = 500;
  const CENTER = SIZE / 2;
  const MAX_RADIUS = SIZE / 2 - 20;

  const polarToCartesian = useCallback((centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }, []);

  const describeArc = useCallback(
    (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
    },
    [polarToCartesian]
  );

  const describeArcPath = useCallback(
    (innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
      const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
      const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);
      const outerStart = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
      const outerEnd = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);

      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

      return [
        'M',
        innerStart.x,
        innerStart.y,
        'A',
        innerRadius,
        innerRadius,
        0,
        largeArcFlag,
        0,
        innerEnd.x,
        innerEnd.y,
        'L',
        outerEnd.x,
        outerEnd.y,
        'A',
        outerRadius,
        outerRadius,
        0,
        largeArcFlag,
        1,
        outerStart.x,
        outerStart.y,
        'Z',
      ].join(' ');
    },
    [polarToCartesian]
  );

  const processNode = useCallback(
    (
      node: SunburstNode,
      startAngle: number,
      endAngle: number,
      level: number,
      colorIndex: number,
      segments: SunburstSegment[]
    ) => {
      const levelDepth = 3; // Max 3 levels
      const radiusPerLevel = MAX_RADIUS / levelDepth;
      const innerRadius = level * radiusPerLevel;
      const outerRadius = (level + 1) * radiusPerLevel;

      const path = describeArcPath(innerRadius, outerRadius, startAngle, endAngle);
      const color = COLORS[colorIndex % COLORS.length];

      const segment: SunburstSegment = {
        node,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius,
        level,
        path,
        color,
      };

      segments.push(segment);

      // Process children
      if (node.children && node.children.length > 0) {
        const totalValue = node.children.reduce((sum, child) => sum + child.value, 0);
        let currentAngle = startAngle;

        node.children.forEach((child, index) => {
          const childAngleSpan = ((endAngle - startAngle) * child.value) / totalValue;
          const childEndAngle = currentAngle + childAngleSpan;

          processNode(child, currentAngle, childEndAngle, level + 1, colorIndex + index + 1, segments);

          currentAngle = childEndAngle;
        });
      }
    },
    [describeArcPath]
  );

  const generateSunburst = useCallback(() => {
    const newSegments: SunburstSegment[] = [];
    processNode(data, 0, 360, 0, 0, newSegments);
    setSegments(newSegments);
  }, [data, processNode]);

  useEffect(() => {
    if (data) {
      generateSunburst();
    }
  }, [data, generateSunburst]);

  const handleSegmentClick = (segment: SunburstSegment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment.node);
  };

  const getTotalTasks = (node: SunburstNode): number => {
    let total = node.value;
    if (node.children) {
      node.children.forEach((child) => {
        total += getTotalTasks(child);
      });
    }
    return total;
  };

  const getSegmentLabel = (segment: SunburstSegment): { x: number; y: number; text: string } => {
    const angle = (segment.startAngle + segment.endAngle) / 2;
    const radius = (segment.innerRadius + segment.outerRadius) / 2;
    const point = polarToCartesian(CENTER, CENTER, radius, angle);

    // Only show labels for segments that are large enough
    const angleSpan = segment.endAngle - segment.startAngle;
    if (angleSpan < 15) {
      return { x: point.x, y: point.y, text: '' };
    }

    return {
      x: point.x,
      y: point.y,
      text: segment.node.name.length > 12 ? segment.node.name.slice(0, 12) + '...' : segment.node.name,
    };
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-white">Task Completion Patterns</h3>
          <p className="text-sm text-gray-400 mt-1">
            Hierarchical breakdown of your task categories
          </p>
        </div>

        {/* Sunburst Container */}
        <div className="flex items-start gap-8">
          {/* SVG Sunburst */}
          <div className="relative">
            <svg
              ref={svgRef}
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="overflow-visible"
            >
              {/* Segments */}
              {segments.map((segment, index) => {
                const isHovered = hoveredSegment === segment;
                const isSelected = selectedSegment === segment;
                const opacity = isHovered || isSelected ? 1 : 0.7;

                return (
                  <g key={index}>
                    <motion.path
                      d={segment.path}
                      fill={segment.color}
                      opacity={opacity}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth={1}
                      onMouseEnter={() => setHoveredSegment(segment)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => handleSegmentClick(segment)}
                      className="cursor-pointer transition-all hover:stroke-white hover:stroke-2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity, scale: 1 }}
                      transition={{ delay: index * 0.01, duration: 0.3 }}
                      whileHover={{ opacity: 1 }}
                    />

                    {/* Label */}
                    {(() => {
                      const label = getSegmentLabel(segment);
                      if (!label.text) return null;

                      return (
                        <text
                          x={label.x}
                          y={label.y}
                          textAnchor="middle"
                          className="text-xs font-medium fill-white pointer-events-none"
                          style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                        >
                          {label.text}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Center Circle */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={40}
                fill="rgba(17, 24, 39, 0.9)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={2}
              />
              <text
                x={CENTER}
                y={CENTER - 5}
                textAnchor="middle"
                className="text-sm font-semibold fill-white"
              >
                {getTotalTasks(data)}
              </text>
              <text
                x={CENTER}
                y={CENTER + 10}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                Total Tasks
              </text>
            </svg>

            {/* Tooltip */}
            {hoveredSegment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl max-w-xs z-10"
              >
                <p className="text-sm text-white font-medium mb-2">{hoveredSegment.node.name}</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">
                    Tasks: <span className="text-emerald-400 font-medium">{hoveredSegment.node.value}</span>
                  </p>
                  {hoveredSegment.node.percentage && (
                    <p className="text-xs text-gray-400">
                      Percentage:{' '}
                      <span className="text-blue-400 font-medium">{hoveredSegment.node.percentage.toFixed(1)}%</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Level: <span className="text-purple-400 font-medium">{hoveredSegment.level + 1}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Legend & Details */}
          <div className="flex-1 space-y-4">
            {/* Selected Segment Details */}
            {selectedSegment ? (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">{selectedSegment.node.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Tasks Completed</span>
                    <span className="text-lg font-semibold text-emerald-400">{selectedSegment.node.value}</span>
                  </div>
                  {selectedSegment.node.percentage && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Of Total</span>
                      <span className="text-lg font-semibold text-blue-400">
                        {selectedSegment.node.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Category Level</span>
                    <span className="text-lg font-semibold text-purple-400">{selectedSegment.level + 1}</span>
                  </div>
                  {selectedSegment.node.children && selectedSegment.node.children.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-2">Subcategories:</p>
                      <div className="space-y-1">
                        {selectedSegment.node.children.map((child, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{child.name}</span>
                            <span className="text-xs text-white font-medium">{child.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 text-center">Click a segment to see details</p>
              </div>
            )}

            {/* Legend */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Top Categories</h4>
              <div className="space-y-2">
                {data.children?.slice(0, 5).map((child, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{child.name}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{child.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{data.children?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{getTotalTasks(data)}</p>
            <p className="text-xs text-gray-400 mt-1">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {data.children && data.children.length > 0
                ? Math.max(...data.children.map((c) => c.value))
                : 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Most Active</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
