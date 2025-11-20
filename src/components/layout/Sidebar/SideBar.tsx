// src/components/SideBar.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useNav } from "../../../context/NavContext";
import type { NavItem } from "../../../utils/nav";

const DRAWER_WIDTH = 260;

type Props = {
  open: boolean;
  onClose?: () => void;
  initialActive?: string;
};

const DEFAULT_NAV: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon />,
  },
];

export default function SideBar({ open, onClose, initialActive }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const { nav: ctxNav, loading } = useNav();

  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [active, setActive] = useState<string>(
    initialActive ?? DEFAULT_NAV[0].key
  );

  const keyFromPath = (p: string) => {
    const parts = p.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : "";
  };

  // update nav items when context changes
  useEffect(() => {
    setNavItems(
      Array.isArray(ctxNav) && ctxNav.length > 0 ? ctxNav : DEFAULT_NAV
    );

    const pathKey = keyFromPath(location.pathname);
    const candidate =
      initialActive ||
      (pathKey && (ctxNav || DEFAULT_NAV).some((i) => i.key === pathKey)
        ? pathKey
        : null) ||
      (Array.isArray(ctxNav) && ctxNav.length > 0
        ? ctxNav[0].key
        : DEFAULT_NAV[0].key);

    setActive(candidate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxNav, initialActive, location.pathname]);

  // keep active in sync with route changes
  useEffect(() => {
    const pathKey = keyFromPath(location.pathname);
    if (pathKey && navItems.some((i) => i.key === pathKey)) setActive(pathKey);
  }, [location.pathname, navItems]);

  const goTo = (item: NavItem) => {
    setActive(item.key);
    const target = item.path ?? `/${item.key}`;
    navigate(target);
    onClose?.();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "85vw", sm: `${DRAWER_WIDTH}px` },
          boxSizing: "border-box",
          top: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          overflowY: "auto",
          borderRadius: 0,
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <List sx={{ p: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={20} />
            </Box>
          ) : navItems.length === 0 ? (
            <ListItemButton disabled>
              <ListItemText primary="No pages" />
            </ListItemButton>
          ) : (
            navItems.map((item) => {
              const selected = active === item.key;
              return (
                <ListItemButton
                  key={item.key}
                  selected={selected}
                  onClick={() => goTo(item)}
                  sx={{ borderRadius: 1, mb: 1, px: 2 }}
                >
                  {/* <ListItemIcon>{item.icon}</ListItemIcon> */}
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })
          )}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
