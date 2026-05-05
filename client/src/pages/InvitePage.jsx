import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { WBLogo } from '../components/ui/Logo';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material';

const InvitePage = () => {
  const { token: inviteToken } = useParams();
  const { token: authToken } = useAuthStore();
  const navigate = useNavigate();
  const [boardInfo, setBoardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    init();
  }, [inviteToken, authToken]);

  const init = async () => {
    try {
      // Always fetch board info first (no auth needed)
      const { data } = await api.get(`/boards/invite/${inviteToken}`);
      setBoardInfo(data);

      // If user is logged in, auto-accept immediately
      if (authToken) {
        setAccepting(true);
        try {
          const res = await api.post(`/boards/invite/${inviteToken}/accept`);
          toast.success('Joined board!');
          navigate(`/board/${res.data.boardId}`, { replace: true });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to join');
          navigate('/dashboard', { replace: true });
        }
      }
    } catch {
      toast.error('Invalid or expired invite link');
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading || accepting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 gap-3">
        <CircularProgress sx={{ color: '#6366f1' }} />
        <p className="text-gray-500 text-sm">{accepting ? 'Joining board...' : 'Loading invite...'}</p>
      </div>
    );
  }

  const redirectPath = `/invite/${inviteToken}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <WBLogo size={52} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You're invited to Apna WhiteBoard!</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{boardInfo?.title}</h2>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-indigo-600">{boardInfo?.ownerName}</span> invited you to collaborate on this board.
          </p>

          <div className="flex flex-col gap-3">
            <a href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm text-center block">
              Sign in to join
            </a>
            <a href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
              className="w-full py-2.5 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl transition-colors text-sm text-center block">
              Create account &amp; join
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">You'll be added as an editor after signing in.</p>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
