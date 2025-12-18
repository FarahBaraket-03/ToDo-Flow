import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format, addDays, startOfWeek, isSameDay, parseISO, addWeeks, subWeeks, isThisWeek, isFuture, isToday, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AddTaskForm from '../components/AddTaskForm';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Upcoming = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
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
      const response = await api.get('/tasks');
      // Filter tasks to show today and future tasks
      const allTasks = response.data.tasks;
      const todayStart = startOfDay(new Date());
      const upcomingTasks = allTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = parseISO(task.dueDate);
        return taskDate >= todayStart;
      });
      setTasks(upcomingTasks);
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

  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterPriority]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: filteredTasks.length,
      thisWeek: filteredTasks.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = parseISO(t.dueDate);
        return isThisWeek(taskDate, { locale: fr, weekStartsOn: 1 }) || isToday(taskDate);
      }).length,
      withTime: filteredTasks.filter(t => {
        if (!t.dueDate) return false;
        const date = parseISO(t.dueDate);
        return date.getHours() !== 0 || date.getMinutes() !== 0;
      }).length
    };
  }, [filteredTasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Time slots for calendar view (6:00 to 23:00)
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

  // Get tasks for a specific day
  const getTasksForDay = (day) => {
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(parseISO(task.dueDate), day);
    });
  };

  // Get all-day tasks (no specific time)
  const getAllDayTasks = (day) => {
    return getTasksForDay(day).filter(task => {
      const taskDate = parseISO(task.dueDate);
      return taskDate.getHours() === 0 && taskDate.getMinutes() === 0;
    });
  };

  // Get time-specific tasks
  const getTimedTasks = (day) => {
    return getTasksForDay(day).filter(task => {
      const taskDate = parseISO(task.dueDate);
      return taskDate.getHours() !== 0 || taskDate.getMinutes() !== 0;
    });
  };

  // Get color based on priority or project
  const getTaskColor = (task) => {
    if (task.project?.color) return task.project.color;
    
    const priorityColors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    return priorityColors[task.priority] || '#3b82f6';
  };

  // Calculate task position and height based on time
  const getTaskStyle = (task) => {
    const taskDate = parseISO(task.dueDate);
    const hour = taskDate.getHours();
    const minutes = taskDate.getMinutes();
    
    if (hour < 6) return null; // Don't show tasks before 6am
    
    const topPosition = ((hour - 6) * 60 + minutes) / 60 * 64; // 64px per hour
    const height = 48; // Default 45min height
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      backgroundColor: getTaskColor(task),
    };
  };

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
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Prochainement</h1>
                    <p className="text-gray-600 dark:text-gray-400">Vos tâches à venir</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {/* View toggle */}
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                        viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      <span className="hidden sm:inline">Calendrier</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2 md:px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                        viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="hidden sm:inline">Liste</span>
                      <span className="sm:hidden">☰</span>
                    </button>
                  </div>

                  {/* Week navigation */}
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2 py-1">
                    <button
                      onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium px-3 capitalize">
                      {format(currentWeekStart, 'MMM yyyy', { locale: fr })}
                    </span>
                    <button
                      onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    className="btn-secondary text-sm"
                  >
                    Aujourd'hui
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {!loading && filteredTasks.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Cette semaine</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.thisWeek}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Avec horaire</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.withTime}</div>
                  </div>
                </div>
              )}

              {/* Filters */}
              {!loading && filteredTasks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      <span>Filtres</span>
                      {filterPriority !== 'all' && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          Actifs
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="all">Toutes</option>
                        <option value="urgent">Urgente</option>
                        <option value="high">Haute</option>
                        <option value="medium">Moyenne</option>
                        <option value="low">Basse</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Quick add button */}
              <button
                onClick={() => setShowAddTask(true)}
                className="w-full flex items-center gap-2 p-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors mb-4 border-2 border-dashed border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-800"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Ajouter une tâche</span>
              </button>
            </div>

            {viewMode === 'calendar' ? (
              /* Calendar View */
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                {/* Week header */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="p-4"></div>
                  {weekDays.map((day, index) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={index}
                        className={`p-4 text-center border-l border-gray-200 dark:border-gray-700 ${
                          isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1 font-medium">
                          {format(day, 'EEE', { locale: fr })}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            isToday
                              ? 'w-8 h-8 bg-primary-600 dark:bg-primary-500 text-white rounded-full inline-flex items-center justify-center'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All-day tasks section */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50 dark:bg-gray-800">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    Toute la<br />journée
                  </div>
                  {weekDays.map((day, index) => {
                    const allDayTasks = getAllDayTasks(day);
                    return (
                      <div key={index} className="p-1 border-l border-gray-200 dark:border-gray-700 min-h-[60px]">
                        {allDayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="mb-1 p-2 rounded-md text-xs text-white truncate cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                            style={{ backgroundColor: getTaskColor(task) }}
                            title={`${task.title}${task.description ? ' - ' + task.description : ''}`}
                          >
                            <div className="flex items-center gap-1">
                              {task.priority === 'urgent' && <span className="text-[10px]">🔥</span>}
                              <span className="truncate font-medium">{task.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Time grid */}
                <div className="relative overflow-y-auto max-h-[calc(100vh-350px)]">
                  <div className="grid grid-cols-[80px_repeat(7,1fr)]">
                    {/* Time column */}
                    <div className="relative bg-gray-50 dark:bg-gray-800/50">
                      {timeSlots.map((hour) => (
                        <div key={hour} className="h-16 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 pr-2 text-right pt-1 font-medium">
                          {hour}:00
                        </div>
                      ))}
                    </div>

                    {/* Days columns */}
                    {weekDays.map((day, dayIndex) => {
                      const timedTasks = getTimedTasks(day);
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div key={dayIndex} className={`relative border-l border-gray-200 dark:border-gray-700 ${
                          isToday ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                        }`}>
                          {/* Hour lines */}
                          {timeSlots.map((hour) => (
                            <div key={hour} className="h-16 border-b border-gray-100 dark:border-gray-700" />
                          ))}

                          {/* Tasks */}
                          {timedTasks.map((task) => {
                            const style = getTaskStyle(task);
                            if (!style) return null;
                            const taskDate = parseISO(task.dueDate);
                            
                            return (
                              <div
                                key={task.id}
                                className="absolute left-1 right-1 rounded-md px-2 py-1 text-white text-xs cursor-pointer hover:opacity-90 hover:shadow-lg transition-all overflow-hidden border-l-2 border-white/30"
                                style={style}
                                title={`${task.title} - ${format(taskDate, 'HH:mm', { locale: fr })}`}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Clock className="w-3 h-3 opacity-80" />
                                  <span className="text-[10px] font-semibold opacity-90">
                                    {format(taskDate, 'HH:mm')}
                                  </span>
                                  {task.priority === 'urgent' && <span className="text-[10px] ml-auto">🔥</span>}
                                </div>
                                <div className="font-medium truncate">{task.title}</div>
                                {task.description && (
                                  <div className="text-[10px] opacity-80 truncate mt-0.5">{task.description}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {weekDays.map((day) => {
                  const dayTasks = getTasksForDay(day);
                  if (dayTasks.length === 0) return null;
                  
                  const isToday = isSameDay(day, new Date());
                  const allDayTasks = getAllDayTasks(day);
                  const timedTasks = getTimedTasks(day);

                  return (
                    <div key={day.toString()} className={`bg-white dark:bg-gray-800 rounded-lg border ${
                      isToday ? 'border-primary-300 dark:border-primary-700 shadow-md' : 'border-gray-200 dark:border-gray-700'
                    } p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                          {isToday && (
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                              Aujourd'hui
                            </span>
                          )}
                          {format(day, 'EEEE d MMMM', { locale: fr })}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {dayTasks.length} tâche{dayTasks.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {/* All-day tasks */}
                        {allDayTasks.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              Toute la journée
                            </div>
                            {allDayTasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700 mb-2"
                              >
                                <div
                                  className="w-1 h-12 rounded-full"
                                  style={{ backgroundColor: getTaskColor(task) }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {task.title}
                                    {task.priority === 'urgent' && <span className="text-sm">🔥</span>}
                                  </div>
                                  {task.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</div>
                                  )}
                                  {task.project && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs">{task.project.icon}</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Timed tasks */}
                        {timedTasks.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Avec horaire
                            </div>
                            {timedTasks.sort((a, b) => {
                              return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
                            }).map((task) => {
                              const taskDate = parseISO(task.dueDate);
                              return (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700 mb-2"
                                >
                                  <div
                                    className="w-1 h-12 rounded-full"
                                    style={{ backgroundColor: getTaskColor(task) }}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                      {task.title}
                                      {task.priority === 'urgent' && <span className="text-sm">🔥</span>}
                                    </div>
                                    {task.description && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</div>
                                    )}
                                    {task.project && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs">{task.project.icon}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                      <Clock className="w-3 h-3" />
                                      {format(taskDate, 'HH:mm')}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
};

export default Upcoming;
