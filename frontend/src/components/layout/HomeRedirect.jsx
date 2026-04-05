import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";
import HomePage from "../../pages/HomePage";
import {
  isAllowedStatus,
  getDashboardPathByRole,
} from "../../utils/authGuards";

const HomeRedirect = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!session) {
    return <HomePage />;
  }

  if (!profile) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (profile.deleted_at) {
    return <Navigate to="/login" replace />;
  }

  if (profile.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (profile.status === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isAllowedStatus(profile.status)) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathByRole(profile.role)} replace />;
};

export default HomeRedirect;