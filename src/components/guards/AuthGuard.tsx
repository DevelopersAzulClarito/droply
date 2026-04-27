import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * Redirects unauthenticated users to /login.
 * Place this as a parent Route element wrapping role-specific routes.
 */
const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default AuthGuard;
