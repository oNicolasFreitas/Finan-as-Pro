import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    console.log('[AuthGuard]', 'state { isAuthLoading: true, hasUser: false, path:', location.pathname, '}');
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-muted font-medium animate-pulse">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[AuthGuard]', 'state { isAuthLoading: false, hasUser: false, path:', location.pathname, '}');
    console.log('[AuthGuard]', 'Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[AuthGuard]', 'state { isAuthLoading: false, hasUser: true, path:', location.pathname, '}');
  return <>{children}</>;
};
