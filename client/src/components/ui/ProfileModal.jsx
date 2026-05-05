import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Avatar, Tabs, Tab } from '@mui/material';
import { Close, Edit, Save, Lock, Google, GitHub } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/boardStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfileModal = ({ open, onClose }) => {
  const { user, fetchMe } = useAuthStore();
  const { darkMode } = useUIStore();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const bg     = darkMode ? '#1e293b' : '#ffffff';
  const text   = darkMode ? '#e2e8f0' : '#1e293b';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${darkMode ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'}`;
  const labelCls = `block text-xs font-semibold mb-1.5 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.put('/auth/profile', { name: form.name, bio: form.bio, avatar: form.avatar });
      useAuthStore.setState((s) => ({ user: { ...s.user, ...updated.data } }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm)
      return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const providerBadge = user?.provider && user.provider !== 'local' ? (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${user.provider === 'google' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
      {user.provider === 'google' ? <Google sx={{ fontSize: 12 }} /> : <GitHub sx={{ fontSize: 12 }} />}
      {user.provider === 'google' ? 'Google' : 'GitHub'} account
    </span>
  ) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: bg, color: text, borderRadius: 3, border: `1px solid ${border}` } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <span className="font-semibold text-base">My Profile</span>
        <IconButton size="small" onClick={onClose} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Avatar + name header */}
        <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
          <div className="relative">
            <Avatar src={form.avatar || user?.avatar}
              sx={{ width: 64, height: 64, bgcolor: '#6366f1', fontSize: 24 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </div>
          <div>
            <div className="font-semibold text-base">{user?.name}</div>
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</div>
            <div className="mt-1">{providerBadge}</div>
          </div>
        </div>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: `1px solid ${border}` }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}>
          {['Edit Profile', 'Change Password'].map((l, i) => (
            <Tab key={l} label={l} sx={{ color: darkMode ? '#94a3b8' : '#64748b', '&.Mui-selected': { color: '#6366f1' }, textTransform: 'none', fontSize: 13, minWidth: 0, px: 2 }} />
          ))}
        </Tabs>

        {tab === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className={labelCls}>Avatar URL</label>
              <input className={inputCls} value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
              {form.avatar && (
                <img src={form.avatar} alt="preview" className="w-10 h-10 rounded-full mt-2 object-cover border-2 border-indigo-300" />
              )}
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea className={inputCls} rows={3} value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
              style={{ background: '#6366f1', color: 'white' }}>
              <Save sx={{ fontSize: 16 }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-4">
            {user?.provider !== 'local' ? (
              <div className={`text-center py-6 text-sm rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <Lock sx={{ fontSize: 32, opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                Password change is not available for {user?.provider} accounts.
              </div>
            ) : (
              <>
                {[
                  { label: 'Current Password', key: 'currentPassword', placeholder: '••••••••' },
                  { label: 'New Password',     key: 'newPassword',     placeholder: 'Min 6 characters' },
                  { label: 'Confirm Password', key: 'confirm',         placeholder: 'Repeat new password' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input type="password" className={inputCls} placeholder={placeholder}
                      value={pwForm[key]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} />
                  </div>
                ))}
                <button onClick={changePassword} disabled={saving}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background: '#6366f1', color: 'white' }}>
                  <Lock sx={{ fontSize: 16 }} />
                  {saving ? 'Updating...' : 'Change Password'}
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
