import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "vigilia_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null, workspace: null };
  });
  const [isLoading, setIsLoading] = useState(Boolean(session.token));

  useEffect(() => {
    if (!session.token) {
      setAuthToken(null);
      setIsLoading(false);
      return;
    }

    setAuthToken(session.token);
    api
      .get("/auth/me")
      .then((response) => {
        const nextSession = {
          token: session.token,
          user: response.data.user,
          workspace: response.data.workspace,
        };
        setSession(nextSession);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      })
      .catch(() => {
        setSession({ token: null, user: null, workspace: null });
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [session.token]);

  const persistSession = useCallback((data) => {
    const nextSession = {
      token: data.access_token,
      user: data.user,
      workspace: data.workspace,
    };
    setAuthToken(data.access_token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistSession(data);
    return data;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data);
    return data;
  }, [persistSession]);

  const logout = useCallback(() => {
    setSession({ token: null, user: null, workspace: null });
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token),
      isLoading,
      login,
      register,
      logout,
    }),
    [session, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
