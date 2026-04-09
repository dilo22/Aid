import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../api/organizationsApi";
import { getApprovedProfiles } from "../../api/profilesApi";
import AdminOrganizationsManagementCard from "./AdminOrganizationsManagementCard";
import AdminOrganizationsModal from "./AdminOrganizationsModal";
import "../../styles/AdminOrganizations.css";

const EMPTY_FORM = {
  name: "", type: "", address: "", city: "", phone: "", email: "", is_active: true,
};

const getStatusTheme = (isActive) =>
  isActive
    ? { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Active" }
    : { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Inactive" };

const getProfileDisplayName = (profile) => {
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return name || profile?.email || "-";
};

const PAGE_LIMIT = 20;

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [orgMeta,       setOrgMeta]       = useState({ total: 0, page: 1, totalPages: 1 });
  const [profiles,      setProfiles]      = useState([]);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [editingId,     setEditingId]     = useState(null);
  const [selectedOrg,   setSelectedOrg]   = useState(null);

  const [loading,         setLoading]         = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [deletingId,      setDeletingId]      = useState(null);
  const [showForm,        setShowForm]        = useState(false);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [cityFilter,   setCityFilter]   = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);

  // ===== CHARGEMENT =====

  const loadOrganizations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await getOrganizations({
        page,
        limit:  PAGE_LIMIT,
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type:   typeFilter   !== "all" ? typeFilter   : undefined,
        city:   cityFilter   !== "all" ? cityFilter   : undefined,
      });
      setOrganizations(Array.isArray(data) ? data : data?.items ?? []);
      setOrgMeta(data?.meta ?? { total: 0, page: 1, totalPages: 1 });
    } catch (error) {
      console.error("[AdminOrganizationsPage] load:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, cityFilter]);

  const loadProfiles = async () => {
    try {
      setProfilesLoading(true);
      const data = await getApprovedProfiles();
      setProfiles(Array.isArray(data) ? data : data?.items ?? []);
    } catch (error) {
      console.error("[AdminOrganizationsPage] loadProfiles:", error);
    } finally {
      setProfilesLoading(false);
    }
  };
useEffect(() => {
  loadProfiles();
}, []);

// ✅ Un seul useEffect pour les filtres ET la pagination
useEffect(() => {
  loadOrganizations(currentPage);
}, [currentPage, search, statusFilter, typeFilter, cityFilter]);

// ✅ Reset page séparé — ne déclenche pas loadOrganizations directement
useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter, typeFilter, cityFilter]);
  // ===== FORM =====

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (org) => {
    setEditingId(org.id);
    setForm({
      name:      org.name      || "",
      type:      org.type      || "",
      address:   org.address   || "",
      city:      org.city      || "",
      phone:     org.phone     || "",
      email:     org.email     || "",
      is_active: org.is_active ?? true,
    });
    setSelectedOrg(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateOrganization(editingId, form);
      } else {
        await createOrganization(form);
      }
      handleCancel();
      await loadOrganizations(currentPage);
    } catch (error) {
      console.error("[AdminOrganizationsPage] handleSubmit:", error);
      alert(error?.message || "Impossible d'enregistrer l'organisation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" ?`)) return;
    setDeletingId(id);
    try {
      await deleteOrganization(id);
      await loadOrganizations(currentPage);
      if (editingId       === id) handleCancel();
      if (selectedOrg?.id === id) setSelectedOrg(null);
    } catch (error) {
      console.error("[AdminOrganizationsPage] handleDelete:", error);
      alert(error?.message || "Impossible de supprimer.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== MEMO =====

  const profilesByOrg = useMemo(() => {
    const map = new Map();
    for (const profile of profiles) {
      const orgId = profile?.organization_id;
      if (!orgId) continue;
      if (!map.has(orgId)) map.set(orgId, []);
      map.get(orgId).push(profile);
    }
    return map;
  }, [profiles]);

  const getProfilesForOrg      = (orgId) => profilesByOrg.get(orgId) ?? [];
  const getProfilesCountForOrg = (orgId) => getProfilesForOrg(orgId).length;

  // ✅ Options de villes depuis toutes les orgs (pas juste la page courante)
  const cityOptions = useMemo(() =>
    [...new Set(organizations.map((o) => o.city).filter(Boolean))],
    [organizations]
  );

  // ✅ Filtrage local supprimé — géré côté backend
  const filteredOrganizations = organizations;

  const selectedOrgProfiles = useMemo(
    () => selectedOrg ? getProfilesForOrg(selectedOrg.id) : [],
    [selectedOrg, profilesByOrg]
  );

  return (
    <div className="org-page">
      <div className="org-container">
        <AdminOrganizationsManagementCard
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
          cityOptions={cityOptions}
          filteredOrganizations={filteredOrganizations}
          onChange={handleChange}
          onOpenCreate={handleOpenCreate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={setSelectedOrg}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setTypeFilter={setTypeFilter}
          setCityFilter={setCityFilter}
          getStatusTheme={getStatusTheme}
          getProfilesCountForOrganization={getProfilesCountForOrg}
          // ✅ Pagination
          meta={orgMeta}
          onPageChange={setCurrentPage}
        />
      </div>

      <AdminOrganizationsModal
        selectedOrganization={selectedOrg}
        selectedOrganizationProfiles={selectedOrgProfiles}
        deletingId={deletingId}
        setSelectedOrganization={setSelectedOrg}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusTheme={getStatusTheme}
        getProfileDisplayName={getProfileDisplayName}
      />
    </div>
  );
}