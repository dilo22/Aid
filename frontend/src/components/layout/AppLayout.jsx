import { useAuth } from "../../contexts/AuthContext";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
    background: "#f8fafc",
  },
  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "8px 0 30px rgba(15, 23, 42, 0.08)",
    height: "100vh",
    position: "sticky",
    top: 0,
    boxSizing: "border-box",
  },
  brand: {
    padding: "8px 8px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 20,
    flexShrink: 0,
  },
  brandTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  brandSubtitle: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  sidebarScroll: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingRight: 4,
  },
  navSection: {
    display: "grid",
    gap: 8,
  },
  navLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.45)",
    padding: "0 10px",
    marginBottom: 4,
    fontWeight: 700,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "rgba(255,255,255,0.82)",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 600,
    fontSize: 15,
    transition: "all 0.2s ease",
  },
  activeNavLink: {
    background: "rgba(37, 99, 235, 0.22)",
    color: "#ffffff",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.18)",
  },
  navIcon: {
    width: 18,
    textAlign: "center",
    flexShrink: 0,
  },
  sidebarFooter: {
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
    flexShrink: 0,
    marginTop: 20,
  },
  profileBox: {
    display: "block",
    textDecoration: "none",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    color: "#fff",
  },
  profileBoxActive: {
    background: "rgba(37, 99, 235, 0.22)",
    border: "1px solid rgba(96, 165, 250, 0.35)",
  },
  profileName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 14,
  },
  profileRole: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  logoutButton: {
    border: "1px solid rgba(248, 113, 113, 0.35)",
    background: "rgba(127, 29, 29, 0.18)",
    color: "#fecaca",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    padding: "18px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  headerTitleWrap: {
    display: "grid",
    gap: 4,
  },
  headerTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  headerSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userChip: {
    padding: "10px 14px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 999,
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: 13,
  },
  content: {
    padding: 28,
  },
};

const getRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "organization":
      return "Responsable organisation";
    case "fidel":
      return "Fidèle";
    default:
      return role || "Utilisateur";
  }
};

const getDisplayName = (profile) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (profile?.email) return profile.email;

  return "Utilisateur";
};

const navLinkStyle = ({ isActive }) => ({
  ...styles.navLink,
  ...(isActive ? styles.activeNavLink : {}),
});

const profileLinkStyle = ({ isActive }) => ({
  ...styles.profileBox,
  ...(isActive ? styles.profileBoxActive : {}),
});

const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <h2 style={styles.brandTitle}>🐑 Aid Platform</h2>
        </div>

        <div style={styles.sidebarScroll}>
          {profile?.role === "admin" && (
            <div style={styles.navSection}>
              <div style={styles.navLabel}>Administration</div>

              <NavLink to="/admin" end style={navLinkStyle}>
                <span style={styles.navIcon}>📊</span>
                Dashboard
              </NavLink>

              <NavLink to="/admin/organizations" style={navLinkStyle}>
                <span style={styles.navIcon}>🕌</span>
                Organisations
              </NavLink>

              <NavLink to="/admin/sheep" style={navLinkStyle}>
                <span style={styles.navIcon}>🐏</span>
                Moutons
              </NavLink>

              <NavLink to="/admin/profiles" style={navLinkStyle}>
                <span style={styles.navIcon}>👥</span>
                Utilisateurs
              </NavLink>
            </div>
          )}

          {profile?.role === "organization" && (
            <div style={styles.navSection}>
              <div style={styles.navLabel}>Organisation</div>

              <NavLink to="/organization" end style={navLinkStyle}>
                <span style={styles.navIcon}>📊</span>
                Tableau de bord
              </NavLink>

              <NavLink to="/organization/fidels" style={navLinkStyle}>
                <span style={styles.navIcon}>👥</span>
                Fidèles
              </NavLink>

              <NavLink to="/organization/contact" style={navLinkStyle}>
                <span style={styles.navIcon}>🛠️</span>
                Support technique
              </NavLink>
            </div>
          )}

          {profile?.role === "fidel" && (
            <div style={styles.navSection}>
              <div style={styles.navLabel}>Mon espace</div>

              <NavLink to="/fidel" end style={navLinkStyle}>
                <span style={styles.navIcon}>🏠</span>
                Tableau de bord
              </NavLink>

              <NavLink to="/fidel/profile" style={navLinkStyle}>
                <span style={styles.navIcon}>👤</span>
                Mon profil
              </NavLink>

              <NavLink to="/fidel/contact" style={navLinkStyle}>
                <span style={styles.navIcon}>📞</span>
                Contact
              </NavLink>
            </div>
          )}
        </div>

        <div style={styles.sidebarFooter}>
          {profile?.role === "fidel" ? (
            <NavLink to="/fidel/profile" style={profileLinkStyle}>
              <p style={styles.profileName}>{getDisplayName(profile)}</p>
              <p style={styles.profileRole}>{getRoleLabel(profile?.role)}</p>
            </NavLink>
          ) : (
            <div style={styles.profileBox}>
              <p style={styles.profileName}>{getDisplayName(profile)}</p>
              <p style={styles.profileRole}>{getRoleLabel(profile?.role)}</p>
            </div>
          )}

          <button onClick={handleLogout} style={styles.logoutButton}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <h1 style={styles.headerTitle}>Espace de gestion</h1>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.userChip}>{getRoleLabel(profile?.role)}</div>
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