import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrganizationFidels } from "../../api/profilesApi";
import { useAuth } from "../../contexts/AuthContext";

const styles = {
  page: {
    display: "grid",
    gap: 24,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: 28,
    color: "#fff",
    background:
      "linear-gradient(135deg, #0f172a 0%, #111827 35%, #2563eb 100%)",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.22)",
  },
  heroGlowOne: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(4px)",
  },
  heroGlowTwo: {
    position: "absolute",
    bottom: -90,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    filter: "blur(4px)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    gap: 18,
  },
  heroTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  heroTitle: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  heroText: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    maxWidth: 720,
    lineHeight: 1.6,
  },
  heroBadgeWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  heroBadge: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    backdropFilter: "blur(8px)",
    fontSize: 13,
    fontWeight: 600,
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  heroStatCard: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
  },
  heroStatLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 8,
  },
  heroStatValue: {
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1,
  },
  heroStatMeta: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 24,
    alignItems: "start",
  },
  card: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 22,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  sectionText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6,
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginTop: 18,
  },
  quickCard: {
    borderRadius: 22,
    padding: 18,
    border: "1px solid #e5e7eb",
    background:
      "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)",
    display: "grid",
    gap: 12,
    minHeight: 190,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontSize: 24,
    background: "#eff6ff",
  },
  quickTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  quickText: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
  },
  buttonPrimary: {
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  rightStack: {
    display: "grid",
    gap: 24,
  },
  flashList: {
    display: "grid",
    gap: 12,
    marginTop: 18,
  },
  flashItem: {
    borderRadius: 18,
    padding: 16,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  flashIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
  },
  flashTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },
  flashText: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
};

const KpiCard = ({ label, value, meta }) => (
  <div style={styles.heroStatCard}>
    <div style={styles.heroStatLabel}>{label}</div>
    <div style={styles.heroStatValue}>{value}</div>
    <div style={styles.heroStatMeta}>{meta}</div>
  </div>
);

const QuickActionCard = ({ icon, title, text, primaryLabel, onPrimary }) => (
  <div style={styles.quickCard}>
    <div style={styles.iconBubble}>{icon}</div>
    <div>
      <h3 style={styles.quickTitle}>{title}</h3>
      <p style={styles.quickText}>{text}</p>
    </div>
    <div style={{ marginTop: "auto" }}>
      <button style={styles.buttonPrimary} onClick={onPrimary}>
        {primaryLabel}
      </button>
    </div>
  </div>
);

const FlashInfo = ({ icon, title, text }) => (
  <div style={styles.flashItem}>
    <div style={styles.flashIcon}>{icon}</div>
    <div>
      <p style={styles.flashTitle}>{title}</p>
      <p style={styles.flashText}>{text}</p>
    </div>
  </div>
);

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const items = await getOrganizationFidels({}, session?.access_token);
        const normalizedItems = Array.isArray(items?.items)
          ? items.items
          : Array.isArray(items)
          ? items
          : [];

        setStats({
          total: normalizedItems.length,
          approved: normalizedItems.filter((item) => item.status === "approved")
            .length,
          pending: normalizedItems.filter((item) => item.status === "pending")
            .length,
          rejected: normalizedItems.filter((item) => item.status === "rejected")
            .length,
        });
      } catch (error) {
        console.error("organization dashboard stats error:", error);
        setStats({
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [session?.access_token]);

  const flashInfos = useMemo(() => {
    const items = [];

    if (stats.pending > 0) {
      items.push({
        icon: "⏳",
        title: `${stats.pending} fidèle(s) en attente`,
        text: "Des comptes de ton organisation sont encore en statut pending.",
      });
    }

    if (stats.approved > 0) {
      items.push({
        icon: "✅",
        title: `${stats.approved} fidèle(s) approuvé(s)`,
        text: "Les fidèles approuvés de ton organisation sont déjà disponibles dans le module de gestion.",
      });
    }

    if (stats.total === 0) {
      items.push({
        icon: "👥",
        title: "Aucun fidèle enregistré",
        text: "Commence par ajouter un premier fidèle à ton organisation.",
      });
    }

    return items;
  }, [stats]);

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div style={styles.heroTopRow}>
            <div>
              <h1 style={styles.heroTitle}>Dashboard Organization</h1>
              <p style={styles.heroText}>
                Un espace clair pour piloter les fidèles de ton organisation,
                suivre les statuts des comptes et accéder rapidement au module
                de gestion dédié.
              </p>
            </div>

            <div style={styles.heroBadgeWrap}>
              <div style={styles.heroBadge}>Vue organization</div>
              <div style={styles.heroBadge}>Gestion des fidèles</div>
              <div style={styles.heroBadge}>Traçabilité admin</div>
            </div>
          </div>

          <div style={styles.heroStats}>
            <KpiCard
              label="Fidèles"
              value={loading ? "..." : stats.total}
              meta="Total dans l’organisation"
            />
            <KpiCard
              label="Approuvés"
              value={loading ? "..." : stats.approved}
              meta="Comptes prêts à utiliser"
            />
            <KpiCard
              label="En attente"
              value={loading ? "..." : stats.pending}
              meta="Comptes à suivre"
            />
            <KpiCard
              label="Rejetés"
              value={loading ? "..." : stats.rejected}
              meta="Comptes non retenus"
            />
          </div>
        </div>
      </section>

      <div style={styles.sectionGrid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Accès rapide</h2>
          <p style={styles.sectionText}>
            Toute la gestion autonome de ton organisation passe par un module
            dédié, scoped uniquement à tes fidèles.
          </p>

          <div style={styles.quickGrid}>
            <QuickActionCard
              icon="👥"
              title="Mes fidèles"
              text="Voir les fidèles de ton organisation, ajouter un compte et suivre leurs statuts."
              primaryLabel="Ouvrir la gestion des fidèles"
              onPrimary={() => navigate("/organization/fidels")}
            />
          </div>
        </section>

        <div style={styles.rightStack}>
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Flash infos</h2>
            <p style={styles.sectionText}>
              Les informations essentielles de ton organisation en un coup d’œil.
            </p>

            <div style={styles.flashList}>
              {flashInfos.length === 0 ? (
                <FlashInfo
                  icon="🎉"
                  title="Aucun signal particulier"
                  text="Ton espace organization est prêt pour la gestion autonome des fidèles."
                />
              ) : (
                flashInfos.map((item, index) => (
                  <FlashInfo
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    text={item.text}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}