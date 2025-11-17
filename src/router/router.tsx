// src/router/AppRouter.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../pages/Login";
import Unauthorized from "../pages/unauthorized";
import UsersManagement from "../pages/admin/UsersManagement";
import RolesManagement from "../pages/admin/RolesManagement";
import Dashboard from "../pages/admin/Dashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";

/**
 * Central map of pageKey -> React component + default path
 * Add new entries here when you add pages.
 */
const pageComponentMap: {
  [pageKey: string]: { path: string; Component: React.ComponentType<any> };
} = {
  dashboard: { path: "/admin/dashboard", Component: Dashboard },
  users: { path: "/admin/users", Component: UsersManagement },
  roles: { path: "/admin/roles", Component: RolesManagement },
  m_dashboard: { path: "/manager/dashboard", Component: ManagerDashboard },
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, loading, allowedNavItems, loadingAllowedNav } =
    useAuth();

  // don't redirect while we are resolving auth/allowed pages
  if (loading || loadingAllowedNav) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedNavItems) && allowedNavItems.length > 0) {
    // take first allowed nav item with a path
    const first = allowedNavItems[0];
    const target =
      first.path ?? pageComponentMap[first.key]?.path ?? `/admin/${first.key}`;
    return <Navigate to={target} replace />;
  }

  // fallback
  return <Navigate to="/admin/dashboard" replace />;
};

const AppRouter: React.FC = () => {
  const { loading, loadingAllowedNav } = useAuth();

  // small global loading while auth is resolving (optional)
  if (loading || loadingAllowedNav) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Dynamically create guarded routes from the pageComponentMap.
            Each route still exists in router, but PrivateRoute enforces
            that users can only access pages they are allowed to (pageKey). */}
        {Object.entries(pageComponentMap).map(
          ([pageKey, { path, Component }]) => (
            <Route
              key={pageKey}
              path={path}
              element={
                <PrivateRoute pageKey={pageKey}>
                  <Component />
                </PrivateRoute>
              }
            />
          )
        )}

        {/* fallback: send to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
