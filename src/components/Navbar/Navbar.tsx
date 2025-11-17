// src/components/Navbar/Navbar.tsx
import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { NavItem } from "../../utils/loadAllowedPages";

type Props = {
  onToggleSidebar: () => void; // collapses on desktop / opens on mobile
  onToggleCart?: () => void;
  cartCount?: number;
  onSettings?: () => void;
};

const ALL_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "products", label: "Products", path: "/admin/products" },
  { key: "orders", label: "Orders", path: "/admin/orders" },
];

const Navbar: React.FC<Props> = ({
  onToggleSidebar,
  onToggleCart,
  cartCount = 0,
  onSettings,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(anchorEl);

  const { logout, allowedNavItems } = useAuth();
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  // Decide which middle nav items to show:
  // - while loading (allowedNavItems === null) -> show ALL_NAV for better UX
  // - when loaded: if list non-empty show allowedNavItems (normalized), else fallback to ALL_NAV
  const middleNavToShow: NavItem[] =
    allowedNavItems === null
      ? ALL_NAV
      : allowedNavItems.length > 0
      ? allowedNavItems.map((it) => ({
          ...it,
          path: it.path ?? `/admin/${it.key}`,
        }))
      : ALL_NAV;

  const handleMiddleNav = (path: string) => {
    navigate(path);
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundColor: (t) => t.palette.background.paper,
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 120,
        backdropFilter: "blur(6px)",
      }}
    >
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onToggleSidebar}
          size="large"
        >
          <MenuIcon />
        </IconButton>

        {/* Logo + middle nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            FlowCart
          </Typography>

          {/* middle nav — hidden on xs */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            {middleNavToShow.map((item) => (
              <Button
                key={item.key}
                size="small"
                onClick={() =>
                  handleMiddleNav(item.path ?? `/admin/${item.key}`)
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Right icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton aria-label="cart" onClick={onToggleCart} size="large">
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="large"
            aria-label="profile"
          >
            <Avatar sx={{ width: 34, height: 34 }}>J</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={profileOpen}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onSettings?.();
              }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogoutClick();
              }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
