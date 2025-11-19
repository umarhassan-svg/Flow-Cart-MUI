// src/router/AppRouter.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import PrivateRoute from "../components/PrivateRoute/PrivateRoute";

// Pages
import Login from "../pages/Login";
import Unauthorized from "../pages/unauthorized";
import UsersManagement from "../pages/admin/UsersManagement";
import RolesManagement from "../pages/admin/RolesManagement";
import Dashboard from "../pages/admin/Dashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import Home from "../pages/Home";
import ProductsListPage from "../pages/ProductsListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CheckOutPage from "../pages/CheckOutPage";

/**
 * Routes:
 * - /admin/users           -> list (requires users:read)
 * - /admin/users/create    -> open ManageUser in "create" mode (requires users:create)
 * - /admin/users/:id/edit  -> open ManageUser in "edit" mode (requires users:update)
 *
 * - /admin/roles           -> list (requires roles:read)
 * - /admin/roles/create    -> open ManageRole in "create" mode (requires roles:create)
 * - /admin/roles/:id/edit  -> open ManageRole in "edit" mode (requires roles:update)
 */

const router = createBrowserRouter([
  // Public
  {
    path: "/login",
    element: <Login />,
  },

  // All private routes: require authentication
  {
    element: <PrivateRoute />, // auth-only wrapper
    children: [
      { path: "/home", element: <Home /> },
      { path: "/products", element: <ProductsListPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/checkout", element: <CheckOutPage /> },

      {
        // Admin dashboard
        path: "/admin/dashboard",
        element: (
          <PrivateRoute requiredPermissions={["dashboard:view"]}>
            <Dashboard />
          </PrivateRoute>
        ),
      },

      // Users routing (parent requires read; create/update children protected individually)
      {
        path: "/admin/users",
        element: (
          // require basic read permission to visit users area
          <PrivateRoute requiredPermissions={["users:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          // index -> list
          { index: true, element: <UsersManagement /> },

          // create -> show modal in create mode; require users:create
          {
            path: "create",
            element: (
              <PrivateRoute requiredPermissions={["users:create"]}>
                <UsersManagement />
              </PrivateRoute>
            ),
          },

          // edit -> show modal in edit mode; require users:update
          {
            path: ":id/edit",
            element: (
              <PrivateRoute requiredPermissions={["users:update"]}>
                <UsersManagement />
              </PrivateRoute>
            ),
          },
        ],
      },

      // Roles routing (parent requires read; create/update children protected individually)
      {
        path: "/admin/roles",
        element: (
          <PrivateRoute requiredPermissions={["roles:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          // index -> list
          { index: true, element: <RolesManagement /> },

          // create -> show ManageRole in create mode; require roles:create
          {
            path: "create",
            element: (
              <PrivateRoute requiredPermissions={["roles:create"]}>
                <RolesManagement />
              </PrivateRoute>
            ),
          },

          // edit -> show ManageRole in edit mode; require roles:update
          {
            path: ":id/edit",
            element: (
              <PrivateRoute requiredPermissions={["roles:update"]}>
                <RolesManagement />
              </PrivateRoute>
            ),
          },
        ],
      },

      // Manager dashboard
      {
        path: "/manager/dashboard",
        element: (
          <PrivateRoute requiredPermissions={["dashboard:view"]}>
            <ManagerDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },

  // Unauthorized
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);

export default router;
