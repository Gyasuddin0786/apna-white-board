const COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e'];
const roomUsers = new Map(); // roomId -> Map(socketId -> userInfo)
const roomMessages = new Map(); // roomId -> last 100 messages

module.exports = (io) => {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    socket.on('join-room', ({ roomId, user }) => {
      currentRoom = roomId;
      currentUser = { ...user, socketId: socket.id, color: COLORS[Math.floor(Math.random() * COLORS.length)] };

      socket.join(roomId);
      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, currentUser);

      // Send existing chat history to new joiner
      const history = roomMessages.get(roomId) || [];
      socket.emit('chat-history', history);

      io.to(roomId).emit('room-users', Array.from(roomUsers.get(roomId).values()));
      socket.to(roomId).emit('user-joined', currentUser);
    });

    socket.on('cursor-move', ({ x, y }) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('cursor-update', { socketId: socket.id, x, y, user: currentUser });
    });

    socket.on('elements-update', (elements) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('elements-update', elements);
    });

    socket.on('board-title-change', (title) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('board-title-change', title);
    });

    // Chat
    socket.on('chat-message', (text) => {
      if (!currentRoom || !currentUser || !text?.trim()) return;
      const msg = {
        id: `${Date.now()}_${socket.id}`,
        text: text.trim(),
        user: { name: currentUser.name, color: currentUser.color },
        timestamp: Date.now(),
      };
      if (!roomMessages.has(currentRoom)) roomMessages.set(currentRoom, []);
      const msgs = roomMessages.get(currentRoom);
      msgs.push(msg);
      if (msgs.length > 100) msgs.shift();
      io.to(currentRoom).emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
      if (!currentRoom || !roomUsers.has(currentRoom)) return;
      roomUsers.get(currentRoom).delete(socket.id);
      const users = Array.from(roomUsers.get(currentRoom).values());
      io.to(currentRoom).emit('room-users', users);
      socket.to(currentRoom).emit('user-left', socket.id);
      if (users.length === 0) roomUsers.delete(currentRoom);
    });
  });
};
