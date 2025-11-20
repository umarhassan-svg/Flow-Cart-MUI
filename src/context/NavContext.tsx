// src/contexts/NavContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api/axios";
import type { NavItem } from "../utils/loadAllowedPages";

type NavContextValue = {
  nav: NavItem[] | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const NavContext = createContext<NavContextValue | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nav, setNav] = useState<NavItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const body = await api.get<NavItem[]>("/api/me/nav");
      setNav(body.data as NavItem[]);
    } catch (err) {
      console.error("Failed to load nav", err);
      setNav([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load on mount
    load();
  }, []);

  return (
    <NavContext.Provider value={{ nav, loading, reload: load }}>
      {children}
    </NavContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNav = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
};
