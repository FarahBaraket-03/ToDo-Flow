import { Plus } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  illustration = 'tasks' 
}) => {
  const illustrations = {
    tasks: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <path d="M70 90 L90 110 L130 70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="4" className="text-gray-300 dark:text-gray-600" />
      </svg>
    ),
    projects: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 200 200" fill="none">
        <rect x="40" y="60" width="120" height="80" rx="8" fill="currentColor" className="text-gray-200 dark:text-gray-700" />
        <rect x="60" y="40" width="80" height="20" rx="4" fill="currentColor" className="text-gray-300 dark:text-gray-600" />
        <circle cx="70" cy="90" r="8" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
        <circle cx="70" cy="115" r="8" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </svg>
    ),
    search: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 200 200" fill="none">
        <circle cx="80" cy="80" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-300 dark:text-gray-600" />
        <line x1="110" y1="110" x2="140" y2="140" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-gray-300 dark:text-gray-600" />
      </svg>
    )
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md animate-fade-in">
        {Icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
        
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
