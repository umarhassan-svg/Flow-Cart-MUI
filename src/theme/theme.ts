// src/theme/index.ts
import { createTheme } from "@mui/material/styles";

/* ================================
   Palette brief
   Ordered (top → bottom light-to-dark):
     1) #F2F2F2  (very light - app background for light theme)
     2) #EAE4D5  (soft warm surface - paper / cards)
     3) #B6B09F  (mid tone - accents / borders)
     4) #000000  (black - text on light theme / background for dark theme)

   Accent (single green color):
     GREEN: #2E7D32 (used as primary / interactive accent)
================================= */

/* -------------------------
   LIGHT THEME
------------------------- */
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    // primary = interactive accent (green)
    primary: {
      main: "#2E7D32",
      light: "#66BB6A",
      dark: "#1B5E20",
      contrastText: "#ffffff",
    },

    // secondary / supportive color uses your mid-tone
    secondary: {
      main: "#B6B09F",
      light: "#D3CEBF",
      dark: "#8E8878",
      contrastText: "#000000",
    },

    // Use the lightest stops for background & paper
    background: {
      default: "#F2F2F2", // page background (top-most / light)
      paper: "#EAE4D5",   // cards / surfaces (slightly warmer)
    },

    // Text on light theme should be dark (use black as strongest contrast)
    text: {
      primary: "#000000",
      secondary: "#3A3A33",
    },

    // keep feedback colors sensible
    error: { main: "#D32F2F" },
    warning: { main: "#F57C00" },
    info: { main: "#1976D2" },
    success: { main: "#2E7D32" },
    divider: "#B6B09F",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.4rem", color: "#000000" },
    h2: { fontWeight: 600, fontSize: "2rem", color: "#000000" },
    h3: { fontWeight: 600, fontSize: "1.5rem", color: "#3A3A33" },
    body1: { fontSize: "1rem", color: "#000000" },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: "1.2rem" },
        containedPrimary: {
          backgroundColor: "#2E7D32",
          color: "#fff",
          "&:hover": { backgroundColor: "#1B5E20" },
        },
        containedSecondary: {
          backgroundColor: "#B6B09F",
          color: "#000",
          "&:hover": { backgroundColor: "#8E8878" },
        },
        outlined: {
          borderColor: "#B6B09F",
          "&:hover": { backgroundColor: "#EAE4D5" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#EAE4D5",
          borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#F2F2F2",
          color: "#000",
          boxShadow: "none",
          borderBottom: "1px solid #B6B09F",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "#EAE4D5",
        },
      },
    },
  },
});

/* -------------------------
   DARK THEME (inverted / bottom-to-top)
   The dark theme inverts the visual ordering so the darkest stop (#000000)
   becomes the main background; the other stops are used as surfaces/accents.
------------------------- */
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // keep the single green accent (use a brighter green for visibility)
    primary: {
      main: "#66BB6A",
      light: "#9AE59A",
      dark: "#2E7D32",
      contrastText: "#000000",
    },

    // secondary uses the mid-tone as a muted accent in dark mode
    secondary: {
      main: "#B6B09F",
      light: "#D3CEBF",
      dark: "#8E8878",
      contrastText: "#000000",
    },

    // dark background and surfaces
    background: {
      default: "#000000", // bottom-most / dark
      paper: "#1A1A18",   // near-black surface (keeps contrast)
    },

    // text should be light for readability on dark background
    text: {
      primary: "#F2F2F2",
      secondary: "#EAE4D5",
    },

    error: { main: "#EF5350" },
    warning: { main: "#FFB300" },
    info: { main: "#90CAF9" },
    success: { main: "#66BB6A" },

    divider: "#3E3B35",
  },

  typography: {
    fontFamily: `"Inter", "Roboto", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.4rem", color: "#F2F2F2" },
    h2: { fontWeight: 600, fontSize: "1.9rem", color: "#F2F2F2" },
    h3: { fontWeight: 600, fontSize: "1.4rem", color: "#EAE4D5" },
    body1: { fontSize: "1rem", color: "#F2F2F2" },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: "1.2rem" },
        containedPrimary: {
          backgroundColor: "#66BB6A",
          color: "#000",
          "&:hover": { backgroundColor: "#2E7D32" },
        },
        containedSecondary: {
          backgroundColor: "#B6B09F",
          color: "#000",
          "&:hover": { backgroundColor: "#8E8878" },
        },
        outlined: {
          borderColor: "#3E3B35",
          "&:hover": { backgroundColor: "#111110" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A18",
          borderRadius: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#F2F2F2",
          borderBottom: "1px solid #3E3B35",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "#22221F",
        },
      },
    },
  },
});
