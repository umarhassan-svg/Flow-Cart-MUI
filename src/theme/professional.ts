// src/theme/professional.ts
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B5FFF", // deep blue
      light: "#3B78FF",
      dark: "#0039B3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6B7280", // slate gray
      light: "#9CA3AF",
      dark: "#374151",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F6F8FA", // page background
      paper: "#FFFFFF", // cards/panels
    },
    text: {
      primary: "#0B2438",
      secondary: "#425466",
    },
    error: { main: "#D32F2F" },
    warning: { main: "#F59E0B" },
    info: { main: "#0288D1" },
    success: { main: "#2E7D32" },
    divider: "#E6EEF6",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.2rem" },
    h2: { fontWeight: 600, fontSize: "1.75rem" },
    h3: { fontWeight: 600, fontSize: "1.25rem" },
    body1: { fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: { borderRadius: 10 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: "0.9rem" },
        containedPrimary: {
          backgroundColor: "#0B5FFF",
          color: "#fff",
          "&:hover": { backgroundColor: "#0039B3" },
        },
        outlined: {
          borderColor: "#E6EEF6",
          "&:hover": { backgroundColor: "#F1F6FF" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(10,25,41,0.06)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0B2438",
          boxShadow: "none",
          borderBottom: "1px solid #EEF3FB",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "#FFFFFF",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5F9CFF",
      light: "#89B9FF",
      dark: "#2E74FF",
      contrastText: "#000000",
    },
    secondary: {
      main: "#9CA3AF",
      contrastText: "#000000",
    },
    background: {
      default: "#071023",
      paper: "#0B1622",
    },
    text: {
      primary: "#EAF2FF",
      secondary: "#B7C8DB",
    },
    error: { main: "#F87171" },
    warning: { main: "#FBBF24" },
    info: { main: "#81D4FA" },
    success: { main: "#66BB6A" },
    divider: "#163247",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.2rem", color: "#EAF2FF" },
    h2: { fontWeight: 600, fontSize: "1.75rem", color: "#EAF2FF" },
    body1: { fontSize: "1rem", color: "#B7C8DB" },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: { borderRadius: 10 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: "0.9rem" },
        containedPrimary: {
          backgroundColor: "#5F9CFF",
          color: "#000",
          "&:hover": { backgroundColor: "#2E74FF" },
        },
        outlined: {
          borderColor: "#163247",
          "&:hover": { backgroundColor: "#021025" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B1622",
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#071023",
          color: "#EAF2FF",
          borderBottom: "1px solid #163247",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "#071A27",
        },
      },
    },
  },
});
