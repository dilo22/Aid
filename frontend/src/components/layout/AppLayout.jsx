import { useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import "../../styles/AppLayout.css";

const ROLE_LABELS = {
  admin:        "Administrateur",
  organization: "Responsable organisation",
  fidel:        "Fidèle",
};

const NAV_ITEMS = {
  admin: [
    { to: "/admin",               end: true,  icon: "📊", label: "Dashboard" },
    { to: "/admin/organizations", end: false, icon: "🕌", label: "Organisations" },
    { to: "/admin/sheep",         end: false, icon: "🐏", label: "Moutons" },
    { to: "/admin/profiles",      end: false, icon: "👥", label: "Utilisateurs" },
    { to: "/admin/appointments", end: false, icon: "📅", label: "Rendez-vous" },
  ],
  organization: [
    { to: "/organization",         end: true,  icon: "📊", label: "Tableau de bord" },
    { to: "/organization/fidels",  end: false, icon: "👥", label: "Fidèles" },
    { to: "/organization/contact", end: false, icon: "🛠", label: "Support technique" },
  ],
  fidel: [
    { to: "/fidel",         end: true,  icon: "🏠", label: "Tableau de bord" },
    { to: "/fidel/profile", end: false, icon: "👤", label: "Mon profil" },
    { to: "/fidel/contact", end: false, icon: "📞", label: "Contact" },
  ],
};

const SECTION_LABELS = {
  admin:        "Administration",
  organization: "Organisation",
  fidel:        "Mon espace",
};

const getRoleLabel   = (role) => ROLE_LABELS[role] || role || "Utilisateur";
const getDisplayName = (profile) => {
  const name = `${profile?.first_name?.trim() || ""} ${profile?.last_name?.trim() || ""}`.trim();
  return name || profile?.email || "Utilisateur";
};

const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    if (!window.confirm("Voulez-vous vraiment vous déconnecter ?")) return;
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("[LOGOUT]", error);
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  // ✅ Hook appelé AVANT tout return conditionnel
  const handleIdle = useCallback(async () => {
    try { await signOut(); } catch (e) { console.error("[IDLE]", e); }
    finally { navigate("/login", { replace: true }); }
  }, [signOut, navigate]);

  useIdleTimeout(handleIdle);

  // ✅ Return conditionnel APRÈS tous les hooks
  if (!profile) return <Loader />;

  const navItems = NAV_ITEMS[profile.role] || [];

  return (
    <div className="layout">
      <aside className="sidebar">

        <div className="sidebar-brand">
          <h2 className="sidebar-brand-title">AID Platform</h2>
          <p className="sidebar-brand-subtitle">Aid Al Edha</p>
        </div>

        <div className="sidebar-scroll">
          <div className="nav-section">
            <div className="nav-label">{SECTION_LABELS[profile.role]}</div>
            {navItems.map(({ to, end, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          {profile.role === "fidel" ? (
            <NavLink
              to="/fidel/profile"
              className={({ isActive }) => `profile-box${isActive ? " active" : ""}`}
            >
              <p className="profile-name">{getDisplayName(profile)}</p>
              <p className="profile-role">{getRoleLabel(profile.role)}</p>
            </NavLink>
          ) : (
            <div className="profile-box">
              <p className="profile-name">{getDisplayName(profile)}</p>
              <p className="profile-role">{getRoleLabel(profile.role)}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="logout-button"
          >
            {loggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>

      </aside>

      <div className="main">
        <header className="app-header">
          <h1 className="header-title">Espace de gestion</h1>
          <div className="header-right">
            <div className="user-chip">{getRoleLabel(profile.role)}</div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;