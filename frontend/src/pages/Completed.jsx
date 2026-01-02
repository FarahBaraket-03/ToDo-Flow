import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isYesterday, startOfWeek, startOfMonth, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, Trophy, Calendar, Filter, ChevronDown, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskList from '../components/TaskList';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Completed = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, today, week, month
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
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
        params: { status: 'completed' }
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
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer toutes les ${tasks.length} tâches complétées ?`)) {
      return;
    }

    try {
      await Promise.all(tasks.map(task => api.delete(`/tasks/${task.id}`)));
      setTasks([]);
      toast.success('Toutes les tâches ont été supprimées');
    } catch (error) {
      toast.error('Erreur lors de la suppression des tâches');
    }
  };

  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      
      if (filterPeriod !== 'all' && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (filterPeriod === 'today' && !isToday(completedDate)) return false;
        if (filterPeriod === 'week' && !isThisWeek(completedDate, { locale: fr })) return false;
        if (filterPeriod === 'month' && !isThisMonth(completedDate)) return false;
      }
      
      return true;
    });
  }, [tasks, filterPeriod, filterPriority]);

  // Groupement par période
  const groupedTasks = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    filteredTasks.forEach(task => {
      if (!task.completedAt) {
        groups.older.push(task);
        return;
      }

      const completedDate = new Date(task.completedAt);
      
      if (isToday(completedDate)) {
        groups.today.push(task);
      } else if (isYesterday(completedDate)) {
        groups.yesterday.push(task);
      } else if (isThisWeek(completedDate, { locale: fr })) {
        groups.thisWeek.push(task);
      } else if (isThisMonth(completedDate)) {
        groups.thisMonth.push(task);
      } else {
        groups.older.push(task);
      }
    });

    return groups;
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      today: tasks.filter(t => t.completedAt && isToday(new Date(t.completedAt))).length,
      week: tasks.filter(t => t.completedAt && isThisWeek(new Date(t.completedAt), { locale: fr })).length,
      month: tasks.filter(t => t.completedAt && isThisMonth(new Date(t.completedAt))).length
    };
  }, [tasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Complétées
                    </h1>
                    <p className="text-gray-600">
                      Toutes vos tâches terminées
                    </p>
                  </div>
                </div>
                {!loading && tasks.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Tout supprimer</span>
                  </button>
                )}
              </div>

              {/* Stats Cards */}
              {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Trophy className="w-4 h-4" />
                      <span>Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aujourd'hui</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.today}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Cette semaine</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.week}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Ce mois</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.month}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            {!loading && tasks.length > 0 && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <span>Filtres</span>
                    {(filterPeriod !== 'all' || filterPriority !== 'all') && (
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Période</label>
                      <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className="input-field"
                      >
                        <option value="all">Toutes</option>
                        <option value="today">Aujourd'hui</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
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
            )}

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
                  <CheckCircle2 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tasks.length === 0 ? 'Aucune tâche complétée' : 'Aucune tâche trouvée'}
                </h3>
                <p className="text-gray-500">
                  {tasks.length === 0 
                    ? 'Complétez vos premières tâches pour les voir apparaître ici' 
                    : 'Essayez de modifier vos filtres'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Today */}
                {groupedTasks.today.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Aujourd'hui ({groupedTasks.today.length})
                    </h2>
                    <TaskList
                      tasks={groupedTasks.today}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* Yesterday */}
                {groupedTasks.yesterday.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Hier ({groupedTasks.yesterday.length})
                    </h2>
                    <TaskList
                      tasks={groupedTasks.yesterday}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* This Week */}
                {groupedTasks.thisWeek.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Cette semaine ({groupedTasks.thisWeek.length})
                    </h2>
                    <TaskList
                      tasks={groupedTasks.thisWeek}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* This Month */}
                {groupedTasks.thisMonth.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Ce mois ({groupedTasks.thisMonth.length})
                    </h2>
                    <TaskList
                      tasks={groupedTasks.thisMonth}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* Older */}
                {groupedTasks.older.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Plus ancien ({groupedTasks.older.length})
                    </h2>
                    <TaskList
                      tasks={groupedTasks.older}
                      loading={false}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </div>
                )}

                {/* Success Message */}
                {filteredTasks.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 text-green-900 dark:text-green-100">
                      <Trophy className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Excellent travail ! 🎉
                        </h3>
                        <p className="text-green-700">
                          Vous avez complété {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}.
                          Continuez comme ça !
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </div>
  );
};

export default Completed;
