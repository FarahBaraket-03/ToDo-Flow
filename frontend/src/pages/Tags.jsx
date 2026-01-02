import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hash, Plus, X, TrendingUp, CheckCircle2, Clock, Edit2, Trash2, Search } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import EditTaskForm from '../components/EditTaskForm';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Tags = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const allTasks = response.data.tasks;
      setTasks(allTasks);
      
      // Extract all unique tags with stats
      const tagsMap = new Map();
      allTasks.forEach(task => {
        if (task.tags && Array.isArray(task.tags)) {
          task.tags.forEach(tag => {
            if (!tagsMap.has(tag)) {
              tagsMap.set(tag, {
                name: tag,
                total: 0,
                completed: 0,
                pending: 0
              });
            }
            const tagData = tagsMap.get(tag);
            tagData.total++;
            if (task.status === 'completed') {
              tagData.completed++;
            } else {
              tagData.pending++;
            }
          });
        }
      });
      setAllTags(Array.from(tagsMap.values()));
    } catch (error) {
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    if (updatedTask.isEditing) {
      handleEditTask(updatedTask);
    } else {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      fetchTasks(); // Refresh to update tag stats
    }
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    fetchTasks(); // Refresh to update tag stats
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTask(true);
  };

  // Filter tasks by selected tag and search query
  const filteredTasks = useMemo(() => {
    let filtered = selectedTag
      ? tasks.filter(t => t.tags && t.tags.includes(selectedTag))
      : tasks;
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedTag, tasks, searchQuery]);

  // Overall stats
  const overallStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    totalTags: allTags.length
  }), [tasks, allTags]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tagColors = [
    { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', ring: 'ring-red-500' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-500' },
    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', ring: 'ring-yellow-500' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', ring: 'ring-green-500' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-500' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', ring: 'ring-purple-500' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400', ring: 'ring-pink-500' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', ring: 'ring-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 dark:bg-primary-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar 
          projects={projects} 
          onAddTask={() => {}}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {/* Header with stats */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Filtres et étiquettes
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Organisez vos tâches par étiquettes
                  </p>
                </div>
              </div>

              {/* Overall Stats */}
              {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Hash className="w-4 h-4" />
                      <span>Total étiquettes</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.totalTags}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Total tâches</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{overallStats.total}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complétées</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">{overallStats.completed}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>En cours</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{overallStats.pending}</div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg h-32 skeleton" />
                ))}
              </div>
            ) : allTags.length > 0 ? (
              <>
                {/* Tags Grid */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Toutes les étiquettes</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{allTags.length} étiquette{allTags.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
                    {/* All tags button */}
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all ${
                        !selectedTag 
                          ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                          <Hash className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Toutes</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{tasks.length} tâches</span>
                        </div>
                      </div>
                    </button>

                    {/* Individual tags */}
                    {allTags.map((tagData, index) => {
                      const colors = tagColors[index % tagColors.length];
                      const completionRate = tagData.total > 0 
                        ? Math.round((tagData.completed / tagData.total) * 100) 
                        : 0;
                      
                      return (
                        <button
                          key={tagData.name}
                          onClick={() => setSelectedTag(tagData.name)}
                          className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all ${
                            selectedTag === tagData.name 
                              ? `border-primary-500 dark:border-primary-400 ${colors.bg}` 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mb-2`}>
                              <Hash className={`w-6 h-6 ${colors.text}`} />
                            </div>
                            <span className={`font-semibold text-sm mb-1 truncate w-full ${colors.text}`}>
                              #{tagData.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>{tagData.total} tâches</span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                              <div
                                className={`h-1.5 rounded-full ${colors.bg}`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{completionRate}% complété</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search and Task List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {selectedTag ? (
                          <>
                            <span className={tagColors[allTags.findIndex(t => t.name === selectedTag) % tagColors.length]?.text}>
                              #{selectedTag}
                            </span>
                            <button
                              onClick={() => setSelectedTag(null)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          'Toutes les tâches'
                        )}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Search bar */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Rechercher une tâche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {filteredTasks.length > 0 ? (
                    <TaskList
                      tasks={filteredTasks}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <Hash className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Aucune tâche trouvée
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Essayez une autre recherche' : 'Aucune tâche avec cette étiquette'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <Hash className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucune étiquette
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Ajoutez des étiquettes à vos tâches pour les organiser
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Les étiquettes apparaîtront ici automatiquement
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showEditTask && (
        <EditTaskForm
          onClose={() => {
            setShowEditTask(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onTaskUpdated={handleTaskUpdate}
        />
      )}
      </div>
    </div>
  );
};

export default Tags;
