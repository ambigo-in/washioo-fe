import { createContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../utils/tokenStorage";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await authApi.getUserDetails();
      setUser(data.user);
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenStorage.getAccessToken()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tokens: any) => {
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    fetchUser();
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefreshToken();
    if (refresh) await authApi.logout(refresh);
    tokenStorage.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};