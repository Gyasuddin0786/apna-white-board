import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';
import api from '../services/api';

export const useAutoSave = (boardId, delay = 3000) => {
  const { elements, title } = useBoardStore();
  const timerRef = useRef(null);
  const lastSavedRef = useRef(null);

  const save = useCallback(async () => {
    if (!boardId) return;
    const payload = JSON.stringify({ elements, title });
    if (payload === lastSavedRef.current) return;
    try {
      await api.put(`/boards/${boardId}`, { elements, title });
      lastSavedRef.current = payload;
    } catch (err) {
      console.error('Auto-save failed:', err.message);
    }
  }, [boardId, elements, title]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, delay);
    return () => clearTimeout(timerRef.current);
  }, [save, delay]);
};
