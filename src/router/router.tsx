// src/router/AppRouter.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import PrivateRoute from "../components/PrivateRoute/PrivateRoute";

// Pages
import Login from "../pages/Login";
import Unauthorized from "../pages/unauthorized";
import UsersManagement from "../pages/admin/UsersManagement";
import RolesManagement from "../pages/admin/RolesManagement";
import { AdminDashboard } from "../pages/admin/Dashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import Home from "../pages/Home";
import ProductsListPage from "../pages/ProductsListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CheckOutPage from "../pages/CheckOutPage";
import BulkOrderPage from "../pages/BulkOrderPage";
import { NavProvider } from "../context/NavContext";
import OrdersListPage from "../pages/OrdersListPage";

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
    element: (
      <NavProvider>
        <PrivateRoute />
      </NavProvider>
    ), // auth-only wrapper
    children: [
      // Home page – maybe all logged-in users can access
      {
        path: "/home",
        element: (
          <PrivateRoute requiredPermissions={[] /* or [] for all */}>
            <Home />
          </PrivateRoute>
        ),
      },

      // Products
      {
        path: "/products",
        element: (
          <PrivateRoute requiredPermissions={["products:read"]}>
            <ProductsListPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/products/:id",
        element: (
          <PrivateRoute requiredPermissions={["products:read"]}>
            <ProductDetailPage />
          </PrivateRoute>
        ),
      },

      // Checkout
      {
        path: "/checkout",
        element: (
          <PrivateRoute requiredPermissions={["orders:create"]}>
            <CheckOutPage />
          </PrivateRoute>
        ),
      },

      // Bulk order
      {
        path: "/bulk-order",
        element: (
          <PrivateRoute requiredPermissions={["orders:create"]}>
            <BulkOrderPage />
          </PrivateRoute>
        ),
      },

      // Orders list
      {
        path: "/orders",
        element: (
          <PrivateRoute requiredPermissions={["orders:read"]}>
            <OrdersListPage />
          </PrivateRoute>
        ),
      },

      // Dashboard
      {
        path: "/dashboard",
        element: (
          <PrivateRoute requiredPermissions={["dashboard:read"]}>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },

      // Users routing
      {
        path: "/admin/users",
        element: (
          <PrivateRoute requiredPermissions={["users:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <UsersManagement /> },
          {
            path: "create",
            element: (
              <PrivateRoute requiredPermissions={["users:create"]}>
                <UsersManagement />
              </PrivateRoute>
            ),
          },
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

      // Roles routing
      {
        path: "/admin/roles",
        element: (
          <PrivateRoute requiredPermissions={["roles:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <RolesManagement /> },
          {
            path: "create",
            element: (
              <PrivateRoute requiredPermissions={["roles:create"]}>
                <RolesManagement />
              </PrivateRoute>
            ),
          },
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
      // Unauthorized
      { path: "/unauthorized", element: <Unauthorized /> },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
