// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "../services/auth.service";
import type { User } from "../services/auth.service";
import type { ReactNode } from "react";
import {
  loadNavItemsForCurrentUser,
  type NavItem,
} from "../utils/loadAllowedPages";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  // new: allowed nav items (null = loading, [] = loaded but empty)
  allowedNavItems: NavItem[] | null;
  loadingAllowedNav: boolean;
  refreshAllowedNav: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() =>
    authService.getCurrentUser()
  );
  const [loading, setLoading] = useState<boolean>(false);

  // allowed nav
  const [allowedNavItems, setAllowedNavItems] = useState<NavItem[] | null>(
    null
  );
  const [loadingAllowedNav, setLoadingAllowedNav] = useState<boolean>(true);

  // init: if token exists, validate token & load profile + allowed nav
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = authService.getToken();
      if (!token) {
        if (mounted) {
          setUser(null);
          setAllowedNavItems([]);
          setLoadingAllowedNav(false);
        }
        return;
      }

      setLoading(true);
      setLoadingAllowedNav(true);
      try {
        const profile = await authService.getProfile(); // also updates localStorage
        if (mounted) setUser(profile);

        // load nav items once (uses local user & roles)
        try {
          const items = await loadNavItemsForCurrentUser();
          if (mounted) setAllowedNavItems(items ?? []);
        } catch (err) {
          console.error(err);
          if (mounted) setAllowedNavItems([]);
        }
      } catch {
        // invalid token -> clear session
        authService.logout();
        if (mounted) {
          setUser(null);
          setAllowedNavItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingAllowedNav(false);
        }
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // helper to refresh allowed nav (exposed)
  const refreshAllowedNav = async (): Promise<void> => {
    setLoadingAllowedNav(true);
    try {
      const items = await loadNavItemsForCurrentUser();
      setAllowedNavItems(items ?? []);
    } catch (err) {
      console.error(err);
      setAllowedNavItems([]);
    } finally {
      setLoadingAllowedNav(false);
    }
  };

  // login: preserve previous behaviour but also load allowed nav once
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setLoadingAllowedNav(true);
    try {
      const u = await authService.login(email, password);
      setUser(u ?? null);

      // compute/load nav items for this user (best-effort)
      try {
        const items = await loadNavItemsForCurrentUser();
        setAllowedNavItems(items ?? []);
      } catch {
        setAllowedNavItems([]);
      }
    } finally {
      setLoadingAllowedNav(false);
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setAllowedNavItems([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    setLoading(true);
    setLoadingAllowedNav(true);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      const items = await loadNavItemsForCurrentUser();
      setAllowedNavItems(items ?? []);
    } finally {
      setLoading(false);
      setLoadingAllowedNav(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && authService.getToken()),
      loading,
      login,
      logout,
      refresh,
      allowedNavItems,
      loadingAllowedNav,
      refreshAllowedNav,
    }),
    [user, loading, allowedNavItems, loadingAllowedNav]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
