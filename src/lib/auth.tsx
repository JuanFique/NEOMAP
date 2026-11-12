import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSessionEmail, onAuthChange, signIn as doSignIn, signOut as doSignOut } from './data';

interface AuthState {
  email: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getSessionEmail()
      .then((value) => {
        if (alive) setEmail(value);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    const off = onAuthChange((value) => setEmail(value));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const signIn = useCallback(async (mail: string, password: string) => {
    setEmail(await doSignIn(mail, password));
  }, []);

  const signOut = useCallback(async () => {
    await doSignOut();
    setEmail(null);
  }, []);

  const value = useMemo(() => ({ email, loading, signIn, signOut }), [email, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
