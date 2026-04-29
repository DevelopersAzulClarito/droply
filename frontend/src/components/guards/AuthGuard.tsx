import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Spinner = () => (
  <div className="flex items-center justify-center h-screen bg-surface">
    <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
  </div>
);

const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default AuthGuard;
