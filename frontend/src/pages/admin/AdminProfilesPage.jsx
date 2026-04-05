import { useEffect, useMemo, useState } from "react";
import {
  getProfiles,
  registerFidel,
  approveProfile,
} from "../../api/profilesApi";
import { getOrganizations } from "../../api/organizationsApi";
import { getSheepList } from "../../api/sheepApi";
import AdminProfilesManagementCard from "./AdminProfilesManagementCard";
import AdminProfilesModals from "./AdminProfilesModals";
import { useAuth } from "../../contexts/AuthContext";

const getEmptyForm = () => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  role: "fidel",
  status: "pending",
  organization_id: "",
  must_change_password: false,
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
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
  },
  toolbar: {
    padding: 20,
    display: "grid",
    gap: 16,
    borderTop: "1px solid #e2e8f0",
  },
  toolbarRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
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
  checkboxWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    border: "1px solid #dbe3f0",
    borderRadius: 12,
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
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
  successButton: {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
  },
  dangerButton: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
  },
  sheepButton: {
    border: "1px solid #ddd6fe",
    background: "#f5f3ff",
    color: "#6d28d9",
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
  clickableRow: {
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
  },
  empty: {
    padding: 32,
    textAlign: "center",
    color: "#64748b",
  },
  errorBox: {
    padding: 16,
    margin: 20,
    borderRadius: 12,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    fontWeight: 600,
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
    maxWidth: 760,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  assignModal: {
    width: "100%",
    maxWidth: 980,
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
  tdActions: {
    padding: "16px",
    borderBottom: "1px solid #eef2f7",
    color: "#0f172a",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    width: 170,
  },
  modalFooter: {
    padding: "18px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  sheepList: {
    display: "grid",
    gap: 10,
  },
  sheepRow: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    background: "#fff",
  },
  sheepMeta: {
    display: "grid",
    gap: 4,
  },
  sheepTitle: {
    fontWeight: 700,
    color: "#0f172a",
  },
  sheepSub: {
    color: "#64748b",
    fontSize: 13,
  },
  sheepBlock: {
    gridColumn: "1 / -1",
  },
  sheepTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    marginRight: 8,
    marginBottom: 8,
  },
};

const getStatusTheme = (status) => {
  switch (status) {
    case "pending":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "En attente",
      };
    case "approved":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Approuvé",
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

const getSheepStatusLabel = (status) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "assigned":
      return "Attribué";
    case "sacrificed":
      return "Sacrifié";
    case "missing":
      return "Manquant";
    default:
      return status || "-";
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
};

const getDisplayName = (item) => {
  const firstName = item?.first_name?.trim() || "";
  const lastName = item?.last_name?.trim() || "";
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (item?.email) return item.email;

  return "-";
};

const getOrganizationLabel = (item) => {
  if (!item?.organization) return "-";

  const name = item.organization.name || "";
  const type = item.organization.type || "";

  if (!name && !type) return "-";
  if (name && type) return `${name} (${type})`;
  return name || type || "-";
};

const cleanPayload = (payload) => {
  const cleaned = { ...payload };

  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === "") cleaned[key] = null;
  });

  cleaned.first_name = (cleaned.first_name || "").trim() || null;
  cleaned.last_name = (cleaned.last_name || "").trim() || null;
  cleaned.email = cleaned.email ? cleaned.email.trim().toLowerCase() : null;
  cleaned.phone = cleaned.phone ? cleaned.phone.trim() : null;

  return cleaned;
};

