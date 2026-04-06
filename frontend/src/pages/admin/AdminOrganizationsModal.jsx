import { useEffect } from "react";
import "../../styles/AdminOrganizationsModal.css";

// ✅ DetailCard défini avant le composant parent
const DetailCard = ({ label, value, full = false, muted = false }) => (
  <div className={`modal-detail-card${full ? " modal-detail-card--full" : ""}`}>
    <div className="modal-detail-label">{label}</div>
    <div className={`modal-detail-value${muted ? " modal-detail-value--muted" : ""}`}>
      {value ?? "-"}
    </div>
  </div>
);

export default function AdminOrganizationsModal({
  selectedOrganization,
  selectedOrganizationProfiles,
  deletingId,
  setSelectedOrganization,
  onEdit,
  onDelete,
  getStatusTheme,
  getProfileDisplayName,
}) {
  if (!selectedOrganization) return null;

  const close = () => setSelectedOrganization(null);
  const isDeleting = deletingId === selectedOrganization.id;
  const statusTheme = getStatusTheme(selectedOrganization.is_active);

  // ✅ Fermeture avec Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // ✅ Blocage du scroll en arrière-plan
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="modal-overlay" onClick={close} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedOrganization.name || "Organisation"}
          </h2>
          <button type="button" onClick={close} className="btn-secondary">
            Fermer
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="modal-details-grid">
            <DetailCard label="Nom"    value={selectedOrganization.name} />
            <DetailCard label="Type"   value={selectedOrganization.type} />
            <DetailCard label="Ville"  value={selectedOrganization.city} />
            <DetailCard label="Adresse" value={selectedOrganization.address} />
            <DetailCard label="Téléphone" value={selectedOrganization.phone} />
            <DetailCard label="Email"  value={selectedOrganization.email} />
            <DetailCard label="Statut" value={statusTheme.label} />
            <DetailCard label="Fidèles rattachés" value={selectedOrganizationProfiles.length} />
            <DetailCard label="ID" value={selectedOrganization.id} muted />

            {/* Liste des fidèles */}
            <div className="modal-detail-card modal-detail-card--full">
              <div className="modal-detail-label">Fidèles</div>
              <div className="modal-detail-value">
                {selectedOrganizationProfiles.length === 0 ? (
                  <span className="modal-detail-value--muted">Aucun fidèle rattaché</span>
                ) : (
                  <div className="modal-member-list">
                    {selectedOrganizationProfiles.map((profile) => (
                      <div key={profile.id} className="modal-member-item">
                        <div className="modal-member-name">
                          {getProfileDisplayName(profile)}
                        </div>
                        <div className="modal-member-sub">
                          {profile.email || "-"} • {profile.phone || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button type="button" onClick={() => onEdit(selectedOrganization)} className="btn-primary">
            Modifier
          </button>

          {/* ✅ Bouton danger visuellement distinct */}
          <button
            type="button"
            onClick={() => onDelete(selectedOrganization.id, selectedOrganization.name)}
            className="btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>

          <button type="button" onClick={close} className="btn-secondary">
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}