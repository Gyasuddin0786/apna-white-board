import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore, useUIStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { useCollaboration } from '../hooks/useCollaboration';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoSave } from '../hooks/useAutoSave';
import WhiteboardCanvas from '../components/canvas/WhiteboardCanvas';
import ToolBar from '../components/toolbar/ToolBar';
import TopBar from '../components/toolbar/TopBar';
import PropertiesPanel from '../components/sidebar/PropertiesPanel';
import LayersPanel from '../components/sidebar/LayersPanel';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, fetchMe } = useAuthStore();
  const { setBoardMeta, setElements } = useBoardStore();
  const { darkMode } = useUIStore();
  const stageRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const { emitElements, emitCursor, emitTitleChange } = useCollaboration(id);
  useKeyboardShortcuts();
  useAutoSave(id);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // If user not yet hydrated from persist, fetch first
    const init = async () => {
      if (!user) await fetchMe();
      await loadBoard();
    };
    init();
  }, [id, token]);

  const loadBoard = async () => {
    try {
      const { data } = await api.get(`/boards/${id}`);
      setBoardMeta({ boardId: data._id, title: data.title, role: data.role, background: data.background, gridEnabled: data.gridEnabled });
      setElements(data.elements || [], false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load board');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen overflow-hidden relative ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopBar stageRef={stageRef} boardId={id} onTitleChange={emitTitleChange} />
      <LayersPanel />
      <ToolBar />
      <div className="absolute inset-0 pt-14 pl-56 pr-60">
        <WhiteboardCanvas
          stageRef={stageRef}
          onElementsChange={emitElements}
          onCursorMove={emitCursor}
        />
      </div>
      <PropertiesPanel />
    </div>
  );
};

export default BoardPage;
