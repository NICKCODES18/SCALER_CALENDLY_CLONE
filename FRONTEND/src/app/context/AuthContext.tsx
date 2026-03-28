import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { api, setAuthToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  /** IANA timezone persisted for the host (availability + slot math). */
  timeZone?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<AuthUser>('/api/me');
      setUser(data);
    } catch {
      // Host shell uses default user without login; if /api/me fails (network/CORS), still
      // set a stub so hooks that gate on `user` keep working. IDs must match BACKEND .env.
      if (import.meta.env.VITE_USE_DEFAULT_USER === 'true') {
        setUser({
          id: import.meta.env.VITE_DEFAULT_USER_ID ?? '1',
          email: import.meta.env.VITE_DEFAULT_USER_EMAIL ?? 'demo@calendly.local',
          name: 'Host',
          picture: null,
          timeZone: 'America/New_York',
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const loginWithEmail = useCallback(async (email: string, name?: string) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>('/api/auth/dev-login', {
      email,
      name,
    });
    setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    if (import.meta.env.VITE_USE_DEFAULT_USER === 'true') {
      return;
    }
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAuthToken(null);
      setUser(null);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      loginWithEmail,
      logout,
    }),
    [user, loading, refreshUser, loginWithEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
