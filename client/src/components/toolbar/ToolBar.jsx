import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Tooltip, IconButton, Divider } from '@mui/material';
import {
  NearMe, Edit, AutoFixHigh, CropSquare, RadioButtonUnchecked,
  ArrowRightAlt, Remove, TextFields, StickyNote2, ChangeHistory,
  Star, Hexagon, DragIndicator,
} from '@mui/icons-material';
import { useBoardStore, useUIStore } from '../../store/boardStore';

const DiamondIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 22,12 12,22 2,12" />
  </svg>
);
const ParallelogramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="6,4 22,4 18,20 2,20" />
  </svg>
);
const CylinderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const HighlightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 22H4v-3l9.5-9.5 3 3L7 22zm13.7-12.3c.4-.4.4-1 0-1.4l-1.6-1.6c-.4-.4-1-.4-1.4 0l-1.8 1.8 3 3 1.8-1.8z" />
  </svg>
);

const TOOL_GROUPS = [
  {
    tools: [{ id: 'select', icon: <NearMe sx={{ fontSize: 18 }} />, label: 'Select (V)' }],
  },
  {
    tools: [
      { id: 'pencil', icon: <Edit sx={{ fontSize: 18 }} />, label: 'Pencil (P)' },
      { id: 'highlight', icon: <HighlightIcon />, label: 'Highlighter' },
      { id: 'eraser', icon: <AutoFixHigh sx={{ fontSize: 18 }} />, label: 'Eraser (E)' },
    ],
  },
  {
    tools: [
      { id: 'rect', icon: <CropSquare sx={{ fontSize: 18 }} />, label: 'Rectangle (R)' },
      { id: 'circle', icon: <RadioButtonUnchecked sx={{ fontSize: 18 }} />, label: 'Circle (C)' },
      { id: 'triangle', icon: <ChangeHistory sx={{ fontSize: 18 }} />, label: 'Triangle' },
      { id: 'diamond', icon: <DiamondIcon />, label: 'Diamond' },
      { id: 'star', icon: <Star sx={{ fontSize: 18 }} />, label: 'Star' },
      { id: 'hexagon', icon: <Hexagon sx={{ fontSize: 18 }} />, label: 'Hexagon' },
      { id: 'parallelogram', icon: <ParallelogramIcon />, label: 'Parallelogram' },
      { id: 'cylinder', icon: <CylinderIcon />, label: 'Cylinder' },
    ],
  },
  {
    tools: [
      { id: 'arrow', icon: <ArrowRightAlt sx={{ fontSize: 18 }} />, label: 'Arrow' },
      { id: 'line', icon: <Remove sx={{ fontSize: 18 }} />, label: 'Line (L)' },
    ],
  },
  {
    tools: [
      { id: 'text', icon: <TextFields sx={{ fontSize: 18 }} />, label: 'Text (T)' },
      { id: 'sticky', icon: <StickyNote2 sx={{ fontSize: 18 }} />, label: 'Sticky Note' },
    ],
  },
];

const STORAGE_KEY = 'wb-toolbar-pos';

const getInitialPos = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.x === 'number') return saved;
  } catch {}
  return { x: 12, y: window.innerHeight / 2 - 200 };
};

const ToolBar = () => {
  const { activeTool, setActiveTool } = useBoardStore();
  const { darkMode } = useUIStore();

  const [pos, setPos] = useState(getInitialPos);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // Persist position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  const onMouseDown = useCallback((e) => {
    // Only drag from the handle
    if (!e.currentTarget.dataset.handle) return;
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const panel = panelRef.current;
      const pw = panel?.offsetWidth || 52;
      const ph = panel?.offsetHeight || 400;
      const x = Math.min(Math.max(0, e.clientX - offset.current.x), window.innerWidth - pw);
      const y = Math.min(Math.max(56, e.clientY - offset.current.y), window.innerHeight - ph - 8);
      setPos({ x, y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  return (
    <div
      ref={panelRef}
      className={`fixed z-40 flex flex-col gap-0.5 rounded-2xl shadow-xl border select-none ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
      style={{ left: pos.x, top: pos.y, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
    >
      {/* Drag handle */}
      <div
        data-handle="true"
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
        className={`flex items-center justify-center py-1.5 cursor-grab active:cursor-grabbing rounded-t-2xl ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
        title="Drag to move toolbar"
      >
        <DragIndicator sx={{ fontSize: 16, color: darkMode ? '#4b5563' : '#d1d5db', transform: 'rotate(90deg)' }} />
      </div>

      <div className="px-1.5 pb-1.5 flex flex-col gap-0.5">
        {TOOL_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <Divider sx={{ my: 0.5, borderColor: darkMode ? '#374151' : '#e5e7eb' }} />}
            {group.tools.map(({ id, icon, label }) => (
              <Tooltip key={id} title={label} placement="right">
                <IconButton
                  size="small"
                  onClick={() => setActiveTool(id)}
                  sx={{
                    width: 36, height: 36, borderRadius: '9px',
                    color: activeTool === id ? 'white' : darkMode ? '#94a3b8' : '#475569',
                    backgroundColor: activeTool === id ? '#6366f1' : 'transparent',
                    '&:hover': {
                      backgroundColor: activeTool === id ? '#4f46e5' : darkMode ? '#1e293b' : '#f1f5f9',
                    },
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ToolBar;
