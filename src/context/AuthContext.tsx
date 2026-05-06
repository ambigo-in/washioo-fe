import React, { useEffect, useMemo } from "react";
import { AuthContext } from "./authContextValue";
import type { UserProfile, UserRole } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  hydrateSession,
  logoutSession,
  refreshCurrentUser,
  setUser as setAuthUser,
} from "../store/slices/authSlice";
import { removeCleanerPushSubscription } from "../utils/pushNotifications";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, activeRole } = useAppSelector(
    (state) => state.auth,
  );
  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  const refreshUser = async () => {
    const response = await dispatch(refreshCurrentUser()).unwrap();
    return response;
  };

  const login = refreshUser;

  const logout = async () => {
    if (activeRole === "cleaner") {
      await removeCleanerPushSubscription();
    }
    await dispatch(logoutSession()).unwrap();
  };

  const hasRole = (role: UserRole) => roles.includes(role);
  const setActiveRole = () => {
    // Active role is controlled by the role-specific auth endpoint/JWT.
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        roles,
        activeRole,
        hasRole,
        setActiveRole,
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
