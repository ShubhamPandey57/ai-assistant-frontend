import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Called by GoogleCallback after storing token in localStorage
  const setUserFromGoogle = (googleUser) => {
    setUser(googleUser);
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token'); localStorage.removeItem('user');
          sessionStorage.removeItem('token'); sessionStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, adminId = null, rememberMe = true) => {
    const payload = adminId ? { adminId, password } : { email, password };
    const res = await authApi.login(payload);
    const { token, user } = res.data;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
    // Clear the other storage
    if (rememberMe) { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); }
    else { localStorage.removeItem('token'); localStorage.removeItem('user'); }
    setUser(user);
    return user;
  };

  const loginWithGoogle = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${apiBase}/auth/google`;
  };

  const register = async (name, email, password) => {
    const payload = { name, email, password };
    const res = await authApi.register(payload);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, setUserFromGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
