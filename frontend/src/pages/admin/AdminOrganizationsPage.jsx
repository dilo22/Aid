import { useEffect, useMemo, useState } from "react";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../api/organizationsApi";
import { getApprovedProfiles } from "../../api/profilesApi"; // ✅ plus getProfiles
import AdminOrganizationsManagementCard from "./AdminOrganizationsManagementCard";
import AdminOrganizationsModal from "./AdminOrganizationsModal";
import "../../styles/AdminOrganizations.css";

const EMPTY_FORM = {
  name:      "",
  type:      "",
  address:   "",
  city:      "",
  phone:     "",
  email:     "",
  is_active: true,
};

const getStatusTheme = (isActive) =>
  isActive
    ? { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Active" }
    : { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Inactive" };

const getProfileDisplayName = (profile) => {
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return name || profile?.email || "-";
};

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [profiles,      setProfiles]      = useState([]);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [editingId,     setEditingId]     = useState(null);
  const [selectedOrg,   setSelectedOrg]   = useState(null);

  const [loading,        setLoading]        = useState(false);
  const [profilesLoading,setProfilesLoading]= useState(false);
  const [saving,         setSaving]         = useState(false);
  const [deletingId,     setDeletingId]     = useState(null);
  const [showForm,       setShowForm]       = useState(false);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [cityFilter,   setCityFilter]   = useState("all");

  // ===== CHARGEMENT =====

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();
      setOrganizations(Array.isArray(data) ? data : data?.items ?? []);
    } catch (error) {
      console.error("[AdminOrganizationsPage] loadOrganizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setProfilesLoading(true);
      // ✅ getApprovedProfiles — un seul appel, profils actifs uniquement
      const data = await getApprovedProfiles();
      setProfiles(Array.isArray(data) ? data : data?.items ?? []);
    } catch (error) {
      console.error("[AdminOrganizationsPage] loadProfiles:", error);
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
    loadProfiles();
  }, []);

  // ===== FORM =====

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        // ✅ temporaryPassword supprimé du backend — on informe simplement
        alert("Organisation créée. Le mot de passe provisoire a été envoyé par email à l'organisation.");
      }
      handleCancel();
      await Promise.all([loadOrganizations(), loadProfiles()]);
    } catch (error) {
      console.error("[AdminOrganizationsPage] handleSubmit:", error);
      alert(error?.message || "Impossible d'enregistrer l'organisation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return;

    setDeletingId(id);
    try {
      await deleteOrganization(id);
      await loadOrganizations();
      if (editingId === id)       handleCancel();
      if (selectedOrg?.id === id) setSelectedOrg(null);
    } catch (error) {
      console.error("[AdminOrganizationsPage] handleDelete:", error);
      // ✅ Feedback utilisateur sur l'erreur
      alert(error?.message || "Impossible de supprimer l'organisation.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== MEMO =====

  // ✅ Map des profils par organisation — O(n) au lieu de O(n×m)
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

  const cityOptions = useMemo(() => {
    const cities = [...new Set(organizations.map((o) => o.city).filter(Boolean))];
    return cities;
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return organizations.filter((org) => {
      const matchSearch = !term || [org.name, org.type, org.address, org.city, org.phone, org.email]
        .filter(Boolean).some((v) => v.toLowerCase().includes(term));
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active"   &&  org.is_active) ||
        (statusFilter === "inactive" && !org.is_active);
      const matchType = typeFilter === "all" || org.type === typeFilter;
      const matchCity = cityFilter === "all" || org.city === cityFilter;
      return matchSearch && matchStatus && matchType && matchCity;
    });
  }, [organizations, search, statusFilter, typeFilter, cityFilter]);

  const selectedOrgProfiles = useMemo(
    () => (selectedOrg ? getProfilesForOrg(selectedOrg.id) : []),
    [selectedOrg, profilesByOrg]
  );

  // ===== RENDER =====

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