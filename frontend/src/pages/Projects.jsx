import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📁'
  });
  const [loading, setLoading] = useState(false);

  const icons = ['📁', '💼', '🎯', '📚', '🏋️', '🛒', '🏠', '💻', '🎨', '🎵', '✈️', '🎓'];
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/projects', formData);
      onProjectCreated(response.data.project);
      toast.success('Projet créé avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nouveau projet</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ex: Travail, Sport, Courses..."
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du projet..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icône
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 text-2xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    formData.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 dark:ring-primary-400' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects', {
        params: { includeTaskCount: true }
      });
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Supprimer ce projet ? Les tâches seront déplacées dans la boîte de réception.')) {
      return;
    }
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Projet supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projects={projects} onAddTask={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mes projets</h1>
                <p className="text-gray-600 dark:text-gray-400">Organisez vos tâches par projets</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau projet
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-32 skeleton" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="card hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{project.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>{project.taskCount || 0} tâches</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <span className="text-3xl">📁</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucun projet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Créez votre premier projet pour organiser vos tâches
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  Créer un projet
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Projects;
