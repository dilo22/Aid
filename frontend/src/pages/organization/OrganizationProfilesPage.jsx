import { useEffect, useMemo, useState } from "react";
import {
  getOrganizationFidels,
  createOrganizationFidel,
  updateOrganizationFidel,
  deleteOrganizationFidel,
} from "../../api/profilesApi";
import { useAuth } from "../../contexts/AuthContext";

const getEmptyForm = () => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  status: "approved",
});

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 24,
  },
  container: {
    maxWidth: 1600,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  header: {
    padding: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  titleBlock: {
    display: "grid",
    gap: 6,
  },
  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
  toolbar: {
    padding: 20,
    display: "grid",
    gap: 16,
    borderTop: "1px solid #e2e8f0",
  },
  toolbarRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dbe3f0",
    borderRadius: 12,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    outline: "none",
  },
  form: {
    padding: 20,
    display: "grid",
    gap: 16,
    borderTop: "1px solid #e2e8f0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
  },
  buttonPrimary: {
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonSecondary: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
    background: "#fff",
  },
  editButton: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  dangerButton: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
  },
  errorBox: {
    padding: 16,
    margin: "0 20px",
    borderRadius: 12,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    fontWeight: 600,
  },
  successBox: {
    padding: 16,
    margin: "0 20px",
    borderRadius: 12,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1100,
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 13,
    color: "#475569",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #eef2f7",
    color: "#0f172a",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  empty: {
    padding: 32,
    textAlign: "center",
    color: "#64748b",
  },
  topStats: {
    padding: "0 20px 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  statCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    background: "#f8fafc",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },
  statMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
};

const getStatusTheme = (status) => {
  switch (status) {
    case "approved":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Approuvé",
      };
    case "pending":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "En attente",
      };
    case "rejected":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Rejeté",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
        label: status || "-",
      };
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
};

const cleanPayload = (payload) => {
  return {
    first_name: String(payload.first_name || "").trim(),
    last_name: String(payload.last_name || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    phone: String(payload.phone || "").trim(),
    status: String(payload.status || "approved").trim(),
  };
};

const StatCard = ({ label, value, meta }) => (
  <div style={styles.statCard}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statMeta}>{meta}</div>
  </div>
);

