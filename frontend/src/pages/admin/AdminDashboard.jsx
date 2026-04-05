import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingProfiles, getProfiles } from "../../api/profilesApi";
import { getOrganizations } from "../../api/organizationsApi";
import { getSheepList } from "../../api/sheepApi";

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
      "linear-gradient(135deg, #0f172a 0%, #111827 35%, #1d4ed8 100%)",
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
    gridTemplateColumns: "1.2fr 0.8fr",
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
  buttonSoft: {
    border: "1px solid #dbeafe",
    borderRadius: 14,
    padding: "11px 14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
  },
  rightStack: {
    display: "grid",
    gap: 24,
  },
  chartWrap: {
    marginTop: 18,
    display: "grid",
    gap: 14,
  },
  chartRow: {
    display: "grid",
    gap: 8,
  },
  chartLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 14,
  },
  chartTrack: {
    width: "100%",
    height: 12,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  chartFillBlue: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
  },
  chartFillGreen: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #059669 0%, #34d399 100%)",
  },
  chartFillAmber: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #d97706 0%, #fbbf24 100%)",
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
  pulse: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#f8fafc",
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 6px rgba(34,197,94,0.14)",
  },
};

const KpiCard = ({ label, value, meta }) => (
  <div style={styles.heroStatCard}>
    <div style={styles.heroStatLabel}>{label}</div>
    <div style={styles.heroStatValue}>{value}</div>
    <div style={styles.heroStatMeta}>{meta}</div>
  </div>
);

