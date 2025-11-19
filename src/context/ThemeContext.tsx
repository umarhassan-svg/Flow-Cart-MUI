import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
// import { lightTheme, darkTheme } from "../theme/theme";
//import { lightTheme, darkTheme } from "../theme/professional";
import { lightTheme, darkTheme } from "../theme/modern";
// import { lightTheme, darkTheme } from "../theme/warm-cold";

type ThemeContextType = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => useContext(ThemeContext);

type Props = { children: ReactNode };

export const CustomThemeProvider = ({ children }: Props) => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // useMemo to prevent re-renders
  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
