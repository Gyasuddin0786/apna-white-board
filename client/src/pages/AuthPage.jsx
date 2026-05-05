import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    }
  </svg>
);

const WBLogoInline = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#6366f1"/>
    <rect x="6" y="8" width="28" height="20" rx="2" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.2"/>
    <path d="M10 22 Q15 14 20 18 Q25 22 30 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M27 27 L33 21 L35 23 L29 29 Z" fill="white" fillOpacity="0.9"/>
    <path d="M27 27 L25 31 L29 29 Z" fill="white" fillOpacity="0.6"/>
    <path d="M33 21 L35 19 L37 21 L35 23 Z" fill="#a5b4fc"/>
  </svg>
);

const features = [
  { icon: '✦', text: 'Freehand drawing with 10+ shape tools' },
  { icon: '✦', text: 'Real-time multi-user collaboration' },
  { icon: '✦', text: 'Auto-save with version history' },
  { icon: '✦', text: 'Share boards via invite link' },
  { icon: '✦', text: 'Export as PNG, PDF or JSON' },
];

const AuthPage = ({ mode = 'login' }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Show error toast if OAuth failed
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_failed') toast.error('Google sign-in failed. Please try again.');
    if (error === 'github_failed') toast.error('GitHub sign-in failed. Please try again.');
    if (error === 'oauth_failed') toast.error('Sign-in failed. Please try again.');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleOAuth = (provider) => {
    if (redirectTo !== '/dashboard') sessionStorage.setItem('oauth-redirect', redirectTo);
    // Use relative URL so Vite proxy forwards to backend in dev,
    // and same-origin works in production
    window.location.href = `/api/auth/${provider}`;
  };

  const altLink = `${mode === 'login' ? '/register' : '/login'}${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;

  return (
    <div className="auth-page">
      <style>{`
        /* ── Base input styles ── */
        .wb-input { color: #0f172a !important; background-color: #f8fafc !important; }
        .wb-input:focus { background-color: #ffffff !important; }
        .wb-input:-webkit-autofill,
        .wb-input:-webkit-autofill:hover,
        .wb-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #0f172a !important;
          -webkit-box-shadow: 0 0 0 1000px #f8fafc inset !important;
          caret-color: #0f172a !important;
        }

        /* ── Layout ── */
        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0f0f23;
        }

        /* Left panel */
        .auth-left {
          flex: 0 0 45%;
          background: linear-gradient(145deg, #312e81 0%, #4338ca 45%, #6d28d9 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }

        /* Right panel */
        .auth-right {
          flex: 1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 380px;
        }

        /* Mobile branding strip shown only on small screens */
        .auth-mobile-header {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        /* ── Tablet (≤ 900px): shrink left panel ── */
        @media (max-width: 900px) {
          .auth-left {
            flex: 0 0 40%;
            padding: 40px 32px;
          }
          .auth-left h2 {
            font-size: 26px !important;
          }
        }

        /* ── Mobile (≤ 640px): hide left panel, full-width form ── */
        @media (max-width: 640px) {
          .auth-page {
            flex-direction: column;
            background: #ffffff;
          }
          .auth-left {
            display: none;
          }
          .auth-right {
            flex: 1;
            padding: 32px 20px;
            align-items: flex-start;
            padding-top: 48px;
          }
          .auth-form-wrap {
            max-width: 100%;
          }
          .auth-mobile-header {
            display: flex;
          }
        }

        /* ── Small mobile (≤ 380px) ── */
        @media (max-width: 380px) {
          .auth-right {
            padding: 28px 16px;
            padding-top: 40px;
          }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div className="auth-left">
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-100px', left:'-80px', width:'420px', height:'420px', background:'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-80px', right:'-60px', width:'360px', height:'360px', background:'radial-gradient(circle, rgba(109,40,217,0.5) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'50%', right:'10%', width:'180px', height:'180px', background:'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'56px' }}>
          <WBLogoInline />
          <span style={{ color:'white', fontSize:'18px', fontWeight:700, letterSpacing:'-0.3px' }}>Apna WhiteBoard</span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:'40px' }}>
          <h2 style={{ color:'white', fontSize:'32px', fontWeight:800, lineHeight:1.2, margin:'0 0 14px', letterSpacing:'-0.5px' }}>
            Where ideas<br/>
            <span style={{ background:'linear-gradient(90deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              come to life
            </span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'14px', lineHeight:1.6, margin:0 }}>
            A professional canvas for teams to draw, plan, and collaborate — all in real time.
          </p>
        </div>

        {/* Features */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {features.map((f) => (
            <div key={f.text} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ color:'#818cf8', fontSize:'10px', flexShrink:0 }}>{f.icon}</span>
              <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'13px' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{ marginTop:'auto', paddingTop:'48px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'100px', padding:'8px 16px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }}/>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px' }}>Free to use · No credit card required</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Mobile-only branding header (shown when left panel is hidden) */}
          <div className="auth-mobile-header">
            <WBLogoInline />
            <span style={{ fontSize:'17px', fontWeight:700, color:'#0f172a', letterSpacing:'-0.3px' }}>Apna WhiteBoard</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom:'28px' }}>
            <h1 style={{ fontSize:'24px', fontWeight:800, color:'#0f172a', margin:'0 0 6px', letterSpacing:'-0.4px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize:'13px', color:'#94a3b8', margin:0 }}>
              {mode === 'login'
                ? 'Sign in to continue to your boards'
                : 'Start collaborating for free today'}
            </p>
          </div>

          {redirectTo !== '/dashboard' && (
            <div style={{ marginBottom:'20px', padding:'10px 14px', background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:'10px', fontSize:'12px', color:'#4338ca', textAlign:'center' }}>
              🔗 Sign in to join the shared board
            </div>
          )}

          {/* OAuth */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
            <OAuthBtn icon={<GoogleIcon />} label="Continue with Google" onClick={() => handleOAuth('google')}
              bg="white" color="#1f2937" border="1.5px solid #e2e8f0"
              hoverBg="#f8fafc" hoverBorder="#cbd5e1" />
            <OAuthBtn icon={<GitHubIcon />} label="Continue with GitHub" onClick={() => handleOAuth('github')}
              bg="#0d1117" color="white" border="1.5px solid #0d1117"
              hoverBg="#161b22" hoverBorder="#161b22" />
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
            <div style={{ flex:1, height:'1px', background:'#f1f5f9' }}/>
            <span style={{ fontSize:'11px', color:'#cbd5e1', fontWeight:500, whiteSpace:'nowrap' }}>or continue with email</span>
            <div style={{ flex:1, height:'1px', background:'#f1f5f9' }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {mode === 'register' && (
              <Field label="Full Name">
                <Input type="text" placeholder="John Doe" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
            )}
            <Field label="Email Address">
              <Input type="email" placeholder="you@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <div style={{ position:'relative' }}>
                <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight:'40px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex', padding:0,
                }}>
                  <EyeIcon show={showPw} />
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'12px', marginTop:'2px',
              background: loading ? '#a5b4fc' : '#6366f1',
              color:'white', border:'none', borderRadius:'10px',
              fontSize:'14px', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing:'0.1px', transition:'all 0.15s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background='#4f46e5'; e.currentTarget.style.boxShadow='0 6px 20px rgba(99,102,241,0.45)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background=loading?'#a5b4fc':'#6366f1'; e.currentTarget.style.boxShadow=loading?'none':'0 4px 16px rgba(99,102,241,0.35)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign:'center', fontSize:'13px', color:'#94a3b8', marginTop:'20px', marginBottom:0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link to={altLink} style={{ color:'#6366f1', fontWeight:700, textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */

const OAuthBtn = ({ icon, label, onClick, bg, color, border, hoverBg, hoverBorder }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
        width:'100%', padding:'11px 16px', border: hov ? hoverBorder : border,
        borderRadius:'10px', background: hov ? hoverBg : bg,
        fontSize:'13px', fontWeight:600, color, cursor:'pointer',
        transition:'all 0.15s',
        boxShadow: hov ? '0 2px 10px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}>
      {icon}{label}
    </button>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#475569', marginBottom:'6px', letterSpacing:'0.2px' }}>
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ style: extraStyle, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      className="wb-input"
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width:'100%', padding:'10px 13px', boxSizing:'border-box',
        border: focused ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
        borderRadius:'10px', fontSize:'13px', color:'#0f172a',
        background: focused ? '#ffffff' : '#f8fafc',
        outline:'none', transition:'all 0.15s', cursor:'text',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
        WebkitTextFillColor: '#0f172a',
        ...extraStyle,
      }}
    />
  );
};

export default AuthPage;
