import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";

const styles = {
  page: {
    background: "#f8fafc",
    minHeight: "100%",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  heroCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    padding: 24,
    display: "grid",
    gap: 10,
  },
  heroTitle: {
    margin: 0,
    fontSize: 30,
    color: "#0f172a",
  },
  heroSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 16,
    lineHeight: 1.5,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
    width: "fit-content",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 20,
    borderBottom: "1px solid #e2e8f0",
    display: "grid",
    gap: 6,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
  },
  cardSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },
  cardBody: {
    padding: 20,
    display: "grid",
    gap: 16,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  infoBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    wordBreak: "break-word",
  },
};

const getStatusTheme = (status) => {
  switch (status) {
    case "approved":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Approuvé",
      };
    case "pending":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "En attente",
      };
    case "inactive":
      return {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #cbd5e1",
        label: "Inactif",
      };
    case "blocked":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Bloqué",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
        label: status || "-",
      };
  }
};

const getDisplayName = (profile) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (profile?.email) return profile.email;

  return "cher fidèle";
};

const getOrganizationLabel = (profile) => {
  const name = profile?.organization?.name || "";
  const type = profile?.organization?.type || "";

  if (name && type) return `${name} (${type})`;
  return name || profile?.organization_id || "-";
};

export default function FidelProfilePage() {
  const { profile } = useAuth();

  const statusTheme = useMemo(
    () => getStatusTheme(profile?.status),
    [profile?.status]
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.heroCard}>
          <h1 style={styles.heroTitle}>Mon profil</h1>
          <p style={styles.heroSubtitle}>
            Consultez ici vos informations personnelles et votre rattachement.
          </p>

          <span
            style={{
              ...styles.badge,
              background: statusTheme.background,
              color: statusTheme.color,
              border: statusTheme.border,
            }}
          >
            Statut du profil : {statusTheme.label}
          </span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{getDisplayName(profile)}</h2>
            <p style={styles.cardSubtitle}>Informations de votre compte.</p>
          </div>

          <div style={styles.cardBody}>
            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Prénom</div>
                <div style={styles.infoValue}>{profile?.first_name || "-"}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Nom</div>
                <div style={styles.infoValue}>{profile?.last_name || "-"}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Téléphone</div>
                <div style={styles.infoValue}>{profile?.phone || "-"}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{profile?.email || "-"}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Rôle</div>
                <div style={styles.infoValue}>{profile?.role || "-"}</div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Organisation</div>
                <div style={styles.infoValue}>
                  {getOrganizationLabel(profile)}
                </div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Type d’organisation</div>
                <div style={styles.infoValue}>
                  {profile?.organization?.type || "-"}
                </div>
              </div>

              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Mot de passe</div>
                <div style={styles.infoValue}>
                  {profile?.must_change_password ? "À changer" : "OK"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}