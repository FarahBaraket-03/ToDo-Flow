import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const useUndo = () => {
  const undoTimeoutRef = useRef(null);

  const deleteWithUndo = useCallback((item, onDelete, onRestore, options = {}) => {
    const { 
      deleteMessage = 'Supprimé', 
      undoLabel = 'Annuler',
      duration = 5000 
    } = options;

    // Stockage temporaire pour restauration
    const itemCopy = { ...item };
    let isUndone = false;

    // Afficher le toast avec option d'annulation
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {deleteMessage}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {itemCopy.title || itemCopy.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                isUndone = true;
                if (undoTimeoutRef.current) {
                  clearTimeout(undoTimeoutRef.current);
                }
                onRestore(itemCopy);
                toast.dismiss(t.id);
                toast.success('Restauré');
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              {undoLabel}
            </button>
          </div>
        </div>
      ),
      { duration }
    );

    // Supprimer définitivement après le délai
    undoTimeoutRef.current = setTimeout(() => {
      if (!isUndone) {
        onDelete(item.id);
      }
    }, duration);

    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  return { deleteWithUndo };
};

export default useUndo;
