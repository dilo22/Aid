import Loader from "../../components/ui/Loader";
import "../../styles/AdminOrganizations.css";

const ORGANIZATION_TYPES = [
  { value: "mosque",      label: "Mosquée" },
  { value: "association", label: "Association" },
];

export default function AdminOrganizationsManagementCard({
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
  const isLoading = loading || profilesLoading;

  return (
    <div className="org-card">

      {/* HEADER */}
      <div className="org-header">
        <div>
          <h1 className="org-title">Gestion des organisations</h1>
          <p className="org-subtitle">
            Recherche, filtres, actions rapides et consultation détaillée.
          </p>
        </div>
        <button onClick={onOpenCreate} className="btn-primary">
          + Nouvelle organisation
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="org-toolbar">
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone, ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="org-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="org-input">
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="org-input">
          <option value="all">Tous les types</option>
          {ORGANIZATION_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="org-input">
          <option value="all">Toutes les villes</option>
          {cityOptions.filter((c) => c !== "all").map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <form onSubmit={onSubmit} className="org-form">
          <div className="org-form-grid">
            <label className="org-label">
              Nom *
              <input name="name" value={form.name} onChange={onChange}
                placeholder="Nom de l'organisation" required className="org-input" />
            </label>

            {/* ✅ Select au lieu de text — aligné avec le backend */}
            <label className="org-label">
              Type *
              <select name="type" value={form.type} onChange={onChange} required className="org-input">
                <option value="">Sélectionner un type</option>
                {ORGANIZATION_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="org-label">
              Adresse
              <input name="address" value={form.address} onChange={onChange}
                placeholder="Adresse" className="org-input" />
            </label>

            <label className="org-label">
              Ville
              <input name="city" value={form.city} onChange={onChange}
                placeholder="Ville" className="org-input" />
            </label>

            <label className="org-label">
              Téléphone
              <input name="phone" value={form.phone} onChange={onChange}
                placeholder="Téléphone" className="org-input" />
            </label>

            <label className="org-label">
              Email *
              <input name="email" type="email" value={form.email} onChange={onChange}
                placeholder="Email" required className="org-input" />
            </label>
          </div>

          <label className="org-checkbox-label">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
            Organisation active
          </label>

          <div className="org-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Créer l'organisation"}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* TABLE */}
      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th className="org-th">Nom</th>
              <th className="org-th">Ville</th>
              <th className="org-th">Téléphone</th>
              <th className="org-th">Email</th>
              <th className="org-th">Statut</th>
              <th className="org-th">Fidèles</th>
              <th className="org-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                {/* ✅ colSpan correct — 7 colonnes */}
                <td colSpan={7} className="org-loading-cell">
                  <Loader small />
                  <div>Chargement des données...</div>
                </td>
              </tr>
            ) : filteredOrganizations.length === 0 ? (
              <tr>
                <td colSpan={7} className="org-empty">
                  Aucune organisation trouvée.
                </td>
              </tr>
            ) : (
              filteredOrganizations.map((org) => {
                const theme = getStatusTheme(org.is_active);
                return (
                  <tr key={org.id} className="org-row" onClick={() => onRowClick(org)}>
                    <td className="org-td">{org.name  || "-"}</td>
                    <td className="org-td">{org.city  || "-"}</td>
                    <td className="org-td">{org.phone || "-"}</td>
                    <td className="org-td">{org.email || "-"}</td>
                    <td className="org-td">
                      <span style={{ background: theme.background, color: theme.color, border: theme.border }}
                        className="badge">
                        {theme.label}
                      </span>
                    </td>
                    <td className="org-td">{getProfilesCountForOrganization(org.id)}</td>
                    <td className="org-td">
                      <div className="org-actions">
                        <button type="button" className="org-btn-icon"
                          onClick={(e) => { e.stopPropagation(); onEdit(org); }}
                          title="Modifier" aria-label="Modifier">
                          ✏️
                        </button>
                        <button type="button" className="org-btn-icon org-btn-icon--delete"
                          onClick={(e) => { e.stopPropagation(); onDelete(org.id, org.name); }}
                          disabled={deletingId === org.id}
                          title="Supprimer" aria-label="Supprimer">
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