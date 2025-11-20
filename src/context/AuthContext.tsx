// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import authService from "../services/auth.service";
import type { User } from "../types/User";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // initialize user from auth service (may read from localStorage inside the service)
  const [user, setUser] = useState<User | null>(() =>
    authService.getCurrentUser()
  );
  const [loading, setLoading] = useState<boolean>(false);

  // on mount, try to validate/refresh profile if token exists
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = authService.getToken();
      if (!token) {
        if (mounted) setUser(null);
        return;
      }

      setLoading(true);
      try {
        const profile = await authService.getProfile(); // may throw if token invalid
        if (mounted) setUser(profile);
      } catch (err) {
        console.warn("Auth init failed, clearing session:", err);
        try {
          await authService.logout();
        } catch {
          /* ignore */
        }
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u ?? null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    setLoading(true);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const can = (p: string) => {
    console.log(user);
    if (!user) return false;
    return user.effectivePermissions?.includes(p) || false;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && authService.getToken()),
      loading,
      login,
      logout,
      refresh,
      can,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
