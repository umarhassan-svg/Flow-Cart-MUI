/* eslint-disable react-refresh/only-export-components */
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
import type { allowedPages, User } from "../types/User";
import { useSession } from "../store/hooks/useSession";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // loading local state only — session user/token live in Redux
  const [loading, setLoading] = useState(true);

  // session values + actions from Redux
  const {
    token,
    user,

    saveSession,
    clearSession,
  } = useSession();

  // Init: check token and load profile on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const t = token;

      if (!t) {
        const persistedToken = localStorage.getItem("persisted:root");

        if (persistedToken) {
          const token = JSON.parse(persistedToken).session.token;
          const user = JSON.parse(persistedToken).session.user;

          if (token && user) {
            saveSession(
              token,
              user,
              user.effectivePermissions,
              user.allowedPages
            );
            return;
          }
        }
      }

      // If no token, not authenticated
      if (!t) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const resp = await authService.getProfile();
        const profile = (resp.data.user || resp.data) as User;

        if (!profile || typeof profile !== "object" || !("id" in profile)) {
          throw new Error("Invalid profile data received");
        }

        if (mounted) {
          // Save fresh profile into Redux session
          saveSession(
            t,
            profile,
            profile.effectivePermissions,
            profile.allowedPages
          );
        }
      } catch (err) {
        // Token invalid/expired -> clear session
        console.error("Profile fetch failed:", err);
        clearSession();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
    };
    // We intentionally run on mount only. If you want to re-run when token changes, add `token` to deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login user
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const resp = await authService.login(email, password);

      const {
        token: t,
        user: u,
        effectivePermissions: eps,
        allowedPages: aps,
      } = resp.data as {
        token: string;
        user: User;
        effectivePermissions?: string[];
        allowedPages?: allowedPages[];
      };

      if (!u || typeof u !== "object" || !("id" in u)) {
        throw new Error("Login failed: invalid server response");
      }

      // Save into Redux session
      saveSession(t, u, eps, aps);

      return u;
    } catch (err: unknown) {
      let message = "Login failed";
      if (err && typeof err === "object") {
        const e = err as {
          message?: string;
          response?: { data?: { error?: string; message?: string } };
        };
        message =
          e.response?.data?.error ??
          e.response?.data?.message ??
          e.message ??
          message;
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearSession();
    }
  };

  // Refresh profile
  const refresh = async (): Promise<void> => {
    const t = token;
    if (!t) throw new Error("No token available");

    setLoading(true);
    try {
      const resp = await authService.getProfile();
      const profile = (resp.data.user || resp.data) as User;

      if (!profile || typeof profile !== "object" || !("id" in profile)) {
        throw new Error("Invalid profile data");
      }

      saveSession(
        t,
        profile,
        profile.effectivePermissions,
        profile.allowedPages
      );
    } catch (err) {
      console.error("Refresh failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check permission
  const can = (permission: string) =>
    user?.effectivePermissions?.includes(permission) ?? false;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      logout,
      refresh,
      can,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
