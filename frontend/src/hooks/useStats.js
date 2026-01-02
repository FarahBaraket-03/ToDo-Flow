import { useMemo } from 'react';
import { eachDayOfInterval, format, subDays, startOfDay, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useStats = (tasks = []) => {
  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        completionRate: 0,
        dailyCompletion: [],
        weeklyCompletion: [],
        monthlyCompletion: [],
        streak: 0,
        averageTimeByPriority: {},
        totalCompleted: 0,
        totalTasks: 0,
        completedThisWeek: 0,
        completedThisMonth: 0,
        priorityBreakdown: {}
      };
    }

    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29); // 30 jours incluant aujourd'hui
    const sevenDaysAgo = subDays(today, 6);   // 7 jours incluant aujourd'hui
    const oneDayAgo = subDays(today, 1);

    // 1. COMPLETION RATE
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. DAILY COMPLETION (derniers 30 jours)
    const allDays = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: today
    });

    const dailyCompletion = allDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const completed = tasks.filter(
        t => t.status === 'completed' && 
             t.completedAt && 
             format(parseISO(t.completedAt), 'yyyy-MM-dd') === dayStr
      ).length;
      
      return {
        date: format(day, 'd MMM', { locale: fr }),
        dateShort: format(day, 'dd/MM'),
        completed,
        timestamp: day.getTime()
      };
    });

    // 3. WEEKLY COMPLETION (7 derniers jours)
    const sevenDays = eachDayOfInterval({
      start: sevenDaysAgo,
      end: today
    });

    const weeklyCompletion = sevenDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const completed = tasks.filter(
        t => t.status === 'completed' && 
             t.completedAt && 
             format(parseISO(t.completedAt), 'yyyy-MM-dd') === dayStr
      ).length;
      
      return {
        day: format(day, 'EEE', { locale: fr }).substring(0, 3),
        date: format(day, 'd MMM', { locale: fr }),
        completed,
        timestamp: day.getTime()
      };
    });

    // 4. MONTHLY COMPLETION (12 derniers mois)
    const monthlyCompletion = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = subDays(today, i * 30);
      const monthStr = format(monthStart, 'yyyy-MM');
      const completed = tasks.filter(
        t => t.status === 'completed' && 
             t.completedAt && 
             format(parseISO(t.completedAt), 'yyyy-MM') === monthStr
      ).length;
      
      monthlyCompletion.push({
        month: format(monthStart, 'MMM', { locale: fr }),
        monthFull: format(monthStart, 'MMMM yyyy', { locale: fr }),
        completed,
        timestamp: monthStart.getTime()
      });
    }

    // 5. STREAK COUNTER (jours consécutifs productifs)
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dayStr = format(currentDate, 'yyyy-MM-dd');
      const hasCompleted = tasks.some(
        t => t.status === 'completed' && 
             t.completedAt && 
             format(parseISO(t.completedAt), 'yyyy-MM-dd') === dayStr
      );
      
      if (hasCompleted) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    // 6. COMPLETION THIS WEEK & MONTH
    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const completedDate = startOfDay(parseISO(t.completedAt));
      return completedDate >= sevenDaysAgo && completedDate <= today;
    }).length;

    const completedThisMonth = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const completedDate = startOfDay(parseISO(t.completedAt));
      return completedDate >= thirtyDaysAgo && completedDate <= today;
    }).length;

    // 7. AVERAGE TIME BY PRIORITY
    const averageTimeByPriority = {};
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    priorities.forEach(priority => {
      const tasksByPriority = tasks.filter(t => t.priority === priority);
      
      if (tasksByPriority.length > 0) {
        const completed = tasksByPriority.filter(t => t.status === 'completed');
        
        if (completed.length > 0) {
          const totalTime = completed.reduce((sum, task) => {
            if (task.createdAt && task.completedAt) {
              const created = parseISO(task.createdAt);
              const done = parseISO(task.completedAt);
              return sum + (done.getTime() - created.getTime());
            }
            return sum;
          }, 0);
          
          const avgTimeMs = totalTime / completed.length;
          const avgDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24) * 10) / 10;
          
          averageTimeByPriority[priority] = {
            label: priority.charAt(0).toUpperCase() + priority.slice(1),
            days: avgDays,
            completed: completed.length,
            total: tasksByPriority.length
          };
        }
      }
    });

    // 8. PRIORITY BREAKDOWN
    const priorityBreakdown = {};
    priorities.forEach(priority => {
      const count = tasks.filter(t => t.priority === priority).length;
      priorityBreakdown[priority] = {
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
      };
    });

    return {
      completionRate,
      dailyCompletion,
      weeklyCompletion,
      monthlyCompletion,
      streak,
      averageTimeByPriority,
      totalCompleted: completedTasks,
      totalTasks,
      completedThisWeek,
      completedThisMonth,
      priorityBreakdown
    };
  }, [tasks]);
};

export default useStats;
