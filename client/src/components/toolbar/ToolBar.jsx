import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import {
  NearMe, Edit, AutoFixHigh, CropSquare, RadioButtonUnchecked,
  ArrowRightAlt, Remove, TextFields, StickyNote2,
} from '@mui/icons-material';
import { useBoardStore, useUIStore } from '../../store/boardStore';

const tools = [
  { id: 'select', icon: <NearMe />, label: 'Select (V)' },
  { id: 'pencil', icon: <Edit />, label: 'Pencil (P)' },
  { id: 'eraser', icon: <AutoFixHigh />, label: 'Eraser (E)' },
  { id: 'rect', icon: <CropSquare />, label: 'Rectangle (R)' },
  { id: 'circle', icon: <RadioButtonUnchecked />, label: 'Circle (C)' },
  { id: 'arrow', icon: <ArrowRightAlt />, label: 'Arrow' },
  { id: 'line', icon: <Remove />, label: 'Line (L)' },
  { id: 'text', icon: <TextFields />, label: 'Text (T)' },
  { id: 'sticky', icon: <StickyNote2 />, label: 'Sticky Note' },
];

const ToolBar = () => {
  const { activeTool, setActiveTool } = useBoardStore();
  const { darkMode } = useUIStore();

  return (
    <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 p-2 rounded-2xl shadow-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      {tools.map(({ id, icon, label }) => (
        <Tooltip key={id} title={label} placement="right">
          <IconButton
            size="small"
            onClick={() => setActiveTool(id)}
            sx={{
              width: 40, height: 40, borderRadius: '10px',
              color: activeTool === id ? 'white' : darkMode ? '#94a3b8' : '#475569',
              backgroundColor: activeTool === id ? '#6366f1' : 'transparent',
              '&:hover': { backgroundColor: activeTool === id ? '#4f46e5' : darkMode ? '#1e293b' : '#f1f5f9' },
            }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ))}
    </div>
  );
};

export default ToolBar;
