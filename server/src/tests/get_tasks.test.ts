import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        { title: 'Task 1', completed: false },
        { title: 'Task 2', completed: true },
        { title: 'Task 3', completed: false }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result.map(task => task.title)).toContain('Task 1');
    expect(result.map(task => task.title)).toContain('Task 2');
    expect(result.map(task => task.title)).toContain('Task 3');
  });

  it('should return tasks ordered by creation date (newest first)', async () => {
    // Create tasks with different timestamps
    const task1 = await db.insert(tasksTable)
      .values({ title: 'First Task', completed: false })
      .returning()
      .execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const task2 = await db.insert(tasksTable)
      .values({ title: 'Second Task', completed: true })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const task3 = await db.insert(tasksTable)
      .values({ title: 'Third Task', completed: false })
      .returning()
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    // Newest first (Third, Second, First)
    expect(result[0].title).toEqual('Third Task');
    expect(result[1].title).toEqual('Second Task');
    expect(result[2].title).toEqual('First Task');
  });

  it('should return tasks with all required properties', async () => {
    await db.insert(tasksTable)
      .values({ title: 'Test Task', completed: false })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    const task = result[0];

    expect(task.id).toBeDefined();
    expect(typeof task.id).toBe('number');
    expect(task.title).toEqual('Test Task');
    expect(task.completed).toBe(false);
    expect(task.created_at).toBeInstanceOf(Date);
  });

  it('should handle both completed and incomplete tasks correctly', async () => {
    await db.insert(tasksTable)
      .values([
        { title: 'Incomplete Task', completed: false },
        { title: 'Complete Task', completed: true }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    const incompleteTask = result.find(task => task.title === 'Incomplete Task');
    const completeTask = result.find(task => task.title === 'Complete Task');

    expect(incompleteTask).toBeDefined();
    expect(incompleteTask!.completed).toBe(false);
    expect(completeTask).toBeDefined();
    expect(completeTask!.completed).toBe(true);
  });
});