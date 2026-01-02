import TaskItem from './TaskItem';
import TaskSkeleton from './TaskSkeleton';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

const TaskList = ({ tasks, loading, onTaskUpdate, onTaskDelete, emptyTitle, emptyDescription, onAddTask }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyTitle || "Aucune tâche"}
        description={emptyDescription || "Commencez par ajouter votre première tâche"}
        actionLabel={onAddTask ? "Ajouter une tâche" : null}
        onAction={onAddTask}
      />
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
          index={index}
        />
      ))}
    </div>
  );
};

export default TaskList;
