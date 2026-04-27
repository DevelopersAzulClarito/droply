import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface Props {
  allowed: UserRole[];
}

/**
 * Redirects users whose role is not in `allowed` back to /.
 * Must be nested inside <AuthGuard> so `role` is guaranteed to be loaded.
 */
const RoleGuard: React.FC<Props> = ({ allowed }) => {
  const { role } = useAuth();

  if (!role || !allowed.includes(role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