export default function OrganizationProfilesPage() {
  const { session } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getEmptyForm());

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getOrganizationFidels(
        {
          search,
          status: statusFilter,
        },
        session?.access_token
      );

      const normalizedProfiles = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setProfiles(normalizedProfiles);
    } catch (error) {
      console.error("Erreur chargement fidèles organization :", error);
      setProfiles([]);
      setErrorMessage(error?.message || "Impossible de charger les fidèles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [session?.access_token]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return profiles.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.first_name,
          item.last_name,
          item.email,
          item.phone,
          item.status,
          item.created_at,
          item.id,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" || String(item.status || "") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [profiles, search, statusFilter]);

  const stats = useMemo(() => {
    const total = profiles.length;
    const approved = profiles.filter((item) => item.status === "approved").length;
    const pending = profiles.filter((item) => item.status === "pending").length;
    const rejected = profiles.filter((item) => item.status === "rejected").length;

    return { total, approved, pending, rejected };
  }, [profiles]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      first_name: item.first_name || "",
      last_name: item.last_name || "",
      email: item.email || "",
      phone: item.phone || "",
      status: item.status || "approved",
    });
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setShowForm(false);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = cleanPayload(form);

      if (!payload.first_name) {
        setErrorMessage("Le prénom est obligatoire.");
        return;
      }

      if (!payload.last_name) {
        setErrorMessage("Le nom est obligatoire.");
        return;
      }

      if (!payload.email) {
        setErrorMessage("L’email est obligatoire.");
        return;
      }

      if (editingId) {
        await updateOrganizationFidel(editingId, payload, session?.access_token);
        setSuccessMessage("Fidèle modifié avec succès.");
      } else {
        const result = await createOrganizationFidel(payload, session?.access_token);
        setSuccessMessage(
          `Fidèle créé avec succès. Mot de passe provisoire : ${result.temporaryPassword}`
        );
      }

      setForm(getEmptyForm());
      setEditingId(null);
      setShowForm(false);
      await loadProfiles();
    } catch (error) {
      console.error("Erreur sauvegarde fidèle organization :", error);
      setErrorMessage(error?.message || "Impossible d’enregistrer le fidèle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Supprimer ce fidèle ?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteOrganizationFidel(id, session?.access_token);

      setSuccessMessage("Fidèle supprimé avec succès.");

      if (editingId === id) {
        handleCancel();
      }

      await loadProfiles();
    } catch (error) {
      console.error("Erreur suppression fidèle organization :", error);
      setErrorMessage(error?.message || "Impossible de supprimer le fidèle.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.card}>
          <div style={styles.header}>
            <div style={styles.titleBlock}>
              <h1 style={styles.title}>Gestion des fidèles</h1>
              <p style={styles.subtitle}>
                Consulte uniquement les fidèles rattachés à ton organisation,
                ajoute de nouveaux comptes et gère leurs informations.
              </p>
            </div>

            <button style={styles.buttonPrimary} onClick={handleOpenCreate}>
              Ajouter un fidèle
            </button>
          </div>

          <div style={styles.topStats}>
            <StatCard
              label="Total"
              value={loading ? "..." : stats.total}
              meta="Fidèles de l’organisation"
            />
            <StatCard
              label="Approuvés"
              value={loading ? "..." : stats.approved}
              meta="Comptes disponibles"
            />
            <StatCard
              label="En attente"
              value={loading ? "..." : stats.pending}
              meta="Comptes à suivre"
            />
            <StatCard
              label="Rejetés"
              value={loading ? "..." : stats.rejected}
              meta="Comptes supprimés ou rejetés"
            />
          </div>

          {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}
          {successMessage ? (
            <div style={styles.successBox}>{successMessage}</div>
          ) : null}

          <div style={styles.toolbar}>
            <div style={styles.toolbarRow}>
              <input
                style={styles.input}
                placeholder="Rechercher par prénom, nom, email, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                style={styles.input}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="approved">Approuvé</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>

          {showForm && (
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  name="first_name"
                  placeholder="Prénom"
                  value={form.first_name}
                  onChange={handleChange}
                />
                <input
                  style={styles.input}
                  name="last_name"
                  placeholder="Nom"
                  value={form.last_name}
                  onChange={handleChange}
                />
                <input
                  style={styles.input}
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
                <input
                  style={styles.input}
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                />
                <select
                  style={styles.input}
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="approved">Approuvé</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" style={styles.buttonPrimary} disabled={saving}>
                  {saving
                    ? editingId
                      ? "Enregistrement..."
                      : "Création..."
                    : editingId
                    ? "Enregistrer"
                    : "Créer le fidèle"}
                </button>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={handleCancel}
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
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Création</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td style={styles.td} colSpan={7}>
                      Chargement...
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td style={styles.empty} colSpan={7}>
                      Aucun fidèle trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((item) => {
                    const statusTheme = getStatusTheme(item.status);

                    return (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.first_name || "-"}</td>
                        <td style={styles.td}>{item.last_name || "-"}</td>
                        <td style={styles.td}>{item.email || "-"}</td>
                        <td style={styles.td}>{item.phone || "-"}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              ...statusTheme,
                            }}
                          >
                            {statusTheme.label}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDateTime(item.created_at)}</td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button
                              style={{ ...styles.iconButton, ...styles.editButton }}
                              onClick={() => handleEdit(item)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              style={{ ...styles.iconButton, ...styles.dangerButton }}
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              title="Supprimer"
                            >
                              🗑️
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
        </section>
      </div>
    </div>
  );
}