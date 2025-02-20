// src/components/layout/ProtectedRoute.tsx
import { useCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector(useCurrentUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Optional: Check user role against route requirements
  // Example: If you have admin-only routes, verify user.roles here

  return children;
};

export default ProtectedRoute;
