import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  theme?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Fetch user profile
      api.getProfile()
        .then((data) => {
          // Decode JWT to get email (simple base64 decode)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: data.profile.user_id,
              email: payload.email || '',
              display_name: data.profile.display_name,
              avatar_url: data.profile.avatar_url,
              theme: data.profile.theme,
            });
          } catch {
            setUser({
              id: data.profile.user_id,
              email: '',
              display_name: data.profile.display_name,
              avatar_url: data.profile.avatar_url,
              theme: data.profile.theme,
            });
          }
        })
        .catch(() => {
          // Token invalid, clear it
          api.clearToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const data = await api.signup(email, password, name);
    setUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
  };

  const signOut = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
