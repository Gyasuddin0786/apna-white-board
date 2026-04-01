import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardStore, useUIStore } from '../../store/boardStore';
import { generateId, getRelativePointerPosition, snapToGrid, GRID_SIZE, TOOL_CURSORS } from '../../utils/helpers';
import GridLayer from './GridLayer';
import RemoteCursors from './RemoteCursors';
import ElementRenderer from './ElementRenderer';
import SelectionTransformer from './SelectionTransformer';

const RADIUS_TOOLS = ['circle', 'triangle', 'star', 'hexagon'];
const POINT_TOOLS  = ['pencil', 'eraser', 'highlight'];
const LINE_TOOLS   = ['arrow', 'line'];
const BOX_TOOLS    = ['rect', 'diamond', 'parallelogram', 'cylinder'];

const WhiteboardCanvas = ({ stageRef: externalRef, onElementsChange, onCursorMove }) => {
  const internalRef = useRef(null);
  const stageRef = externalRef || internalRef;
  const isDrawing = useRef(false);
  const [currentElement, setCurrentElement] = useState(null);

  const {
    elements, activeTool, strokeColor, fillColor, strokeWidth, fontSize,
    opacity, gridEnabled, stageScale, stagePos,
    setStageScale, setStagePos, addElement, setElements, selectedIds, setSelectedIds, role,
  } = useBoardStore();
  const { darkMode } = useUIStore();

  const isReadOnly = role === 'viewer';

  const getPos = useCallback((snap = false) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = getRelativePointerPosition(stage);
    return snap && gridEnabled ? { x: snapToGrid(pos.x, GRID_SIZE), y: snapToGrid(pos.y, GRID_SIZE) } : pos;
  }, [gridEnabled]);

  // Paste image from clipboard
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (ev) => {
            const el = {
              id: generateId(), type: 'image', src: ev.target.result,
              x: 100, y: 100, width: 400, height: 300,
              stroke: 'transparent', strokeWidth: 0, fill: 'transparent', opacity: 1,
            };
            addElement(el);
            onElementsChange?.([...elements, el]);
          };
          reader.readAsDataURL(blob);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [elements, addElement, onElementsChange]);

  const handleMouseDown = useCallback((e) => {
    if (isReadOnly) return;
    if (activeTool === 'select') {
      if (e.target === e.target.getStage()) setSelectedIds([]);
      return;
    }

    isDrawing.current = true;
    const pos = getPos(true);
    const id = generateId();
    const base = { id, stroke: strokeColor, strokeWidth, opacity, fill: fillColor };

    if (POINT_TOOLS.includes(activeTool)) {
      const stroke = activeTool === 'eraser' ? (darkMode ? '#111827' : '#f9fafb') : strokeColor;
      setCurrentElement({ ...base, stroke, type: activeTool, points: [pos.x, pos.y] });
    } else if (BOX_TOOLS.includes(activeTool)) {
      setCurrentElement({ ...base, type: activeTool, x: pos.x, y: pos.y, width: 0, height: 0 });
    } else if (RADIUS_TOOLS.includes(activeTool)) {
      setCurrentElement({ ...base, type: activeTool, x: pos.x, y: pos.y, radius: 0 });
    } else if (LINE_TOOLS.includes(activeTool)) {
      setCurrentElement({ ...base, type: activeTool, points: [pos.x, pos.y, pos.x, pos.y] });
    } else if (activeTool === 'text') {
      const el = { ...base, type: 'text', x: pos.x, y: pos.y, text: 'Double-click to edit', fontSize, fill: strokeColor };
      addElement(el);
      onElementsChange?.([...elements, el]);
      isDrawing.current = false;
    } else if (activeTool === 'sticky') {
      const el = { ...base, type: 'sticky', x: pos.x, y: pos.y, width: 160, height: 120, text: 'Note...', fill: '#fef08a', stroke: '#ca8a04', fontSize: 14 };
      addElement(el);
      onElementsChange?.([...elements, el]);
      isDrawing.current = false;
    }
  }, [activeTool, strokeColor, fillColor, strokeWidth, fontSize, opacity, gridEnabled, isReadOnly, darkMode, elements]);

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (stage) {
      const pos = getRelativePointerPosition(stage);
      onCursorMove?.(pos.x, pos.y);
    }
    if (!isDrawing.current || !currentElement) return;
    const pos = getPos(true);

    if (POINT_TOOLS.includes(currentElement.type)) {
      setCurrentElement((p) => ({ ...p, points: [...p.points, pos.x, pos.y] }));
    } else if (BOX_TOOLS.includes(currentElement.type)) {
      setCurrentElement((p) => ({ ...p, width: pos.x - p.x, height: pos.y - p.y }));
    } else if (RADIUS_TOOLS.includes(currentElement.type)) {
      const dx = pos.x - currentElement.x, dy = pos.y - currentElement.y;
      setCurrentElement((p) => ({ ...p, radius: Math.sqrt(dx * dx + dy * dy) }));
    } else if (LINE_TOOLS.includes(currentElement.type)) {
      setCurrentElement((p) => ({ ...p, points: [p.points[0], p.points[1], pos.x, pos.y] }));
    }
  }, [currentElement, getPos, onCursorMove]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !currentElement) return;
    isDrawing.current = false;

    const valid =
      (POINT_TOOLS.includes(currentElement.type) && currentElement.points.length > 2) ||
      (BOX_TOOLS.includes(currentElement.type) && (Math.abs(currentElement.width) > 2 || Math.abs(currentElement.height) > 2)) ||
      (RADIUS_TOOLS.includes(currentElement.type) && currentElement.radius > 2) ||
      (LINE_TOOLS.includes(currentElement.type) && currentElement.points.length === 4);

    if (valid) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      onElementsChange?.(newElements);
    }
    setCurrentElement(null);
  }, [currentElement, elements, setElements, onElementsChange]);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0 ? Math.min(oldScale * scaleBy, 5) : Math.max(oldScale / scaleBy, 0.1);
    const mousePointTo = { x: (pointer.x - stagePos.x) / oldScale, y: (pointer.y - stagePos.y) / oldScale };
    setStageScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  }, [stageScale, stagePos, setStageScale, setStagePos]);

  const cursor = isReadOnly ? 'not-allowed' : (TOOL_CURSORS[activeTool] || 'default');

  return (
    <div className="w-full h-full overflow-hidden" style={{ cursor }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={stageScale} scaleY={stageScale}
        x={stagePos.x} y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
        draggable={activeTool === 'select' && selectedIds.length === 0}
        onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
      >
        <Layer>
          {gridEnabled && <GridLayer scale={stageScale} stagePos={stagePos} />}
        </Layer>
        <Layer>
          <ElementRenderer
            elements={elements}
            selectedIds={selectedIds}
            onSelect={(id) => { if (activeTool !== 'select') return; setSelectedIds([id]); }}
            onUpdate={(id, updates) => {
              const updated = elements.map((el) => el.id === id ? { ...el, ...updates } : el);
              setElements(updated);
              onElementsChange?.(updated);
            }}
          />
          {currentElement && <ElementRenderer elements={[currentElement]} selectedIds={[]} preview />}
          <SelectionTransformer
            elements={elements}
            selectedIds={selectedIds}
            stageRef={stageRef}
            onUpdate={(updates) => {
              const updated = elements.map((el) => updates[el.id] ? { ...el, ...updates[el.id] } : el);
              setElements(updated);
              onElementsChange?.(updated);
            }}
          />
        </Layer>
        <Layer>
          <RemoteCursors />
        </Layer>
      </Stage>
    </div>
  );
};

export default WhiteboardCanvas;
