import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bb_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        setCompany(data.company);
      })
      .catch(() => {
        localStorage.removeItem("bb_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token, u, c) => {
    localStorage.setItem("bb_token", token);
    localStorage.setItem("bb_user", JSON.stringify(u));
    setUser(u);
    setCompany(c);
  };

  const logout = () => {
    localStorage.removeItem("bb_token");
    localStorage.removeItem("bb_user");
    setUser(null);
    setCompany(null);
    window.location.href = "/login";
  };

  return (
    <AuthCtx.Provider value={{ user, company, loading, setSession, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
