import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";

const isAllowedStatus = (status) => {
  return status === "active" || status === "approved";
};

export default function PublicOnlyRoute() {
  const { session, profile, loading } = useAuth();

  if (loading) return <Loader />;

  if (!session) {
    return <Outlet />;
  }

  if (!profile) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile.deleted_at) {
    return <Outlet />;
  }

  if (profile.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (profile.status === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isAllowedStatus(profile.status)) {
    return <Outlet />;
  }

  switch (profile.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "organization":
      return <Navigate to="/organization" replace />;
    case "fidel":
      return <Navigate to="/fidel" replace />;
    default:
      return <Outlet />;
  }
}