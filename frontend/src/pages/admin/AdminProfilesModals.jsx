import { useEffect } from "react";
import { SHEEP_SIZES } from "../../constants/sheep";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/AdminProfilesModals.css";

// ✅ Défini avant les composants parents
const DetailCard = ({ label, value, full = false }) => (
  <div className={`pmodal-detail-card${full ? " pmodal-detail-card--full" : ""}`}>
    <div className="pmodal-detail-label">{label}</div>
    <div className="pmodal-detail-value">{value ?? "-"}</div>
  </div>
);

// ✅ Hook réutilisable pour Escape + scroll lock
const useModalBehavior = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);
};

// ===== MODAL PROFIL =====
const ProfileDetailModal = ({
  selectedProfile,
  setSelectedProfile,
  selectedProfileSheep,
  onEdit,
  onApprove,
  onOpenAssignModal,
  getDisplayName,
  getOrganizationLabel,
  formatDateTime,
}) => {
  const close = () => setSelectedProfile(null);
  useModalBehavior(!!selectedProfile, close);

  if (!selectedProfile) return null;

  return (
    <div className="pmodal-overlay" onClick={close} role="dialog" aria-modal="true">
      <div className="pmodal" onClick={(e) => e.stopPropagation()}>

        <div className="pmodal-header">
          <div>
            <h2 className="pmodal-title">{getDisplayName(selectedProfile)}</h2>
            <p className="pmodal-subtitle">{selectedProfile.role} • {selectedProfile.status}</p>
          </div>
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

        <div className="pmodal-body">
          <div className="pmodal-details-grid">
            <DetailCard label="Prénom"       value={selectedProfile.first_name} />
            <DetailCard label="Nom"          value={selectedProfile.last_name} />
            <DetailCard label="Email"        value={selectedProfile.email} />
            <DetailCard label="Téléphone"    value={selectedProfile.phone} />
            <DetailCard label="Rôle"         value={selectedProfile.role} />
            <DetailCard label="Statut"       value={<StatusBadge status={selectedProfile.status} />} />
            <DetailCard label="Organisation" value={getOrganizationLabel(selectedProfile)} />
            <DetailCard label="Type org."    value={selectedProfile.organization?.type} />
            <DetailCard label="Mdp à changer" value={selectedProfile.must_change_password ? "Oui" : "Non"} />
            <DetailCard label="Créé le"      value={formatDateTime(selectedProfile.created_at)} />
            <DetailCard label="Modifié le"   value={formatDateTime(selectedProfile.updated_at)} />
            <DetailCard label="ID"           value={selectedProfile.id} />

            {/* Moutons attribués */}
            <div className="pmodal-detail-card pmodal-detail-card--full">
              <div className="pmodal-detail-label">Moutons attribués</div>
              <div className="pmodal-detail-value">
                {selectedProfileSheep.length === 0 ? (
                  <span style={{ color: "#94a3b8", fontWeight: 400 }}>Aucun mouton attribué</span>
                ) : (
                  <div className="pmodal-sheep-tags">
                    {selectedProfileSheep.map((s) => (
                      <span key={s.id} className="pmodal-sheep-tag">
                        #{s.number || "-"} • {s.color || "-"} • {s.size || "-"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pmodal-footer">
          {selectedProfile.role === "fidel" && (
            <button type="button" className="btn-icon btn-icon--sheep"
              onClick={() => { const p = selectedProfile; close(); onOpenAssignModal(p); }}
              title="Attribuer un mouton">🐏</button>
          )}
          <button type="button" className="btn-icon btn-icon--edit"
            onClick={() => { onEdit(selectedProfile); close(); }}
            title="Modifier">✏️</button>
          {selectedProfile.status === "pending" && (
            <button type="button" className="btn-icon btn-icon--approve"
              onClick={async () => { await onApprove(selectedProfile.id); close(); }}
              title="Valider">✓</button>
          )}
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

      </div>
    </div>
  );
};

// ===== MODAL ATTRIBUTION =====
const AssignSheepModal = ({
  assignProfile,
  setAssignProfile,
  filteredSheepForAssign,
  sheep,
  sheepSearch,
  setSheepSearch,
  sheepStatusFilter,
  setSheepStatusFilter,
  sheepColorFilter,
  setSheepColorFilter,
  sheepSizeFilter,
  setSheepSizeFilter,
  sheepColorOptions,
  assigningSheepId,
  onAssignSheep,
  getDisplayName,
}) => {
  const close = () => setAssignProfile(null);
  useModalBehavior(!!assignProfile, close);

  if (!assignProfile) return null;

  return (
    <div className="pmodal-overlay" onClick={close} role="dialog" aria-modal="true">
      <div className="pmodal pmodal--wide" onClick={(e) => e.stopPropagation()}>

        <div className="pmodal-header">
          <div>
            <h2 className="pmodal-title">Attribuer un mouton</h2>
            <p className="pmodal-subtitle">Fidèle : {getDisplayName(assignProfile)}</p>
          </div>
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

        <div className="pmodal-body">
          {/* FILTRES */}
          <div className="pmodal-filters">
            <input type="text" placeholder="Rechercher par numéro..."
              value={sheepSearch} onChange={(e) => setSheepSearch(e.target.value)}
              className="pmodal-input" />

            <select value={sheepStatusFilter} onChange={(e) => setSheepStatusFilter(e.target.value)} className="pmodal-input">
              <option value="available">Disponibles</option>
              <option value="all">Tous</option>
              <option value="assigned">Attribués</option>
              <option value="sacrificed">Sacrifiés</option>
              <option value="missing">Manquants</option>
            </select>

            {/* ✅ Couleurs issues des données */}
            <select value={sheepColorFilter} onChange={(e) => setSheepColorFilter(e.target.value)} className="pmodal-input">
              <option value="all">Toutes les couleurs</option>
              {sheepColorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* ✅ Tailles depuis la constante SHEEP_SIZES */}
            <select value={sheepSizeFilter} onChange={(e) => setSheepSizeFilter(e.target.value)} className="pmodal-input">
              <option value="all">Toutes les tailles</option>
              {SHEEP_SIZES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="pmodal-count">
            {filteredSheepForAssign.length} mouton(s) sur {sheep.length}
          </div>

          {/* LISTE */}
          <div className="pmodal-sheep-list">
            {filteredSheepForAssign.length === 0 ? (
              <div className="pmodal-empty">Aucun mouton trouvé.</div>
            ) : (
              filteredSheepForAssign.map((item) => {
                const alreadyAssigned = !!item.fidel_id;
                return (
                  <div key={item.id} className="pmodal-sheep-row">
                    <div>
                      <div className="pmodal-sheep-title">Mouton #{item.number || "-"}</div>
                      <div className="pmodal-sheep-sub">
                        {item.size || "-"} • {item.color || "-"} • {item.weight ? `${item.weight} kg` : "-"}
                      </div>
                    </div>
                    <button type="button" className="btn-primary"
                      onClick={() => onAssignSheep(item)}
                      disabled={assigningSheepId === item.id || alreadyAssigned}>
                      {assigningSheepId === item.id ? "Attribution..."
                        : alreadyAssigned ? "Déjà attribué"
                        : "Attribuer"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pmodal-footer">
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

      </div>
    </div>
  );
};

// ===== EXPORT PRINCIPAL =====
export default function AdminProfilesModals(props) {
  return (
    <>
      <ProfileDetailModal
        selectedProfile={props.selectedProfile}
        setSelectedProfile={props.setSelectedProfile}
        selectedProfileSheep={props.selectedProfileSheep}
        onEdit={props.onEdit}
        onApprove={props.onApprove}
        onOpenAssignModal={props.onOpenAssignModal}
        getDisplayName={props.getDisplayName}
        getOrganizationLabel={props.getOrganizationLabel}
        formatDateTime={props.formatDateTime}
      />
      <AssignSheepModal
        assignProfile={props.assignProfile}
        setAssignProfile={props.setAssignProfile}
        filteredSheepForAssign={props.filteredSheepForAssign}
        sheep={props.sheep}
        sheepSearch={props.sheepSearch}
        setSheepSearch={props.setSheepSearch}
        sheepStatusFilter={props.sheepStatusFilter}
        setSheepStatusFilter={props.setSheepStatusFilter}
        sheepColorFilter={props.sheepColorFilter}
        setSheepColorFilter={props.setSheepColorFilter}
        sheepSizeFilter={props.sheepSizeFilter}
        setSheepSizeFilter={props.setSheepSizeFilter}
        sheepColorOptions={props.sheepColorOptions}
        assigningSheepId={props.assigningSheepId}
        onAssignSheep={props.onAssignSheep}
        getDisplayName={props.getDisplayName}
      />
    </>
  );
}