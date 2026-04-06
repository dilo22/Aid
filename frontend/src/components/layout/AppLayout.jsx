import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import "../../styles/AppLayout.css";


const ROLE_LABELS = {
  admin:        "Administrateur",
  organization: "Responsable organisation",
  fidel:        "Fidèle",
};

const NAV_ITEMS = {
  admin: [
    { to: "/admin",                end: true,  icon: "📊", label: "Dashboard" },
    { to: "/admin/organizations",  end: false, icon: "🕌", label: "Organisations" },
    { to: "/admin/sheep",          end: false, icon: "🐏", label: "Moutons" },
    { to: "/admin/profiles",       end: false, icon: "👥", label: "Utilisateurs" },
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

const getRoleLabel  = (role) => ROLE_LABELS[role] || role || "Utilisateur";

const getDisplayName = (profile) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName  = profile?.last_name?.trim()  || "";
  const rebuilt   = `${firstName} ${lastName}`.trim();
  return rebuilt || profile?.email || "Utilisateur";
};

const navLinkStyle     = ({ isActive }) => ({ ...styles.navLink,    ...(isActive ? styles.activeNavLink    : {}) });
const profileLinkStyle = ({ isActive }) => ({ ...styles.profileBox, ...(isActive ? styles.profileBoxActive : {}) });

const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ Garde si profil pas encore chargé
  if (!profile) return <Loader />;

  const navItems = NAV_ITEMS[profile.role] || [];

  // ✅ Gestion d'erreur + état de chargement
  const handleLogout = async () => {
    if (loggingOut) return;

    // ✅ Confirmation avant déconnexion
    const confirmed = window.confirm("Voulez-vous vraiment vous déconnecter ?");
    if (!confirmed) return;

    setLoggingOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("[LOGOUT] error:", error);
      // ✅ Forcer la déconnexion même si signOut échoue
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          {/* ✅ Texte sans emoji pour éviter les problèmes d'encodage */}
          <h2 style={styles.brandTitle}>AID Platform</h2>
          <p style={styles.brandSubtitle}>Aid Al Edha</p>
        </div>

        <div style={styles.sidebarScroll}>
          <div style={styles.navSection}>
            <div style={styles.navLabel}>
              {profile.role === "admin"        ? "Administration" :
               profile.role === "organization" ? "Organisation"   : "Mon espace"}
            </div>

            {/* ✅ Rendu depuis une config centralisée — plus de triple if */}
            {navItems.map(({ to, end, icon, label }) => (
              <NavLink key={to} to={to} end={end} style={navLinkStyle}>
                <span style={styles.navIcon}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div style={styles.sidebarFooter}>
          {profile.role === "fidel" ? (
            <NavLink to="/fidel/profile" style={profileLinkStyle}>
              <p style={styles.profileName}>{getDisplayName(profile)}</p>
              <p style={styles.profileRole}>{getRoleLabel(profile.role)}</p>
            </NavLink>
          ) : (
            <div style={styles.profileBox}>
              <p style={styles.profileName}>{getDisplayName(profile)}</p>
              <p style={styles.profileRole}>{getRoleLabel(profile.role)}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              ...styles.logoutButton,
              ...(loggingOut ? styles.logoutButtonDisabled : {}),
            }}
          >
            {loggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Espace de gestion</h1>
          <div style={styles.headerRight}>
            <div style={styles.userChip}>{getRoleLabel(profile.role)}</div>
          </div>
        </header>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;