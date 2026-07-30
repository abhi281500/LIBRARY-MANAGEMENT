import { useMemo, useState, useEffect } from "react";
import { storage } from "../utils/storage.js";
import { AuthContext } from "./auth.context.js";
import { getMe } from "../services/auth.service.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user } = await getMe();
        setUser(user);
      }
      catch (error) {
        storage.removeToken();
        setToken(null);
        setUser(null);
        console.error("Authentication check failed:", error);
        
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = (newToken, userData) => {
    storage.setToken(newToken);
    setToken(newToken);
    setUser(userData);
  };
  const logout = () => {
  storage.removeToken();
  setToken(null);
  setUser(null);
  setLoading(false);
};

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!user,
      login,
      logout,
      loading,
      user
    }),
    [token, loading, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}