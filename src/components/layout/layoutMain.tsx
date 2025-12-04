// src/components/LayoutMain.tsx (Option A - pixel mt)
import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./Navbar/Navbar";
import SideBar from "./Sidebar/SideBar";
import CartDrawer from "../CartDrawer/CartDrawer";
// import { useCart } from "../../context/CartContext";
import { useCart } from "../../store/hooks/useCart";
import { useAuth } from "../../context/AuthContext";

const LayoutMain = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCart = () => setCartOpen((s) => !s);
  const closeCart = () => setCartOpen(false);
  const { user } = useAuth();
  const { totals } = useCart();

  const innerSx = {
    bgcolor: "transparent",
    p: 0,
    minHeight: { xs: "auto", md: "60vh" },
    boxSizing: "border-box",
    overflowX: "hidden",
    "& > *": { boxSizing: "border-box", maxWidth: "100%" },
  } as const;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />

      <Navbar
        onToggleSidebar={toggleSidebar}
        onToggleCart={toggleCart}
        cartCount={totals.itemsCount}
      />

      <SideBar
        open={sidebarOpen}
        onClose={closeSidebar}
        initialActive={user?.allowedPages?.[0].key}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          px: 0,
          py: { xs: 2, sm: 3, md: 4 },
          // Use pixel strings so MUI does not interpret numeric spacing units
          mt: { xs: "25px", sm: "35px" },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 920, md: 1080, lg: 1200 },
            mx: "auto",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Box sx={innerSx}>{children}</Box>
          <Box sx={{ height: { xs: 16, sm: 24 } }} />
        </Box>
      </Box>

      <CartDrawer onClose={closeCart} open={cartOpen} />
    </Box>
  );
};

export default LayoutMain;
