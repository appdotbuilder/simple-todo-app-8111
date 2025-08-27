import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import type { Task } from '../../../server/src/schema';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <Card 
      className={`shadow-md transition-all duration-200 hover:shadow-lg task-card-hover animate-slide-in ${
        task.completed 
          ? 'task-completed' 
          : 'task-pending'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => onToggle(task)}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 task-checkbox"
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400 hover:text-blue-600" />
              )}
            </button>
            
            <div className="flex-1">
              <h3 
                className={`font-medium transition-all duration-200 ${
                  task.completed 
                    ? 'text-green-700 line-through opacity-75' 
                    : 'text-gray-800'
                }`}
              >
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Created: {task.created_at.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="button-danger"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}