import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface Props {
  allowed: UserRole[];
}

const RoleGuard: React.FC<Props> = ({ allowed }) => {
  const { role } = useAuth();

  if (!role || !allowed.includes(role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
