import { useState } from 'react';
import { X, Calendar, Flag, Clock } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EditTaskForm = ({ task, onClose, onTaskUpdated }) => {
  // Parse the dueDate to extract date and time separately
  const parseDueDate = (dueDateString) => {
    if (!dueDateString) return { date: '', time: '' };
    
    const date = new Date(dueDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: hours !== '00' || minutes !== '00' ? `${hours}:${minutes}` : ''
    };
  };

  const { date: initialDate, time: initialTime } = parseDueDate(task.dueDate);

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    dueDate: initialDate,
    dueTime: initialTime,
    priority: task.priority || 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setLoading(true);
    try {
      // Combine dueDate and dueTime if both are provided
      let combinedDueDate = formData.dueDate || null;
      if (formData.dueDate && formData.dueTime) {
        combinedDueDate = `${formData.dueDate}T${formData.dueTime}:00`;
      }

      const response = await api.put(`/tasks/${task.id}`, {
        ...formData,
        dueDate: combinedDueDate
      });
      onTaskUpdated(response.data.task);
      toast.success('Tâche mise à jour avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Modifier la tâche
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Finir le rapport"
              className="input-field"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ajouter une description..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Heure
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskForm;