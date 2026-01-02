import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const KeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      callback: () => setIsOpen(true)
    }
  ]);

  const shortcuts = [
    { key: 'Ctrl + N', description: 'Nouvelle tâche' },
    { key: 'Ctrl + F', description: 'Basculer les filtres' },
    { key: 'Ctrl + K', description: 'Focus sur la recherche' },
    { key: 'Escape', description: 'Fermer les modales' },
    { key: 'Shift + ?', description: 'Afficher cette aide' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group animate-bounce-subtle"
        aria-label="Afficher les raccourcis clavier"
        title="Raccourcis clavier (Shift + ?)"
      >
        <Keyboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Raccourcis clavier
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100 shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Shift + ?</kbd> pour afficher cette aide
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
