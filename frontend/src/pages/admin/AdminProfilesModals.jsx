export default function AdminProfilesModals({
  styles,
  selectedProfile,
  setSelectedProfile,
  assignProfile,
  setAssignProfile,
  selectedProfileSheep,
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
  sheepSizeOptions,
  assigningSheepId,
  onAssignSheep,
  onEdit,
  onApprove,
  onOpenAssignModal,
  getDisplayName,
  getOrganizationLabel,
  getStatusTheme,
  getSheepStatusLabel,
  formatDateTime,
}) {
  return (
    <>
      {selectedProfile && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedProfile(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Profil - {getDisplayName(selectedProfile)}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                style={styles.buttonSecondary}
              >
                Fermer
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailsGrid}>
                <DetailCard
                  styles={styles}
                  label="Prénom"
                  value={selectedProfile.first_name || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Nom"
                  value={selectedProfile.last_name || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Email"
                  value={selectedProfile.email || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Téléphone"
                  value={selectedProfile.phone || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Rôle"
                  value={selectedProfile.role || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Statut"
                  value={getStatusTheme(selectedProfile.status).label}
                />
                <DetailCard
                  styles={styles}
                  label="Organisation"
                  value={getOrganizationLabel(selectedProfile)}
                />
                <DetailCard
                  styles={styles}
                  label="Type organisation"
                  value={selectedProfile.organization?.type || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Mot de passe à changer"
                  value={selectedProfile.must_change_password ? "Oui" : "Non"}
                />
                <DetailCard
                  styles={styles}
                  label="Créé le"
                  value={formatDateTime(selectedProfile.created_at)}
                />
                <DetailCard
                  styles={styles}
                  label="Modifié le"
                  value={formatDateTime(selectedProfile.updated_at)}
                />
                <DetailCard
                  styles={styles}
                  label="Créé par"
                  value={selectedProfile.created_by || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Modifié par"
                  value={selectedProfile.updated_by || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="Supprimé par"
                  value={selectedProfile.deleted_by || "-"}
                />
                <DetailCard
                  styles={styles}
                  label="ID profil"
                  value={selectedProfile.id || "-"}
                />

                <div style={{ ...styles.detailCard, ...styles.sheepBlock }}>
                  <div style={styles.detailLabel}>Moutons attribués</div>
                  <div style={styles.detailValue}>
                    {selectedProfileSheep.length === 0 ? (
                      "Aucun mouton attribué"
                    ) : (
                      <div>
                        {selectedProfileSheep.map((item) => (
                          <span key={item.id} style={styles.sheepTag}>
                            Mouton #{item.number || "-"} • Couleur :{" "}
                            {item.color || "-"} • Taille : {item.size || "-"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {selectedProfile.role === "fidel" && (
                <button
                  type="button"
                  onClick={() => {
                    const profileToAssign = selectedProfile;
                    setSelectedProfile(null);
                    onOpenAssignModal(profileToAssign);
                  }}
                  style={{ ...styles.iconButton, ...styles.sheepButton }}
                  title="Attribuer un mouton"
                  aria-label="Attribuer un mouton"
                >
                  🐏
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onEdit(selectedProfile);
                  setSelectedProfile(null);
                }}
                style={{ ...styles.iconButton, ...styles.editButton }}
                title="Modifier"
                aria-label="Modifier"
              >
                ✏️
              </button>

              {selectedProfile.status === "pending" && (
                <button
                  type="button"
                  onClick={async () => {
                    await onApprove(selectedProfile.id);
                    setSelectedProfile(null);
                  }}
                  style={{ ...styles.iconButton, ...styles.successButton }}
                  title="Valider"
                  aria-label="Valider"
                >
                  ✓
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                style={styles.buttonSecondary}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {assignProfile && (
        <div style={styles.modalOverlay} onClick={() => setAssignProfile(null)}>
          <div style={styles.assignModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Attribuer un mouton</h2>
                <div
                  style={{
                    color: "#475569",
                    marginTop: 6,
                    fontWeight: 600,
                  }}
                >
                  Fidèle : {getDisplayName(assignProfile)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignProfile(null)}
                style={styles.buttonSecondary}
              >
                Fermer
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ ...styles.detailCard, background: "#f8fafc" }}>
                <div style={styles.detailLabel}>Fidèle sélectionné</div>
                <div style={styles.detailValue}>
                  {getDisplayName(assignProfile)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <input
                  type="text"
                  placeholder="Rechercher par numéro de mouton..."
                  value={sheepSearch}
                  onChange={(e) => setSheepSearch(e.target.value)}
                  style={styles.input}
                />

                <select
                  value={sheepStatusFilter}
                  onChange={(e) => setSheepStatusFilter(e.target.value)}
                  style={styles.input}
                >
                  <option value="available">Disponibles non attribués</option>
                  <option value="all">Tous</option>
                  <option value="assigned">Attribués</option>
                  <option value="sacrificed">Sacrifiés</option>
                  <option value="missing">Manquants</option>
                </select>

                <select
                  value={sheepColorFilter}
                  onChange={(e) => setSheepColorFilter(e.target.value)}
                  style={styles.input}
                >
                  <option value="all">Toutes les couleurs</option>
                  {sheepColorOptions
                    .filter((value) => value !== "all")
                    .map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                </select>

                <select
                  value={sheepSizeFilter}
                  onChange={(e) => setSheepSizeFilter(e.target.value)}
                  style={styles.input}
                >
                  <option value="all">Toutes les tailles</option>
                  {sheepSizeOptions
                    .filter((value) => value !== "all")
                    .map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>
                {filteredSheepForAssign.length} mouton(s) trouvé(s) sur {sheep.length}
              </div>

              <div style={styles.sheepList}>
                {filteredSheepForAssign.length === 0 ? (
                  <div style={styles.empty}>Aucun mouton trouvé.</div>
                ) : (
                  filteredSheepForAssign.map((item) => {
                    const alreadyAssigned =
                      item.fidel_id !== null &&
                      item.fidel_id !== undefined &&
                      String(item.fidel_id).trim() !== "";

                    return (
                      <div key={item.id} style={styles.sheepRow}>
                        <div style={styles.sheepMeta}>
                          <div style={styles.sheepTitle}>
                            Mouton #{item.number || "-"}
                          </div>
                          <div style={styles.sheepSub}>
                            Statut : {getSheepStatusLabel(item.status)} •
                            Taille : {item.size || "-"} • Couleur :{" "}
                            {item.color || "-"}
                          </div>
                          <div style={styles.sheepSub}>
                            Poids : {item.weight || "-"} kg • ID : {item.id}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onAssignSheep(item)}
                          disabled={assigningSheepId === item.id || alreadyAssigned}
                          style={styles.buttonPrimary}
                        >
                          {assigningSheepId === item.id
                            ? "Attribution..."
                            : alreadyAssigned
                            ? "Déjà attribué"
                            : "Attribuer"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setAssignProfile(null)}
                style={styles.buttonSecondary}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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