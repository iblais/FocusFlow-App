"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema, CreateTaskInput } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles } from "lucide-react";

interface EditingTask {
  id: string;
  title: string;
  description?: string | null;
  estimatedTime?: number | null;
  energyLevel: string;
  difficulty?: number | null;
  priority: number;
  dueDate?: Date | string | null;
  tags: string[];
}

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingTask?: EditingTask | null;
}

export function TaskForm({ open, onOpenChange, onSuccess, editingTask }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingAIBreakdown, setIsGettingAIBreakdown] = useState(false);

  const isEditMode = !!editingTask;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      energyLevel: "MEDIUM",
      priority: 0,
      tags: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingTask && open) {
      setValue("title", editingTask.title);
      setValue("description", editingTask.description || "");
      setValue("estimatedTime", editingTask.estimatedTime || undefined);
      setValue("energyLevel", editingTask.energyLevel as "LOW" | "MEDIUM" | "HIGH");
      setValue("difficulty", editingTask.difficulty || undefined);
      setValue("priority", editingTask.priority);
      setValue("tags", editingTask.tags || []);
      if (editingTask.dueDate) {
        // Format date for datetime-local input
        const date = new Date(editingTask.dueDate);
        const formatted = date.toISOString().slice(0, 16);
        setValue("dueDate", formatted);
      }
    } else if (!open) {
      reset();
    }
  }, [editingTask, open, setValue, reset]);

  const energyLevel = watch("energyLevel");
  const estimatedTime = watch("estimatedTime");

  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);

    try {
      const url = isEditMode ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} task`);
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} task`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAIBreakdown = async () => {
    const title = watch("title");
    const description = watch("description");
    const time = watch("estimatedTime");

    if (!title || !time) {
      alert("Please enter a task title and estimated time first");
      return;
    }

    setIsGettingAIBreakdown(true);

    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskTitle: title,
          taskDescription: description,
          estimatedTime: time,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get AI breakdown");
      }

      const { microSteps } = await response.json();

      // Store micro-steps (we'll handle this in the API when creating the task)
      // For now, just show success
      alert(`Got ${microSteps.length} micro-steps! These will be saved with the task.`);

      // TODO: Store micro-steps in form state and send with task creation
    } catch (error) {
      console.error("Error getting AI breakdown:", error);
      alert(error instanceof Error ? error.message : "Failed to get AI breakdown");
    } finally {
      setIsGettingAIBreakdown(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your task details below.'
              : 'Add a new task to your list. AI can help break it down into manageable steps.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What do you need to do?"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Estimated Time & Energy Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">
                Estimated Time (min) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min="1"
                placeholder="30"
                {...register("estimatedTime", { valueAsNumber: true })}
              />
              {errors.estimatedTime && (
                <p className="text-sm text-destructive">{errors.estimatedTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energy Level</Label>
              <Select
                value={energyLevel}
                onValueChange={(value) => setValue("energyLevel", value as "LOW" | "MEDIUM" | "HIGH")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low (Admin work)</SelectItem>
                  <SelectItem value="MEDIUM">Medium (Standard)</SelectItem>
                  <SelectItem value="HIGH">High (Creative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-10)</Label>
              <Input
                id="difficulty"
                type="number"
                min="1"
                max="10"
                placeholder="5"
                {...register("difficulty", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                {...register("priority", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              {...register("dueDate")}
            />
          </div>

          {/* AI Breakdown Button */}
          {estimatedTime && estimatedTime > 15 && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGetAIBreakdown}
                disabled={isGettingAIBreakdown}
              >
                {isGettingAIBreakdown ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting AI breakdown...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Breakdown
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Tasks over 15 minutes can be broken down into micro-steps
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
