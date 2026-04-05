export default function AdminOrganizationsModal({
  styles,
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

  return (
    <div
      style={styles.modalOverlay}
      onClick={() => setSelectedOrganization(null)}
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            Organisation - {selectedOrganization.name || "-"}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedOrganization(null)}
            style={styles.secondaryButton}
          >
            Fermer
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.detailsGrid}>
            <DetailCard
              styles={styles}
              label="Nom"
              value={selectedOrganization.name || "-"}
            />

            <DetailCard
              styles={styles}
              label="Type"
              value={selectedOrganization.type || "-"}
            />

            <DetailCard
              styles={styles}
              label="Adresse"
              value={selectedOrganization.address || "-"}
            />

            <DetailCard
              styles={styles}
              label="Ville"
              value={selectedOrganization.city || "-"}
            />

            <DetailCard
              styles={styles}
              label="Téléphone"
              value={selectedOrganization.phone || "-"}
            />

            <DetailCard
              styles={styles}
              label="Email"
              value={selectedOrganization.email || "-"}
            />

            <DetailCard
              styles={styles}
              label="Statut"
              value={getStatusTheme(selectedOrganization.is_active).label}
            />

            <DetailCard
              styles={styles}
              label="Nombre de fidèles"
              value={selectedOrganizationProfiles.length}
            />

            <DetailCard
              styles={styles}
              label="ID organisation"
              value={selectedOrganization.id || "-"}
            />

            <div style={{ ...styles.detailCard, ...styles.detailBlock }}>
              <div style={styles.detailLabel}>Fidèles rattachés</div>
              <div style={styles.detailValue}>
                {selectedOrganizationProfiles.length === 0 ? (
                  "Aucun fidèle rattaché"
                ) : (
                  <div style={styles.memberList}>
                    {selectedOrganizationProfiles.map((profile) => (
                      <div key={profile.id} style={styles.memberItem}>
                        <div style={styles.memberName}>
                          {getProfileDisplayName(profile)}
                        </div>
                        <div style={styles.memberSub}>
                          Prénom : {profile.first_name || "-"} • Nom :{" "}
                          {profile.last_name || "-"}
                        </div>
                        <div style={styles.memberSub}>
                          Email : {profile.email || "-"} • Téléphone :{" "}
                          {profile.phone || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            type="button"
            onClick={() => onEdit(selectedOrganization)}
            style={styles.primaryButton}
          >
            Modifier
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(selectedOrganization.id, selectedOrganization.name)
            }
            style={styles.secondaryButton}
            disabled={deletingId === selectedOrganization.id}
          >
            {deletingId === selectedOrganization.id
              ? "Suppression..."
              : "Supprimer"}
          </button>

          <button
            type="button"
            onClick={() => setSelectedOrganization(null)}
            style={styles.secondaryButton}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ styles, label, value }) {
  return (
    <div style={styles.detailCard}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}