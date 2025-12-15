// src/router/AppRouter.tsx
import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import FriendlyErrorBoundary from "../pages/ErrorBoundary/ErrorBoundary";
import { SessionProvider } from "../context/SessionContext";
// import { CartProvider } from "../context/CartContext";
import { NavProvider } from "../context/NavContext";

import NotificationContainer from "../components/CustomUI/NotificationContainer/NotificationContainer";
import { AdminDashboard } from "../pages/admin/Dashboard";
import Loader from "../pages/LoadingPage.tsx";
import ContactUsPage from "../pages/ContactUsPage.tsx";
// import CustomizeableLayout from "../pages/CustomizeablePage.tsx";
import DashboardBuilder from "../components/DashboardBuilder/DashboardBuilder.tsx";
import OrderTrackPage from "../pages/OrderTrackPage.tsx";

// Import table CSS files to ensure they load globally
import "../components/CustomUI/OrdersTable/orderstable.css";
import "../components/CustomUI/RolesTable/rolestable.css";
import "../components/CustomUI/UsersTable/usertable.css";

// --- Lazy load all pages ---
const Login = lazy(() => import("../pages/Login"));
const Unauthorized = lazy(() => import("../pages/unauthorized"));
const UsersManagement = lazy(
  () => import("../pages/UserManagement2/UserManagement2")
);
const RolesManagement = lazy(
  () => import("../pages/RolesManagement2/RolesManagement2")
);
const ManagerDashboard = lazy(
  () => import("../pages/manager/ManagerDashboard")
);
const Home = lazy(() => import("../pages/Home"));
const ProductsListPage = lazy(() => import("../pages/ProductsListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CheckOutPage = lazy(() => import("../pages/CheckOutPage"));
const BulkOrderPage = lazy(() => import("../pages/BulkOrderPage"));
const OrdersListPage = lazy(
  () => import("../pages/OrdersListPage2/OrdersListPage")
);
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const EmployeesPage = lazy(() => import("../pages/EmployeesPage"));
const TestErrorBoundry = lazy(() => import("../pages/TestErrorBoundry"));
const UsersTable = lazy(
  () => import("../pages/UserManagement2/UserManagement2")
);
const TCustomForm = lazy(() => import("../pages/TCustomForm"));

// --- Router ---
const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/unauthorized",
    element: (
      <Suspense fallback={<Loader />}>
        <Unauthorized />
      </Suspense>
    ),
  },

  // Private routes
  {
    element: (
      <FriendlyErrorBoundary>
        <SessionProvider>
          <NavProvider>
            <PrivateRoute />
            <NotificationContainer maxVisible={5} position="top-right" />
          </NavProvider>
        </SessionProvider>
      </FriendlyErrorBoundary>
    ),
    children: [
      {
        path: "/home",
        element: (
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute requiredPermissions={["profile:read"]}>
            <Suspense fallback={<Loader />}>
              <ProfilePage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/employees",
        element: (
          <PrivateRoute requiredPermissions={["employees:read"]}>
            <Suspense fallback={<Loader />}>
              <EmployeesPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/home",
        element: (
          <PrivateRoute requiredPermissions={[]}>
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <PrivateRoute requiredPermissions={["products:read"]}>
            <Suspense fallback={<Loader />}>
              <ProductsListPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/products/:id",
        element: (
          <PrivateRoute requiredPermissions={["products:read"]}>
            <Suspense fallback={<Loader />}>
              <ProductDetailPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute requiredPermissions={["orders:create"]}>
            <Suspense fallback={<Loader />}>
              <CheckOutPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/bulk-order",
        element: (
          <PrivateRoute requiredPermissions={["orders:create"]}>
            <Suspense fallback={<Loader />}>
              <BulkOrderPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <PrivateRoute requiredPermissions={["orders:read"]}>
            <Suspense fallback={<Loader />}>
              <OrdersListPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/track-order/:id",
        element: (
          <Suspense fallback={<Loader />}>
            <OrderTrackPage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute requiredPermissions={["dashboard:read"]}>
            <Suspense fallback={<Loader />}>
              <AdminDashboard />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/manager/dashboard",
        element: (
          <PrivateRoute requiredPermissions={["dashboard:view"]}>
            <Suspense fallback={<Loader />}>
              <ManagerDashboard />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <PrivateRoute requiredPermissions={["users:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loader />}>
                <UsersManagement />
              </Suspense>
            ),
          },
          {
            path: "create",
            element: (
              <Suspense fallback={<Loader />}>
                <UsersManagement />
              </Suspense>
            ),
          },
          {
            path: ":id",
            element: (
              <Suspense fallback={<Loader />}>
                <UsersManagement />
              </Suspense>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <Suspense fallback={<Loader />}>
                <UsersManagement />
              </Suspense>
            ),
          },
          {
            path: ":id/employee-card/download",
            element: (
              <Suspense fallback={<Loader />}>
                <UsersManagement />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/admin/roles",
        element: (
          <PrivateRoute requiredPermissions={["roles:read"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loader />}>
                <RolesManagement />
              </Suspense>
            ),
          },
          {
            path: "create",
            element: (
              <Suspense fallback={<Loader />}>
                <RolesManagement />
              </Suspense>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <Suspense fallback={<Loader />}>
                <RolesManagement />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/test-error",
        element: (
          <Suspense fallback={<Loader />}>
            <TestErrorBoundry />
          </Suspense>
        ),
      },
      {
        path: "/test-custom-table",
        element: (
          <Suspense fallback={<Loader />}>
            <UsersTable />
          </Suspense>
        ),
      },
      {
        path: "/test-customform",
        element: (
          <Suspense fallback={<Loader />}>
            <TCustomForm />
          </Suspense>
        ),
      },
      {
        path: "/admin/dashboard-builder",
        element: (
          <Suspense fallback={<Loader />}>
            <DashboardBuilder />
          </Suspense>
        ),
      },
      {
        path: "/contact-us",
        element: (
          <Suspense fallback={<Loader />}>
            <ContactUsPage />
          </Suspense>
        ),
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
