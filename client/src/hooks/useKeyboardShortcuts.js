import { useEffect, useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';

export const useKeyboardShortcuts = () => {
  const { undo, redo, deleteSelected, setActiveTool, canUndo, canRedo } = useBoardStore();

  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z': e.preventDefault(); e.shiftKey ? redo() : undo(); break;
        case 'y': e.preventDefault(); redo(); break;
        default: break;
      }
    } else {
      switch (e.key) {
        case 'Delete':
        case 'Backspace': deleteSelected(); break;
        case 'v': setActiveTool('select'); break;
        case 'p': setActiveTool('pencil'); break;
        case 'e': setActiveTool('eraser'); break;
        case 'r': setActiveTool('rect'); break;
        case 'c': setActiveTool('circle'); break;
        case 't': setActiveTool('text'); break;
        case 'l': setActiveTool('line'); break;
        case 'Escape': setActiveTool('select'); break;
        default: break;
      }
    }
  }, [undo, redo, deleteSelected, setActiveTool]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
