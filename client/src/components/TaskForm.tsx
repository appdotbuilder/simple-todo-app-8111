import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { CreateTaskInput } from '../../../server/src/schema';

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting = false }: TaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({ title: title.trim() });
    setTitle(''); // Reset form after successful submission
  };

  return (
    <Card className="mb-6 shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Plus className="h-5 w-5 text-blue-600" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="What needs to be done? ✨"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTitle(e.target.value)
            }
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim()}
            className="button-primary px-6"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Adding...
              </>
            ) : (
              'Add Task'
            )}
          </Button>
        </form>
        {title.length > 180 && (
          <p className="text-sm text-amber-600 mt-2">
            {200 - title.length} characters remaining
          </p>
        )}
      </CardContent>
    </Card>
  );
}