import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, User } from '../../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('[AuthContext]', 'initAuth:error', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const newUser = await auth.signIn(email, password);
      setUser(newUser);
      console.log('[AuthContext]', 'signIn:success', { userId: newUser.id });
    } catch (error) {
      console.error('[AuthContext]', 'signIn:error', error);
      throw error;
    }
  };

  const signOut = () => {
    console.log('[AuthContext]', 'signOut');
    auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
