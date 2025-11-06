/**
 * Analytics Data API
 * Fetches and processes analytics data for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type {
  FocusHeatmapData,
  EnergyProductivityPoint,
  DistractionEvent,
  SunburstNode,
  ProductivityLandscape3D,
  WeeklyStats,
  Achievement,
  Improvement,
} from '@/types/analytics';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch focus sessions
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Fetch energy logs
    const energyLogs = await prisma.energyLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Process focus heatmap data
    const focusData: FocusHeatmapData[] = [];
    const focusByDateHour = new Map<string, { minutes: number; quality: number; distractions: number }>();

    focusSessions.forEach((session) => {
      const date = new Date(session.startedAt);
      const dateKey = `${date.toDateString()}-${date.getHours()}`;

      const existing = focusByDateHour.get(dateKey) || { minutes: 0, quality: 0, distractions: 0 };
      focusByDateHour.set(dateKey, {
        minutes: existing.minutes + (session.duration || 0),
        quality: Math.max(existing.quality, session.quality || 0),
        distractions: existing.distractions + (session.distractions || 0),
      });
    });

    focusByDateHour.forEach((value, key) => {
      const [dateStr, hourStr] = key.split('-');
      focusData.push({
        date: new Date(dateStr),
        hour: parseInt(hourStr),
        focusMinutes: value.minutes,
        quality: value.quality,
        distractionCount: value.distractions,
      });
    });

    // Process energy/productivity data
    const energyData: EnergyProductivityPoint[] = energyLogs.map((log) => {
      const date = new Date(log.timestamp);
      const dayTasks = tasks.filter(
        (t) =>
          new Date(t.createdAt).toDateString() === date.toDateString() &&
          t.status === 'COMPLETED'
      );

      return {
        timestamp: log.timestamp,
        energyLevel: log.level,
        tasksCompleted: dayTasks.length,
        focusQuality: log.focusQuality || 0,
        workingMemoryScore: log.workingMemoryScore,
      };
    });

    // Process distraction events
    const distractions: DistractionEvent[] = focusSessions
      .filter((s) => s.distractionEvents)
      .flatMap((s) =>
        (s.distractionEvents as any[]).map((event) => ({
          timestamp: new Date(event.timestamp),
          type: event.type,
          duration: event.duration,
          context: {
            taskId: s.taskId || undefined,
            timeOfDay: new Date(event.timestamp).toLocaleTimeString(),
            energyLevel: s.energyLevel || 3,
          },
        }))
      );

    // Process sunburst data (task categories)
    const tasksByTag = new Map<string, number>();
    tasks.forEach((task) => {
      if (Array.isArray(task.tags)) {
        task.tags.forEach((tag: string) => {
          tasksByTag.set(tag, (tasksByTag.get(tag) || 0) + 1);
        });
      }
    });

    const sunburstData: SunburstNode = {
      name: 'All Tasks',
      value: tasks.length,
      children: Array.from(tasksByTag.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: (value / tasks.length) * 100,
        }))
        .sort((a, b) => b.value - a.value),
    };

    // Process 3D landscape data
    const landscapePoints: ProductivityLandscape3D['points'] = [];
    const peaks: ProductivityLandscape3D['peaks'] = [];
    const valleys: ProductivityLandscape3D['valleys'] = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour < 24; hour++) {
        const dayData = focusData.filter((f) => {
          const date = new Date(f.date);
          return date.getDay() === day && f.hour === hour;
        });

        if (dayData.length > 0) {
          const avgQuality = dayData.reduce((sum, d) => sum + d.quality, 0) / dayData.length;

          landscapePoints.push({
            x: hour,
            y: day,
            z: avgQuality,
            color: avgQuality > 80 ? '#10B981' : avgQuality > 60 ? '#EAB308' : avgQuality > 40 ? '#F59E0B' : '#EF4444',
          });

          if (avgQuality > 85) {
            peaks.push({ x: hour, y: day, z: avgQuality, label: 'Peak' });
          } else if (avgQuality < 30) {
            valleys.push({ x: hour, y: day, z: avgQuality, label: 'Valley' });
          }
        }
      }
    }

    const landscapeData: ProductivityLandscape3D = {
      points: landscapePoints,
      peaks: peaks.sort((a, b) => b.z - a.z).slice(0, 3),
      valleys: valleys.sort((a, b) => a.z - b.z).slice(0, 3),
    };

    // Calculate weekly stats
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
    const totalFocusTime = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgEnergy = energyLogs.length > 0
      ? energyLogs.reduce((sum, l) => sum + l.level, 0) / energyLogs.length
      : 0;

    // Mock achievements (in production, fetch from database)
    const achievements: Achievement[] = [];
    if (completedTasks.length >= 20) {
      achievements.push({
        id: 'task-master',
        title: 'Task Master',
        description: 'Completed 20+ tasks this week!',
        icon: '🏆',
        rarity: 'rare',
        unlockedAt: new Date(),
        celebration: {
          animation: 'bounce',
          confetti: true,
        },
      });
    }

    // Calculate improvements
    const improvements: Improvement[] = [
      {
        area: 'Focus Quality',
        currentScore: focusData.length > 0
          ? focusData.reduce((sum, f) => sum + f.quality, 0) / focusData.length
          : 0,
        previousScore: 65, // Mock - in production, fetch from previous week
        percentChange: 15, // Mock
        tips: [
          'Your deep focus sessions have improved significantly',
          'Try scheduling important tasks during your peak hours',
        ],
        priority: 'high',
      },
    ];

    const weeklyStats: WeeklyStats = {
      weekStart: start,
      weekEnd: end,
      focusTime: {
        total: totalFocusTime,
        average: totalFocusTime / 7,
        trend: 12, // Mock - calculate from previous week
        bestDay: start, // Mock - find actual best day
      },
      tasksCompleted: {
        total: completedTasks.length,
        average: completedTasks.length / 7,
        trend: 8, // Mock
        breakdown: {}, // Mock
      },
      energy: {
        average: avgEnergy,
        trend: 5, // Mock
        bestTime: '10:00 AM', // Mock
        worstTime: '3:00 PM', // Mock
      },
      distractions: {
        total: distractions.length,
        average: distractions.length / 7,
        trend: -10, // Negative is good - fewer distractions
        topTriggers: [], // Mock
      },
      achievements,
      improvements,
    };

    return NextResponse.json({
      focusData,
      energyData,
      distractions,
      sunburstData,
      landscapeData,
      weeklyStats,
    });
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
