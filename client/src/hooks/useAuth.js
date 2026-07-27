import { createContext, useMemo, useState } from "react";
import { storage } from "../utils/storage.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.getToken());

  const login = (newToken) => {
    storage.setToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    storage.removeToken();
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}