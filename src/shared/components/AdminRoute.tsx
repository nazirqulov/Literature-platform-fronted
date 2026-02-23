import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

interface AdminRouteProps {
  redirectPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ redirectPath = "/dashboard" }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const isSuperAdmin = role === "SUPERADMIN" || role === "ROLE_SUPERADMIN";

  if (!user || !isSuperAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
