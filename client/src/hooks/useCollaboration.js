import { useEffect, useRef } from 'react';
import { getSocket, connectSocket } from '../services/socket';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';

export const useCollaboration = (boardId) => {
  const { user } = useAuthStore();
  const {
    setElements, setRoomUsers, setRemoteCursor, removeRemoteCursor, setTitle,
  } = useBoardStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!boardId || !user) return;
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit('join-room', { roomId: boardId, user: { id: user.id, name: user.name } });

    socket.on('room-users', setRoomUsers);
    socket.on('elements-update', (els) => setElements(els, false));
    socket.on('cursor-update', ({ socketId, x, y, user: u }) =>
      setRemoteCursor(socketId, { x, y, user: u })
    );
    socket.on('user-left', removeRemoteCursor);
    socket.on('board-title-change', setTitle);

    return () => {
      socket.off('room-users');
      socket.off('elements-update');
      socket.off('cursor-update');
      socket.off('user-left');
      socket.off('board-title-change');
    };
  }, [boardId, user]);

  const emitElements = (elements) => {
    socketRef.current?.emit('elements-update', elements);
  };

  const emitCursor = (x, y) => {
    socketRef.current?.emit('cursor-move', { x, y });
  };

  const emitTitleChange = (title) => {
    socketRef.current?.emit('board-title-change', title);
  };

  return { emitElements, emitCursor, emitTitleChange };
};
