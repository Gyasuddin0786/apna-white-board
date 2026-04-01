import React from 'react';
import { Line, Rect } from 'react-konva';

const GRID_SIZE = 20;

const GridLayer = ({ scale, stagePos }) => {
  const width = window.innerWidth / scale;
  const height = window.innerHeight / scale;
  const offsetX = -stagePos.x / scale;
  const offsetY = -stagePos.y / scale;

  const startX = Math.floor(offsetX / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(offsetY / GRID_SIZE) * GRID_SIZE;

  const vLines = [];
  const hLines = [];

  for (let x = startX; x < offsetX + width; x += GRID_SIZE) {
    vLines.push(
      <Line key={`v${x}`} points={[x, offsetY, x, offsetY + height]}
        stroke="#e2e8f0" strokeWidth={0.5 / scale} />
    );
  }
  for (let y = startY; y < offsetY + height; y += GRID_SIZE) {
    hLines.push(
      <Line key={`h${y}`} points={[offsetX, y, offsetX + width, y]}
        stroke="#e2e8f0" strokeWidth={0.5 / scale} />
    );
  }

  return <>{vLines}{hLines}</>;
};

export default GridLayer;
