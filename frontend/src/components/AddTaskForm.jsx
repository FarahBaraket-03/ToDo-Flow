import { useState, useEffect } from 'react';
import { X, Calendar, Flag, Folder, Tag, Plus, Clock } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AddTaskForm = ({ onClose, onTaskAdded, defaultProject = null, projects = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    projectId: defaultProject?.id || '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // Fetch existing tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/tasks');
        const tasks = response.data.tasks || [];
        const tagsSet = new Set();
        tasks.forEach(task => {
          if (task.tags && Array.isArray(task.tags)) {
            task.tags.forEach(tag => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Update tag suggestions based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !formData.tags.includes(tag)
      );
      setSuggestedTags(filtered.slice(0, 5));
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setSuggestedTags([]);
      setShowTagSuggestions(false);
    }
  }, [tagInput, allTags, formData.tags]);

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

      const response = await api.post('/tasks', {
        ...formData,
        dueDate: combinedDueDate,
        projectId: formData.projectId || null,
        tags: formData.tags
      });
      
      onTaskAdded(response.data.task);
      toast.success('Tâche créée avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-task-title">
      <div 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 id="add-task-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ajouter une tâche
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de la tâche *
            </label>
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
              aria-required="true"
              aria-invalid={!formData.title.trim()}
              className="input-field"
              placeholder="ex: Finir le rapport"
              className="input-field"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ajouter une description..."
              rows={3}
              className="input-field resize-none"
              aria-label="Description de la tâche"
            />
          </div>

          {/* Date, Time and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label htmlFor="task-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance
              </label>
              <input
                id="task-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              Projet
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="input-field"
            >
              <option value="">Boîte de réception</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.icon} {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Étiquettes
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => tagInput.trim() && setShowTagSuggestions(suggestedTags.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder="Ajouter une étiquette..."
                  className="input-field flex-1"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              {/* Autocomplete suggestions */}
              {showTagSuggestions && suggestedTags.length > 0 && (
                <div className="absolute z-20 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto animate-slide-down">
                  {suggestedTags.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, tag]
                        });
                        setTagInput('');
                        setShowTagSuggestions(false);
                        
                        // Update allTags if new tag
                        if (!allTags.includes(tag)) {
                          setAllTags([...allTags, tag]);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                    >
                      <Tag className="w-3 h-3 text-primary-500" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {loading ? 'Création...' : 'Ajouter une tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
