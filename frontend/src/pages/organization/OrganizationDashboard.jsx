import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrganizationFidels } from "../../api/profilesApi";
import "../../styles/OrganizationPages.css";

const KpiCard = ({ label, value, meta }) => (
  <div className="org-dash-kpi-card">
    <div className="org-dash-kpi-label">{label}</div>
    <div className="org-dash-kpi-value">{value}</div>
    <div className="org-dash-kpi-meta">{meta}</div>
  </div>
);

const FlashInfo = ({ icon, title, text }) => (
  <div className="org-flash-item">
    <div className="org-flash-icon">{icon}</div>
    <div>
      <p className="org-flash-title">{title}</p>
      <p className="org-flash-text">{text}</p>
    </div>
  </div>
);

export default function OrganizationDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // ✅ Pas de token manuel — intercepteur axios
        const data = await getOrganizationFidels();
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

        setStats({
          total:    items.length,
          approved: items.filter((i) => i.status === "approved").length,
          pending:  items.filter((i) => i.status === "pending").length,
          rejected: items.filter((i) => i.status === "rejected").length,
        });
      } catch (error) {
        console.error("[OrganizationDashboard]", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []); // ✅ Pas de dépendance sur session?.access_token

  // ✅ Clés stables
  const flashInfos = useMemo(() => {
    const items = [];
    if (stats.pending > 0)  items.push({ key: "pending",  icon: "⏳", title: `${stats.pending} fidèle(s) en attente`,  text: "Des comptes sont encore en statut pending." });
    if (stats.approved > 0) items.push({ key: "approved", icon: "✅", title: `${stats.approved} fidèle(s) approuvé(s)`, text: "Les fidèles approuvés sont disponibles dans le module." });
    if (stats.total === 0)  items.push({ key: "empty",    icon: "👥", title: "Aucun fidèle enregistré",                  text: "Commence par ajouter un premier fidèle." });
    return items;
  }, [stats]);

  const val = (n) => loading ? "..." : n;

  return (
    <div className="org-dash-page">
      <section className="org-dash-hero">
        <div className="org-dash-glow org-dash-glow--one" />
        <div className="org-dash-glow org-dash-glow--two" />

        <div className="org-dash-hero-content">
          <div className="org-dash-hero-top">
            <div>
              <h1 className="org-dash-hero-title">Dashboard Organisation</h1>
              <p className="org-dash-hero-text">
                Pilotez les fidèles de votre organisation, suivez les statuts et accédez rapidement au module de gestion.
              </p>
            </div>
            <div className="org-dash-badge-wrap">
              <span className="org-dash-badge">Vue organisation</span>
              <span className="org-dash-badge">Gestion des fidèles</span>
            </div>
          </div>

          <div className="org-dash-kpi-grid">
            <KpiCard label="Fidèles"    value={val(stats.total)}    meta="Total dans l'organisation" />
            <KpiCard label="Approuvés"  value={val(stats.approved)} meta="Comptes actifs" />
            <KpiCard label="En attente" value={val(stats.pending)}  meta="À suivre" />
            <KpiCard label="Rejetés"    value={val(stats.rejected)} meta="Non retenus" />
          </div>
        </div>
      </section>

      <div className="org-dash-section-grid">
        <section className="org-card">
          <h2 className="org-card-title">Accès rapide</h2>
          <p className="org-card-text">Gérez vos fidèles depuis le module dédié.</p>

          <div className="org-quick-grid">
            <div className="org-quick-card">
              <div className="org-quick-icon">👥</div>
              <div>
                <h3 className="org-quick-title">Mes fidèles</h3>
                <p className="org-quick-text">Voir, ajouter et gérer les fidèles de votre organisation.</p>
              </div>
              <div className="org-quick-footer">
                <button className="btn-primary" onClick={() => navigate("/organization/fidels")}>
                  Ouvrir la gestion
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="org-right-stack">
          <section className="org-card">
            <h2 className="org-card-title">Flash infos</h2>
            <p className="org-card-text">Informations essentielles en un coup d'œil.</p>

            <div className="org-flash-list">
              {flashInfos.length === 0 ? (
                <FlashInfo icon="🎉" title="Aucun signal particulier" text="Votre espace est prêt." />
              ) : (
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
}