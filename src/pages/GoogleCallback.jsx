import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GoogleCallback — handles the redirect from backend after Google OAuth.
 * Backend redirects to: /auth/callback?token=JWT&user=JSON
 * This page stores the token, updates auth state, then navigates to /dashboard.
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    const error = params.get('error');

    if (error || !token || !userRaw) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      // Store in localStorage (Google logins are "remembered" by default)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Sync AuthContext state
      if (setUserFromGoogle) setUserFromGoogle(user);

      // Force a hard navigation so AuthContext properly mounts with the new token
      window.location.href = user.isAdmin ? '/admin' : '/dashboard';
    } catch {
      window.location.href = '/login?error=google_failed';
    }
  }, [setUserFromGoogle]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#2b2724',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      gap: '20px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(255,255,255,0.15)',
        borderTopColor: '#ff4d4d',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#a09e9d', fontSize: '1rem' }}>Completing Google sign-in…</p>
    </div>
  );
};

export default GoogleCallback;
