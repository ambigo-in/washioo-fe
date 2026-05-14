import { createContext } from "react";
import type { UserProfile, UserRole } from "../types/apiTypes";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  termsAccepted: boolean;
  hasRole: (role: UserRole) => boolean;
  setActiveRole: (role: UserRole) => void;
  refreshUser: () => Promise<UserProfile | null>;
  login: () => Promise<UserProfile | null>;
  acceptTerms: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
