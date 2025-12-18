import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Circle, 
  CheckCircle2, 
  Calendar, 
  Flag,
  MoreHorizontal,
  Trash2,
  Edit2 
} from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleComplete = async () => {
    try {
      const response = await api.patch(`/tasks/${task.id}/toggle`);
      onUpdate(response.data.task);
      toast.success(
        task.status === 'completed' ? 'Tâche réouverte' : 'Tâche complétée'
      );
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${task.id}`);
      onDelete(task.id);
      toast.success('Tâche supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = () => {
    onUpdate({ ...task, isEditing: true });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || colors.medium;
  };

  const isCompleted = task.status === 'completed';

  return (
    <div className="task-item group">
      {/* Checkbox */}
      <button
        onClick={toggleComplete}
        className="flex-shrink-0 mt-0.5"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-primary-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleEdit();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(task.dueDate), 'd MMM', { locale: fr })}
              </span>
            </div>
          )}
          
          {task.priority && task.priority !== 'medium' && (
            <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
          )}

          {task.project && (
            <div className="flex items-center gap-1">
              <span className="text-xs">{task.project.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{task.project.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
