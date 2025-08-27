import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTaskInput = {
  title: 'Complete project documentation'
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task', async () => {
    const result = await createTask(testInput);

    // Basic field validation
    expect(result.title).toEqual('Complete project documentation');
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save task to database', async () => {
    const result = await createTask(testInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Complete project documentation');
    expect(tasks[0].completed).toEqual(false);
    expect(tasks[0].created_at).toBeInstanceOf(Date);
  });

  it('should create task with default completed status as false', async () => {
    const result = await createTask(testInput);

    expect(result.completed).toEqual(false);

    // Verify in database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks[0].completed).toEqual(false);
  });

  it('should create multiple tasks with different titles', async () => {
    const input1: CreateTaskInput = { title: 'First task' };
    const input2: CreateTaskInput = { title: 'Second task' };

    const result1 = await createTask(input1);
    const result2 = await createTask(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('First task');
    expect(result2.title).toEqual('Second task');
    expect(result1.completed).toEqual(false);
    expect(result2.completed).toEqual(false);

    // Verify both tasks exist in database
    const allTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(allTasks).toHaveLength(2);
    expect(allTasks.map(task => task.title)).toContain('First task');
    expect(allTasks.map(task => task.title)).toContain('Second task');
  });

  it('should create task with current timestamp', async () => {
    const beforeCreation = new Date();
    
    const result = await createTask(testInput);
    
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at >= beforeCreation).toBe(true);
    expect(result.created_at <= afterCreation).toBe(true);
  });

  it('should handle special characters in task title', async () => {
    const specialInput: CreateTaskInput = {
      title: "Test task with special characters: !@#$%^&*()_+{}|:<>?[]\\;'\",./"
    };

    const result = await createTask(specialInput);

    expect(result.title).toEqual(specialInput.title);

    // Verify in database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks[0].title).toEqual(specialInput.title);
  });
});