import { Badge } from '@/components/ui/badge';
import type { Task } from '../../../server/src/schema';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const completedCount = tasks.filter((task: Task) => task.completed).length;
  const totalCount = tasks.length;
  const remainingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex justify-center gap-4 mb-6 animate-fade-in">
      <Badge variant="outline" className="px-4 py-2 bg-white/80 backdrop-blur-sm">
        📊 Total: {totalCount}
      </Badge>
      <Badge variant="outline" className="px-4 py-2 bg-green-50/80 backdrop-blur-sm border-green-200">
        ✅ Completed: {completedCount}
      </Badge>
      <Badge variant="outline" className="px-4 py-2 bg-orange-50/80 backdrop-blur-sm border-orange-200">
        ⏳ Remaining: {remainingCount}
      </Badge>
      {totalCount > 0 && (
        <Badge variant="outline" className="px-4 py-2 bg-blue-50/80 backdrop-blur-sm border-blue-200">
          📈 {completionPercentage}% Complete
        </Badge>
      )}
    </div>
  );
}