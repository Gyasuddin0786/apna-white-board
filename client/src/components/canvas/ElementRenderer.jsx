import React, { useState } from 'react';
import { Line, Rect, Circle, Arrow, Text, Group } from 'react-konva';

const ElementRenderer = ({ elements, selectedIds, onSelect, onUpdate, preview = false }) => {
  const [editingId, setEditingId] = useState(null);

  const handleDblClick = (el) => {
    if (preview || (el.type !== 'text' && el.type !== 'sticky')) return;
    setEditingId(el.id);
    const stage = document.querySelector('canvas').parentElement;
    const input = document.createElement(el.type === 'sticky' ? 'textarea' : 'input');
    input.value = el.text || '';
    input.style.cssText = `position:fixed;top:${el.y + 60}px;left:${el.x + 60}px;font-size:${el.fontSize || 16}px;border:2px solid #6366f1;border-radius:4px;padding:4px;z-index:9999;background:${el.fill || 'white'};min-width:120px;`;
    document.body.appendChild(input);
    input.focus();
    input.select();
    const finish = () => {
      onUpdate?.(el.id, { text: input.value });
      document.body.removeChild(input);
      setEditingId(null);
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && el.type !== 'sticky') finish(); });
  };

  return (
    <>
      {elements.map((el) => {
        const isSelected = selectedIds.includes(el.id);
        const commonProps = {
          id: el.id,
          opacity: el.opacity ?? 1,
          draggable: !preview && onSelect !== undefined,
          onClick: () => onSelect?.(el.id, false),
          onTap: () => onSelect?.(el.id, false),
          onDragEnd: (e) => onUpdate?.(el.id, { x: e.target.x(), y: e.target.y() }),
        };

        if (el.type === 'pencil' || el.type === 'eraser') {
          return (
            <Line key={el.id} {...commonProps}
              points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth}
              tension={0.5} lineCap="round" lineJoin="round" globalCompositeOperation={el.type === 'eraser' ? 'destination-out' : 'source-over'}
            />
          );
        }
        if (el.type === 'rect') {
          return (
            <Rect key={el.id} {...commonProps}
              x={el.x} y={el.y} width={el.width} height={el.height}
              stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
              rotation={el.rotation ?? 0}
            />
          );
        }
        if (el.type === 'circle') {
          return (
            <Circle key={el.id} {...commonProps}
              x={el.x} y={el.y} radius={el.radius}
              stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
            />
          );
        }
        if (el.type === 'arrow') {
          return (
            <Arrow key={el.id} {...commonProps}
              points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth}
              fill={el.stroke} pointerLength={10} pointerWidth={8}
            />
          );
        }
        if (el.type === 'line') {
          return (
            <Line key={el.id} {...commonProps}
              points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth}
              lineCap="round"
            />
          );
        }
        if (el.type === 'text') {
          return (
            <Text key={el.id} {...commonProps}
              x={el.x} y={el.y} text={el.text || ''} fontSize={el.fontSize || 16}
              fill={el.fill || el.stroke || '#000'} fontFamily="Inter, sans-serif"
              onDblClick={() => handleDblClick(el)}
              onDblTap={() => handleDblClick(el)}
            />
          );
        }
        if (el.type === 'sticky') {
          return (
            <Group key={el.id} {...commonProps} x={el.x} y={el.y}
              onDblClick={() => handleDblClick(el)} onDblTap={() => handleDblClick(el)}>
              <Rect width={el.width || 160} height={el.height || 120}
                fill={el.fill || '#fef08a'} stroke={el.stroke || '#ca8a04'}
                strokeWidth={el.strokeWidth || 1} cornerRadius={4}
                shadowColor="rgba(0,0,0,0.15)" shadowBlur={8} shadowOffsetY={2}
              />
              <Text text={el.text || ''} fontSize={el.fontSize || 14}
                fill="#1a1a1a" padding={10} width={el.width || 160}
                fontFamily="Inter, sans-serif" wrap="word"
              />
            </Group>
          );
        }
        return null;
      })}
    </>
  );
};

export default ElementRenderer;
