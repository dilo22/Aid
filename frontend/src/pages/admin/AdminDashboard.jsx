import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingProfiles, getApprovedProfiles } from "../../api/profilesApi";
import { getOrganizations } from "../../api/organizationsApi";
import { getSheepList } from "../../api/sheepApi";
import "../../styles/AdminDashboard.css";

// ===== Sous-composants =====

const KpiCard = ({ label, value, meta }) => (
  <div className="dash-kpi-card">
    <div className="dash-kpi-label">{label}</div>
    <div className="dash-kpi-value">{value}</div>
    <div className="dash-kpi-meta">{meta}</div>
  </div>
);

const QuickActionCard = ({ icon, title, text, primaryLabel, secondaryLabel, onPrimary, onSecondary }) => (
  <div className="dash-quick-card">
    <div className="dash-quick-icon">{icon}</div>
    <div>
      <h3 className="dash-quick-title">{title}</h3>
      <p className="dash-quick-text">{text}</p>
    </div>
    <div className="dash-quick-actions">
      <button className="btn-primary" onClick={onPrimary}>{primaryLabel}</button>
      {secondaryLabel && (
        <button className="btn-soft" onClick={onSecondary}>{secondaryLabel}</button>
      )}
    </div>
  </div>
);

const ChartRow = ({ label, pct, colorClass }) => (
  <div className="dash-chart-row">
    <div className="dash-chart-label-row">
      <span className="dash-chart-label">{label}</span>
      <span className="dash-chart-pct">{pct}%</span>
    </div>
    <div className="dash-chart-track">
      <div className={`dash-chart-fill dash-chart-fill--${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const FlashInfo = ({ icon, title, text }) => (
  <div className="dash-flash-item">
    <div className="dash-flash-icon">{icon}</div>
    <div>
      <p className="dash-flash-title">{title}</p>
      <p className="dash-flash-text">{text}</p>
    </div>
  </div>
);

// ===== Dashboard =====

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    organizations:    0,
    pendingProfiles:  0,
    approvedProfiles: 0,
    sheepTotal:       0,
    sheepAvailable:   0,
  });

  useEffect(() => {
  const loadStats = async () => {
    try {
      setLoading(true);

      const [pending, approved, orgs, sheepTotal, sheepAvailable] = await Promise.allSettled([
        getPendingProfiles(),
        getApprovedProfiles(),
        getOrganizations(),
        // ✅ limit: 1 — on veut juste meta.total, pas les données
        getSheepList({ page: 1, limit: 1 }),
        getSheepList({ page: 1, limit: 1, status: "available" }),
      ]);

      const pendingData  = pending.status  === "fulfilled" ? (pending.value  ?? []) : [];
      const approvedData = approved.status === "fulfilled" ? (approved.value ?? []) : [];
      const orgsData     = orgs.status     === "fulfilled" ? (orgs.value     ?? []) : [];

      // ✅ meta.total = vrai total en base, pas limité par la pagination
      const totalCount     = sheepTotal.status     === "fulfilled" ? (sheepTotal.value?.meta?.total     ?? 0) : 0;
      const availableCount = sheepAvailable.status === "fulfilled" ? (sheepAvailable.value?.meta?.total ?? 0) : 0;

      setStats({
        organizations:    orgsData.length,
        pendingProfiles:  pendingData.length,
        approvedProfiles: approvedData.length,
        sheepTotal:       totalCount,
        sheepAvailable:   availableCount,
      });
    } catch (error) {
      console.error("[AdminDashboard] loadStats error:", error);
    } finally {
      setLoading(false);
    }
  };

  loadStats();
}, []);

  const profilesTotal = stats.pendingProfiles + stats.approvedProfiles;

  const ratios = useMemo(() => ({
    profileApproval: profilesTotal > 0
      ? Math.round((stats.approvedProfiles / profilesTotal) * 100) : 0,
    sheepAvailability: stats.sheepTotal > 0
      ? Math.round((stats.sheepAvailable / stats.sheepTotal) * 100) : 0,
    activityDensity: stats.organizations > 0
      ? Math.min(100, Math.round((stats.approvedProfiles / stats.organizations) * 10)) : 0,
  }), [stats, profilesTotal]);

  // ✅ Clés stables basées sur le contenu
  const flashInfos = [
    stats.pendingProfiles > 0 && {
      key:   "pending",
      icon:  "⏳",
      title: `${stats.pendingProfiles} compte(s) en attente`,
      text:  "Des fidèles attendent une validation. Priorité haute.",
    },
    stats.sheepAvailable === 0 && stats.sheepTotal > 0 && {
      key:   "no-sheep",
      icon:  "🐑",
      title: "Aucun mouton disponible",
      text:  "Le stock existe mais plus aucun mouton n'est disponible.",
    },
    stats.organizations === 0 && {
      key:   "no-org",
      icon:  "🕌",
      title: "Aucune organisation active",
      text:  "Ajoute une première mosquée ou association.",
    },
    stats.sheepAvailable > 0 && {
      key:   "sheep-ok",
      icon:  "✅",
      title: `${stats.sheepAvailable} mouton(s) disponibles`,
      text:  "Le stock permet encore de nouvelles attributions.",
    },
  ].filter(Boolean);

  const val = (n) => loading ? "..." : n;

  return (
    <div className="dash-page">

      {/* HERO */}
      <section className="dash-hero">
        <div className="dash-hero-glow dash-hero-glow--one" />
        <div className="dash-hero-glow dash-hero-glow--two" />

        <div className="dash-hero-content">
          <div className="dash-hero-top">
            <div>
              <div className="dash-pulse">
                <span className="dash-pulse-dot" />
                Centre de pilotage administratif
              </div>
              <h1 className="dash-hero-title">Dashboard Admin</h1>
              <p className="dash-hero-text">
                Vue globale sur la plateforme : organisations, profils,
                stock de moutons et points de vigilance.
              </p>
            </div>
            <div className="dash-badge-wrap">
              <span className="dash-badge">Vue globale</span>
              <span className="dash-badge">Accès rapide</span>
              <span className="dash-badge">Pilotage métier</span>
            </div>
          </div>

          <div className="dash-kpi-grid">
            <KpiCard label="Organisations"   value={val(stats.organizations)}    meta="Mosquées et associations" />
            <KpiCard label="Profils validés" value={val(stats.approvedProfiles)} meta="Comptes actifs" />
            <KpiCard label="En attente"      value={val(stats.pendingProfiles)}  meta="À valider" />
            <KpiCard label="Moutons"         value={val(stats.sheepTotal)}       meta={`${stats.sheepAvailable} disponibles`} />
          </div>
        </div>
      </section>

      {/* GRILLE PRINCIPALE */}
      <div className="dash-section-grid">

        {/* ACCÈS RAPIDE */}
        <section className="dash-card">
          <h2 className="dash-card-title">Accès rapide aux modules</h2>
          <p className="dash-card-text">Tables, éditions et consultations dans les écrans dédiés.</p>

          <div className="dash-quick-grid">
            <QuickActionCard
              icon="🕌" title="Organisations"
              text="Consulter, créer, modifier et superviser toutes les organisations."
              primaryLabel="Ouvrir"
              secondaryLabel="Créer"
              onPrimary={()  => navigate("/admin/organizations")}
              onSecondary={() => navigate("/admin/organizations?action=create")} // ✅ URL distincte
            />
            <QuickActionCard
              icon="👥" title="Profils"
              text="Valider les inscriptions et piloter les utilisateurs."
              primaryLabel="Ouvrir"
              secondaryLabel="Validations en attente"
              onPrimary={()  => navigate("/admin/profiles")}
              onSecondary={() => navigate("/admin/profiles?status=pending")} // ✅ URL distincte
            />
            <QuickActionCard
              icon="🐑" title="Moutons"
              text="Gérer le stock, les disponibilités et les attributions."
              primaryLabel="Ouvrir"
              secondaryLabel="Ajouter un mouton"
              onPrimary={()  => navigate("/admin/sheep")}
              onSecondary={() => navigate("/admin/sheep?action=create")} // ✅ URL distincte
            />
          </div>
        </section>

        <div className="dash-right-stack">

          {/* TENDANCES */}
          <section className="dash-card">
            <h2 className="dash-card-title">Tendances rapides</h2>
            <p className="dash-card-text">Équilibres visuels de la plateforme.</p>
            <div className="dash-chart-wrap">
              <ChartRow label="Comptes validés"      pct={ratios.profileApproval}   colorClass="blue"  />
              <ChartRow label="Stock disponible"     pct={ratios.sheepAvailability} colorClass="green" />
              <ChartRow label="Intensité d'activité" pct={ratios.activityDensity}   colorClass="amber" />
            </div>
          </section>

          {/* FLASH INFOS */}
          <section className="dash-card">
            <h2 className="dash-card-title">Flash infos</h2>
            <p className="dash-card-text">Points de vigilance sans quitter l'accueil.</p>
            <div className="dash-flash-list">
              {flashInfos.length === 0 ? (
                <FlashInfo icon="🎉" title="Aucun signal bloquant" text="Le système est stable." />
              ) : (
                // ✅ key stable basée sur le contenu
                flashInfos.map((item) => (
                  <FlashInfo key={item.key} icon={item.icon} title={item.title} text={item.text} />
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