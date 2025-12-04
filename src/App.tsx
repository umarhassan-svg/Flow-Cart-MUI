import "./App.css";
import { RouterProvider } from "react-router-dom";
import React from "react";
import router from "./router/router";
import { CustomThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";

const App: React.FC = () => {
  return (
    <>
      <CustomThemeProvider>
        <ReduxProvider store={store}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ReduxProvider>
      </CustomThemeProvider>
    </>
  );
};

export default App;
