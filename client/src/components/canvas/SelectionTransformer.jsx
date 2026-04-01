import React, { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';

const SelectionTransformer = ({ elements, selectedIds, stageRef, onUpdate }) => {
  const trRef = useRef(null);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean);
    trRef.current.nodes(nodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds, elements]);

  if (!selectedIds.length) return null;

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
      onTransformEnd={() => {
        const stage = stageRef.current;
        const updates = {};
        selectedIds.forEach((id) => {
          const node = stage.findOne(`#${id}`);
          if (!node) return;
          updates[id] = {
            x: node.x(), y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation(),
            radius: node.radius ? node.radius() * node.scaleX() : undefined,
          };
          node.scaleX(1);
          node.scaleY(1);
        });
        onUpdate(updates);
      }}
    />
  );
};

export default SelectionTransformer;
