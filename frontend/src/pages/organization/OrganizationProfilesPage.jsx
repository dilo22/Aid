import { useEffect, useMemo, useState } from "react";
import {
  getOrganizationFidels,
  createOrganizationFidel,
  updateOrganizationFidel,
  deleteOrganizationFidel,
} from "../../api/profilesApi";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/OrganizationPages.css";

const EMPTY_FORM = () => ({
  first_name: "", last_name: "", email: "", phone: "", status: "approved",
});

const formatDate = (v) => v ? new Date(v).toLocaleDateString("fr-FR") : "-";

const StatCard = ({ label, value, meta }) => (
  <div className="org-stat-card">
    <div className="org-stat-label">{label}</div>
    <div className="org-stat-value">{value}</div>
    {meta && <div className="org-stat-meta">{meta}</div>}
  </div>
);

export default function OrganizationProfilesPage() {
  const [profiles,   setProfiles]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM());

  const [errorMessage,   setErrorMessage]   = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      // ✅ Pas de token manuel
      const data = await getOrganizationFidels();
      setProfiles(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[OrgProfilesPage] load:", error);
      setErrorMessage(error?.message || "Impossible de charger les fidèles.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pas de dépendance sur session?.access_token
  useEffect(() => { loadProfiles(); }, []);

  // ✅ Filtrage côté client uniquement (données déjà chargées)
  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((item) => {
      const matchSearch = !term || [item.first_name, item.last_name, item.email, item.phone]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(term));
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [profiles, search, statusFilter]);

  const stats = useMemo(() => ({
    total:    profiles.length,
    approved: profiles.filter((i) => i.status === "approved").length,
    pending:  profiles.filter((i) => i.status === "pending").length,
    rejected: profiles.filter((i) => i.status === "rejected").length,
  }), [profiles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      first_name: item.first_name || "",
      last_name:  item.last_name  || "",
      email:      item.email      || "",
      phone:      item.phone      || "",
      status:     item.status     || "approved",
    });
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setShowForm(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      email:      form.email.trim().toLowerCase(),
      phone:      form.phone.trim(),
      status:     form.status,
    };

    if (!payload.first_name) return setErrorMessage("Le prénom est obligatoire.");
    if (!payload.last_name)  return setErrorMessage("Le nom est obligatoire.");
    if (!payload.email)      return setErrorMessage("L'email est obligatoire.");

    setSaving(true);
    try {
      if (editingId) {
        await updateOrganizationFidel(editingId, payload);
        setSuccessMessage("Fidèle modifié avec succès.");
      } else {
        await createOrganizationFidel(payload);
        // ✅ Plus de temporaryPassword dans la réponse
        setSuccessMessage("Fidèle créé avec succès. Le mot de passe provisoire a été envoyé par email.");
      }
      handleCancel();
      await loadProfiles();
    } catch (error) {
      console.error("[OrgProfilesPage] submit:", error);
      setErrorMessage(error?.message || "Impossible d'enregistrer le fidèle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce fidèle ?")) return;
    setDeletingId(id);
    try {
      await deleteOrganizationFidel(id);
      setSuccessMessage("Fidèle supprimé avec succès.");
      if (editingId === id) handleCancel();
      await loadProfiles();
    } catch (error) {
      console.error("[OrgProfilesPage] delete:", error);
      setErrorMessage(error?.message || "Impossible de supprimer le fidèle.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="org-profiles-page">
      <div className="org-profiles-container">
        <div className="org-profiles-card">

          {/* HEADER */}
          <div className="org-profiles-header">
            <div>
              <h1 className="org-profiles-title">Gestion des fidèles</h1>
              <p className="org-profiles-subtitle">
                Fidèles rattachés à votre organisation uniquement.
              </p>
            </div>
            <button className="btn-primary" onClick={handleOpenCreate}>
              + Ajouter un fidèle
            </button>
          </div>

          {/* STATS */}
          <div className="org-stats-grid">
            <StatCard label="Total"      value={loading ? "..." : stats.total}    meta="Fidèles" />
            <StatCard label="Approuvés"  value={loading ? "..." : stats.approved} meta="Actifs" />
            <StatCard label="En attente" value={loading ? "..." : stats.pending}  meta="À suivre" />
            <StatCard label="Rejetés"    value={loading ? "..." : stats.rejected} />
          </div>

          {errorMessage   && <div className="org-error">{errorMessage}</div>}
          {successMessage && <div className="org-success">{successMessage}</div>}

          {/* TOOLBAR */}
          <div className="org-toolbar">
            <input type="text" placeholder="Rechercher par prénom, nom, email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="org-input" style={{ flex: 2 }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="org-input">
              <option value="all">Tous les statuts</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>

          {/* FORM */}
          {showForm && (
            <form className="org-form" onSubmit={handleSubmit}>
              <div className="org-form-grid">
                <label className="org-form-label">
                  Prénom *
                  <input name="first_name" value={form.first_name} onChange={handleChange}
                    placeholder="Prénom" className="org-input" required />
                </label>
                <label className="org-form-label">
                  Nom *
                  <input name="last_name" value={form.last_name} onChange={handleChange}
                    placeholder="Nom" className="org-input" required />
                </label>
                <label className="org-form-label">
                  Email *
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="Email" className="org-input" required />
                </label>
                <label className="org-form-label">
                  Téléphone
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="Téléphone" className="org-input" />
                </label>
                <label className="org-form-label">
                  Statut
                  <select name="status" value={form.status} onChange={handleChange} className="org-input">
                    <option value="approved">Approuvé</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </label>
              </div>
              <div className="org-form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer le fidèle"}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Annuler</button>
              </div>
            </form>
          )}

          {/* TABLE */}
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th className="org-th">Prénom</th>
                  <th className="org-th">Nom</th>
                  <th className="org-th">Email</th>
                  <th className="org-th">Téléphone</th>
                  <th className="org-th">Statut</th>
                  <th className="org-th">Créé le</th>
                  <th className="org-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="org-table-loading">Chargement...</td></tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr><td colSpan={7} className="org-table-empty">Aucun fidèle trouvé.</td></tr>
                ) : (
                  filteredProfiles.map((item) => (
                    <tr key={item.id}>
                      <td className="org-td">{item.first_name || "-"}</td>
                      <td className="org-td">{item.last_name  || "-"}</td>
                      <td className="org-td">{item.email      || "-"}</td>
                      <td className="org-td">{item.phone      || "-"}</td>
                      <td className="org-td"><StatusBadge status={item.status} /></td>
                      <td className="org-td">{formatDate(item.created_at)}</td>
                      <td className="org-td">
                        <div className="org-row-actions">
                          <button type="button" className="org-btn-icon org-btn-icon--edit"
                            onClick={() => handleEdit(item)} title="Modifier">✏️</button>
                          <button type="button" className="org-btn-icon org-btn-icon--delete"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id} title="Supprimer">
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

        </div>
      </div>
    </div>
  );
}