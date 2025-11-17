import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

type PrivateRouteProps = {
  redirectTo?: string;
  children?: React.ReactNode;
  roles?: string[]; // allowed roles (any match grants access)
  pageKey?: string; // allowed page key (e.g. "users", "roles", "dashboard")
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = "/login",
  children,
  roles,
  pageKey,
}) => {
  const {
    isAuthenticated,
    user,
    loading, // auth/profile loading
    allowedNavItems, // NavItem[] | null (null = still loading)
    loadingAllowedNav, // boolean
  } = useAuth();

  // Wait while authentication/profile and allowed-nav are resolving
  if (loading || loadingAllowedNav || allowedNavItems === null) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  // 1) require authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2) role check (if provided)
  if (roles && roles.length > 0) {
    const userRoles = user?.roles ?? [];
    const allowedByRole = roles.some((r) => userRoles.includes(r));
    if (!allowedByRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3) pageKey check (if provided)
  if (pageKey) {
    // allowedNavItems is loaded (maybe empty array)
    const allowedKeys = new Set((allowedNavItems || []).map((i) => i.key));
    if (!allowedKeys.has(pageKey)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4) render children / nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
