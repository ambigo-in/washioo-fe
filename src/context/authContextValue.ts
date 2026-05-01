import { createContext } from "react";
import type { UserProfile, UserRole } from "../types/apiTypes";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<UserProfile | null>;
  login: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

