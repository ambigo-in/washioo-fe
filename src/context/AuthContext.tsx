import React, { useEffect, useState } from "react";
import { getAccessToken, getRefreshToken, clearTokens } from "../utils/tokenManager";
import { getCurrentUser, logoutUser } from "../api/authApi";
import { AuthContext } from "./authContextValue";
import type { UserProfile, UserRole } from "../types/apiTypes";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      if (!getAccessToken()) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (!active) return;
        setUser(response.user);
        setIsAuthenticated(true);
      } catch {
        clearTokens();
        if (!active) return;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  const refreshUser = async () => {
    const response = await getCurrentUser();
    setUser(response.user);
    setIsAuthenticated(true);
    return response.user;
  };

  const login = refreshUser;

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken && getAccessToken()) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Local logout must still complete if the server token is already invalid.
      }
    }
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const roles = user?.roles ?? [];
  const hasRole = (role: UserRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        roles,
        hasRole,
        refreshUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

