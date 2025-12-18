import { Link, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  Calendar, 
  CheckCircle, 
  Plus,
  Hash,
  ChevronDown,
  CalendarClock
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ projects = [], onAddTask, isOpen, onClose }) => {
  const location = useLocation();
  const [showProjects, setShowProjects] = useState(true);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { icon: Inbox, label: 'Boîte de réception', path: '/inbox' },
    { icon: Calendar, label: "Aujourd'hui", path: '/today' },
    { icon: CalendarClock, label: 'Prochainement', path: '/upcoming' },
    { icon: CheckCircle, label: 'Complétés', path: '/completed' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        flex flex-col h-screen transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Todo Flow</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Projects section */}
        <div className="mb-4">
          <button
            onClick={() => setShowProjects(!showProjects)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300"
          >
            <span>Mes projets</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${showProjects ? '' : '-rotate-90'}`}
            />
          </button>

          {showProjects && (
            <div className="mt-2 space-y-1">
              {projects.length > 0 ? (
                <>
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className={`sidebar-item text-sm group ${
                        isActive(`/projects/${project.id}`) ? 'sidebar-item-active' : ''
                      }`}
                      style={{ borderLeft: `3px solid ${project.color || '#6366f1'}` }}
                    >
                      <span className="text-lg">{project.icon || '📁'}</span>
                      <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{project.name}</span>
                      {project.taskCount !== undefined && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {project.taskCount}
                        </span>
                      )}
                    </Link>
                  ))}
                  <Link to="/projects" className="sidebar-item text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 font-medium">
                    <Plus className="w-4 h-4" />
                    <span>Gérer les projets</span>
                  </Link>
                </>
              ) : (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Aucun projet pour l'instant</p>
                  <Link 
                    to="/projects" 
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Créer votre premier projet
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags section */}
        <div>
          <div className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filtres et étiquettes
          </div>
          <Link to="/tags" className="sidebar-item text-sm">
            <Hash className="w-4 h-4" />
            <span className="text-gray-700 dark:text-gray-300">Toutes les étiquettes</span>
          </Link>
        </div>
      </nav>

      {/* Add task button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button 
          onClick={onAddTask}
          className="w-full btn-primary flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une tâche</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
