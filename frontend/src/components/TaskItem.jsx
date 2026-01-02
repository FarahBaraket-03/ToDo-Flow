import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Circle, 
  CheckCircle2, 
  Calendar, 
  Flag,
  MoreHorizontal,
  Trash2,
  Edit2,
  GripVertical
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TaskItem = ({ task, onUpdate, onDelete, index = 0, onDragStart, onDragEnd, onDragOver, onDrop, draggable = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);
  const taskRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const response = await api.patch(`/tasks/${task.id}/toggle`);
      
      // Animation delay before update
      setTimeout(() => {
        onUpdate(response.data.task);
        toast.success(
          task.status === 'completed' ? 'Tâche réouverte' : 'Tâche complétée',
          {
            icon: task.status === 'completed' ? '🔄' : '✅',
          }
        );
        setIsCompleting(false);
      }, 300);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    // Store task copy for undo
    const taskCopy = { ...task };
    
    // Optimistically remove from UI
    onDelete(task.id);
    
    // Show undo toast
    const toastId = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Tâche supprimée
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {taskCopy.title}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={async () => {
                // Restore task
                try {
                  // Re-add to UI
                  onUpdate(taskCopy);
                  toast.dismiss(toastId);
                  toast.success('Tâche restaurée');
                  setIsDeleting(false);
                } catch (error) {
                  toast.error('Erreur lors de la restauration');
                }
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
    
    // Delete from backend after delay
    setTimeout(async () => {
      try {
        await api.delete(`/tasks/${task.id}`);
        setIsDeleting(false);
      } catch (error) {
        // If API call fails, restore the task
        onUpdate(taskCopy);
        toast.error('Erreur lors de la suppression');
        setIsDeleting(false);
      }
    }, 5000);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    // Limit swipe to reasonable range
    if (diff > 0 && diff < 100) {
      setTouchOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchOffset > 60) {
      // Swipe threshold reached - show delete
      handleDelete();
    }
    
    setTouchStart(null);
    setTouchOffset(0);
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
    <div 
      ref={taskRef}
      draggable={draggable && !isCompleted}
      onDragStart={(e) => {
        if (draggable && !isCompleted) {
          setIsDragging(true);
          onDragStart?.(e, task, index);
        }
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd?.(e);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, index);
      }}
      className={`task-item group stagger-item ${isCompleting ? 'animate-scale-in' : ''} ${isDeleting ? 'animate-leave' : ''} ${isDragging ? 'opacity-50 cursor-grabbing' : ''} ${draggable && !isCompleted ? 'cursor-grab' : ''}`}
      style={{
        transform: `translateX(-${touchOffset}px)`,
        transition: touchStart ? 'none' : 'transform 0.3s ease-out',
        animationDelay: `${index * 0.05}s`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe delete indicator (mobile) */}
      {touchOffset > 30 && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 bg-red-500 rounded-r-lg"
          style={{ width: `${touchOffset}px` }}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Drag handle */}
      {draggable && !isCompleted && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={toggleComplete}
        disabled={isCompleting}
        className="flex-shrink-0 mt-0.5 relative focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-full"
        aria-label={isCompleted ? "Marquer comme non terminé" : "Marquer comme terminé"}
        aria-pressed={isCompleted}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-primary-600 animate-bounce-subtle" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600 hover:scale-110 transition-all duration-200" />
        )}
        {isCompleting && (
          <span className="absolute inset-0 rounded-full border-2 border-primary-500 animate-pulse-ring"></span>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className={`text-sm font-medium transition-all duration-300 ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Options de la tâche"
              aria-expanded={showMenu}
              aria-haspopup="true"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 animate-scale-in"
                role="menu"
                aria-orientation="vertical"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleEdit();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                  role="menuitem"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                  role="menuitem"
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
