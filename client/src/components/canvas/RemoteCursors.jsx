import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import { useBoardStore } from '../../store/boardStore';

const RemoteCursors = ({ scale, stagePos }) => {
  const { remoteCursors } = useBoardStore();

  return (
    <>
      {Object.entries(remoteCursors).map(([socketId, { x, y, user }]) => (
        <Group key={socketId} x={x} y={y}>
          <Circle radius={6} fill={user?.color || '#6366f1'} opacity={0.85} />
          <Text
            text={user?.name || 'User'}
            fontSize={11}
            fill="white"
            x={8} y={-6}
            padding={3}
            background={user?.color || '#6366f1'}
          />
        </Group>
      ))}
    </>
  );
};

export default RemoteCursors;
