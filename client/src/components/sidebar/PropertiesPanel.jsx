import React from 'react';
import { Slider, Typography, Tooltip, IconButton } from '@mui/material';
import { ArrowUpward, ArrowDownward, Delete, ContentCopy } from '@mui/icons-material';
import { useBoardStore, useUIStore } from '../../store/boardStore';
import { generateId } from '../../utils/helpers';

const PRESET_COLORS = ['#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff','#94a3b8'];
const FILL_PRESETS = ['transparent','#fef9c3','#dbeafe','#dcfce7','#fce7f3','#f3e8ff','#ffedd5'];

const PropertiesPanel = () => {
  const {
    selectedIds, elements, strokeColor, fillColor, strokeWidth,
    fontSize, opacity, setStrokeColor, setFillColor, setStrokeWidth,
    setFontSize, setOpacity, updateElement, deleteSelected, addElement,
    moveLayerUp, moveLayerDown,
  } = useBoardStore();
  const { darkMode } = useUIStore();

  const selectedEl = elements.find((el) => el.id === selectedIds[0]);

  const updateSelected = (updates) => selectedIds.forEach((id) => updateElement(id, updates));

  const duplicateSelected = () => {
    if (!selectedEl) return;
    addElement({ ...selectedEl, id: generateId(), x: (selectedEl.x || 0) + 20, y: (selectedEl.y || 0) + 20 });
  };

  const bg = darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
  const label = `text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const iconColor = darkMode ? '#94a3b8' : undefined;

  return (
    <div className={`fixed right-0 top-14 bottom-0 w-60 z-40 overflow-y-auto border-l p-4 flex flex-col gap-4 ${bg}`}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>Properties</Typography>

      <div className="flex flex-col gap-2">
        <span className={label}>Stroke Color</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button key={c} onClick={() => { setStrokeColor(c); updateSelected({ stroke: c }); }}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: strokeColor === c ? '#6366f1' : '#e2e8f0' }} />
          ))}
        </div>
        <input type="color" value={strokeColor}
          onChange={(e) => { setStrokeColor(e.target.value); updateSelected({ stroke: e.target.value }); }}
          className="w-full h-8 rounded cursor-pointer border-0" />
      </div>

      <div className="flex flex-col gap-2">
        <span className={label}>Fill Color</span>
        <div className="flex flex-wrap gap-1.5">
          {FILL_PRESETS.map((c) => (
            <button key={c} onClick={() => { setFillColor(c); updateSelected({ fill: c }); }}
              className="w-6 h-6 rounded border-2 transition-transform hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: c === 'transparent' ? 'white' : c, borderColor: fillColor === c ? '#6366f1' : '#e2e8f0' }}
              title={c === 'transparent' ? 'No fill' : c}>
              {c === 'transparent' && <span className="text-gray-400 text-xs leading-none">∅</span>}
            </button>
          ))}
        </div>
        {fillColor !== 'transparent' && (
          <input type="color" value={fillColor}
            onChange={(e) => { setFillColor(e.target.value); updateSelected({ fill: e.target.value }); }}
            className="w-full h-8 rounded cursor-pointer border-0" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className={label}>Stroke Width: {strokeWidth}px</span>
        <Slider min={1} max={20} value={strokeWidth}
          onChange={(_, v) => { setStrokeWidth(v); updateSelected({ strokeWidth: v }); }}
          sx={{ color: '#6366f1' }} size="small" />
      </div>

      <div className="flex flex-col gap-2">
        <span className={label}>Opacity: {Math.round(opacity * 100)}%</span>
        <Slider min={0.1} max={1} step={0.05} value={opacity}
          onChange={(_, v) => { setOpacity(v); updateSelected({ opacity: v }); }}
          sx={{ color: '#6366f1' }} size="small" />
      </div>

      {selectedEl && (selectedEl.type === 'text' || selectedEl.type === 'sticky') && (
        <div className="flex flex-col gap-2">
          <span className={label}>Font Size: {fontSize}px</span>
          <Slider min={8} max={72} value={fontSize}
            onChange={(_, v) => { setFontSize(v); updateSelected({ fontSize: v }); }}
            sx={{ color: '#6366f1' }} size="small" />
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={label}>Actions</span>
          <div className="flex gap-1 flex-wrap">
            <Tooltip title="Move Up"><IconButton size="small" onClick={() => moveLayerUp(selectedIds[0])} sx={{ color: iconColor }}><ArrowUpward fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Move Down"><IconButton size="small" onClick={() => moveLayerDown(selectedIds[0])} sx={{ color: iconColor }}><ArrowDownward fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Duplicate"><IconButton size="small" onClick={duplicateSelected} sx={{ color: iconColor }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={deleteSelected} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
          </div>
        </div>
      )}

      {selectedEl && (
        <div className={`text-xs rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={label + ' mb-1'}>Element Info</div>
          <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            <div>Type: <span className="font-medium capitalize">{selectedEl.type}</span></div>
            {selectedEl.x !== undefined && <div>X: {Math.round(selectedEl.x)}, Y: {Math.round(selectedEl.y)}</div>}
            {selectedEl.width !== undefined && <div>W: {Math.round(Math.abs(selectedEl.width))}, H: {Math.round(Math.abs(selectedEl.height))}</div>}
            {selectedEl.radius !== undefined && <div>R: {Math.round(selectedEl.radius)}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
