import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/jobApi';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // true while revalidating on mount

  // ── On mount: revalidate a stored token via GET /api/auth/me ─────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
        setToken(storedToken);
      } catch {
        // Token is invalid / expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Persist token to localStorage whenever it changes ─────────────────────
  const saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── register(name, email, password) → { success, error? } ────────────────
  const register = useCallback(async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user: newUser } = res.data.data;
      saveSession(newToken, newUser);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' ? 'Cannot connect to server.' : 'Registration failed.');
      return { success: false, error: msg };
    }
  }, [saveSession]);

  // ── login(email, password) → { success, error? } ─────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data.data;
      saveSession(newToken, newUser);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' ? 'Cannot connect to server.' : 'Login failed.');
      return { success: false, error: msg };
    }
  }, [saveSession]);

  // ── logout() — clears session, redirects to /login ───────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Convenience hook ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
