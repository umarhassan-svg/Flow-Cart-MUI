import "./App.css";
import { RouterProvider } from "react-router-dom";
import React from "react";
import router from "./router/router";
import { CustomThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";

const App: React.FC = () => {
  return (
    <>
      <CustomThemeProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </>
  );
};

export default App;
