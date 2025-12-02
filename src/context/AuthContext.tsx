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
import {
  clearSession,
  saveSession,
  getToken,
} from "../utils/ServicesHelpers/AuthHelpers";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Init: check token and load profile on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // console.log(" Auth init started");

      const token = getToken();

      // console.log(" Token exists:", !!token);

      // If no token, we're not authenticated
      if (!token) {
        // console.log(" No token found, user not authenticated");
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // We have a token, try to validate it
      // console.log(" Token found, validating with server...");

      try {
        const resp = await authService.getProfile();
        // console.log(" Profile fetched successfully:", resp.data);

        // Backend returns { user: {...} }, not the user directly
        const profile = (resp.data.user || resp.data) as User;

        if (!profile || typeof profile !== "object" || !("id" in profile)) {
          throw new Error("Invalid profile data received");
        }

        if (mounted) {
          // Update storage with fresh data
          saveSession(
            token,
            profile,
            profile.effectivePermissions,
            profile.allowedPages
          );
          setUser(profile);
          // console.log(" User authenticated successfully");
        }
      } catch (err) {
        console.error(" Profile fetch failed:", err);

        // Token is invalid or expired, clear everything
        clearSession();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          // console.log(" Auth init completed");
        }
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  // Login user
  const login = async (email: string, password: string): Promise<User> => {
    // console.log(" Login attempt for:", email);
    setLoading(true);

    try {
      const resp = await authService.login(email, password);
      // console.log(" Login response received:", resp.data);

      const {
        token,
        user: u,
        effectivePermissions,
        allowedPages,
      } = resp.data as {
        token: string;
        user: User;
        effectivePermissions?: string[];
        allowedPages?: allowedPages[];
      };

      if (!u || typeof u !== "object" || !("id" in u)) {
        throw new Error("Login failed: invalid server response");
      }

      saveSession(token, u, effectivePermissions, allowedPages);
      setUser(u);
      // console.log(" User logged in successfully");
      return u;
    } catch (err: unknown) {
      // console.error(" Login failed:", err);

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
    // console.log(" Logging out user");

    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearSession();
      setUser(null);
      // console.log(" User logged out, session cleared");
    }
  };

  // Refresh profile
  const refresh = async (): Promise<void> => {
    // console.log("Refreshing user profile");

    const token = getToken();
    if (!token) {
      throw new Error("No token available");
    }

    setLoading(true);
    try {
      const resp = await authService.getProfile();
      // Backend returns { user: {...} }, not the user directly
      const profile = (resp.data.user || resp.data) as User;

      if (!profile || typeof profile !== "object" || !("id" in profile)) {
        throw new Error("Invalid profile data");
      }

      saveSession(
        token,
        profile,
        profile.effectivePermissions,
        profile.allowedPages
      );
      setUser(profile);
      // console.log("Profile refreshed successfully");
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
      isAuthenticated: Boolean(user && getToken()),
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

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
