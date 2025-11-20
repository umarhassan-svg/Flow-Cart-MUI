import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type PrivateRouteProps = {
  redirectTo?: string; // where to send unauthenticated users
  children?: React.ReactNode;
  // list of permissions required to view the child route
  requiredPermissions?: string[];
  // if true, user must have ALL permissions; if false (default), user must have ANY
  requireAll?: boolean;
};

const PrivateRoute = ({
  redirectTo = "/login",
  children,
  requiredPermissions = [],
  requireAll = false,
}: PrivateRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  // still validating auth (token/profile) — avoid flicker
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        Loading...
      </div>
    );
  }

  // not logged in -> go to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // permission check
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPerms: string[] =
      user?.effectivePermissions ?? user?.permissions ?? [];
    //console.log("hasPermissions", userPerms, requiredPermissions);

    const hasPermissions = requireAll
      ? requiredPermissions.every((p) => userPerms.includes(p))
      : requiredPermissions.some((p) => userPerms.includes(p));

    if (!hasPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // everything ok -> render
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
