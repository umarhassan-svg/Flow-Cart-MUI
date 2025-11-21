// src/pages/Login.tsx
import { Box, Stack, Typography } from "@mui/material";
import LoginForm from "../components/forms/Loginform";
const Login = () => {
  const bg =
    "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b28e3f6e7f2b7b8a638d5b9fb63f8c4";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          width: { xs: "100%", sm: 980 },
          height: { xs: "auto", sm: 500 },
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* LEFT: hero image panel (cover) */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: "48%" },
            height: { xs: 150, sm: "100%" },
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "block",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {/* top-left brand/logo */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              zIndex: 5,
              gap: 0.25,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "common.white",
                fontWeight: 800,
                userSelect: "none",
              }}
            >
              Flow
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "common.black",
                fontWeight: 800,
                userSelect: "none",
                padding: 0,
              }}
            >
              Cart
            </Typography>
          </Box>

          {/* bottom gradient & quote */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: { xs: 90, sm: 140 },
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
              display: "flex",
              alignItems: "flex-end",
              p: 2,
              zIndex: 4,
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "common.white",
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Simplify your product operations
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                Manage catalog, inventory and orders in one beautiful dashboard.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT: login form area */}
        <Box
          sx={{
            width: { xs: "100%", sm: "52%" },
            minHeight: { xs: "auto", sm: "100%", md: "100%" },
            p: { xs: 2, sm: 4 },
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
          }}
        >
          <LoginForm />
        </Box>
      </Stack>
    </Box>
  );
};

export default Login;
