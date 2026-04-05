import { useEffect, useMemo, useState } from "react";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../api/organizationsApi";
import { getProfiles } from "../../api/profilesApi";
import AdminOrganizationsManagementCard from "./AdminOrganizationsManagementCard";
import AdminOrganizationsModal from "./AdminOrganizationsModal";

const emptyForm = {
  name: "",
  type: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  is_active: true,
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 24,
  },
  container: {
    maxWidth: 1400,
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
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
  },
  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
  editIconButton: {
    width: 36,
    height: 36,
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    background: "#eff6ff",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    border: "1px solid #fecaca",
    borderRadius: 10,
    background: "#fff1f2",
    color: "#be123c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
  },
  toolbar: {
    padding: 20,
    display: "grid",
    gap: 16,
  },
  toolbarRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
  },
  form: {
    padding: 20,
    display: "grid",
    gap: 16,
    borderTop: "1px solid #e2e8f0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  label: {
    display: "grid",
    gap: 8,
    fontWeight: 600,
    color: "#0f172a",
    fontSize: 14,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1050,
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
  clickableRow: {
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  empty: {
    padding: 32,
    textAlign: "center",
    color: "#64748b",
  },
  badgeBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: 860,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
  },
  modalBody: {
    padding: 24,
    display: "grid",
    gap: 14,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  detailCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    background: "#f8fafc",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailValue: {
    color: "#0f172a",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  detailBlock: {
    gridColumn: "1 / -1",
  },
  memberList: {
    display: "grid",
    gap: 10,
    marginTop: 8,
  },
  memberItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#fff",
    display: "grid",
    gap: 4,
  },
  memberName: {
    fontWeight: 700,
    color: "#0f172a",
  },
  memberSub: {
    fontSize: 13,
    color: "#64748b",
  },
  modalFooter: {
    padding: "18px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
};

const getStatusTheme = (isActive) => {
  if (isActive) {
    return {
      background: "#ecfdf5",
      color: "#047857",
      border: "1px solid #a7f3d0",
      label: "Active",
    };
  }

  return {
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    label: "Inactive",
  };
};

const getProfileDisplayName = (profile) => {
  const firstName = String(profile?.first_name || "").trim();
  const lastName = String(profile?.last_name || "").trim();
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (profile?.email) return profile.email;

  return "-";
};

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();

      const normalizedOrganizations = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setOrganizations(normalizedOrganizations);
    } catch (error) {
      console.error("Erreur chargement organisations :", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setProfilesLoading(true);
      const data = await getProfiles();

      const normalizedProfiles = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setProfiles(normalizedProfiles);
    } catch (error) {
      console.error("Erreur chargement profils :", error);
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
    loadProfiles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (organization) => {
    setEditingId(organization.id);
    setForm({
      name: organization.name || "",
      type: organization.type || "",
      address: organization.address || "",
      city: organization.city || "",
      phone: organization.phone || "",
      email: organization.email || "",
      is_active: organization.is_active ?? true,
    });
    setSelectedOrganization(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await updateOrganization(editingId, form);
      } else {
        const result = await createOrganization(form);

        if (result?.temporaryPassword) {
          alert(
            `Organisation créée avec succès.\n\nEmail : ${form.email}\nMot de passe provisoire : ${result.temporaryPassword}\n\nCe mot de passe n'est affiché qu'une seule fois.`
          );
        }
      }

      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);
      await loadOrganizations();
      await loadProfiles();
    } catch (error) {
      console.error("Erreur sauvegarde organisation :", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Impossible d’enregistrer l’organisation."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'organisation "${name}" ?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteOrganization(id);
      await loadOrganizations();

      if (editingId === id) handleCancel();
      if (selectedOrganization?.id === id) setSelectedOrganization(null);
    } catch (error) {
      console.error("Erreur suppression organisation :", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getProfilesForOrganization = (organizationId) => {
    const normalizedOrganizationId = String(organizationId || "").trim();

    return profiles.filter((profile) => {
      const profileOrganizationId = String(profile?.organization_id || "").trim();
      return (
        normalizedOrganizationId !== "" &&
        profileOrganizationId !== "" &&
        profileOrganizationId === normalizedOrganizationId
      );
    });
  };

  const getProfilesCountForOrganization = (organizationId) => {
    return getProfilesForOrganization(organizationId).length;
  };

  const typeOptions = useMemo(() => {
    const values = organizations
      .map((org) => org.type)
      .filter(Boolean)
      .map((value) => value.trim());

    return ["all", ...Array.from(new Set(values))];
  }, [organizations]);

  const cityOptions = useMemo(() => {
    const values = organizations
      .map((org) => org.city)
      .filter(Boolean)
      .map((value) => value.trim());

    return ["all", ...Array.from(new Set(values))];
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesSearch =
        !term ||
        [org.name, org.type, org.address, org.city, org.phone, org.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && org.is_active) ||
        (statusFilter === "inactive" && !org.is_active);

      const matchesType =
        typeFilter === "all" || (org.type || "") === typeFilter;

      const matchesCity =
        cityFilter === "all" || (org.city || "") === cityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCity;
    });
  }, [organizations, search, statusFilter, typeFilter, cityFilter]);

  const selectedOrganizationProfiles = useMemo(() => {
    if (!selectedOrganization?.id) return [];
    return getProfilesForOrganization(selectedOrganization.id);
  }, [selectedOrganization, profiles]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <AdminOrganizationsManagementCard
          styles={styles}
          loading={loading}
          profilesLoading={profilesLoading}
          saving={saving}
          deletingId={deletingId}
          showForm={showForm}
          editingId={editingId}
          form={form}
          search={search}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          cityFilter={cityFilter}
          typeOptions={typeOptions}
          cityOptions={cityOptions}
          filteredOrganizations={filteredOrganizations}
          onChange={handleChange}
          onOpenCreate={handleOpenCreate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={setSelectedOrganization}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setTypeFilter={setTypeFilter}
          setCityFilter={setCityFilter}
          getStatusTheme={getStatusTheme}
          getProfilesCountForOrganization={getProfilesCountForOrganization}
        />
      </div>

      <AdminOrganizationsModal
        styles={styles}
        selectedOrganization={selectedOrganization}
        selectedOrganizationProfiles={selectedOrganizationProfiles}
        deletingId={deletingId}
        setSelectedOrganization={setSelectedOrganization}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusTheme={getStatusTheme}
        getProfileDisplayName={getProfileDisplayName}
      />
    </div>
  );
}