const QuickActionCard = ({
  icon,
  title,
  text,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}) => (
  <div style={styles.quickCard}>
    <div style={styles.iconBubble}>{icon}</div>
    <div>
      <h3 style={styles.quickTitle}>{title}</h3>
      <p style={styles.quickText}>{text}</p>
    </div>
    <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
      <button style={styles.buttonPrimary} onClick={onPrimary}>
        {primaryLabel}
      </button>
      {secondaryLabel && (
        <button style={styles.buttonSoft} onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
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

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    organizations: 0,
    pendingProfiles: 0,
    approvedProfiles: 0,
    sheepTotal: 0,
    sheepAvailable: 0,
    sheepReserved: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const [pendingProfiles, approvedProfiles, organizations, sheep] =
          await Promise.allSettled([
            getPendingProfiles(),
            getProfiles({ status: "active" }),
            getOrganizations(),
            getSheepList({ page: 1, limit: 1000 }),
          ]);

        const pendingData =
          pendingProfiles.status === "fulfilled" &&
          Array.isArray(pendingProfiles.value)
            ? pendingProfiles.value
            : [];

        const approvedData =
          approvedProfiles.status === "fulfilled" &&
          Array.isArray(approvedProfiles.value)
            ? approvedProfiles.value
            : [];

        const organizationsData =
          organizations.status === "fulfilled" &&
          Array.isArray(organizations.value)
            ? organizations.value
            : organizations.status === "fulfilled" &&
              Array.isArray(organizations.value?.items)
            ? organizations.value.items
            : [];

        const sheepData =
          sheep.status === "fulfilled" && Array.isArray(sheep.value?.items)
            ? sheep.value.items
            : sheep.status === "fulfilled" && Array.isArray(sheep.value)
            ? sheep.value
            : [];

        const sheepAvailable = sheepData.filter(
          (item) => item.status === "available"
        ).length;
        const sheepReserved = sheepData.filter(
          (item) => item.status !== "available"
        ).length;

        setStats({
          organizations: organizationsData.length,
          pendingProfiles: pendingData.length,
          approvedProfiles: approvedData.length,
          sheepTotal: sheepData.length,
          sheepAvailable,
          sheepReserved,
        });
      } catch (error) {
        console.error("dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const profilesTotal = stats.pendingProfiles + stats.approvedProfiles;

  const ratios = useMemo(() => {
    const profileApprovalRatio =
      profilesTotal > 0
        ? Math.round((stats.approvedProfiles / profilesTotal) * 100)
        : 0;

    const sheepAvailabilityRatio =
      stats.sheepTotal > 0
        ? Math.round((stats.sheepAvailable / stats.sheepTotal) * 100)
        : 0;

    const organizationDensity =
      stats.organizations > 0
        ? Math.min(100, Math.round((stats.approvedProfiles / stats.organizations) * 10))
        : 0;

    return {
      profileApprovalRatio,
      sheepAvailabilityRatio,
      organizationDensity,
    };
  }, [stats, profilesTotal]);

  const flashInfos = [
    stats.pendingProfiles > 0 && {
      icon: "⏳",
      title: `${stats.pendingProfiles} compte(s) en attente`,
      text: "Des fidèles attendent une validation. Priorité haute pour fluidifier l’inscription.",
    },
    stats.sheepAvailable === 0 && stats.sheepTotal > 0 && {
      icon: "🐑",
      title: "Aucun mouton disponible",
      text: "Le stock existe mais plus aucun mouton n’est disponible à l’attribution.",
    },
    stats.organizations === 0 && {
      icon: "🕌",
      title: "Aucune organisation active",
      text: "Ajoute une première mosquée ou association pour structurer la plateforme.",
    },
    stats.sheepAvailable > 0 && {
      icon: "✅",
      title: `${stats.sheepAvailable} mouton(s) disponibles`,
      text: "Le stock actuel permet encore d’absorber de nouvelles attributions.",
    },
  ].filter(Boolean);

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div style={styles.heroTopRow}>
            <div>
              <div style={styles.pulse}>
                <span style={styles.pulseDot} />
                Centre de pilotage administratif
              </div>

              <h1 style={styles.heroTitle}>Dashboard Admin</h1>
              <p style={styles.heroText}>
                Une vue claire et premium sur la plateforme : organisations, profils,
                stock de moutons et points de vigilance. Le but est d’aller à l’essentiel,
                décider vite, puis accéder aux modules détaillés seulement quand tu en as besoin.
              </p>
            </div>

            <div style={styles.heroBadgeWrap}>
              <div style={styles.heroBadge}>Vue globale</div>
              <div style={styles.heroBadge}>Accès rapide</div>
              <div style={styles.heroBadge}>Pilotage métier</div>
            </div>
          </div>

          <div style={styles.heroStats}>
            <KpiCard
              label="Organisations"
              value={loading ? "..." : stats.organizations}
              meta="Mosquées et associations actives"
            />
            <KpiCard
              label="Profils validés"
              value={loading ? "..." : stats.approvedProfiles}
              meta="Comptes prêts à utiliser la plateforme"
            />
            <KpiCard
              label="En attente"
              value={loading ? "..." : stats.pendingProfiles}
              meta="Demandes à traiter par l’admin"
            />
            <KpiCard
              label="Moutons"
              value={loading ? "..." : stats.sheepTotal}
              meta={`${stats.sheepAvailable} disponibles`}
            />
          </div>
        </div>
      </section>

      <div style={styles.sectionGrid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Accès rapide aux modules</h2>
          <p style={styles.sectionText}>
            Le dashboard reste épuré. Les tables, éditions, suppressions et consultations complètes
            doivent vivre dans des écrans dédiés.
          </p>

          <div style={styles.quickGrid}>
            <QuickActionCard
              icon="🕌"
              title="Organisations"
              text="Consulter, créer, modifier, désactiver et superviser toutes les organisations."
              primaryLabel="Ouvrir les organisations"
              secondaryLabel="Créer une organisation"
              onPrimary={() => navigate("/admin/organizations")}
              onSecondary={() => navigate("/admin/organizations")}
            />

            <QuickActionCard
              icon="👥"
              title="Profils"
              text="Valider les inscriptions, consulter les profils et piloter les utilisateurs."
              primaryLabel="Ouvrir les profils"
              secondaryLabel="Voir les validations"
              onPrimary={() => navigate("/admin/profiles")}
              onSecondary={() => navigate("/admin/profiles")}
            />

            <QuickActionCard
              icon="🐑"
              title="Moutons"
              text="Gérer le stock complet, les disponibilités, les attributions et le suivi."
              primaryLabel="Ouvrir les moutons"
              secondaryLabel="Ajouter un mouton"
              onPrimary={() => navigate("/admin/sheep")}
              onSecondary={() => navigate("/admin/sheep")}
            />
          </div>
        </section>

        <div style={styles.rightStack}>
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Tendances rapides</h2>
            <p style={styles.sectionText}>
              Lecture visuelle immédiate des équilibres de la plateforme.
            </p>

            <div style={styles.chartWrap}>
              <div style={styles.chartRow}>
                <div style={styles.chartLabelRow}>
                  <span style={{ color: "#334155", fontWeight: 700 }}>
                    Comptes validés
                  </span>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {ratios.profileApprovalRatio}%
                  </span>
                </div>
                <div style={styles.chartTrack}>
                  <div
                    style={{
                      ...styles.chartFillBlue,
                      width: `${ratios.profileApprovalRatio}%`,
                    }}
                  />
                </div>
              </div>

              <div style={styles.chartRow}>
                <div style={styles.chartLabelRow}>
                  <span style={{ color: "#334155", fontWeight: 700 }}>
                    Stock disponible
                  </span>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {ratios.sheepAvailabilityRatio}%
                  </span>
                </div>
                <div style={styles.chartTrack}>
                  <div
                    style={{
                      ...styles.chartFillGreen,
                      width: `${ratios.sheepAvailabilityRatio}%`,
                    }}
                  />
                </div>
              </div>

              <div style={styles.chartRow}>
                <div style={styles.chartLabelRow}>
                  <span style={{ color: "#334155", fontWeight: 700 }}>
                    Intensité d’activité
                  </span>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {ratios.organizationDensity}%
                  </span>
                </div>
                <div style={styles.chartTrack}>
                  <div
                    style={{
                      ...styles.chartFillAmber,
                      width: `${ratios.organizationDensity}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Flash infos</h2>
            <p style={styles.sectionText}>
              Les éléments à surveiller sans quitter la page d’accueil.
            </p>

            <div style={styles.flashList}>
              {flashInfos.length === 0 ? (
                <FlashInfo
                  icon="🎉"
                  title="Aucun signal bloquant"
                  text="Le système semble stable. Tu peux passer sur les modules détaillés pour travailler."
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
};

export default AdminDashboard;