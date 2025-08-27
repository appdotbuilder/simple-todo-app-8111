import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput, type UpdateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

// Helper function to create a test task
const createTestTask = async (title: string = 'Test Task') => {
  const result = await db.insert(tasksTable)
    .values({
      title: title,
      completed: false
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task completion status only', async () => {
    // Create a test task
    const createdTask = await createTestTask('Original Title');

    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      completed: true
    };

    const result = await updateTask(updateInput);

    // Check the returned task
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Original Title'); // Title should remain unchanged
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const dbTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(dbTask).toHaveLength(1);
    expect(dbTask[0].completed).toEqual(true);
    expect(dbTask[0].title).toEqual('Original Title');
  });

  it('should update task title only', async () => {
    // Create a test task
    const createdTask = await createTestTask('Original Title');

    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Title'
    };

    const result = await updateTask(updateInput);

    // Check the returned task
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.completed).toEqual(false); // Should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const dbTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(dbTask).toHaveLength(1);
    expect(dbTask[0].title).toEqual('Updated Title');
    expect(dbTask[0].completed).toEqual(false);
  });

  it('should update both title and completion status', async () => {
    // Create a test task
    const createdTask = await createTestTask('Original Title');

    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Completed Task',
      completed: true
    };

    const result = await updateTask(updateInput);

    // Check the returned task
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Completed Task');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const dbTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(dbTask).toHaveLength(1);
    expect(dbTask[0].title).toEqual('Completed Task');
    expect(dbTask[0].completed).toEqual(true);
  });

  it('should mark task as incomplete when completed is false', async () => {
    // Create a completed task
    const createdTask = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        completed: true
      })
      .returning()
      .execute();

    const updateInput: UpdateTaskInput = {
      id: createdTask[0].id,
      completed: false
    };

    const result = await updateTask(updateInput);

    // Check the returned task
    expect(result.id).toEqual(createdTask[0].id);
    expect(result.title).toEqual('Completed Task');
    expect(result.completed).toEqual(false);

    // Verify in database
    const dbTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask[0].id))
      .execute();

    expect(dbTask).toHaveLength(1);
    expect(dbTask[0].completed).toEqual(false);
  });

  it('should throw error when task does not exist', async () => {
    const nonExistentId = 99999;
    
    const updateInput: UpdateTaskInput = {
      id: nonExistentId,
      completed: true
    };

    await expect(updateTask(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve created_at timestamp when updating', async () => {
    // Create a test task
    const createdTask = await createTestTask('Test Task');
    const originalCreatedAt = createdTask.created_at;

    // Wait a small amount to ensure timestamps would differ if updated
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateTaskInput = {
      id: createdTask.id,
      title: 'Updated Task'
    };

    const result = await updateTask(updateInput);

    // The created_at should remain the same
    expect(result.created_at).toEqual(originalCreatedAt);

    // Verify in database
    const dbTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(dbTask[0].created_at).toEqual(originalCreatedAt);
  });

  it('should handle empty update input gracefully', async () => {
    // Create a test task
    const createdTask = await createTestTask('Original Task');

    const updateInput: UpdateTaskInput = {
      id: createdTask.id
      // No title or completed fields provided
    };

    const result = await updateTask(updateInput);

    // Task should remain unchanged
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Original Task');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toEqual(createdTask.created_at);
  });
});