// src/components/SideBar.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { NavItem } from "../../utils/loadAllowedPages";

export const DRAWER_WIDTH = 260;

type SideBarProps = {
  open: boolean;
  onClose?: () => void;
  initialActive?: string; // key of the active item
};

const DEFAULT_NAV: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardOutlinedIcon />,
  },
];

const SideBar: React.FC<SideBarProps> = ({
  open = false,
  onClose,
  initialActive,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { allowedNavItems, loadingAllowedNav } = useAuth();

  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [active, setActive] = useState<string>(
    initialActive ?? DEFAULT_NAV[0].key
  );

  // derive key from path
  const deriveKeyFromPath = (pathname: string) => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : "";
  };

  // update navItems when auth context changes
  useEffect(() => {
    if (loadingAllowedNav) {
      // keep current items until loaded
      return;
    }

    // if allowedNavItems is null or empty, fallback to DEFAULT_NAV
    const resolved =
      allowedNavItems && allowedNavItems.length > 0
        ? allowedNavItems
        : DEFAULT_NAV;
    setNavItems(resolved);

    // determine active: prefer initialActive -> path -> first item
    const pathKey = deriveKeyFromPath(location.pathname);
    const candidate =
      initialActive ||
      (pathKey && resolved.some((i) => i.key === pathKey) ? pathKey : null) ||
      resolved[0].key;

    setActive(candidate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedNavItems, loadingAllowedNav, initialActive]);

  // keep active in sync with router changes
  useEffect(() => {
    const key = deriveKeyFromPath(location.pathname);
    if (key && navItems.some((i) => i.key === key)) {
      setActive(key);
    }
  }, [location.pathname, navItems]);

  const handleClick = (item: NavItem) => {
    setActive(item.key);
    const target = item.path ?? `/admin/${item.key}`;
    navigate(target);
    onClose?.();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true, disableScrollLock: true }}
      PaperProps={{
        sx: {
          width: { xs: "85vw", sm: `${DRAWER_WIDTH}px` },
          boxSizing: "border-box",
          top: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 6,
        },
      }}
      role="navigation"
      aria-label="main navigation"
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", p: 1 }}
      >
        <List sx={{ p: 1 }}>
          {loadingAllowedNav ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={20} />
            </Box>
          ) : navItems.length === 0 ? (
            <ListItemButton disabled>
              <ListItemText primary="No pages available" />
            </ListItemButton>
          ) : (
            navItems.map((item) => {
              const selected = active === item.key;
              return (
                <ListItemButton
                  key={item.key}
                  selected={selected}
                  onClick={() => handleClick(item)}
                  aria-current={selected ? "page" : undefined}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    px: 2,
                    bgcolor: selected
                      ? theme.palette.action.selected
                      : "transparent",
                    "& .MuiListItemIcon-root": {
                      color: selected ? "primary.main" : "inherit",
                      minWidth: 40,
                    },
                  }}
                >
                  {item.icon ? (
                    <ListItemIcon>{item.icon}</ListItemIcon>
                  ) : (
                    <ListItemIcon sx={{ minWidth: 40 }} />
                  )}
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
};

export default SideBar;
