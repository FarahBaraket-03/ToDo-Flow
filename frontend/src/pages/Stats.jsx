import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AddTaskForm from '../components/AddTaskForm';
import { CompletionChart, StreakCounter, AverageTimeCard, PriorityBreakdown, MonthlyCompletionChart } from '../components/StatsCharts';
import useStats from '../hooks/useStats';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Stats = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const stats = useStats(tasks);

  const handleDownloadReport = () => {
    try {
      // Simple CSV export
      const csv = [
        ['Statistiques - ' + new Date().toLocaleDateString('fr-FR')],
        [],
        ['Taux de completion', `${stats.completionRate}%`],
        ['Tâches complétées', stats.totalCompleted],
        ['Total de tâches', stats.totalTasks],
        ['Série actuelle', `${stats.streak} jours`],
        ['Complétées cette semaine', stats.completedThisWeek],
        ['Complétées ce mois', stats.completedThisMonth],
        [],
        ['Temps moyen par priorité'],
        ...Object.entries(stats.averageTimeByPriority).map(([_, value]) => [
          value.label,
          `${value.days} jours`,
          `${value.completed}/${value.total} complétées`
        ])
      ];

      const csvContent = csv.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport-stats-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      toast.success('Rapport téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        projects={projects}
        onAddTask={() => setShowAddTask(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin">
                <BarChart3 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          ) : (
            <div className="max-w-7xl space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Statistiques</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Analysez votre productivité et vos progrès
                  </p>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Télécharger le rapport"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Télécharger</span>
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Taux de completion</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stats.totalCompleted} sur {stats.totalTasks}
                  </p>
                </div>

                {/* Completed This Week */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Cette semaine</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completedThisWeek}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tâches complétées</p>
                </div>

                {/* Completed This Month */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Ce mois</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completedThisMonth}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tâches complétées</p>
                </div>

                {/* Average */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Moyenne/jour</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.dailyCompletion.length > 0
                      ? Math.round(stats.dailyCompletion.reduce((sum, d) => sum + d.completed, 0) / stats.dailyCompletion.length * 10) / 10
                      : 0
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">tâches par jour</p>
                </div>
              </div>

              {/* Streak Banner */}
              <StreakCounter streak={stats.streak} />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Completion */}
                <CompletionChart data={stats.dailyCompletion} period="daily" />

                {/* Priority Breakdown */}
                <PriorityBreakdown data={stats.priorityBreakdown} />
              </div>

              {/* Average Time Card */}
              <AverageTimeCard data={stats.averageTimeByPriority} />

              {/* Monthly Chart */}
              <MonthlyCompletionChart data={stats.monthlyCompletion} />

              {/* Weekly Chart */}
              <CompletionChart data={stats.weeklyCompletion} period="weekly" />

              {/* Empty State */}
              {stats.totalTasks === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Aucune donnée pour le moment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complétez des tâches pour voir vos statistiques apparaître ici
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskForm
          onClose={() => setShowAddTask(false)}
          onTaskAdded={(newTask) => {
            setTasks([newTask, ...tasks]);
            setShowAddTask(false);
          }}
          projects={projects}
        />
      )}
    </div>
  );
};

export default Stats;
