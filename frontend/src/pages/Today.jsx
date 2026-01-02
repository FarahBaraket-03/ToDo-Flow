import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format, isPast, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Filter, CheckCircle2, Circle, AlertCircle, ChevronDown, Inbox, Calendar, Grid3x3, List } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';
import EditTaskForm from '../components/EditTaskForm';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Today = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState(() => {
    return localStorage.getItem('today_filterStatus') || 'all';
  });
  const [filterPriority, setFilterPriority] = useState(() => {
    return localStorage.getItem('today_filterPriority') || 'all';
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('today_viewMode') || 'list';
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('today_filterStatus', filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem('today_filterPriority', filterPriority);
  }, [filterPriority]);

  useEffect(() => {
    localStorage.setItem('today_viewMode', viewMode);
  }, [viewMode]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => {
        setShowAddTask(true);
        toast('Nouvelle tâche', { icon: '✨' });
      }
    },
    {
      key: 'f',
      ctrl: true,
      callback: () => {
        setShowFilters(!showFilters);
        toast('Filtres', { icon: '🔍' });
      }
    },
    {
      key: 'Escape',
      callback: () => {
        if (showAddTask) setShowAddTask(false);
        if (showEditTask) setShowEditTask(false);
        if (showFilters) setShowFilters(false);
      }
    }
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
    }
  }, [isAuthenticated, showFilters]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', {
        params: { dueDate: 'today' }
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
      handleEditTask(updatedTask); // Trigger the edit modal
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
    setShowEditTask(true); // Trigger the edit modal
  };

  // Filtrage et groupement des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority]);

  const groupedTasks = useMemo(() => {
    const overdue = [];
    const pending = [];
    const completed = [];

    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        completed.push(task);
      } else if (task.dueDate && isPast(new Date(task.dueDate)) && !isPast(startOfDay(new Date()))) {
        overdue.push(task);
      } else {
        pending.push(task);
      }
    });

    return { overdue, pending, completed };
  }, [filteredTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.dueDate && isPast(new Date(t.dueDate))).length
  }), [tasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const today = new Date();
  const todayFormatted = format(today, 'EEEE d MMMM', { locale: fr });

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
          onAddTask={() => setShowAddTask(true)} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {/* Header with stats */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <span className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </span>
                Aujourd'hui
              </h1>
              <p className="text-gray-600 dark:text-gray-400 capitalize mb-6">
                {todayFormatted}
              </p>

              {/* Stats Cards */}
              {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Circle className="w-4 h-4" />
                      <span>Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 text-sm mb-1">
                      <Circle className="w-4 h-4" />
                      <span>À faire</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{stats.pending}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complétées</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.completed}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 text-sm mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>En retard</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.overdue}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300">
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
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {(filterStatus !== 'all' || filterPriority !== 'all') && (
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterPriority('all');
                        toast.success('Filtres réinitialisés');
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* View mode toggle and Add task button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setShowAddTask(true)}
                className="flex-1 flex items-center gap-2 p-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 border-2 border-dashed border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Ajouter une nouvelle tâche (Ctrl+N)"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Ajouter une tâche</span>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Ctrl+N</span>
              </button>

              {/* View mode toggle */}
              <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Vue liste"
                  title="Vue liste"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Vue grille"
                  title="Vue grille"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grouped Tasks */}
            {filteredTasks.length === 0 ? (
              <TaskList
                tasks={[]}
                loading={loading}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                emptyTitle="Aucune tâche pour aujourd'hui"
                emptyDescription="Profitez de cette journée productive !"
                onAddTask={() => setShowAddTask(true)}
              />
            ) : viewMode === 'grid' ? (
              <div className="space-y-6">
                {/* Overdue Tasks Grid */}
                {groupedTasks.overdue.length > 0 && (
                  <section aria-label="Tâches en retard">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        En retard ({groupedTasks.overdue.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedTasks.overdue.map((task) => (
                        <TaskList
                          key={task.id}
                          tasks={[task]}
                          loading={false}
                          onTaskUpdate={handleTaskUpdate}
                          onTaskDelete={handleTaskDelete}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Pending Tasks Grid */}
                {groupedTasks.pending.length > 0 && (
                  <section aria-label="Tâches à faire">
                    <div className="flex items-center gap-2 mb-3">
                      <Circle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        À faire ({groupedTasks.pending.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedTasks.pending.map((task) => (
                        <TaskList
                          key={task.id}
                          tasks={[task]}
                          loading={false}
                          onTaskUpdate={handleTaskUpdate}
                          onTaskDelete={handleTaskDelete}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Completed Tasks Grid */}
                {groupedTasks.completed.length > 0 && (
                  <section aria-label="Tâches complétées">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Complétées ({groupedTasks.completed.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedTasks.completed.map((task) => (
                        <TaskList
                          key={task.id}
                          tasks={[task]}
                          loading={false}
                          onTaskUpdate={handleTaskUpdate}
                          onTaskDelete={handleTaskDelete}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overdue Tasks */}
                {groupedTasks.overdue.length > 0 && (
                  <section aria-label="Tâches en retard">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        En retard ({groupedTasks.overdue.length})
                      </h2>
                    </div>
                    <TaskList
                      tasks={groupedTasks.overdue}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </section>
                )}

                {/* Pending Tasks */}
                {groupedTasks.pending.length > 0 && (
                  <section aria-label="Tâches à faire">
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
                  </section>
                )}

                {/* Completed Tasks */}
                {groupedTasks.completed.length > 0 && (
                  <section aria-label="Tâches complétées">
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
                  </section>
                )}

                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in" role="region" aria-label="Progression du jour">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression du jour</span>
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
            )}
          </div>
          </main>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskForm
          onClose={() => {
            setShowAddTask(false);
            setEditingTask(null);
          }}
          onTaskAdded={handleTaskAdded}
          projects={projects}
          task={editingTask} // Pass the task to edit
        />
      )}

      {/* Edit Task Modal - Separate from Add Task Modal */}
      {showEditTask && (
        <EditTaskForm
          onClose={() => {
            setShowEditTask(false);
            setEditingTask(null);
          }}
          task={editingTask} // Pass the task to edit
          onTaskUpdated={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default Today;
