import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { RouteLoader } from "./ui";
import type { UserRole } from "../types/apiTypes";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: UserRole[];
}> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, isLoading, hasRole, activeRole, termsAccepted } =
    useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/verify-phone" state={{ from: location }} replace />;
  }

  if (!termsAccepted) {
    return <Navigate to="/accept-terms" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.some(hasRole)) {
    return <Navigate to="/" replace />;
  }

  if (roles?.length && activeRole && !roles.includes(activeRole)) {
    return <Navigate to={getDashboardPath(activeRole)} replace />;
  }

  return <>{children}</>;
};

const getDashboardPath = (role: UserRole) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "cleaner") return "/cleaner/dashboard";
  return "/dashboard";
};

export default ProtectedRoute;

