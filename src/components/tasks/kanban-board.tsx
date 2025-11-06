'use client';

/**
 * ADHD-Optimized Kanban Board
 * Physics-based dragging, task aging visualization, embedded timers,
 * dependency visualization, and quick actions
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Clock,
  AlertCircle,
  Zap,
  Flame,
  Snowflake,
  Play,
  Check,
  Trash2,
  Edit,
  Link2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/design/GlassCard';
import { AnimatedNumber } from '@/components/design/AnimatedNumber';
import { tasksDB } from '@/lib/db/tasks-db';
import type { KanbanCard, BoardColumn, DragState } from '@/types/adhd-task-system';

interface KanbanBoardProps {
  userId: string;
  onTaskClick?: (taskId: string) => void;
  onTaskStart?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

const COLUMNS: Array<{ id: BoardColumn; title: string; color: string }> = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

const ENERGY_CONFIG = {
  LOW: { icon: Snowflake, color: 'text-blue-500 bg-blue-500/20', label: 'Low Energy' },
  MEDIUM: { icon: Zap, color: 'text-purple-500 bg-purple-500/20', label: 'Medium Energy' },
  HIGH: { icon: Flame, color: 'text-orange-500 bg-orange-500/20', label: 'High Energy' },
};

export function KanbanBoard({
  userId,
  onTaskClick,
  onTaskStart,
  onTaskComplete,
  onTaskDelete,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanCard[]>([]);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredColumn, setHoveredColumn] = useState<BoardColumn | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await tasksDB.getAllTasks(userId);
      const taskCards: KanbanCard[] = records.map(r => r.data);
      setTasks(taskCards);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<BoardColumn, KanbanCard[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    };

    tasks.forEach(task => {
      const column = (task.boardColumn || 'todo') as BoardColumn;
      grouped[column].push(task);
    });

    // Sort by position within column
    Object.keys(grouped).forEach(col => {
      grouped[col as BoardColumn].sort((a, b) => (a.boardPosition || 0) - (b.boardPosition || 0));
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (taskId: string, startX: number, startY: number) => {
    setDragState({
      isDragging: true,
      draggedId: taskId,
      startPosition: { x: startX, y: startY },
      currentPosition: { x: startX, y: startY },
      velocity: { x: 0, y: 0 },
    });
  };

  const handleDragMove = (taskId: string, x: number, y: number) => {
    if (!dragState.isDragging || dragState.draggedId !== taskId) return;

    const velocity = {
      x: dragState.currentPosition ? x - dragState.currentPosition.x : 0,
      y: dragState.currentPosition ? y - dragState.currentPosition.y : 0,
    };

    setDragState(prev => ({
      ...prev,
      currentPosition: { x, y },
      velocity,
    }));
  };

  const handleDragEnd = async (taskId: string, info: PanInfo) => {
    if (!dragState.isDragging) return;

    const targetColumn = hoveredColumn || getColumnFromPosition(info.point.x);
    const task = tasks.find(t => t.id === taskId);

    if (task && targetColumn && targetColumn !== task.boardColumn) {
      // Update task column
      await tasksDB.updateTask(taskId, { boardColumn: targetColumn });

      // Reload tasks
      await loadTasks();
    }

    setDragState({ isDragging: false });
    setHoveredColumn(null);
  };

  const getColumnFromPosition = (x: number): BoardColumn | null => {
    // Simple heuristic based on screen position
    const width = window.innerWidth;
    const columnWidth = width / 3;

    if (x < columnWidth) return 'todo';
    if (x < columnWidth * 2) return 'in-progress';
    if (x < columnWidth * 3) return 'done';

    return null;
  };

  const getTaskAge = (task: KanbanCard): number => {
    const createdDate = new Date(task.age);
    const now = new Date();
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAgingColor = (age: number): string => {
    if (age < 3) return 'border-gray-200';
    if (age < 7) return 'border-yellow-300';
    if (age < 14) return 'border-orange-400';
    return 'border-red-500 animate-pulse';
  };

  const getUrgencyGlow = (task: KanbanCard): string => {
    if (!task.dueDate) return '';

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) return 'shadow-lg shadow-red-500/50';
    if (hoursUntilDue < 24) return 'shadow-lg shadow-orange-500/50';
    if (hoursUntilDue < 72) return 'shadow-lg shadow-yellow-500/50';

    return '';
  };

  const handleQuickAction = async (action: string, taskId: string) => {
    switch (action) {
      case 'start':
        onTaskStart?.(taskId);
        break;
      case 'complete':
        await tasksDB.updateTask(taskId, { boardColumn: 'done' });
        onTaskComplete?.(taskId);
        await loadTasks();
        break;
      case 'delete':
        await tasksDB.deleteTask(taskId);
        onTaskDelete?.(taskId);
        await loadTasks();
        break;
      default:
        break;
    }
  };

  const renderTaskCard = (task: KanbanCard) => {
    const age = getTaskAge(task);
    const EnergyIcon = ENERGY_CONFIG[task.energyLevel].icon;
    const energyColor = ENERGY_CONFIG[task.energyLevel].color;
    const agingBorder = getAgingColor(age);
    const urgencyGlow = getUrgencyGlow(task);
    const isDragged = dragState.draggedId === task.id;

    return (
      <motion.div
        key={task.id}
        layoutId={task.id}
        drag
        dragMomentum={true}
        dragElastic={0.1}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onDragStart={(e, info) => handleDragStart(task.id, info.point.x, info.point.y)}
        onDrag={(e, info) => handleDragMove(task.id, info.point.x, info.point.y)}
        onDragEnd={(e, info) => handleDragEnd(task.id, info)}
        whileHover={{ scale: 1.02, zIndex: 50 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative cursor-grab active:cursor-grabbing ${isDragged ? 'z-50' : ''}`}
      >
        <GlassCard
          variant="light"
          className={`p-4 border-2 ${agingBorder} ${urgencyGlow} transition-all`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h4
              className="font-medium text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600"
              onClick={() => onTaskClick?.(task.id)}
            >
              {task.title}
            </h4>

            {/* Priority badge */}
            {task.priority > 7 && (
              <Badge variant="destructive" className="ml-2">
                P{task.priority}
              </Badge>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {/* Energy level */}
            <Badge className={energyColor}>
              <EnergyIcon className="h-3 w-3 mr-1" />
              {task.energyLevel}
            </Badge>

            {/* Time estimate */}
            {task.estimatedTime && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}m
              </Badge>
            )}

            {/* Due date */}
            {task.dueDate && (
              <Badge
                variant={new Date(task.dueDate) < new Date() ? 'destructive' : 'outline'}
                className="gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}

            {/* Age indicator */}
            {age > 3 && (
              <Badge variant="secondary" className="gap-1">
                {age}d old
              </Badge>
            )}
          </div>

          {/* Progress (micro-steps) */}
          {task.microStepsTotal && task.microStepsTotal > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {task.microStepsCompleted || 0}/{task.microStepsTotal}
                </span>
              </div>
              <Progress
                value={((task.microStepsCompleted || 0) / task.microStepsTotal) * 100}
                className="h-2"
              />
            </div>
          )}

          {/* Dependencies indicator */}
          {task.hasBlockers && (
            <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
              <AlertCircle className="h-3 w-3" />
              <span>Has blockers</span>
            </div>
          )}

          {/* Dependency connections */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Link2 className="h-3 w-3" />
              <span>{task.dependencies.length} dependencies</span>
            </div>
          )}

          {/* Collaborators */}
          {task.collaborators && task.collaborators.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-purple-600 mb-2">
              <Users className="h-3 w-3" />
              <span>{task.collaborators.length} collaborators</span>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Quick actions (shown on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            {task.boardColumn === 'todo' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('start', task.id)}
                className="flex-1 gap-1"
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
            )}

            {task.boardColumn === 'in-progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('complete', task.id)}
                className="flex-1 gap-1"
              >
                <Check className="h-3 w-3" />
                Complete
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleQuickAction('delete', task.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const renderColumn = (column: { id: BoardColumn; title: string; color: string }) => {
    const columnTasks = tasksByColumn[column.id];
    const isHovered = hoveredColumn === column.id;

    return (
      <div
        key={column.id}
        className="flex-1 min-w-[300px]"
        onDragEnter={() => setHoveredColumn(column.id)}
        onDragLeave={() => setHoveredColumn(null)}
      >
        <div
          className={`h-full rounded-lg border-2 transition-all ${
            isHovered
              ? 'border-purple-500 bg-purple-50/50 shadow-lg'
              : 'border-gray-200 bg-gray-50/30'
          }`}
        >
          {/* Column header */}
          <div className={`${column.color} text-white p-4 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{column.title}</h3>
              <Badge variant="secondary" className="bg-white/20">
                <AnimatedNumber value={columnTasks.length} />
              </Badge>
            </div>

            {/* Column stats */}
            {columnTasks.length > 0 && (
              <div className="mt-2 text-xs text-white/80">
                {column.id === 'todo' && (
                  <div>
                    {columnTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}{' '}
                    overdue
                  </div>
                )}
                {column.id === 'in-progress' && (
                  <div>
                    {columnTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0)}m total time
                  </div>
                )}
                {column.id === 'done' && <div>🎉 Great work!</div>}
              </div>
            )}
          </div>

          {/* Column body */}
          <div className="p-4 space-y-3 min-h-[200px]">
            {columnTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No tasks here</p>
                {column.id === 'todo' && <p className="text-xs mt-1">Drag tasks here to start</p>}
              </div>
            ) : (
              columnTasks.map(task => renderTaskCard(task))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Board header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tasks</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <div>
            Total: <AnimatedNumber value={tasks.length} className="font-bold text-purple-600" />
          </div>
          <div>
            Active:{' '}
            <AnimatedNumber
              value={tasksByColumn['in-progress'].length}
              className="font-bold text-purple-600"
            />
          </div>
          <div>
            Completed today:{' '}
            <AnimatedNumber
              value={
                tasksByColumn['done'].filter(
                  t => new Date(t.age).toDateString() === new Date().toDateString()
                ).length
              }
              className="font-bold text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => renderColumn(column))}
      </div>

      {/* Drag indicator */}
      {dragState.isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg"
        >
          Drop to move task
        </motion.div>
      )}
    </div>
  );
}
