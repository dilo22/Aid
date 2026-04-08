import { useEffect, useMemo, useState } from "react";
import {
  getProfiles,
  registerFidel,
  approveProfile,
  rejectProfile,
  updateAdminProfile
} from "../../api/profilesApi";
import { getOrganizations } from "../../api/organizationsApi";
import { getSheepList } from "../../api/sheepApi";
import { assignSheep } from "../../api/usersApi";
import AdminProfilesManagementCard from "./AdminProfilesManagementCard";
import AdminProfilesModals from "./AdminProfilesModals";
import { SHEEP_SIZES } from "../../constants/sheep";
import "../../styles/AdminProfiles.css";

// ===== HELPERS =====

const EMPTY_FORM = () => ({
  first_name:           "",
  last_name:            "",
  email:                "",
  phone:                "",
  role:                 "fidel",
  status:               "pending",
  organization_id:      "",
  must_change_password: false,
});

const getDisplayName = (item) => {
  const name = `${item?.first_name || ""} ${item?.last_name || ""}`.trim();
  return name || item?.email || "-";
};

const getOrganizationLabel = (item) => {
  if (!item?.organization) return "-";
  const { name, type } = item.organization;
  if (name && type) return `${name} (${type})`;
  return name || type || "-";
};

const getStatusTheme = (status) => {
  const themes = {
    pending:  { background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74", label: "En attente" },
    approved: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Approuvé" },
    rejected: { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Rejeté" },
  };
  return themes[status] ?? { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", label: status || "-" };
};

const getSheepStatusLabel = (status) => ({
  available:  "Disponible",
  assigned:   "Assigné",
  sacrificed: "Sacrifié",
  missing:    "Manquant",
}[status] ?? status ?? "-");

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("fr-FR") : "-";

const cleanPayload = (payload) => {
  const cleaned = { ...payload };
  return {
    ...cleaned,
    first_name:      (cleaned.first_name || "").trim()  || null,
    last_name:       (cleaned.last_name  || "").trim()  || null,
    email:           cleaned.email ? cleaned.email.trim().toLowerCase() : null,
    phone:           cleaned.phone ? cleaned.phone.trim() : null,
    organization_id: cleaned.organization_id || null,
  };
};

// ===== PAGE =====

export default function AdminProfilesPage() {
  const [profiles,      setProfiles]      = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [sheep,         setSheep]         = useState([]);

  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [deletingId,       setDeletingId]       = useState(null);
  const [approvingId,      setApprovingId]      = useState(null);
  const [assigningSheepId, setAssigningSheepId] = useState(null);

  const [showForm,         setShowForm]         = useState(false);
  const [editingId,        setEditingId]        = useState(null);
  const [selectedProfile,  setSelectedProfile]  = useState(null);
  const [assignProfile,    setAssignProfile]    = useState(null);

  const [form,         setForm]         = useState(EMPTY_FORM());
  const [errorMessage, setErrorMessage] = useState("");

  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("fidel");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sheepSearch,       setSheepSearch]       = useState("");
  const [sheepStatusFilter, setSheepStatusFilter] = useState("available");
  const [sheepColorFilter,  setSheepColorFilter]  = useState("all");
  const [sheepSizeFilter,   setSheepSizeFilter]   = useState("all");

  // ===== CHARGEMENT =====

  const loadPageData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [profilesData, orgsData, sheepData] = await Promise.all([
        getProfiles(),           // ✅ pas de token manuel — intercepteur axios s'en charge
        getOrganizations(),
        getSheepList({ page: 1, limit: 100 }), // ✅ aligné avec le plafond backend
      ]);

      setProfiles(Array.isArray(profilesData) ? profilesData : profilesData?.items ?? []);
      setOrganizations(Array.isArray(orgsData) ? orgsData : orgsData?.items ?? []);
      setSheep(Array.isArray(sheepData?.items) ? sheepData.items : Array.isArray(sheepData) ? sheepData : []);
    } catch (error) {
      console.error("[AdminProfilesPage] loadPageData:", error);
      setErrorMessage(error?.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pas de dépendance sur session?.access_token — évite rechargement à chaque refresh token
  useEffect(() => { loadPageData(); }, []);

  // ===== FILTRES =====

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((item) => {
      const matchSearch = !term || [
        item.first_name, item.last_name, item.email,
        item.phone, item.role, item.status,
        item.organization?.name, item.organization?.type,
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));

      const matchRole   = roleFilter   === "all" || item.role   === roleFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [profiles, search, roleFilter, statusFilter]);

  // ✅ Couleurs des moutons depuis les données (dynamique)
  const sheepColorOptions = useMemo(() =>
    [...new Set(sheep.map((s) => s.color).filter(Boolean))],
    [sheep]
  );

  // ===== MAP MOUTONS PAR PROFIL — O(n) =====
  const sheepByProfile = useMemo(() => {
    const map = new Map();
    for (const s of sheep) {
      if (!s.fidel_id) continue;
      if (!map.has(s.fidel_id)) map.set(s.fidel_id, []);
      map.get(s.fidel_id).push(s);
    }
    return map;
  }, [sheep]);

  const getAssignedSheepForProfile  = (id) => sheepByProfile.get(id) ?? [];
  const getAssignedSheepCountForProfile = (id) => getAssignedSheepForProfile(id).length;

  // ===== FILTRES MOUTONS ATTRIBUTION =====
  const filteredSheepForAssign = useMemo(() => {
    const term = sheepSearch.trim().toLowerCase();
    const numTerm = term.replace(/^mouton\s*#?\s*/i, "").trim();
    const isNumSearch = numTerm !== "" && /^\d+$/.test(numTerm);

    return sheep.filter((item) => {
      const hasFidel = !!item.fidel_id;

      const matchStatus =
        sheepStatusFilter === "all" ? true
        : sheepStatusFilter === "available" ? !hasFidel && item.status === "available"
        : item.status === sheepStatusFilter;

      const matchColor = sheepColorFilter === "all" || item.color === sheepColorFilter;
      const matchSize  = sheepSizeFilter  === "all" || item.size  === sheepSizeFilter;

      const matchSearch = !term || (
        isNumSearch
          ? String(item.number || "").includes(numTerm)
          : [item.number, item.status, item.size, item.color, item.notes, item.id]
              .filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
      );

      return matchStatus && matchColor && matchSize && matchSearch;
    });
  }, [sheep, sheepSearch, sheepStatusFilter, sheepColorFilter, sheepSizeFilter]);

  // ===== HANDLERS =====

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setShowForm(true);
    setErrorMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      first_name:           item.first_name      || "",
      last_name:            item.last_name        || "",
      email:                item.email            || "",
      phone:                item.phone            || "",
      role:                 item.role             || "fidel",
      status:               item.status           || "pending",
      organization_id:      item.organization_id  || "",
      must_change_password: Boolean(item.must_change_password),
    });
    setShowForm(true);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setShowForm(false);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  const payload = cleanPayload(form);

  if (!payload.first_name) {
    return setErrorMessage("Le prénom est obligatoire.");
  }

  if (!payload.last_name) {
    return setErrorMessage("Le nom est obligatoire.");
  }

  if (!payload.email) {
    return setErrorMessage("L'email est obligatoire.");
  }

  if (!payload.organization_id) {
    return setErrorMessage("L'organisation est obligatoire.");
  }

  setSaving(true);

  try {
    if (editingId) {
      await updateAdminProfile(editingId, payload);
      alert("Profil modifié avec succès.");
    } else {
      await registerFidel(payload);
      alert(
        "Fidèle créé avec succès. Le mot de passe provisoire a été envoyé par email."
      );
    }

    handleCancel();
    await loadPageData();
  } catch (error) {
    console.error("[AdminProfilesPage] handleSubmit:", error);
    setErrorMessage(
      error?.message || "Impossible d'enregistrer le profil."
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce profil définitivement ?")) return;
    // ✅ TODO — brancher deleteProfile quand disponible côté backend
    setErrorMessage("La suppression de profil n'est pas encore disponible.");
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    setErrorMessage("");
    try {
      await approveProfile(id);
      await loadPageData();
    } catch (error) {
      console.error("[AdminProfilesPage] handleApprove:", error);
      setErrorMessage(error?.message || "Impossible de valider le profil.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenAssignModal = (profile) => {
    setAssignProfile(profile);
    setSheepSearch("");
    setSheepStatusFilter("available");
    setSheepColorFilter("all");
    setSheepSizeFilter("all");
    setErrorMessage("");
  };

  const handleAssignSheep = async (sheep) => {
    if (!assignProfile) return;
    setAssigningSheepId(sheep.id);
    try {
      // ✅ Appel API réel via usersApi
      await assignSheep(assignProfile.id, sheep.id);
      await loadPageData();
      setAssignProfile(null);
    } catch (error) {
      console.error("[AdminProfilesPage] handleAssignSheep:", error);
      setErrorMessage(error?.message || "Impossible d'attribuer le mouton.");
    } finally {
      setAssigningSheepId(null);
    }
  };

  const selectedProfileSheep = useMemo(
    () => selectedProfile ? getAssignedSheepForProfile(selectedProfile.id) : [],
    [selectedProfile, sheepByProfile]
  );

  // ===== RENDER =====

  return (
    <div className="profiles-page">
      <div className="profiles-container">
        <AdminProfilesManagementCard
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
        assigningSheepId={assigningSheepId}
        onAssignSheep={handleAssignSheep}
        onEdit={handleEdit}
        onApprove={handleApprove}
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