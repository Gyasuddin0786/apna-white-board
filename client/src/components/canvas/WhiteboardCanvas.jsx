import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Group, RegularPolygon } from 'react-konva';
import { useBoardStore } from '../../store/boardStore';
import { generateId, getRelativePointerPosition, snapToGrid, GRID_SIZE, TOOL_CURSORS } from '../../utils/helpers';
import GridLayer from './GridLayer';
import RemoteCursors from './RemoteCursors';
import ElementRenderer from './ElementRenderer';
import SelectionTransformer from './SelectionTransformer';

const WhiteboardCanvas = ({ stageRef: externalRef, onElementsChange, onCursorMove }) => {
  const internalRef = useRef(null);
  const stageRef = externalRef || internalRef;
  const isDrawing = useRef(false);
  const [currentElement, setCurrentElement] = useState(null);

  const {
    elements, activeTool, strokeColor, fillColor, strokeWidth, fontSize,
    opacity, gridEnabled, stageScale, stagePos, darkMode,
    setStageScale, setStagePos, addElement, setElements, selectedIds,
    setSelectedIds, role,
  } = useBoardStore();

  const isReadOnly = role === 'viewer';

  const getPos = useCallback((snap = false) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = getRelativePointerPosition(stage);
    return snap && gridEnabled
      ? { x: snapToGrid(pos.x, GRID_SIZE), y: snapToGrid(pos.y, GRID_SIZE) }
      : pos;
  }, [gridEnabled]);

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

    if (activeTool === 'pencil') {
      setCurrentElement({ ...base, type: 'pencil', points: [pos.x, pos.y] });
    } else if (activeTool === 'eraser') {
      setCurrentElement({ id, type: 'eraser', points: [pos.x, pos.y], stroke: darkMode ? '#1e1e2e' : '#ffffff', strokeWidth: strokeWidth * 4 });
    } else if (activeTool === 'rect') {
      setCurrentElement({ ...base, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0 });
    } else if (activeTool === 'circle') {
      setCurrentElement({ ...base, type: 'circle', x: pos.x, y: pos.y, radius: 0 });
    } else if (activeTool === 'arrow') {
      setCurrentElement({ ...base, type: 'arrow', points: [pos.x, pos.y, pos.x, pos.y] });
    } else if (activeTool === 'line') {
      setCurrentElement({ ...base, type: 'line', points: [pos.x, pos.y, pos.x, pos.y] });
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

    if (currentElement.type === 'pencil' || currentElement.type === 'eraser') {
      setCurrentElement((prev) => ({ ...prev, points: [...prev.points, pos.x, pos.y] }));
    } else if (currentElement.type === 'rect') {
      setCurrentElement((prev) => ({ ...prev, width: pos.x - prev.x, height: pos.y - prev.y }));
    } else if (currentElement.type === 'circle') {
      const dx = pos.x - currentElement.x;
      const dy = pos.y - currentElement.y;
      setCurrentElement((prev) => ({ ...prev, radius: Math.sqrt(dx * dx + dy * dy) }));
    } else if (currentElement.type === 'arrow' || currentElement.type === 'line') {
      setCurrentElement((prev) => ({ ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] }));
    }
  }, [currentElement, getPos, onCursorMove]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !currentElement) return;
    isDrawing.current = false;

    const isValid =
      (currentElement.type === 'pencil' || currentElement.type === 'eraser') && currentElement.points.length > 2 ||
      currentElement.type === 'rect' && (Math.abs(currentElement.width) > 2 || Math.abs(currentElement.height) > 2) ||
      currentElement.type === 'circle' && currentElement.radius > 2 ||
      (currentElement.type === 'arrow' || currentElement.type === 'line') && currentElement.points.length === 4;

    if (isValid) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      onElementsChange?.(newElements);
    }
    setCurrentElement(null);
  }, [currentElement, elements, setElements, onElementsChange]);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 5)
      : Math.max(oldScale / scaleBy, 0.1);

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [stageScale, stagePos, setStageScale, setStagePos]);

  const cursor = isReadOnly ? 'not-allowed' : TOOL_CURSORS[activeTool] || 'default';

  return (
    <div className="w-full h-full overflow-hidden" style={{ cursor }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
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
            onSelect={(id, multi) => {
              if (activeTool !== 'select') return;
              setSelectedIds(multi ? [...new Set([...selectedIds, id])] : [id]);
            }}
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
          <RemoteCursors scale={stageScale} stagePos={stagePos} />
        </Layer>
      </Stage>
    </div>
  );
};

export default WhiteboardCanvas;