export default function AdminProfilesPage() {
  const { session } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sheep, setSheep] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [assigningSheepId, setAssigningSheepId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [assignProfile, setAssignProfile] = useState(null);

  const [form, setForm] = useState(getEmptyForm());
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("fidel");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sheepSearch, setSheepSearch] = useState("");
  const [sheepStatusFilter, setSheepStatusFilter] = useState("all");
  const [sheepColorFilter, setSheepColorFilter] = useState("all");
  const [sheepSizeFilter, setSheepSizeFilter] = useState("all");

  const loadPageData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [profilesData, organizationsData, sheepData] = await Promise.all([
        getProfiles({}, session?.access_token),
        getOrganizations(),
        getSheepList({ page: 1, limit: 1000 }),
      ]);

      const normalizedProfiles = Array.isArray(profilesData?.items)
        ? profilesData.items
        : Array.isArray(profilesData)
        ? profilesData
        : [];

      const normalizedOrganizations = Array.isArray(organizationsData?.items)
        ? organizationsData.items
        : Array.isArray(organizationsData)
        ? organizationsData
        : [];

      const normalizedSheep = Array.isArray(sheepData)
        ? sheepData
        : Array.isArray(sheepData?.items)
        ? sheepData.items
        : Array.isArray(sheepData?.data)
        ? sheepData.data
        : Array.isArray(sheepData?.results)
        ? sheepData.results
        : Array.isArray(sheepData?.rows)
        ? sheepData.rows
        : [];

      setProfiles(normalizedProfiles);
      setOrganizations(normalizedOrganizations);
      setSheep(normalizedSheep);
    } catch (error) {
      console.error("Erreur chargement page profiles :", error);
      setProfiles([]);
      setOrganizations([]);
      setSheep([]);
      setErrorMessage(error?.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [session?.access_token]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return profiles.filter((item) => {
      const displayName = getDisplayName(item);
      const organizationLabel = getOrganizationLabel(item);

      const matchesSearch =
        !term ||
        [
          item.first_name,
          item.last_name,
          displayName,
          item.email,
          item.phone,
          item.role,
          item.status,
          item.organization?.name,
          item.organization?.type,
          organizationLabel,
          item.organization_id,
          item.created_at,
          item.updated_at,
          item.deleted_at,
          item.created_by,
          item.updated_by,
          item.deleted_by,
          item.id,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesRole =
        roleFilter === "all" || String(item.role || "") === roleFilter;

      const matchesStatus =
        statusFilter === "all" || String(item.status || "") === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [profiles, search, roleFilter, statusFilter]);

  const sheepColorOptions = useMemo(() => {
    const values = sheep
      .map((item) => item.color)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return ["all", ...Array.from(new Set(values))];
  }, [sheep]);

  const sheepSizeOptions = useMemo(() => {
    const values = sheep
      .map((item) => item.size)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return ["all", ...Array.from(new Set(values))];
  }, [sheep]);

  const getAssignedSheepForProfile = (profileId) => {
    const normalizedProfileId = String(profileId || "").trim();

    return sheep.filter((item) => {
      const normalizedFidelId = String(item?.fidel_id || "").trim();
      return normalizedFidelId !== "" && normalizedFidelId === normalizedProfileId;
    });
  };

  const getAssignedSheepCountForProfile = (profileId) => {
    return getAssignedSheepForProfile(profileId).length;
  };

  const filteredSheepForAssign = useMemo(() => {
    const term = sheepSearch.trim().toLowerCase();
    const normalizedNumberTerm = term.replace(/^mouton\s*#?\s*/i, "").trim();
    const isNumberSearch =
      normalizedNumberTerm !== "" && /^\d+$/.test(normalizedNumberTerm);

    return sheep.filter((item) => {
      const sheepLabel = `mouton #${item.number || ""}`.toLowerCase();
      const sheepNumberLabel = `#${item.number || ""}`.toLowerCase();
      const statusLabel = getSheepStatusLabel(item.status).toLowerCase();

      const hasFidel =
        item.fidel_id !== null &&
        item.fidel_id !== undefined &&
        String(item.fidel_id).trim() !== "";

      const matchesStatus =
        sheepStatusFilter === "all"
          ? true
          : sheepStatusFilter === "available"
          ? !hasFidel && String(item.status || "").toLowerCase() === "available"
          : String(item.status || "").toLowerCase() ===
            sheepStatusFilter.toLowerCase();

      const matchesColor =
        sheepColorFilter === "all" ||
        String(item.color || "").toLowerCase() === sheepColorFilter.toLowerCase();

      const matchesSize =
        sheepSizeFilter === "all" ||
        String(item.size || "").toLowerCase() === sheepSizeFilter.toLowerCase();

      let matchesSearch = true;

      if (term) {
        if (isNumberSearch) {
          matchesSearch = String(item.number || "")
            .toLowerCase()
            .includes(normalizedNumberTerm);
        } else {
          matchesSearch = [
            item.number,
            sheepLabel,
            sheepNumberLabel,
            item.status,
            statusLabel,
            item.size,
            item.color,
            item.notes,
            item.id,
          ]
            .filter((value) => value !== null && value !== undefined)
            .some((value) => String(value).toLowerCase().includes(term));
        }
      }

      return matchesStatus && matchesColor && matchesSize && matchesSearch;
    });
  }, [
    sheep,
    sheepSearch,
    sheepStatusFilter,
    sheepColorFilter,
    sheepSizeFilter,
  ]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setShowForm(true);
    setErrorMessage("");
  };

  const handleOpenAssignModal = (profile) => {
    setAssignProfile(profile);
    setSheepSearch("");
    setSheepStatusFilter("available");
    setSheepColorFilter("all");
    setSheepSizeFilter("all");
    setErrorMessage(
      "L’attribution de mouton doit passer par une route backend sécurisée. Cette action n’est pas encore branchée ici."
    );
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      first_name: item.first_name || "",
      last_name: item.last_name || "",
      email: item.email || "",
      phone: item.phone || "",
      role: item.role || "fidel",
      status: item.status || "pending",
      organization_id: item.organization_id || "",
      must_change_password: Boolean(item.must_change_password),
    });
    setShowForm(true);
    setErrorMessage(
      "La modification de profil n’est pas encore branchée côté backend."
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setShowForm(false);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");

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

      if (!editingId && !payload.organization_id) {
        setErrorMessage("L’organisation est obligatoire.");
        return;
      }

      if (editingId) {
        setErrorMessage(
          "La modification de profil n’est pas encore branchée côté backend."
        );
        return;
      }

      const result = await registerFidel(payload, session?.access_token);
      alert(
        `Fidèle créé avec succès. Mot de passe provisoire : ${result.temporaryPassword}`
      );

      setEditingId(null);
      setForm(getEmptyForm());
      setShowForm(false);
      await loadPageData();
    } catch (error) {
      console.error("Erreur sauvegarde profile :", error);
      setErrorMessage(error?.message || "Impossible d’enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Supprimer ce profil ?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setErrorMessage(
        "La suppression de profil n’est pas encore branchée côté backend."
      );

      if (editingId === id) handleCancel();
      if (selectedProfile?.id === id) setSelectedProfile(null);
    } catch (error) {
      console.error("Erreur suppression profile :", error);
      setErrorMessage(error?.message || "Impossible de supprimer le profil.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      setErrorMessage("");
      await approveProfile(id, session?.access_token);
      await loadPageData();
    } catch (error) {
      console.error("Erreur validation profile :", error);
      setErrorMessage(error?.message || "Impossible de valider le profil.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleAssignSheep = async () => {
    setAssigningSheepId(null);
    setErrorMessage(
      "L’attribution de mouton doit passer par une route backend sécurisée. Cette action n’est pas encore branchée ici."
    );
  };

  const selectedProfileSheep = useMemo(() => {
    if (!selectedProfile?.id) return [];
    return getAssignedSheepForProfile(selectedProfile.id);
  }, [selectedProfile, sheep]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <AdminProfilesManagementCard
          styles={styles}
          loading={loading}
          saving={saving}
          deletingId={deletingId}
          approvingId={approvingId}
          profiles={filteredProfiles}
          organizations={organizations}
          form={form}
          showForm={showForm}
          editingId={editingId}
          errorMessage={errorMessage}
          search={search}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          setSearch={setSearch}
          setRoleFilter={setRoleFilter}
          setStatusFilter={setStatusFilter}
          onOpenCreate={handleOpenCreate}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onRowClick={setSelectedProfile}
          onEdit={handleEdit}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onOpenAssignModal={handleOpenAssignModal}
          getOrganizationLabel={getOrganizationLabel}
          getAssignedSheepCountForProfile={getAssignedSheepCountForProfile}
        />
      </div>

      <AdminProfilesModals
        styles={styles}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        assignProfile={assignProfile}
        setAssignProfile={setAssignProfile}
        selectedProfileSheep={selectedProfileSheep}
        filteredSheepForAssign={filteredSheepForAssign}
        sheep={sheep}
        sheepSearch={sheepSearch}
        setSheepSearch={setSheepSearch}
        sheepStatusFilter={sheepStatusFilter}
        setSheepStatusFilter={setSheepStatusFilter}
        sheepColorFilter={sheepColorFilter}
        setSheepColorFilter={setSheepColorFilter}
        sheepSizeFilter={sheepSizeFilter}
        setSheepSizeFilter={setSheepSizeFilter}
        sheepColorOptions={sheepColorOptions}
        sheepSizeOptions={sheepSizeOptions}
        assigningSheepId={assigningSheepId}
        onAssignSheep={handleAssignSheep}
        onEdit={handleEdit}
        onApprove={handleApprove}
        getActorLabel={getActorLabel}
        onOpenAssignModal={handleOpenAssignModal}
        getDisplayName={getDisplayName}
        getOrganizationLabel={getOrganizationLabel}
        getStatusTheme={getStatusTheme}
        getSheepStatusLabel={getSheepStatusLabel}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}