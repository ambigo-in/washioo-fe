import React, { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextValue";
import type { UserProfile, UserRole } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  hydrateSession,
  logoutSession,
  refreshCurrentUser,
  setUser as setAuthUser,
} from "../store/slices/authSlice";

const ACTIVE_ROLE_KEY = "washioo.activeRole";

const rolePriority: UserRole[] = ["customer", "cleaner", "admin"];

const readSavedRole = () => {
  const saved = localStorage.getItem(ACTIVE_ROLE_KEY);
  return rolePriority.includes(saved as UserRole) ? (saved as UserRole) : null;
};

const chooseActiveRole = (
  roles: UserRole[],
  currentRole: UserRole | null,
) => {
  if (currentRole && roles.includes(currentRole)) return currentRole;

  const savedRole = readSavedRole();
  if (savedRole && roles.includes(savedRole)) return savedRole;

  return rolePriority.find((role) => roles.includes(role)) ?? roles[0] ?? null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() =>
    chooseActiveRole(roles, null),
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

  useEffect(() => {
    const nextRole = chooseActiveRole(roles, activeRole);
    setActiveRoleState(nextRole);
    if (nextRole) {
      localStorage.setItem(ACTIVE_ROLE_KEY, nextRole);
    } else {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  }, [roles, activeRole]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const setActiveRole = (role: UserRole) => {
    if (!roles.includes(role)) return;
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    setActiveRoleState(role);
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
