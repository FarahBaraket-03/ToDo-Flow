import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ne pas déclencher si on est dans un input, textarea ou contenteditable
      const isInputField = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || 
                          event.target.isContentEditable;

      shortcuts.forEach(({ key, ctrl, shift, alt, meta, callback, allowInInput }) => {
        const ctrlMatch = ctrl === undefined || event.ctrlKey === ctrl || event.metaKey === ctrl;
        const shiftMatch = shift === undefined || event.shiftKey === shift;
        const altMatch = alt === undefined || event.altKey === alt;
        const metaMatch = meta === undefined || event.metaKey === meta;
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (!isInputField || allowInInput) {
            event.preventDefault();
            callback(event);
          }
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
