import Loader from "../../components/ui/Loader";

export default function AdminOrganizationsManagementCard({
  styles,
  loading,
  profilesLoading,
  saving,
  deletingId,
  showForm,
  editingId,
  form,
  search,
  statusFilter,
  typeFilter,
  cityFilter,
  typeOptions,
  cityOptions,
  filteredOrganizations,
  onChange,
  onOpenCreate,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onRowClick,
  setSearch,
  setStatusFilter,
  setTypeFilter,
  setCityFilter,
  getStatusTheme,
  getProfilesCountForOrganization,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Gestion des associations</h1>
          <p style={styles.subtitle}>
            Liste moderne sur une seule ligne avec recherche, filtres,
            actions rapides et consultation détaillée.
          </p>
        </div>

        <button onClick={onOpenCreate} style={styles.primaryButton}>
          + Nouvelle organisation
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.toolbarRow}>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Tous les types</option>
            {typeOptions
              .filter((value) => value !== "all")
              .map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">Toutes les villes</option>
            {cityOptions
              .filter((value) => value !== "all")
              .map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Nom
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Nom de l'organisation"
                required
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Type
              <input
                name="type"
                value={form.type}
                onChange={onChange}
                placeholder="Type"
                required
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Adresse
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Adresse"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Ville
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                placeholder="Ville"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Téléphone
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Téléphone"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email"
                style={styles.input}
              />
            </label>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
            />
            Organisation active
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              style={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : editingId
                ? "Enregistrer les modifications"
                : "Créer l'organisation"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={styles.secondaryButton}
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
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Ville</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Nb fidèles</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading || profilesLoading ? (
              <tr>
                <td colSpan={9}>
                  <Loader small={true} />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "1rem",
                      color: "#232121",
                    }}
                  >
                    Chargement des données...
                  </div>
                </td>
              </tr>
            ) : filteredOrganizations.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.empty}>
                  Aucune organisation trouvée.
                </td>
              </tr>
            ) : (
              filteredOrganizations.map((org) => {
                const statusTheme = getStatusTheme(org.is_active);

                return (
                  <tr
                    key={org.id}
                    style={styles.clickableRow}
                    onClick={() => onRowClick(org)}
                  >
                    <td style={styles.td}>{org.name || "-"}</td>
                    <td style={styles.td}>{org.city || "-"}</td>
                    <td style={styles.td}>{org.phone || "-"}</td>
                    <td style={styles.td}>{org.email || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badgeBase,
                          background: statusTheme.background,
                          color: statusTheme.color,
                          border: statusTheme.border,
                        }}
                      >
                        {statusTheme.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {getProfilesCountForOrganization(org.id)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(org);
                          }}
                          style={styles.editIconButton}
                          title="Modifier"
                          aria-label="Modifier"
                          type="button"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(org.id, org.name);
                          }}
                          style={styles.deleteIconButton}
                          disabled={deletingId === org.id}
                          title="Supprimer"
                          aria-label="Supprimer"
                          type="button"
                        >
                          {deletingId === org.id ? "…" : "🗑️"}
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