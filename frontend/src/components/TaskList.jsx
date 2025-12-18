import TaskItem from './TaskItem';
import { Loader2 } from 'lucide-react';

const TaskList = ({ tasks, loading, onTaskUpdate, onTaskDelete }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Aucune tâche
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Commencez par ajouter votre première tâche
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
