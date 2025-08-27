import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTask = async (input: UpdateTaskInput): Promise<Task> => {
  try {
    // Build the update values object with only provided fields
    const updateValues: { title?: string; completed?: boolean } = {};
    
    if (input.title !== undefined) {
      updateValues.title = input.title;
    }
    
    if (input.completed !== undefined) {
      updateValues.completed = input.completed;
    }

    // If no fields to update, just return the existing task
    if (Object.keys(updateValues).length === 0) {
      const existingTask = await db.select()
        .from(tasksTable)
        .where(eq(tasksTable.id, input.id))
        .execute();

      if (existingTask.length === 0) {
        throw new Error(`Task with id ${input.id} not found`);
      }

      return existingTask[0];
    }

    // Perform the update operation
    const result = await db.update(tasksTable)
      .set(updateValues)
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    // Check if task was found and updated
    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Task update failed:', error);
    throw error;
  }
};