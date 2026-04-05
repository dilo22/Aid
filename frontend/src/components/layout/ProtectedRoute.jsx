import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";
import {
  isAllowedStatus,
  getDashboardPathByRole,
} from "../../utils/authGuards";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile || profile.deleted_at) {
    return <Navigate to="/login" replace />;
  }

  if (profile.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (profile.status === "pending" && location.pathname !== "/pending-approval") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile.status === "rejected") {
    return <Navigate to="/login" replace />;
  }

  if (
    isAllowedStatus(profile.status) &&
    location.pathname === "/pending-approval"
  ) {
    return <Navigate to={getDashboardPathByRole(profile.role)} replace />;
  }

  if (roles.length > 0 && !roles.includes(profile.role)) {
    return <Navigate to={getDashboardPathByRole(profile.role)} replace />;
  }

  if (
    location.pathname !== "/pending-approval" &&
    location.pathname !== "/change-password" &&
    !isAllowedStatus(profile.status)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;