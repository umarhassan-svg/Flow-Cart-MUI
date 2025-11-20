// src/theme/modern.ts
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00A8C6", // cyan-teal
      light: "#4DD6E8",
      dark: "#007A91",
      contrastText: "#fff",
    },
    secondary: {
      main: "#6A4C93", // muted purple accent
      contrastText: "#fff",
    },
    background: {
      default: "#F7FBFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#082032",
      secondary: "#3C6E71",
    },
    error: { main: "#E63946" },
    warning: { main: "#F4A261" },
    info: { main: "#00A8C6" },
    success: { main: "#2EC4B6" },
    divider: "#E6F6F8",
  },

  typography: {
    fontFamily: `"Inter", "Poppins", sans-serif`,
    h1: { fontWeight: 800, fontSize: "2.4rem" },
    h2: { fontWeight: 700, fontSize: "1.8rem" },
    h3: { fontWeight: 600, fontSize: "1.3rem" },
    body1: { fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 700 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: "1rem" },
        containedPrimary: {
          backgroundColor: "#00A8C6",
          color: "#fff",
          "&:hover": { backgroundColor: "#007A91" },
        },
        containedSecondary: {
          backgroundColor: "#6A4C93",
          color: "#fff",
          "&:hover": { backgroundColor: "#563772" },
        },
        outlined: {
          borderColor: "#E6F6F8",
          "&:hover": { backgroundColor: "#F0FBFC" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(2,24,31,0.04)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#082032",
          boxShadow: "none",
          borderBottom: "1px solid #E6F6F8",
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
      main: "#39EDE6",
      light: "#7FF3EE",
      dark: "#00A8C6",
      contrastText: "#002022",
    },
    secondary: {
      main: "#A07AD1",
      contrastText: "#001018",
    },
    background: {
      default: "#06121A",
      paper: "#071821",
    },
    text: {
      primary: "#E6FCFF",
      secondary: "#9FD8DE",
    },
    error: { main: "#FF6B6B" },
    warning: { main: "#FFA94D" },
    info: { main: "#6EE7F1" },
    success: { main: "#38D9A9" },
    divider: "#08313D",
  },

  typography: {
    fontFamily: `"Inter", "Poppins", sans-serif`,
    h1: { fontWeight: 800, fontSize: "2.4rem", color: "#E6FCFF" },
    body1: { fontSize: "1rem", color: "#C6F1F1" },
    button: { textTransform: "none", fontWeight: 700 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
        containedPrimary: {
          backgroundColor: "#39EDE6",
          color: "#002022",
          "&:hover": { backgroundColor: "#00D2C2" },
        },
        outlined: {
          borderColor: "#08313D",
          "&:hover": { backgroundColor: "#02171C" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#002022",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#06121A",
          color: "#E6FCFF",
          borderBottom: "1px solid #08313D",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "#06202A",
        },
      },
    },
  },
});
