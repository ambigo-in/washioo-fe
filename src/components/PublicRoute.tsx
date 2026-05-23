import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { RouteLoader } from "./ui";
import type { UserRole } from "../types/apiTypes";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, activeRole, termsAccepted } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated && !termsAccepted) {
    return <Navigate to="/accept-terms" replace />;
  }

  return isAuthenticated ? (
    <Navigate to={getDashboardPath(activeRole)} replace />
  ) : (
    <>{children}</>
  );
};

const getDashboardPath = (role?: UserRole | null) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "cleaner") return "/cleaner/dashboard";
  return "/dashboard";
};

export default PublicRoute;

