import React, { useState } from 'react';
import { Line, Rect, Circle, Arrow, Text, Group, RegularPolygon, Shape } from 'react-konva';

const ElementRenderer = ({ elements, selectedIds, onSelect, onUpdate, preview = false }) => {

  const handleDblClick = (el) => {
    if (preview || (el.type !== 'text' && el.type !== 'sticky')) return;
    const input = document.createElement(el.type === 'sticky' ? 'textarea' : 'input');
    input.value = el.text || '';
    input.style.cssText = `position:fixed;top:${el.y + 60}px;left:${el.x + 60}px;font-size:${el.fontSize || 16}px;border:2px solid #6366f1;border-radius:6px;padding:6px 8px;z-index:9999;background:${el.fill === 'transparent' ? 'white' : el.fill || 'white'};min-width:120px;outline:none;font-family:Inter,sans-serif;`;
    document.body.appendChild(input);
    input.focus(); input.select();
    const finish = () => {
      if (document.body.contains(input)) {
        onUpdate?.(el.id, { text: input.value });
        document.body.removeChild(input);
      }
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && el.type !== 'sticky') finish(); if (e.key === 'Escape') { document.body.removeChild(input); } });
  };

  return (
    <>
      {elements.map((el) => {
        const common = {
          id: el.id,
          opacity: el.opacity ?? 1,
          draggable: !preview && !!onSelect,
          onClick: () => onSelect?.(el.id, false),
          onTap: () => onSelect?.(el.id, false),
          onDragEnd: (e) => onUpdate?.(el.id, { x: e.target.x(), y: e.target.y() }),
        };

        switch (el.type) {
          case 'pencil':
          case 'eraser':
          case 'highlight':
            return (
              <Line key={el.id} {...common}
                points={el.points} stroke={el.stroke} strokeWidth={el.type === 'highlight' ? (el.strokeWidth * 6) : el.strokeWidth}
                tension={0.5} lineCap="round" lineJoin="round"
                opacity={el.type === 'highlight' ? 0.35 : (el.opacity ?? 1)}
                globalCompositeOperation={el.type === 'eraser' ? 'destination-out' : 'source-over'}
              />
            );

          case 'rect':
            return (
              <Rect key={el.id} {...common}
                x={el.x} y={el.y} width={el.width} height={el.height}
                stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
                rotation={el.rotation ?? 0} cornerRadius={el.cornerRadius ?? 0}
                dash={el.strokeDash}
              />
            );

          case 'circle':
            return (
              <Circle key={el.id} {...common}
                x={el.x} y={el.y} radius={el.radius}
                stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
                dash={el.strokeDash}
              />
            );

          case 'arrow':
            return (
              <Arrow key={el.id} {...common}
                points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth}
                fill={el.stroke} pointerLength={10} pointerWidth={8}
              />
            );

          case 'line':
            return (
              <Line key={el.id} {...common}
                points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth}
                lineCap="round" dash={el.strokeDash}
              />
            );

          case 'triangle':
            return (
              <RegularPolygon key={el.id} {...common}
                x={el.x} y={el.y} sides={3} radius={el.radius || 50}
                stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
                rotation={el.rotation ?? 0}
              />
            );

          case 'diamond':
            return (
              <Shape key={el.id} {...common}
                x={el.x} y={el.y}
                sceneFunc={(ctx, shape) => {
                  const w = el.width || 100, h = el.height || 60;
                  ctx.beginPath();
                  ctx.moveTo(w / 2, 0);
                  ctx.lineTo(w, h / 2);
                  ctx.lineTo(w / 2, h);
                  ctx.lineTo(0, h / 2);
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                }}
                fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                rotation={el.rotation ?? 0}
              />
            );

          case 'star':
            return (
              <Shape key={el.id} {...common}
                x={el.x} y={el.y}
                sceneFunc={(ctx, shape) => {
                  const r = el.radius || 50, ir = r * 0.45, pts = 5;
                  ctx.beginPath();
                  for (let i = 0; i < pts * 2; i++) {
                    const angle = (i * Math.PI) / pts - Math.PI / 2;
                    const rad = i % 2 === 0 ? r : ir;
                    i === 0 ? ctx.moveTo(Math.cos(angle) * rad, Math.sin(angle) * rad)
                            : ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
                  }
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                }}
                fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
              />
            );

          case 'hexagon':
            return (
              <RegularPolygon key={el.id} {...common}
                x={el.x} y={el.y} sides={6} radius={el.radius || 50}
                stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
                rotation={el.rotation ?? 0}
              />
            );

          case 'parallelogram':
            return (
              <Shape key={el.id} {...common}
                x={el.x} y={el.y}
                sceneFunc={(ctx, shape) => {
                  const w = el.width || 140, h = el.height || 60, skew = 30;
                  ctx.beginPath();
                  ctx.moveTo(skew, 0);
                  ctx.lineTo(w, 0);
                  ctx.lineTo(w - skew, h);
                  ctx.lineTo(0, h);
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                }}
                fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                rotation={el.rotation ?? 0}
              />
            );

          case 'cylinder':
            return (
              <Shape key={el.id} {...common}
                x={el.x} y={el.y}
                sceneFunc={(ctx, shape) => {
                  const w = el.width || 80, h = el.height || 120, ry = 15;
                  ctx.beginPath();
                  ctx.moveTo(0, ry);
                  ctx.lineTo(0, h - ry);
                  ctx.ellipse(w / 2, h - ry, w / 2, ry, 0, Math.PI, 0);
                  ctx.lineTo(w, ry);
                  ctx.ellipse(w / 2, ry, w / 2, ry, 0, 0, Math.PI);
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                  ctx.beginPath();
                  ctx.ellipse(w / 2, ry, w / 2, ry, 0, 0, Math.PI * 2);
                  ctx.fillStrokeShape(shape);
                }}
                fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
              />
            );

          case 'text':
            return (
              <Text key={el.id} {...common}
                x={el.x} y={el.y} text={el.text || ''}
                fontSize={el.fontSize || 16} fill={el.fill || el.stroke || '#000'}
                fontFamily="Inter, sans-serif" fontStyle={el.fontStyle || 'normal'}
                onDblClick={() => handleDblClick(el)}
                onDblTap={() => handleDblClick(el)}
              />
            );

          case 'sticky':
            return (
              <Group key={el.id} {...common} x={el.x} y={el.y}
                onDblClick={() => handleDblClick(el)} onDblTap={() => handleDblClick(el)}>
                <Rect width={el.width || 160} height={el.height || 120}
                  fill={el.fill || '#fef08a'} stroke={el.stroke || '#ca8a04'}
                  strokeWidth={el.strokeWidth || 1} cornerRadius={4}
                  shadowColor="rgba(0,0,0,0.12)" shadowBlur={10} shadowOffsetY={3}
                />
                <Text text={el.text || ''} fontSize={el.fontSize || 14}
                  fill="#1a1a1a" padding={10} width={el.width || 160}
                  fontFamily="Inter, sans-serif" wrap="word"
                />
              </Group>
            );

          case 'image':
            if (!el.src) return null;
            return <KonvaImage key={el.id} el={el} common={common} />;

          default:
            return null;
        }
      })}
    </>
  );
};

// Lazy image loader for pasted images
const KonvaImage = ({ el, common }) => {
  const [img, setImg] = React.useState(null);
  React.useEffect(() => {
    const i = new window.Image();
    i.src = el.src;
    i.onload = () => setImg(i);
  }, [el.src]);
  if (!img) return null;
  const { Image: KImage } = require('react-konva');
  return (
    <KImage key={el.id} {...common}
      image={img} x={el.x} y={el.y}
      width={el.width || img.width} height={el.height || img.height}
      rotation={el.rotation ?? 0}
    />
  );
};

export default ElementRenderer;
