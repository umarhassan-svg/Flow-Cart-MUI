// src/contexts/NavContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api/axios";
import type { NavItem } from "../utils/loadAllowedPages";

type NavContextValue = {
  nav: NavItem[] | null;
  loading: boolean;
  reload: () => Promise<void>;
  getall: () => Promise<void>;
  allPagesList: allPagesType[];
};

type allPagesType = {
  key: string;
  label: string;
};

const NavContext = createContext<NavContextValue | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nav, setNav] = useState<NavItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [allPagesList, setAllPagesList] = useState<allPagesType[]>([]);

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

  const getallPages = async () => {
    setLoading(true);
    try {
      const body = await api.get<allPagesType[]>("/api/allPages");
      setAllPagesList(body.data as allPagesType[]);
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
    getallPages();
  }, []);

  return (
    <NavContext.Provider
      value={{
        nav,
        loading,
        reload: load,
        getall: getallPages,
        allPagesList,
      }}
    >
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
