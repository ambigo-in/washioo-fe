import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/apiTypes";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  if (isLoading) {
    return <div className="route-state">Checking your session...</div>;
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

