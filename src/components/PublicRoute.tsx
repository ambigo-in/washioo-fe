import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="route-state">Checking your session...</div>;
  }

  return isAuthenticated ? (
    <Navigate to={hasRole("customer") ? "/bookings" : "/"} replace />
  ) : (
    <>{children}</>
  );
};

export default PublicRoute;

