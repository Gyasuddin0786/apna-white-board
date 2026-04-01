import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab, Tooltip } from '@mui/material';
import { Close, ContentCopy, PersonAdd, Check } from '@mui/icons-material';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useUIStore } from '../../store/boardStore';

const ShareModal = ({ open, onClose, boardId, boardTitle }) => {
  const { darkMode } = useUIStore();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const boardUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post(`/boards/${boardId}/collaborators`, { email: email.trim(), role });
      toast.success(`Invited ${email} as ${role}`);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite');
    } finally {
      setLoading(false);
    }
  };

  const dialogBg = darkMode ? '#1e1e2e' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: dialogBg, color: textColor, borderRadius: 3, border: `1px solid ${borderColor}` } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <span className="font-semibold text-base">Share "{boardTitle}"</span>
        <IconButton size="small" onClick={onClose} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: `1px solid ${borderColor}` }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}>
          <Tab label="Share Link" sx={{ color: darkMode ? '#94a3b8' : '#64748b', '&.Mui-selected': { color: '#6366f1' }, textTransform: 'none', fontSize: 13 }} />
          <Tab label="Invite People" sx={{ color: darkMode ? '#94a3b8' : '#64748b', '&.Mui-selected': { color: '#6366f1' }, textTransform: 'none', fontSize: 13 }} />
        </Tabs>

        {tab === 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Anyone with this link can view this board. Share it with your team to collaborate in real-time.
            </p>
            <div className="flex gap-2">
              <input
                readOnly value={boardUrl}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border outline-none truncate"
                style={{ background: inputBg, borderColor, color: textColor }}
              />
              <button onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: copied ? '#22c55e' : '#6366f1', color: 'white' }}>
                {copied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="rounded-xl p-3 text-xs" style={{ background: darkMode ? '#0f172a' : '#f1f5f9', color: darkMode ? '#94a3b8' : '#64748b' }}>
              💡 Tip: Users must be registered to edit. Viewers can see the board without an account.
            </div>
          </div>
        )}

        {tab === 1 && (
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Invite registered users by email to collaborate on this board.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Email address</label>
              <input
                type="email" required placeholder="colleague@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                style={{ background: inputBg, borderColor, color: textColor }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Role</label>
              <div className="flex gap-2">
                {['editor', 'viewer'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize"
                    style={{
                      background: role === r ? '#6366f1' : inputBg,
                      color: role === r ? 'white' : textColor,
                      borderColor: role === r ? '#6366f1' : borderColor,
                    }}>
                    {r === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
                {role === 'editor' ? 'Can draw, edit, and delete elements' : 'Can only view the board'}
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ background: '#6366f1', color: 'white' }}>
              <PersonAdd sx={{ fontSize: 16 }} />
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
