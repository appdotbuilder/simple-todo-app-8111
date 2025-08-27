import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput } from '../../server/src/schema';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { TaskStats } from '@/components/TaskStats';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks on component mount
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create a new task
  const handleCreateTask = async (input: CreateTaskInput) => {
    setIsSubmitting(true);
    try {
      const newTask = await trpc.createTask.mutate(input);
      setTasks((prev: Task[]) => [newTask, ...prev]); // Add to beginning (newest first)
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle task completion status
  const handleToggleTask = async (task: Task) => {
    try {
      const updatedTask = await trpc.updateTask.mutate({
        id: task.id,
        completed: !task.completed
      });
      setTasks((prev: Task[]) => 
        prev.map((t: Task) => t.id === task.id ? updatedTask : t)
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: number) => {
    try {
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 To-Do App</h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        {/* Task Creation Form */}
        <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />

        {/* Task Statistics */}
        <TaskStats tasks={tasks} />

        {/* Task List */}
        {isLoading ? (
          <Card className="shadow-lg animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="shadow-lg animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h2>
              <p className="text-gray-500">No tasks yet. Add one above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: Task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm animate-fade-in">
          <p>Built with ❤️ using React, tRPC, and Radix UI</p>
        </div>
      </div>
    </div>
  );
}

export default App;