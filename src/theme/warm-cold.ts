// src/theme/warm-cold.ts
import { createTheme } from "@mui/material/styles";

/**
 * Warm — earthy, friendly light theme
 */
export const warmLight = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#D35400", // burnt orange
      light: "#FF7A1A",
      dark: "#A34100",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#CDB79E", // warm sand
      contrastText: "#000000",
    },
    background: {
      default: "#FFF7F2",
      paper: "#FFF1E6",
    },
    text: {
      primary: "#2B2B2B",
      secondary: "#6C584C",
    },
    error: { main: "#C0392B" },
    warning: { main: "#E67E22" },
    info: { main: "#4DA6FF" },
    success: { main: "#27AE60" },
    divider: "#F0D9C9",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.2rem" },
    h2: { fontWeight: 600, fontSize: "1.7rem" },
    body1: { fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 700 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          backgroundColor: "#D35400",
          color: "#fff",
          "&:hover": { backgroundColor: "#A34100" },
        },
        outlined: {
          borderColor: "#F5EBDD",
          "&:hover": { backgroundColor: "#FFF6F1" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFF1E6",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(45,35,30,0.06)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFF7F2",
          color: "#2B2B2B",
          boxShadow: "none",
          borderBottom: "1px solid #F0D9C9",
        },
      },
    },
  },
});

/**
 * Cold — crisp, icy dark theme
 */
export const coldDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1E90FF", // bright icy blue
      light: "#5EB8FF",
      dark: "#005BB5",
      contrastText: "#000000",
    },
    secondary: {
      main: "#8FB3FF",
      contrastText: "#000",
    },
    background: {
      default: "#031028",
      paper: "#071526",
    },
    text: {
      primary: "#E6F6FF",
      secondary: "#A9D3FF",
    },
    error: { main: "#FF6B6B" },
    warning: { main: "#FFD166" },
    info: { main: "#5EB8FF" },
    success: { main: "#4ADE80" },
    divider: "#09314A",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.2rem", color: "#E6F6FF" },
    body1: { fontSize: "1rem", color: "#CFEFFF" },
    button: { textTransform: "none", fontWeight: 700 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          backgroundColor: "#1E90FF",
          color: "#000",
          "&:hover": { backgroundColor: "#005BB5" },
        },
        outlined: {
          borderColor: "#09314A",
          "&:hover": { backgroundColor: "#021424" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#071526",
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#031028",
          color: "#E6F6FF",
          borderBottom: "1px solid #09314A",
        },
      },
    },
  },
});
