import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { getStoredSession, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, User } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: typeof apiSignIn;
  signUp: typeof apiSignUp;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredSession().then(({ token, user }) => {
      setToken(token);
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleSignIn: typeof apiSignIn = async (email, password) => {
    const res = await apiSignIn(email, password);
    if (res.session) {
      setToken(res.session.access_token);
      setUser(res.session.user);
    }
    return res;
  };

  const handleSignUp: typeof apiSignUp = async (email, password, name) => {
    const res = await apiSignUp(email, password, name);
    if (res.session) {
      setToken(res.session.access_token);
      setUser(res.session.user);
    }
    return res;
  };

  const handleSignOut = async () => {
    await apiSignOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
