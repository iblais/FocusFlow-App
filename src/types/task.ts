import { z } from "zod";

// Energy level enum
export const EnergyLevel = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type EnergyLevel = z.infer<typeof EnergyLevel>;

// Task status enum
export const TaskStatus = z.enum(["PENDING", "ACTIVE", "COMPLETED", "DEFERRED"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Micro-step schema
export const MicroStepSchema = z.object({
  step: z.string().min(1, "Step description is required"),
  time: z.number().min(1, "Time must be at least 1 minute"),
  energy: EnergyLevel,
  completed: z.boolean().default(false),
});
export type MicroStep = z.infer<typeof MicroStepSchema>;

// Create task schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  parentTaskId: z.string().optional(),
  estimatedTime: z.number().min(1, "Estimated time must be positive").optional(),
  energyLevel: EnergyLevel.default("MEDIUM"),
  difficulty: z.number().min(1).max(10).optional(),
  priority: z.number().min(0).max(10).default(0),
  dueDate: z.string().optional(), // Accept any date string format (datetime-local compatible)
  tags: z.array(z.string()).default([]),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// Update task schema
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: TaskStatus.optional(),
  estimatedTime: z.number().min(1).optional(),
  actualTime: z.number().min(0).optional(),
  energyLevel: EnergyLevel.optional(),
  difficulty: z.number().min(1).max(10).optional(),
  priority: z.number().min(0).max(10).optional(),
  dueDate: z.string().optional().nullable(), // Accept any date string format
  deferredUntil: z.string().optional().nullable(), // Accept any date string format
  tags: z.array(z.string()).optional(),
  microSteps: z.array(MicroStepSchema).optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Task filter schema
export const TaskFilterSchema = z.object({
  status: TaskStatus.optional(),
  energyLevel: EnergyLevel.optional(),
  parentTaskId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueBefore: z.string().optional(), // Accept any date string format
  dueAfter: z.string().optional(), // Accept any date string format
});
export type TaskFilter = z.infer<typeof TaskFilterSchema>;

// AI breakdown request schema
export const AIBreakdownSchema = z.object({
  taskTitle: z.string().min(1, "Task title is required"),
  taskDescription: z.string().optional(),
  estimatedTime: z.number().min(1, "Estimated time is required"),
  userEFScores: z.object({
    planning: z.number().min(0).max(100),
    workingMemory: z.number().min(0).max(100),
    inhibition: z.number().min(0).max(100),
    flexibility: z.number().min(0).max(100),
    timeManagement: z.number().min(0).max(100),
    selfMonitoring: z.number().min(0).max(100),
  }).optional(),
});
export type AIBreakdownInput = z.infer<typeof AIBreakdownSchema>;
