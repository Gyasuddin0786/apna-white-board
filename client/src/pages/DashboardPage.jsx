import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Add, Delete, OpenInNew, Logout, Person } from '@mui/icons-material';
import { Avatar, IconButton, Tooltip } from '@mui/material';

const TEMPLATES = [
  { name: 'Blank Board', elements: [] },
  { name: 'Flowchart', elements: [
    { id: 'tpl1', type: 'rect', x: 100, y: 100, width: 160, height: 60, stroke: '#3b82f6', strokeWidth: 2, fill: '#dbeafe', opacity: 1 },
    { id: 'tpl2', type: 'text', x: 130, y: 122, text: 'Start', fontSize: 16, fill: '#1e40af', stroke: '#1e40af', opacity: 1 },
    { id: 'tpl3', type: 'arrow', points: [180, 160, 180, 220], stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6', opacity: 1 },
    { id: 'tpl4', type: 'rect', x: 100, y: 220, width: 160, height: 60, stroke: '#10b981', strokeWidth: 2, fill: '#d1fae5', opacity: 1 },
    { id: 'tpl5', type: 'text', x: 120, y: 242, text: 'Process', fontSize: 16, fill: '#065f46', stroke: '#065f46', opacity: 1 },
  ]},
  { name: 'Wireframe', elements: [
    { id: 'wf1', type: 'rect', x: 50, y: 50, width: 400, height: 40, stroke: '#6b7280', strokeWidth: 1, fill: '#f3f4f6', opacity: 1 },
    { id: 'wf2', type: 'text', x: 60, y: 62, text: 'Navigation Bar', fontSize: 14, fill: '#374151', stroke: '#374151', opacity: 1 },
    { id: 'wf3', type: 'rect', x: 50, y: 110, width: 280, height: 200, stroke: '#6b7280', strokeWidth: 1, fill: '#f9fafb', opacity: 1 },
    { id: 'wf4', type: 'text', x: 60, y: 200, text: 'Main Content', fontSize: 14, fill: '#374151', stroke: '#374151', opacity: 1 },
    { id: 'wf5', type: 'rect', x: 350, y: 110, width: 100, height: 200, stroke: '#6b7280', strokeWidth: 1, fill: '#f9fafb', opacity: 1 },
    { id: 'wf6', type: 'text', x: 355, y: 200, text: 'Sidebar', fontSize: 12, fill: '#374151', stroke: '#374151', opacity: 1 },
  ]},
];

const DashboardPage = () => {
  const { user, logout, fetchMe } = useAuthStore();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (template = TEMPLATES[0]) => {
    try {
      const { data } = await api.post('/boards', { title: template.name === 'Blank Board' ? 'Untitled Board' : template.name, elements: template.elements });
      navigate(`/board/${data._id}`);
    } catch {
      toast.error('Failed to create board');
    }
  };

  const deleteBoard = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
          <span className="text-lg font-bold text-gray-900">WhiteBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={logout}><Logout fontSize="small" /></IconButton>
          </Tooltip>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Templates */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Start from template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {TEMPLATES.map((tpl) => (
              <button key={tpl.name} onClick={() => createBoard(tpl)}
                className="group flex flex-col items-center justify-center h-28 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <Add className="text-gray-400 group-hover:text-indigo-500 mb-1" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* My Boards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">My Boards</h2>
            <span className="text-sm text-gray-400">{boards.length} boards</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🎨</div>
              <p className="font-medium">No boards yet</p>
              <p className="text-sm">Create your first board above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {boards.map((board) => (
                <div key={board._id}
                  onClick={() => navigate(`/board/${board._id}`)}
                  className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all">
                  {/* Preview */}
                  <div className="h-28 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    <span className="text-4xl opacity-30">🎨</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">{board.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(board.updatedAt)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {board.owner._id === user?.id
                        ? <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">Owner</span>
                        : <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Shared</span>
                      }
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip title="Open">
                      <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/board/${board._id}`); }}>
                        <OpenInNew sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    {board.owner._id === user?.id && (
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#fee2e2' } }}
                          onClick={(e) => deleteBoard(board._id, e)}>
                          <Delete sx={{ fontSize: 14, color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
