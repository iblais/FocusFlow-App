'use client';

/**
 * 3D Productivity Landscape
 * Visualizes productivity as a 3D surface across time and days
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ProductivityLandscape3D } from '@/types/analytics';
import { GlassCard } from '@/components/ui/glass-card';

interface ProductivityLandscape3DProps {
  userId: string;
  data: ProductivityLandscape3D;
  autoRotate?: boolean;
}

interface RenderPoint {
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  color: string;
  label?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

export function ProductivityLandscape3D({
  userId,
  data,
  autoRotate = false,
}: ProductivityLandscape3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<RenderPoint | null>(null);
  const animationFrameRef = useRef<number>();

  const WIDTH = 800;
  const HEIGHT = 600;
  const SCALE = 40;

  // Project 3D point to 2D screen coordinates
  const project3D = useCallback(
    (x: number, y: number, z: number): { x: number; y: number } => {
      const rotX = (rotation.x * Math.PI) / 180;
      const rotY = (rotation.y * Math.PI) / 180;

      // Apply rotations
      let tempY = y * Math.cos(rotX) - z * Math.sin(rotX);
      let tempZ = y * Math.sin(rotX) + z * Math.cos(rotX);
      let tempX = x * Math.cos(rotY) - tempZ * Math.sin(rotY);
      tempZ = x * Math.sin(rotY) + tempZ * Math.cos(rotY);

      // Apply zoom
      tempX *= zoom;
      tempY *= zoom;
      tempZ *= zoom;

      // Perspective projection
      const perspective = 500;
      const scale = perspective / (perspective + tempZ);

      return {
        x: WIDTH / 2 + tempX * scale,
        y: HEIGHT / 2 - tempY * scale,
      };
    },
    [rotation, zoom]
  );

  const getColorForProductivity = (z: number): string => {
    // Productivity score 0-100
    if (z < 20) return '#EF4444'; // red
    if (z < 40) return '#F59E0B'; // orange
    if (z < 60) return '#EAB308'; // yellow
    if (z < 80) return '#10B981'; // green
    return '#059669'; // emerald
  };

  const drawLandscape = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw grid and surface
    const points: RenderPoint[] = [];

    // Generate grid points
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 18; hour++) {
        const point = data.points.find((p) => p.x === hour + 6 && p.y === day);
        const z = point?.z || 0;

        const x3D = (hour - 9) * SCALE;
        const y3D = (day - 3) * SCALE;
        const z3D = z * 2; // Scale productivity for visibility

        const { x: screenX, y: screenY } = project3D(x3D, y3D, z3D);

        points.push({
          x: hour + 6,
          y: day,
          z,
          screenX,
          screenY,
          color: point?.color || getColorForProductivity(z),
        });
      }
    }

    // Sort points by depth (z after rotation) for proper rendering
    const sortedPoints = points.sort((a, b) => {
      const rotX = (rotation.x * Math.PI) / 180;
      const rotY = (rotation.y * Math.PI) / 180;

      const aZ = a.z * Math.sin(rotX);
      const bZ = b.z * Math.sin(rotX);

      return aZ - bZ;
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;

    // Vertical lines (across hours)
    for (let day = 0; day < 7; day++) {
      ctx.beginPath();
      for (let hour = 0; hour < 18; hour++) {
        const point = points.find((p) => p.x === hour + 6 && p.y === day);
        if (point) {
          if (hour === 0) {
            ctx.moveTo(point.screenX, point.screenY);
          } else {
            ctx.lineTo(point.screenX, point.screenY);
          }
        }
      }
      ctx.stroke();
    }

    // Horizontal lines (across days)
    for (let hour = 0; hour < 18; hour++) {
      ctx.beginPath();
      for (let day = 0; day < 7; day++) {
        const point = points.find((p) => p.x === hour + 6 && p.y === day);
        if (point) {
          if (day === 0) {
            ctx.moveTo(point.screenX, point.screenY);
          } else {
            ctx.lineTo(point.screenX, point.screenY);
          }
        }
      }
      ctx.stroke();
    }

    // Draw surface quads with gradient
    for (let day = 0; day < 6; day++) {
      for (let hour = 0; hour < 17; hour++) {
        const p1 = points.find((p) => p.x === hour + 6 && p.y === day);
        const p2 = points.find((p) => p.x === hour + 7 && p.y === day);
        const p3 = points.find((p) => p.x === hour + 7 && p.y === day + 1);
        const p4 = points.find((p) => p.x === hour + 6 && p.y === day + 1);

        if (p1 && p2 && p3 && p4) {
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          const color = getColorForProductivity(avgZ);

          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.lineTo(p3.screenX, p3.screenY);
          ctx.lineTo(p4.screenX, p4.screenY);
          ctx.closePath();

          ctx.fillStyle = color + '40'; // Add transparency
          ctx.fill();

          ctx.strokeStyle = color + '80';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw points
    sortedPoints.forEach((point) => {
      const radius = 3;

      ctx.beginPath();
      ctx.arc(point.screenX, point.screenY, radius, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw peaks and valleys
    [...data.peaks, ...data.valleys].forEach((landmark) => {
      const point = points.find((p) => p.x === landmark.x && p.y === landmark.y);
      if (point) {
        ctx.beginPath();
        ctx.arc(point.screenX, point.screenY, 8, 0, Math.PI * 2);
        ctx.fillStyle = landmark.label.includes('Peak') ? '#10B981' : '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(landmark.label, point.screenX, point.screenY - 15);
      }
    });

    // Draw axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';

    // Days axis
    const dayAxisY = project3D(-9 * SCALE, -4 * SCALE, 0);
    ctx.fillText('Days →', dayAxisY.x, dayAxisY.y);

    // Hours axis
    const hourAxisX = project3D(-10 * SCALE, -3 * SCALE, 0);
    ctx.fillText('Hours →', hourAxisX.x, hourAxisX.y);

    // Productivity axis
    const prodAxis = project3D(-9 * SCALE, -3 * SCALE, 50);
    ctx.fillText('Productivity ↑', prodAxis.x, prodAxis.y);
  }, [data, project3D, rotation, zoom]);

  useEffect(() => {
    drawLandscape();
  }, [drawLandscape]);

  useEffect(() => {
    if (autoRotate && !isDragging) {
      const animate = () => {
        setRotation((prev) => ({
          x: prev.x,
          y: (prev.y + 0.5) % 360,
        }));
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setRotation({
        x: Math.max(-90, Math.min(90, rotation.x + deltaY * 0.5)),
        y: rotation.y + deltaX * 0.5,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const resetView = () => {
    setRotation({ x: 30, y: 45 });
    setZoom(1);
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">3D Productivity Landscape</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your productivity terrain across time
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={resetView}
              className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
            >
              Reset View
            </button>
            <div className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-400">
              Zoom: {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">
              🖱️ Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 mb-2">Productivity</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs text-gray-400">Low</span>
              <div className="w-4 h-4 rounded bg-yellow-500 ml-2" />
              <span className="text-xs text-gray-400">Medium</span>
              <div className="w-4 h-4 rounded bg-green-500 ml-2" />
              <span className="text-xs text-gray-400">High</span>
            </div>
          </div>
        </div>

        {/* Peaks and Valleys */}
        <div className="grid grid-cols-2 gap-4">
          {/* Peaks */}
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-400 mb-3">⛰️ Productivity Peaks</h4>
            <div className="space-y-2">
              {data.peaks.slice(0, 3).map((peak, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-white">{peak.label}</p>
                    <p className="text-xs text-gray-400">
                      {DAYS[peak.y]} at {peak.x}:00
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-400">{peak.z.toFixed(0)}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Valleys */}
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-400 mb-3">🏜️ Productivity Valleys</h4>
            <div className="space-y-2">
              {data.valleys.slice(0, 3).map((valley, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-white">{valley.label}</p>
                    <p className="text-xs text-gray-400">
                      {DAYS[valley.y]} at {valley.x}:00
                    </p>
                  </div>
                  <p className="text-lg font-bold text-red-400">{valley.z.toFixed(0)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-2">💡 Terrain Analysis</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            {data.peaks.length > 0 && (
              <li>
                • Your highest peak is on <strong className="text-green-400">{DAYS[data.peaks[0].y]}</strong> at{' '}
                <strong className="text-green-400">{data.peaks[0].x}:00</strong>
              </li>
            )}
            {data.valleys.length > 0 && (
              <li>
                • Your lowest valley is on <strong className="text-red-400">{DAYS[data.valleys[0].y]}</strong> at{' '}
                <strong className="text-red-400">{data.valleys[0].x}:00</strong>
              </li>
            )}
            <li>
              • Schedule important tasks during peak hours for maximum effectiveness
            </li>
            <li>
              • Consider breaks or lighter tasks during valley periods
            </li>
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
