import Loader from "../../components/ui/Loader";

export default function AdminProfilesManagementCard({
  styles,
  loading,
  saving,
  deletingId,
  approvingId,
  profiles,
  organizations,
  form,
  showForm,
  editingId,
  errorMessage,
  search,
  roleFilter,
  statusFilter,
  setSearch,
  setRoleFilter,
  setStatusFilter,
  onOpenCreate,
  onChange,
  onSubmit,
  onCancel,
  onRowClick,
  onEdit,
  onApprove,
  onDelete,
  onOpenAssignModal,
  getOrganizationLabel,
  getAssignedSheepCountForProfile,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Gestion des profils</h1>
          <p style={styles.subtitle}>
            Recherche, filtres, validation, modification, suppression et attribution des moutons.
          </p>
        </div>

        <button onClick={onOpenCreate} style={styles.buttonPrimary}>
          + Nouveau profil
        </button>
      </div>

      {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

      <div style={styles.toolbar}>
        <div style={styles.toolbarRow}>
          <input
            type="text"
            placeholder="Rechercher par prénom, nom, email, téléphone, rôle, organisation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Tous les rôles</option>
            <option value="fidel">Fidèles</option>
            <option value="admin">Admins</option>
            <option value="imam">Imams</option>
            <option value="responsable">Responsables</option>
            <option value="organization">Managers organisation</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="blocked">Bloqué</option>
          </select>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <input
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              placeholder="Prénom"
              required
              style={styles.input}
            />

            <input
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              placeholder="Nom"
              required
              style={styles.input}
            />

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              style={styles.input}
            />

            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Téléphone"
              style={styles.input}
            />

            <select
              name="role"
              value={form.role}
              onChange={onChange}
              style={styles.input}
            >
              <option value="fidel">Fidèle</option>
              <option value="admin">Admin</option>
              <option value="imam">Imam</option>
              <option value="responsable">Responsable</option>
              <option value="organization">Manager organisation</option>
            </select>

            <select
              name="status"
              value={form.status}
              onChange={onChange}
              style={styles.input}
            >
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="blocked">Bloqué</option>
            </select>

            <select
              name="organization_id"
              value={form.organization_id}
              onChange={onChange}
              style={styles.input}
            >
              <option value="">Sélectionner une organisation</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} {org.type ? `(${org.type})` : ""}
                </option>
              ))}
            </select>

            <label style={styles.checkboxWrap}>
              <input
                type="checkbox"
                name="must_change_password"
                checked={form.must_change_password}
                onChange={onChange}
              />
              Changer le mot de passe à la prochaine connexion
            </label>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" style={styles.buttonPrimary} disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingId
                ? "Enregistrer"
                : "Créer"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={styles.buttonSecondary}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Prénom</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Organisation</th>
              <th style={styles.th}>Nb moutons</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <Loader small={true} />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.9rem",
                      color: "#232121",
                    }}
                  >
                    Chargement des données...
                  </div>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.empty}>
                  Aucun profil trouvé.
                </td>
              </tr>
            ) : (
              profiles.map((item) => {
                const canAssignSheep = item.role === "fidel";

                return (
                  <tr
                    key={item.id}
                    style={styles.clickableRow}
                    onClick={() => onRowClick(item)}
                  >
                    <td style={styles.td}>{item.first_name || "-"}</td>
                    <td style={styles.td}>{item.last_name || "-"}</td>
                    <td style={styles.td}>{item.email || "-"}</td>
                    <td style={styles.td}>{item.phone || "-"}</td>
                    <td style={styles.td}>{item.role || "-"}</td>
                    <td style={styles.td}>{getOrganizationLabel(item)}</td>
                    <td style={styles.td}>
                      {getAssignedSheepCountForProfile(item.id)}
                    </td>
                    <td style={styles.tdActions}>
                      <div style={styles.actions}>
                        {canAssignSheep && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAssignModal(item);
                            }}
                            style={{
                              ...styles.iconButton,
                              ...styles.sheepButton,
                            }}
                            title="Attribuer un mouton"
                            aria-label="Attribuer un mouton"
                          >
                            🐏
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          style={{
                            ...styles.iconButton,
                            ...styles.editButton,
                          }}
                          title="Modifier"
                          aria-label="Modifier"
                        >
                          ✏️
                        </button>

                        {item.status === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(item.id);
                            }}
                            style={{
                              ...styles.iconButton,
                              ...styles.successButton,
                            }}
                            disabled={approvingId === item.id}
                            title="Valider"
                            aria-label="Valider"
                          >
                            {approvingId === item.id ? "…" : "✓"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          style={{
                            ...styles.iconButton,
                            ...styles.dangerButton,
                          }}
                          disabled={deletingId === item.id}
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          {deletingId === item.id ? "…" : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}