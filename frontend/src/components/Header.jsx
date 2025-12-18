import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Bell, Search, User, LogOut, Moon, Sun, Menu, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/tasks', {
        params: { dueDate: 'today' }
      });
      const tasks = response.data.tasks;
      
      // Create notifications for overdue and upcoming tasks
      const now = new Date();
      const notifs = [];
      
      tasks.forEach(task => {
        if (task.status !== 'completed' && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const diffHours = (dueDate - now) / (1000 * 60 * 60);
          
          if (diffHours < 0) {
            notifs.push({
              id: task.id,
              type: 'overdue',
              title: 'Tâche en retard',
              message: task.title,
              time: task.dueDate,
              task: task
            });
          } else if (diffHours < 2 && diffHours > 0) {
            notifs.push({
              id: task.id,
              type: 'upcoming',
              title: 'Tâche imminente',
              message: task.title,
              time: task.dueDate,
              task: task
            });
          }
        }
      });
      
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Search functionality with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setSearchLoading(true);
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        api.get('/tasks', { params: { search: query } }),
        api.get('/projects')
      ]);
      
      const tasks = tasksResponse.data.tasks || [];
      const projects = projectsResponse.data.projects || [];
      
      const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults({
        tasks: tasks.slice(0, 5),
        projects: filteredProjects.slice(0, 3)
      });
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.tasks?.length > 0) {
      navigate('/inbox'); // Or navigate to search results page
    }
  };

  const handleTaskClick = (task) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate('/today'); // Navigate to the page with the task
  };

  const handleProjectClick = (project) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/projects/${project.id}`);
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    navigate('/today');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher des tâches, projets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50 hidden md:block">
              {searchLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Recherche...</p>
                </div>
              ) : (
                <>
                  {searchResults.tasks?.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tâches</div>
                      {searchResults.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            task.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {format(new Date(task.dueDate), 'd MMM', { locale: fr })}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.projects?.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Projets</div>
                      {searchResults.projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                        >
                          <span className="text-lg">{project.icon || '📁'}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!searchResults.tasks?.length && !searchResults.projects?.length && (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aucun résultat trouvé</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group"
            title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label="Toggle dark mode"
          >
            <div className="relative w-5 h-5">
              {/* Sun icon */}
              <Sun 
                className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-transform duration-300 ${
                  isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                }`} 
              />
              {/* Moon icon */}
              <Moon 
                className={`absolute inset-0 w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                  isDarkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`} 
              />
            </div>
            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {isDarkMode ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-slide-down z-50 max-h-[32rem] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {format(new Date(notification.time), 'PPp', { locale: fr })}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aucune notification</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vous êtes à jour !</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
              title="Menu utilisateur"
            >
              {user?.profileImage || user?.avatar ? (
                <img 
                  src={user?.profileImage || user?.avatar} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium hidden md:block text-gray-700 dark:text-gray-300">{user?.name}</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-slide-down">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
