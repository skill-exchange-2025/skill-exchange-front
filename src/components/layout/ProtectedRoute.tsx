// src/components/layout/ProtectedRoute.tsx
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { Navigate, useLocation } from 'react-router-dom';
import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(useCurrentUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;