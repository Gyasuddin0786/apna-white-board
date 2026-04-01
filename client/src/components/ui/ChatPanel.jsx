import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Avatar, Tooltip } from '@mui/material';
import { Send, Close, Chat, ExpandMore } from '@mui/icons-material';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/boardStore';

const ChatPanel = ({ boardId }) => {
  const { user } = useAuthStore();
  const { darkMode } = useUIStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('chat-history', (history) => setMessages(history));
    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!open) setUnread((n) => n + 1);
    });

    return () => {
      socket.off('chat-history');
      socket.off('chat-message');
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      inputRef.current?.focus();
    }
  }, [open, messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    getSocket().emit('chat-message', text);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const bg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const msgBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400';

  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-5 right-5 z-50">
        {open ? (
          /* Chat panel */
          <div className={`flex flex-col rounded-2xl shadow-2xl border w-80 h-96 ${bg}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b rounded-t-2xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Chat sx={{ fontSize: 16, color: '#6366f1' }} />
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Board Chat</span>
                {messages.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {messages.length}
                  </span>
                )}
              </div>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                <ExpandMore fontSize="small" />
              </IconButton>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {messages.length === 0 && (
                <div className={`text-center text-xs mt-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No messages yet. Say hello! 👋
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.user.name === user?.name;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: msg.user.color, flexShrink: 0, mt: 0.5 }}>
                        {msg.user.name?.[0]?.toUpperCase()}
                      </Avatar>
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-xs font-medium" style={{ color: msg.user.color }}>{msg.user.name}</span>
                      )}
                      <div
                        className="px-3 py-1.5 rounded-2xl text-sm break-words"
                        style={{
                          backgroundColor: isMe ? '#6366f1' : (darkMode ? '#1e293b' : '#f1f5f9'),
                          color: isMe ? 'white' : (darkMode ? '#e2e8f0' : '#1e293b'),
                          borderBottomRightRadius: isMe ? 4 : undefined,
                          borderBottomLeftRadius: !isMe ? 4 : undefined,
                        }}
                      >
                        {msg.text}
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className={`px-3 py-2.5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none resize-none focus:ring-2 focus:ring-indigo-400 ${inputBg}`}
                  style={{ maxHeight: 80 }}
                />
                <IconButton
                  size="small" onClick={send} disabled={!input.trim()}
                  sx={{ bgcolor: '#6366f1', color: 'white', width: 34, height: 34, flexShrink: 0, '&:hover': { bgcolor: '#4f46e5' }, '&:disabled': { bgcolor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#4b5563' : '#9ca3af' } }}>
                  <Send sx={{ fontSize: 16 }} />
                </IconButton>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed button */
          <Tooltip title="Board Chat" placement="left">
            <button
              onClick={() => setOpen(true)}
              className="relative w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105"
            >
              <Chat sx={{ fontSize: 20 }} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </Tooltip>
        )}
      </div>
    </>
  );
};

export default ChatPanel;
