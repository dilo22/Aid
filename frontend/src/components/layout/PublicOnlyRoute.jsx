import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../ui/Loader";
// ✅ Import depuis authGuards — pas de redéfinition locale
import { isAllowedStatus, getDashboardPathByRole } from "../../utils/authGuards";

export default function PublicOnlyRoute() {
  const { session, profile, loading } = useAuth();

  // ✅ Même garde que ProtectedRoute et HomeRedirect
  if (loading || session === undefined) return <Loader />;

  if (!session) return <Outlet />;

  if (!profile)            return <Navigate to="/pending-approval" replace />;
  if (profile.deleted_at)  return <Outlet />;
  if (profile.must_change_password) return <Navigate to="/change-password" replace />;
  if (profile.status === "pending") return <Navigate to="/pending-approval" replace />;
  if (!isAllowedStatus(profile.status)) return <Outlet />;

  // ✅ getDashboardPathByRole au lieu du switch manuel
  return <Navigate to={getDashboardPathByRole(profile.role)} replace />;
}