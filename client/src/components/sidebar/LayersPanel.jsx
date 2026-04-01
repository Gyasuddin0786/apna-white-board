import React, { useState } from 'react';
import { IconButton, Tooltip, Avatar } from '@mui/material';
import { Layers, ArrowUpward, ArrowDownward, People } from '@mui/icons-material';
import { useBoardStore, useUIStore } from '../../store/boardStore';

const TYPE_ICONS = { pencil: '✏️', eraser: '🧹', rect: '▭', circle: '○', arrow: '→', line: '—', text: 'T', sticky: '📝' };

const LayersPanel = () => {
  const { elements, selectedIds, setSelectedIds, moveLayerUp, moveLayerDown, roomUsers } = useBoardStore();
  const { darkMode } = useUIStore();
  const [tab, setTab] = useState('layers');

  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`fixed left-0 top-14 bottom-0 w-56 z-40 border-r flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} ${border}`}>
      <div className={`flex border-b ${border}`}>
        {[{ id: 'layers', icon: <Layers sx={{ fontSize: 16 }} />, label: 'Layers' },
          { id: 'users', icon: <People sx={{ fontSize: 16 }} />, label: `Users${roomUsers.length ? ` (${roomUsers.length})` : ''}` }
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${tab === id ? 'border-b-2 border-indigo-500 text-indigo-500' : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === 'layers' && (
          <>
            {elements.length === 0 && (
              <div className={`text-center py-8 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No elements yet</div>
            )}
            {[...elements].reverse().map((el) => {
              const isSelected = selectedIds.includes(el.id);
              return (
                <div key={el.id} onClick={() => setSelectedIds([el.id])}
                  className="group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer mb-0.5 transition-colors"
                  style={{ backgroundColor: isSelected ? (darkMode ? 'rgba(99,102,241,0.2)' : '#eef2ff') : undefined }}>
                  <span className="text-sm shrink-0">{TYPE_ICONS[el.type] || '?'}</span>
                  <span className={`text-xs flex-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {(el.type === 'text' || el.type === 'sticky') ? (el.text?.slice(0, 14) || el.type) : el.type}
                  </span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton size="small" sx={{ p: 0.3 }} onClick={(e) => { e.stopPropagation(); moveLayerUp(el.id); }}>
                      <ArrowUpward sx={{ fontSize: 11 }} />
                    </IconButton>
                    <IconButton size="small" sx={{ p: 0.3 }} onClick={(e) => { e.stopPropagation(); moveLayerDown(el.id); }}>
                      <ArrowDownward sx={{ fontSize: 11 }} />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'users' && (
          <div className="flex flex-col gap-2 pt-1">
            {roomUsers.length === 0 && (
              <div className={`text-center py-8 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Only you here</div>
            )}
            {roomUsers.map((u) => (
              <div key={u.socketId} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: u.color || '#6366f1' }}>
                  {u.name?.[0]?.toUpperCase()}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{u.name}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Online</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
