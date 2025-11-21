// src/components/Navbar/Navbar.tsx
import { useState } from "react";
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
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom"; // 1. Import useLocation
import type { NavItem } from "../../../utils/nav";
import { useNav } from "../../../context/NavContext";
import { useThemeContext } from "../../../context/ThemeContext";
import LightModeIcon from "@mui/icons-material/LightMode";

type Props = {
  onToggleSidebar: () => void;
  onToggleCart?: () => void;
  cartCount?: number;
  onSettings?: () => void;
  openSidebar?: boolean;
  // initialActive is no longer needed, removed
};

const ALL_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "products", label: "Products", path: "/admin/products" },
  { key: "orders", label: "Orders", path: "/admin/orders" },
];

const Navbar = ({
  onToggleSidebar,
  onToggleCart,
  cartCount = 0,
  onSettings,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(anchorEl);

  const { logout, user, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 2. Hook into the current URL
  const { mode, toggleTheme } = useThemeContext();

  // Nav comes from NavContext
  const { nav: allowedNavItems, loading: navLoading } = useNav();

  const onLogoutClick = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const middleNavToShow = navLoading ? ALL_NAV : allowedNavItems ?? ALL_NAV;

  const handleMiddleNav = (path: string) => {
    navigate(path);
  };

  const avatarInitial =
    user?.name && String(user.name).trim().length > 0
      ? String(user.name).trim().charAt(0).toUpperCase()
      : "U";

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
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onToggleSidebar}
          size="large"
          sx={{ display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo + middle nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            FlowCart
          </Typography>

          {/* middle nav — hidden on xs */}
          <Box
            sx={{
              display: { xs: "none", sm: "none", lg: "flex" },
              gap: 2,
              width: "100%",
            }}
          >
            {middleNavToShow.map((item) => {
              const itemPath = item.path ?? `/admin/${item.key}`;
              // 3. Derive active state from current location
              // Check if the current pathname starts with the item's path
              const isActive = location.pathname.startsWith(itemPath);

              return (
                <Button
                  key={item.key}
                  size="small"
                  onClick={() => handleMiddleNav(itemPath)}
                  sx={
                    isActive
                      ? {
                          color: "primary.main",
                          textTransform: "none",
                          fontWeight: 600,
                        }
                      : {
                          textTransform: "none",
                          fontWeight: 600,
                          color: "text.primary",
                        }
                  }
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Right icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {can("cart:update") && (
            <IconButton aria-label="cart" onClick={onToggleCart} size="large">
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          )}

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="large"
            aria-label="profile"
          >
            <Avatar sx={{ width: 34, height: 34 }}>{avatarInitial}</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={profileOpen}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={toggleTheme}>
              <ListItemIcon>
                <LightModeIcon fontSize="small" />
              </ListItemIcon>
              {mode === "dark" ? "Light Mode" : "Dark Mode"}
            </MenuItem>

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
