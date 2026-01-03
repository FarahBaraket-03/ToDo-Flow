import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Save, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, logout, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        avatar: profileData.avatar
      });
      updateUser(response.data.user);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    if (!confirm('Toutes vos tâches et projets seront supprimés. Confirmer la suppression ?')) {
      return;
    }

    toast.error('Fonctionnalité de suppression de compte non implémentée pour la sécurité');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const avatarUrl = profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=ef4444&color=fff&size=200`;

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
          <div className="max-w-5xl mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Mon profil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar with avatar and stats */}
              <div className="space-y-6">
                {/* Avatar Card */}
                <div className="card text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={avatarUrl}
                      alt={profileData.name}
                      className="w-32 h-32 rounded-full mx-auto border-4 border-gray-100 dark:border-gray-700"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{user?.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user?.email}</p>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Membre depuis {new Date(user?.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Stats Card */}
                {stats && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total des tâches</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Complétées</span>
                        <span className="font-semibold text-green-600 dark:text-green-500">{stats.completed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">En cours</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-500">{stats.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">En retard</span>
                        <span className="font-semibold text-red-600 dark:text-red-500">{stats.overdue}</span>
                      </div>
                    </div>
                    {stats.total > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Taux de complétion</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {Math.round((stats.completed / stats.total) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeTab === 'general'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Informations générales
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeTab === 'security'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Sécurité
                  </button>
                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Informations du profil
                    </h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          className="input-field bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          L'email ne peut pas être modifié
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL (optionnel)
                        </label>
                        <input
                          type="url"
                          value={profileData.avatar}
                          onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="input-field"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Changer le mot de passe
                      </h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="input-field"
                            required
                            minLength={6}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          {loading ? 'Modification...' : 'Modifier le mot de passe'}
                        </button>
                      </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
                        Zone dangereuse
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        La suppression de votre compte est irréversible. Toutes vos tâches et projets seront perdus.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
};

export default Profile;
