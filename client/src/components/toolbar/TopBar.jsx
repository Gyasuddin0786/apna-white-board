import React, { useState } from 'react';
import { Tooltip, IconButton, Divider } from '@mui/material';
import {
  Undo, Redo, Save, ZoomIn, ZoomOut, GridOn, GridOff,
  DarkMode, LightMode, Download, Share, Delete, Group, LayersClear,
} from '@mui/icons-material';
import { useBoardStore, useUIStore } from '../../store/boardStore';
import { downloadURI, exportToPDF } from '../../utils/helpers';
import ShareModal from '../ui/ShareModal';
import { WBLogo } from '../ui/Logo';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TopBar = ({ stageRef, boardId, onTitleChange }) => {
  const {
    title, setTitle, undo, redo, canUndo, canRedo,
    stageScale, setStageScale, setStagePos, gridEnabled, toggleGrid,
    deleteSelected, selectedIds, groupSelected, ungroupSelected, elements, setElements,
  } = useBoardStore();

  const { darkMode, toggleDarkMode } = useUIStore();
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleSave = async () => {
    if (!boardId) return;
    setSaving(true);
    try {
      await api.put(`/boards/${boardId}`, { elements, title });
      toast.success('Board saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPNG = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (uri) downloadURI(uri, `${title}.png`);
  };

  const handleExportPDF = async () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (uri) await exportToPDF(uri, `${title}.pdf`);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.elements) setElements(data.elements);
        if (data.title) setTitle(data.title);
        toast.success('Board imported!');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ title, elements }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    downloadURI(URL.createObjectURL(blob), `${title}.json`);
  };

  const zoom = (factor) => setStageScale(Math.min(Math.max(stageScale * factor, 0.1), 5));
  const resetZoom = () => { setStageScale(1); setStagePos({ x: 0, y: 0 }); };

  const iconColor = darkMode ? '#94a3b8' : '#475569';

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-1.5 border-b shadow-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <WBLogo size={30} />
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); onTitleChange?.(e.target.value); }}
          className={`text-sm font-medium px-2 py-1 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-400 w-36 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'}`}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: darkMode ? '#334155' : '#e2e8f0' }} />

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)">
          <span><IconButton size="small" onClick={undo} disabled={!canUndo()} sx={{ color: iconColor }}><Undo fontSize="small" /></IconButton></span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <span><IconButton size="small" onClick={redo} disabled={!canRedo()} sx={{ color: iconColor }}><Redo fontSize="small" /></IconButton></span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: darkMode ? '#334155' : '#e2e8f0' }} />

        {/* Zoom */}
        <Tooltip title="Zoom Out"><IconButton size="small" onClick={() => zoom(0.8)} sx={{ color: iconColor }}><ZoomOut fontSize="small" /></IconButton></Tooltip>
        <button onClick={resetZoom}
          className={`text-xs px-2 py-1 rounded-lg font-mono min-w-[48px] ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
          {Math.round(stageScale * 100)}%
        </button>
        <Tooltip title="Zoom In"><IconButton size="small" onClick={() => zoom(1.2)} sx={{ color: iconColor }}><ZoomIn fontSize="small" /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: darkMode ? '#334155' : '#e2e8f0' }} />

        {/* Grid */}
        <Tooltip title={gridEnabled ? 'Hide Grid' : 'Show Grid'}>
          <IconButton size="small" onClick={toggleGrid} sx={{ color: gridEnabled ? '#6366f1' : iconColor }}>
            {gridEnabled ? <GridOn fontSize="small" /> : <GridOff fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Selection actions */}
        {selectedIds.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: darkMode ? '#334155' : '#e2e8f0' }} />
            <Tooltip title="Delete (Del)"><IconButton size="small" onClick={deleteSelected} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
            {selectedIds.length > 1 && (
              <Tooltip title="Group"><IconButton size="small" onClick={groupSelected} sx={{ color: iconColor }}><Group fontSize="small" /></IconButton></Tooltip>
            )}
            <Tooltip title="Ungroup"><IconButton size="small" onClick={ungroupSelected} sx={{ color: iconColor }}><LayersClear fontSize="small" /></IconButton></Tooltip>
          </>
        )}

        <div className="flex-1" />

        {/* Share */}
        <button onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: '#6366f1', color: '#6366f1', background: darkMode ? 'transparent' : '#eef2ff' }}>
          <Share sx={{ fontSize: 15 }} /> Share
        </button>

        {/* Export dropdown */}
        <div className="relative group">
          <button className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            Export ▾
          </button>
          <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl border hidden group-hover:block z-50 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {[
              { label: '🖼️ Export PNG', fn: handleExportPNG },
              { label: '📄 Export PDF', fn: handleExportPDF },
              { label: '📦 Export JSON', fn: handleExportJSON },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
            <label className={`w-full text-left px-4 py-2.5 text-xs font-medium cursor-pointer block transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              📂 Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
            </label>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm">
          <Save sx={{ fontSize: 15 }} />
          {saving ? 'Saving...' : 'Save'}
        </button>

        {/* Dark mode */}
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton size="small" onClick={toggleDarkMode} sx={{ color: darkMode ? '#fbbf24' : '#475569' }}>
            {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Tooltip>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} boardId={boardId} boardTitle={title} />
    </>
  );
};

export default TopBar;
