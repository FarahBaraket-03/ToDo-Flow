const TaskSkeleton = () => {
  return (
    <div className="task-item animate-pulse">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default TaskSkeleton;
