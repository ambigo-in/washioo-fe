import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/apiTypes";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: UserRole[];
}> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="route-state">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/verify-phone" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.some(hasRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

