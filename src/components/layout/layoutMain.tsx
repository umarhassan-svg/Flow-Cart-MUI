// src/components/LayoutMain.tsx
import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../Navbar/Navbar";
import SideBar from "../Sidebar/SideBar";
import CartDrawer from "../CartDrawer/CartDrawer";
import { useCart } from "../../context/CartContext";
type Props = {
  children?: React.ReactNode;
};

const LayoutMain: React.FC<Props> = ({ children }) => {
  // overlay states
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleCart = () => setCartOpen((s) => !s);
  const closeCart = () => setCartOpen(false);
  const { totals } = useCart();

  // inner "card" styles: transparent on xs so there is no visible white band
  const innerSx = {
    bgcolor: "transparent", // <-- transparent on mobile
    p: 0, // small padding on xs, larger on sm+
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
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <CssBaseline />

      <Navbar
        onToggleSidebar={toggleSidebar}
        onToggleCart={toggleCart}
        cartCount={totals.itemsCount}
      />

      {/* spacer below fixed AppBar */}
      <Box sx={{ height: { xs: 56, sm: 64 } }} />

      {/* overlay sidebar */}
      <SideBar open={sidebarOpen} onClose={closeSidebar} />

      {/* MAIN: full-bleed on xs, minimal vertical spacing only */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          px: 0, // no horizontal padding on xs (edge-to-edge)
          py: { xs: 2, sm: 3, md: 4 }, // small vertical breathing space
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
          {/* small top spacing only */}
          <Box sx={{ height: { xs: 8, sm: 12 } }} />

          {/* the inner canvas / actual content */}
          <Box sx={innerSx}>{children}</Box>

          {/* small bottom spacing only */}
          <Box sx={{ height: { xs: 16, sm: 24 } }} />
        </Box>
      </Box>

      {/* CART overlay */}
      {/* cart content */}
      <CartDrawer onClose={closeCart} open={cartOpen} />
    </Box>
  );
};

export default LayoutMain;
