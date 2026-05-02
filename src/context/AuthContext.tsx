import React, { useEffect } from "react";
import { AuthContext } from "./authContextValue";
import type { UserProfile, UserRole } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  hydrateSession,
  logoutSession,
  refreshCurrentUser,
  setUser as setAuthUser,
} from "../store/slices/authSlice";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  const refreshUser = async () => {
    const response = await dispatch(refreshCurrentUser()).unwrap();
    return response;
  };

  const login = refreshUser;

  const logout = async () => {
    await dispatch(logoutSession()).unwrap();
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
        setUser: (nextUser: UserProfile | null) => dispatch(setAuthUser(nextUser)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
