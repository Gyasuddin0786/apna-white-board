import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab } from '@mui/material';
import { Close, ContentCopy, PersonAdd, Check, Link as LinkIcon, Refresh } from '@mui/icons-material';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useUIStore } from '../../store/boardStore';

const ShareModal = ({ open, onClose, boardId, boardTitle }) => {
  const { darkMode } = useUIStore();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const boardUrl = window.location.href;

  const handleCopyBoardUrl = () => {
    navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Board link copied!');
  };

  const generateInviteLink = async () => {
    setLinkLoading(true);
    try {
      const { data } = await api.post(`/boards/${boardId}/invite-token`);
      const link = `${window.location.origin}/invite/${data.inviteToken}`;
      setInviteLink(link);
      navigator.clipboard.writeText(link);
      toast.success('Invite link copied!');
    } catch {
      toast.error('Failed to generate invite link');
    } finally {
      setLinkLoading(false);
    }
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

  const bg = darkMode ? '#1e293b' : '#ffffff';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const subText = darkMode ? '#94a3b8' : '#64748b';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: bg, color: text, borderRadius: 3, border: `1px solid ${border}` } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <span className="font-semibold text-base">Share "{boardTitle}"</span>
        <IconButton size="small" onClick={onClose} sx={{ color: subText }}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: `1px solid ${border}` }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}>
          {['Share Link', 'Invite Link', 'Add by Email'].map((label, i) => (
            <Tab key={label} label={label}
              sx={{ color: subText, '&.Mui-selected': { color: '#6366f1' }, textTransform: 'none', fontSize: 12, minWidth: 0, px: 2 }} />
          ))}
        </Tabs>

        {/* Tab 0: Share current board URL */}
        {tab === 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: subText }}>
              Share this board's URL. Users need to be added as collaborators to edit.
            </p>
            <div className="flex gap-2">
              <input readOnly value={boardUrl}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border outline-none truncate"
                style={{ background: inputBg, borderColor: border, color: text }} />
              <button onClick={handleCopyBoardUrl}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
                style={{ background: copied ? '#22c55e' : '#6366f1', color: 'white' }}>
                {copied ? <Check sx={{ fontSize: 15 }} /> : <ContentCopy sx={{ fontSize: 15 }} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Invite link (token-based) */}
        {tab === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: subText }}>
              Generate a magic invite link. Anyone with this link can join as an editor after signing in.
            </p>
            {inviteLink ? (
              <div className="flex gap-2">
                <input readOnly value={inviteLink}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border outline-none truncate"
                  style={{ background: inputBg, borderColor: border, color: text }} />
                <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copied!'); }}
                  className="px-3 py-2 rounded-xl text-sm font-medium shrink-0"
                  style={{ background: '#6366f1', color: 'white' }}>
                  <ContentCopy sx={{ fontSize: 15 }} />
                </button>
              </div>
            ) : null}
            <button onClick={generateInviteLink} disabled={linkLoading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ background: '#6366f1', color: 'white' }}>
              {linkLoading ? 'Generating...' : inviteLink ? <><Refresh sx={{ fontSize: 16 }} /> Regenerate Link</> : <><LinkIcon sx={{ fontSize: 16 }} /> Generate Invite Link</>}
            </button>
            <div className="rounded-xl p-3 text-xs" style={{ background: darkMode ? '#0f172a' : '#f1f5f9', color: subText }}>
              💡 Each time you regenerate, the old link becomes invalid.
            </div>
          </div>
        )}

        {/* Tab 2: Add by email */}
        {tab === 2 && (
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: subText }}>
              Invite a registered user directly by their email address.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: subText }}>Email address</label>
              <input type="email" required placeholder="colleague@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                style={{ background: inputBg, borderColor: border, color: text }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: subText }}>Role</label>
              <div className="flex gap-2">
                {['editor', 'viewer'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize"
                    style={{ background: role === r ? '#6366f1' : inputBg, color: role === r ? 'white' : text, borderColor: role === r ? '#6366f1' : border }}>
                    {r === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
                {role === 'editor' ? 'Can draw, edit, and delete elements' : 'Can only view the board'}
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
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
