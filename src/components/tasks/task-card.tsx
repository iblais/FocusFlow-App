"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Flame,
  Battery,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  estimatedTime?: number | null;
  energyLevel: string;
  difficulty?: number | null;
  priority: number;
  dueDate?: Date | string | null;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async () => {
    if (!onStatusChange) return;

    setIsUpdating(true);
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getEnergyIcon = () => {
    switch (task.energyLevel) {
      case "LOW":
        return <Battery className="h-4 w-4 text-slate-500" />;
      case "MEDIUM":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "HIGH":
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const isCompleted = task.status === "COMPLETED";

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isCompleted && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status checkbox */}
          <button
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className="mt-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-sm leading-tight",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Task metadata */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {task.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedTime} min</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {getEnergyIcon()}
                <span className="text-xs text-muted-foreground capitalize">
                  {task.energyLevel.toLowerCase()}
                </span>
              </div>

              {task.difficulty && (
                <div className="text-xs text-muted-foreground">
                  Difficulty: {task.difficulty}/10
                </div>
              )}

              {task.priority > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  P{task.priority}
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions menu */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit?.(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
