import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Inbox as InboxIcon, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import EditTaskForm from '../components/EditTaskForm';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Inbox = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', {
        params: { projectId: '' }
      });
      setTasks(response.data.tasks);
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
    }
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTask(true);
  };

  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority]);

  // Groupement par statut
  const groupedTasks = useMemo(() => {
    const pending = filteredTasks.filter(t => t.status !== 'completed');
    const completed = filteredTasks.filter(t => t.status === 'completed');
    return { pending, completed };
  }, [filteredTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length
  }), [tasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        projects={projects} 
        onAddTask={() => setShowAddTask(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {/* Header with stats */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <InboxIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Boîte de réception
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Toutes vos tâches sans projet
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Circle className="w-4 h-4" />
                      <span>Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm mb-1">
                      <Circle className="w-4 h-4" />
                      <span>À faire</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complétées</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {!loading && stats.total > 0 && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</span>
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {stats.completed} sur {stats.total} tâches complétées
                  </p>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtres</span>
                  {(filterStatus !== 'all' || filterPriority !== 'all') && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      Actifs
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">Tous</option>
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Complétées</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">Toutes</option>
                      <option value="urgent">Urgente</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Add task button */}
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center gap-2 p-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors mb-6 border-2 border-dashed border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-800"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Ajouter une tâche</span>
            </button>

            {/* Tasks */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 h-20 skeleton" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 mb-4">
                  <InboxIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Votre boîte de réception est vide
                </h3>
                <p className="text-gray-500 mb-6">
                  Organisez vos tâches en les ajoutant ici ou en les assignant à des projets
                </p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter votre première tâche
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Tasks */}
                {groupedTasks.pending.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Circle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        À faire ({groupedTasks.pending.length})
                      </h2>
                    </div>
                    <TaskList
                      tasks={groupedTasks.pending}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* Completed Tasks */}
                {groupedTasks.completed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Complétées ({groupedTasks.completed.length})
                      </h2>
                    </div>
                    <TaskList
                      tasks={groupedTasks.completed}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddTask && (
        <AddTaskForm
          onClose={() => setShowAddTask(false)}
          onTaskAdded={handleTaskAdded}
          projects={projects}
        />
      )}

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
  );
};

export default Inbox;
