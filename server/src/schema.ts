import { z } from 'zod';

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty')
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating task status
export const updateTaskInputSchema = z.object({
  id: z.number(),
  completed: z.boolean().optional(),
  title: z.string().min(1, 'Task title cannot be empty').optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

// Input schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;