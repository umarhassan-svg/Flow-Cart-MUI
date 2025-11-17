import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute";

// Pages
import Login from "../pages/Login";
import Unauthorized from "../pages/unauthorized";
import UsersManagement from "../pages/admin/UsersManagement";
import RolesManagement from "../pages/admin/RolesManagement";
import Dashboard from "../pages/admin/Dashboard";

import { useAuth } from "../context/AuthContext";

/**
 * Root redirect: chooses where "/" goes based on auth + allowedNavItems.
 * - if not authenticated -> /login
 * - if authenticated and has allowedNavItems -> first allowed path
 * - fallback -> /admin/dashboard
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, loading, allowedNavItems, loadingAllowedNav } =
    useAuth();

  if (loading || loadingAllowedNav) return null; // avoid premature redirect

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedNavItems) && allowedNavItems.length > 0) {
    // preferred: redirect to first allowed item that has a path
    const first = allowedNavItems[0];
    const target = first.path ?? `/admin/${first.key}`;
    return <Navigate to={target} replace />;
  }

  // fallback
  return <Navigate to="/admin/dashboard" replace />;
};

const router = createBrowserRouter([
  // Public
  { path: "/login", element: <Login /> },

  // Root route decision
  { path: "/", element: <RootRedirect /> },

  // Unauthorized
  { path: "/unauthorized", element: <Unauthorized /> },

  // Protected routes — per-route enforcement using PrivateRoute(pageKey=...)
  {
    path: "/admin/dashboard",
    element: (
      <PrivateRoute pageKey="dashboard">
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <PrivateRoute pageKey="users">
        <UsersManagement />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/roles",
    element: (
      <PrivateRoute pageKey="roles">
        <RolesManagement />
      </PrivateRoute>
    ),
  },

  // Fallback: unknown routes -> root
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
