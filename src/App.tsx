import "./App.css";
import { RouterProvider } from "react-router-dom";
import React from "react";
import router from "./router/router";
import { CustomThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const App: React.FC = () => {
  return (
    <>
      <CustomThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </CustomThemeProvider>
    </>
  );
};

export default App;
