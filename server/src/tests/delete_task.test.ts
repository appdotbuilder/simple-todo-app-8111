import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput, type CreateTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test input for creating a task to delete
const testTaskInput: CreateTaskInput = {
  title: 'Task to Delete'
};

// Test input for deletion
const testDeleteInput: DeleteTaskInput = {
  id: 1
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task successfully', async () => {
    // First create a task to delete
    const createdTask = await db.insert(tasksTable)
      .values({
        title: testTaskInput.title,
        completed: false
      })
      .returning()
      .execute();

    const taskId = createdTask[0].id;

    // Delete the task
    const result = await deleteTask({ id: taskId });

    // Should return success
    expect(result.success).toBe(true);

    // Verify task is deleted from database
    const remainingTasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(remainingTasks).toHaveLength(0);
  });

  it('should return false for non-existent task ID', async () => {
    // Try to delete a task that doesn't exist
    const result = await deleteTask({ id: 999 });

    // Should return failure
    expect(result.success).toBe(false);
  });

  it('should not affect other tasks when deleting one task', async () => {
    // Create multiple tasks
    const task1 = await db.insert(tasksTable)
      .values({
        title: 'Task 1',
        completed: false
      })
      .returning()
      .execute();

    const task2 = await db.insert(tasksTable)
      .values({
        title: 'Task 2',
        completed: true
      })
      .returning()
      .execute();

    const taskToDeleteId = task1[0].id;
    const taskToKeepId = task2[0].id;

    // Delete the first task
    const result = await deleteTask({ id: taskToDeleteId });

    expect(result.success).toBe(true);

    // Verify only the first task is deleted
    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskToDeleteId))
      .execute();

    const remainingTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskToKeepId))
      .execute();

    expect(deletedTask).toHaveLength(0);
    expect(remainingTask).toHaveLength(1);
    expect(remainingTask[0].title).toEqual('Task 2');
    expect(remainingTask[0].completed).toBe(true);
  });

  it('should handle deletion of completed and incomplete tasks equally', async () => {
    // Create a completed task
    const completedTask = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        completed: true
      })
      .returning()
      .execute();

    // Create an incomplete task
    const incompleteTask = await db.insert(tasksTable)
      .values({
        title: 'Incomplete Task',
        completed: false
      })
      .returning()
      .execute();

    // Delete completed task
    const result1 = await deleteTask({ id: completedTask[0].id });
    expect(result1.success).toBe(true);

    // Delete incomplete task
    const result2 = await deleteTask({ id: incompleteTask[0].id });
    expect(result2.success).toBe(true);

    // Verify both are deleted
    const allTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(allTasks).toHaveLength(0);
  });
});