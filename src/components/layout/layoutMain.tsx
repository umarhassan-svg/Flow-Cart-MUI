// src/components/LayoutMain.tsx
import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../Navbar/Navbar";
import SideBar from "../Sidebar/SideBar";

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

  // inner "card" styles: transparent on xs so there is no visible white band
  const innerSx = {
    bgcolor: "transparent", // <-- transparent on mobile
    borderRadius: { xs: 0, sm: 1 },
    p: { xs: 1.25, sm: 3, md: 4 }, // small padding on xs, larger on sm+
    boxShadow: { xs: "none", sm: 1 },
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
        cartCount={3}
      />

      {/* spacer below fixed AppBar */}
      <Box sx={{ height: { xs: 56, sm: 64 } }} />

      {/* overlay sidebar */}
      <SideBar open={sidebarOpen} onClose={closeSidebar} />

      {/* MAIN: remove outer horizontal padding on xs so content is full-bleed */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          width: "100%",
          // horizontal padding only from sm upward; xs is edge-to-edge
          px: { xs: 0, sm: 2, md: 3 },
          py: { xs: 2, sm: 3, md: 4 },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 920, md: 1080, lg: 1200 },
            mx: "auto",
            my: { xs: 1, sm: 2, md: 3 },
            boxSizing: "border-box",
            // guard so nested flex children can shrink
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          {/* spacing above content */}
          <Box sx={{ mb: { xs: 1, sm: 2 } }} />

          {/* inner canvas */}
          <Box sx={innerSx}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, sm: 3 },
                width: "100%",
                boxSizing: "border-box",
                minWidth: 0,
                "& > *": { maxWidth: "100%", boxSizing: "border-box" },
              }}
            >
              {children}
            </Box>
          </Box>

          {/* bottom spacing */}
          <Box sx={{ height: { xs: 20, sm: 36 } }} />
        </Box>
      </Box>

      {/* CART overlay */}
      {cartOpen && (
        <Box
          onClick={closeCart}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: (t) => t.zIndex.modal,
            bgcolor: "rgba(0,0,0,0.45)",
          }}
        />
      )}

      {/* CART drawer */}
      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          zIndex: (t) => t.zIndex.drawer + 200,
          transform: cartOpen ? "translateX(0)" : "translateX(100%)",
          transition: (t) =>
            t.transitions.create("transform", {
              duration: t.transitions.duration.standard,
            }),
          width: { xs: "85vw", sm: 400, md: 420 },
          bgcolor: "background.paper",
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box component="span" sx={{ fontWeight: 600 }}>
            Cart
          </Box>
          <Box
            component="button"
            onClick={closeCart}
            sx={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </Box>
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1 }}>{/* cart content */}</Box>
      </Box>
    </Box>
  );
};

export default LayoutMain;
