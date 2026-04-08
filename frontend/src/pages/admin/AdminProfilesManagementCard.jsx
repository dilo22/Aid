import Loader from "../../components/ui/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/AdminProfiles.css";

const ROLES = [
  { value: "fidel",        label: "Fidèle" },
  { value: "organization", label: "Organisation" },
  { value: "admin",        label: "Administrateur" },
];

const STATUSES = [
  { value: "pending",  label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
];

const RoleBadge = ({ role }) => {
  const label = ROLES.find((r) => r.value === role)?.label || role;
  return <span className={`role-badge role-badge--${role}`}>{label}</span>;
};

export default function AdminProfilesManagementCard({
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
    <div className="profiles-card">

      {/* HEADER */}
      <div className="profiles-header">
        <div>
          <h1 className="profiles-title">Gestion des profils</h1>
          <p className="profiles-subtitle">
            Recherche, filtres, validation, modification et attribution des moutons.
          </p>
        </div>
        <button onClick={onOpenCreate} className="btn-primary">+ Nouveau profil</button>
      </div>

      {errorMessage && <div className="profiles-error">{errorMessage}</div>}

      {/* TOOLBAR */}
      <div className="profiles-toolbar">
        <input type="text" placeholder="Rechercher par prénom, nom, email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="profiles-input" style={{ flex: 2, minWidth: 200 }} />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="profiles-input">
          <option value="all">Tous les rôles</option>
          {ROLES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="profiles-input">
          <option value="all">Tous les statuts</option>
          {STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <form onSubmit={onSubmit} className="profiles-form">
          <div className="profiles-form-grid">
            <label className="profiles-label">
              Prénom *
              <input name="first_name" value={form.first_name} onChange={onChange}
                placeholder="Prénom" required className="profiles-input" />
            </label>
            <label className="profiles-label">
              Nom *
              <input name="last_name" value={form.last_name} onChange={onChange}
                placeholder="Nom" required className="profiles-input" />
            </label>
            <label className="profiles-label">
              Email
              <input name="email" type="email" value={form.email} onChange={onChange}
                placeholder="Email" className="profiles-input" />
            </label>
            <label className="profiles-label">
              Téléphone
              <input name="phone" value={form.phone} onChange={onChange}
                placeholder="Téléphone" className="profiles-input" />
            </label>
            <label className="profiles-label">
              Rôle
              <select name="role" value={form.role} onChange={onChange} className="profiles-input">
                {ROLES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="profiles-label">
              Statut
              <select name="status" value={form.status} onChange={onChange} className="profiles-input">
                {STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="profiles-label">
              Organisation
              <select name="organization_id" value={form.organization_id} onChange={onChange} className="profiles-input">
                <option value="">Aucune organisation</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}{org.type ? ` (${org.type})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="profiles-checkbox-label">
              <input type="checkbox" name="must_change_password"
                checked={form.must_change_password} onChange={onChange} />
              Changer le mot de passe à la prochaine connexion
            </label>
          </div>
          <div className="profiles-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {/* ===== TABLEAU — desktop ===== */}
      <div className="profiles-table-wrap">
        <table className="profiles-table">
          <thead>
            <tr>
              <th className="profiles-th">Prénom</th>
              <th className="profiles-th">Nom</th>
              <th className="profiles-th">Email</th>
              <th className="profiles-th">Téléphone</th>
              <th className="profiles-th">Rôle</th>
              <th className="profiles-th">Organisation</th>
              <th className="profiles-th">Moutons</th>
              <th className="profiles-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="profiles-loading-cell">
                  <Loader small /><div>Chargement...</div>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={8} className="profiles-empty">Aucun profil trouvé.</td>
              </tr>
            ) : (
              profiles.map((item) => (
                <tr key={item.id} className="profiles-row" onClick={() => onRowClick(item)}>
                  <td className="profiles-td">{item.first_name || "-"}</td>
                  <td className="profiles-td">{item.last_name  || "-"}</td>
                  <td className="profiles-td">{item.email      || "-"}</td>
                  <td className="profiles-td">{item.phone      || "-"}</td>
                  <td className="profiles-td"><RoleBadge role={item.role} /></td>
                  <td className="profiles-td">{getOrganizationLabel(item)}</td>
                  <td className="profiles-td">{getAssignedSheepCountForProfile(item.id)}</td>
                  <td className="profiles-td">
                    <div className="profiles-actions">
                      {item.role === "fidel" && (
                        <button type="button" className="profiles-btn-icon profiles-btn-icon--sheep"
                          onClick={(e) => { e.stopPropagation(); onOpenAssignModal(item); }}
                          title="Attribuer un mouton">🐏</button>
                      )}
                      <button type="button" className="profiles-btn-icon profiles-btn-icon--edit"
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        title="Modifier">✏️</button>
                      {item.status === "pending" && (
                        <button type="button" className="profiles-btn-icon profiles-btn-icon--approve"
                          onClick={(e) => { e.stopPropagation(); onApprove(item.id); }}
                          disabled={approvingId === item.id}
                          title="Valider">
                          {approvingId === item.id ? "…" : "✓"}
                        </button>
                      )}
                      <button type="button" className="profiles-btn-icon profiles-btn-icon--delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        disabled={deletingId === item.id}
                        title="Supprimer">
                        {deletingId === item.id ? "…" : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== CARTES — mobile ===== */}
      <div className="profiles-mobile-list">
        {loading ? (
          <div className="profiles-mobile-loading"><Loader small /></div>
        ) : profiles.length === 0 ? (
          <div className="profiles-mobile-empty">Aucun profil trouvé.</div>
        ) : (
          profiles.map((item) => (
            <div key={item.id} className="profiles-mobile-card" onClick={() => onRowClick(item)}>
              <div className="profiles-mobile-card-header">
                <span className="profiles-mobile-card-name">
                  {item.first_name || "-"} {item.last_name || ""}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <div className="profiles-mobile-card-row">
                <span>Email</span>
                <span className="profiles-mobile-card-value">{item.email || "-"}</span>
              </div>
              <div className="profiles-mobile-card-row">
                <span>Téléphone</span>
                <span className="profiles-mobile-card-value">{item.phone || "-"}</span>
              </div>
              <div className="profiles-mobile-card-row">
                <span>Rôle</span>
                <RoleBadge role={item.role} />
              </div>
              <div className="profiles-mobile-card-row">
                <span>Organisation</span>
                <span className="profiles-mobile-card-value">{getOrganizationLabel(item)}</span>
              </div>
              <div className="profiles-mobile-card-row">
                <span>Moutons</span>
                <span className="profiles-mobile-card-value">{getAssignedSheepCountForProfile(item.id)}</span>
              </div>
              <div className="profiles-mobile-card-actions">
                {item.role === "fidel" && (
                  <button type="button" className="profiles-btn-icon profiles-btn-icon--sheep"
                    onClick={(e) => { e.stopPropagation(); onOpenAssignModal(item); }}
                    title="Attribuer">🐏</button>
                )}
                <button type="button" className="profiles-btn-icon profiles-btn-icon--edit"
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  title="Modifier">✏️</button>
                {item.status === "pending" && (
                  <button type="button" className="profiles-btn-icon profiles-btn-icon--approve"
                    onClick={(e) => { e.stopPropagation(); onApprove(item.id); }}
                    disabled={approvingId === item.id}
                    title="Valider">
                    {approvingId === item.id ? "…" : "✓"}
                  </button>
                )}
                <button type="button" className="profiles-btn-icon profiles-btn-icon--delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  disabled={deletingId === item.id}
                  title="Supprimer">
                  {deletingId === item.id ? "…" : "🗑️"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
