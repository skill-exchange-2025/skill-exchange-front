import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { Navigate } from 'react-router-dom';
import React from 'react';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(useCurrentUser);

  if (user) {
    // If user is admin, redirect to admin dashboard, otherwise to user dashboard
    return (
      <Navigate
        to={user.roles.includes('admin') ? '/admin/dashboard' : '/'}
        replace
      />
    );
  }

  return children;
};

export default PublicRoute;
