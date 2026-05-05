import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircularProgress } from '@mui/material';

// Handles redirect from Google/GitHub OAuth
// URL: /oauth-callback#token=xxx
const OAuthCallbackPage = () => {
  const { fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace('#', '?')).get('token');

    if (!token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // Save token to localStorage persist store
    try {
      const stored = JSON.parse(localStorage.getItem('wb-auth') || '{"state":{}}');
      stored.state = { ...stored.state, token };
      localStorage.setItem('wb-auth', JSON.stringify(stored));
    } catch {
      localStorage.setItem('wb-auth', JSON.stringify({ state: { token } }));
    }

    // Update Zustand in-memory state
    useAuthStore.setState({ token });

    // Fetch user profile then redirect
    fetchMe()
      .then(() => {
        const redirect = sessionStorage.getItem('oauth-redirect') || '/dashboard';
        sessionStorage.removeItem('oauth-redirect');
        navigate(redirect, { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <CircularProgress sx={{ color: '#6366f1' }} />
      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Signing you in…</p>
    </div>
  );
};

export default OAuthCallbackPage;
