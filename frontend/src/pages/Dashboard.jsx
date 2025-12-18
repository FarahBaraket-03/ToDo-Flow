import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/projects', { params: { includeTaskCount: true } })
      ]);
      setStats(statsRes.data.stats);
      setProjects(projectsRes.data.projects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
          <div className="max-w-7xl mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Tableau de bord
            </h1>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card h-32 skeleton" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total des tâches</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="card hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complétées</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.completed || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="card hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En cours</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.pending || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                <div className="card hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En retard</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats?.overdue || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Mes projets
              </h2>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-all duration-300 border border-transparent dark:hover:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{project.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {project.taskCount || 0} tâches
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aucun projet pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
