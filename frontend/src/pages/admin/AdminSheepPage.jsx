import { useEffect, useMemo, useState } from "react";
import { useSheepManagement } from "../../hooks/useSheepManagement";
import { getApprovedProfiles } from "../../api/profilesApi";
import { getPaymentsBySheepId } from "../../api/paymentsApi";
import AdminSheepManagementCard from "./AdminSheepManagementCard";
import AdminSheepModal from "./AdminSheepModal";
import { SHEEP_SIZES } from "../../constants/sheep";
import "../../styles/AdminSheep.css";

// ===== HELPERS =====

const EMPTY_FORM = {
  number: "",
  photo_url: "",
  weight: "",
  price: "",
  discount_amount: "",
  final_price: "",
  size: "",
  color: "",
  status: "available",
  payment_due_date: "",
  payment_notes: "",
  notes: "",
};

const normalizeMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

const formatWeight = (v) => (v ?? "") === "" ? "-" : `${v} kg`;
const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString("fr-FR") : "-";
const formatDateTime = (v) =>
  v ? new Date(v).toLocaleString("fr-FR") : "-";

const getProfileDisplayName = (profile) => {
  if (!profile) return "-";
  const name = `${profile.first_name || ""} ${
    profile.last_name || ""
  }`.trim();
  return name || profile.email || "-";
};

const getRealSheepStatus = (item) => {
  const status = String(item?.status || "").toLowerCase();
  if (status === "sacrificed" || status === "missing") return status;
  if (item?.fidel_id) return "assigned";
  return status || "available";
};

const getExpectedAmount = (item) => {
  if (item?.final_price != null && item?.final_price !== "") {
    return Math.max(normalizeMoney(item.final_price), 0);
  }
  return Math.max(
    normalizeMoney(item?.price) -
      normalizeMoney(item?.discount_amount),
    0
  );
};

// ===== PAGE =====

export default function AdminSheepPage() {
  const {
    sheep = [],
    filters,
    meta,
    loading,
    refresh,
    setFilters,
    goToPage,
    setLimit,
    createSheep,
    updateSheep,
    deleteSheep,
  } = useSheepManagement();

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSheep, setSelectedSheep] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const search = filters.search || "";
  const statusFilter = filters.status || "all";
  const sizeFilter = filters.size || "all";
  const colorFilter = filters.color || "all";

  // ===== PROFILS =====
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);
        const data = await getApprovedProfiles();
        setProfiles(Array.isArray(data) ? data : data?.items ?? []);
      } catch {
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const profilesMap = useMemo(() => {
    const map = new Map();
    profiles.forEach((p) => map.set(String(p.id), p));
    return map;
  }, [profiles]);

  const getAssignedProfile = (item) =>
    item?.fidel_id
      ? profilesMap.get(String(item.fidel_id)) ?? null
      : null;

  const getAssignedProfileName = (item) =>
    getProfileDisplayName(getAssignedProfile(item));

  // ===== HANDLERS FILTRES =====

  const handleSearch = (v) => setFilters({ search: v, page: 1 });
  const handleStatus = (v) =>
    setFilters({ status: v === "all" ? "" : v, page: 1 });
  const handleSize = (v) =>
    setFilters({ size: v === "all" ? "" : v, page: 1 });
  const handleColor = (v) =>
    setFilters({ color: v === "all" ? "" : v, page: 1 });

  const handleSort = (value) => {
    const map = {
      recent: { sortBy: "created_at", sortOrder: "desc" },
      number_asc: { sortBy: "number", sortOrder: "asc" },
      number_desc: { sortBy: "number", sortOrder: "desc" },
      price_asc: { sortBy: "price", sortOrder: "asc" },
      price_desc: { sortBy: "price", sortOrder: "desc" },
    };
    setFilters({ ...(map[value] || map.recent), page: 1 });
  };

  // ===== FORM =====

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await updateSheep(editingId, form);
      else await createSheep(form);
      await refresh();
      setShowForm(false);
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    setDeletingId(id);
    try {
      await deleteSheep(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ===== PAGINATION =====
  const sortValue =
    filters.sortBy === "number" && filters.sortOrder === "asc"
      ? "number_asc"
      : filters.sortBy === "number"
      ? "number_desc"
      : filters.sortBy === "price" && filters.sortOrder === "asc"
      ? "price_asc"
      : filters.sortBy === "price"
      ? "price_desc"
      : "recent";

  // ===== RENDER =====

  return (
    <div className="sheep-page">
      <div className="sheep-container">

        {errorMessage && <div className="sheep-error">{errorMessage}</div>}

        <AdminSheepManagementCard
          loading={loading}
          profilesLoading={profilesLoading}
          saving={saving}
          deletingId={deletingId}
          showForm={showForm}
          editingId={editingId}
          form={form}

          search={search}
          statusFilter={statusFilter}
          sizeFilter={sizeFilter}
          colorFilter={colorFilter}
          sortBy={sortValue}

          sizeOptions={SHEEP_SIZES}
          colorOptions={[...new Set(sheep.map((s) => s.color).filter(Boolean))]}

          filteredSheep={sheep}
          meta={meta}
          onPageChange={goToPage}
          onLimitChange={setLimit}

          onRefresh={refresh}
          onOpenCreate={handleOpenCreate}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }))
          }
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={setSelectedSheep}

          setSearch={handleSearch}
          setStatusFilter={handleStatus}
          setSizeFilter={handleSize}
          setColorFilter={handleColor}
          setSortBy={handleSort}

          getRealSheepStatus={getRealSheepStatus}
          getAssignedProfileName={getAssignedProfileName}
          formatPrice={formatMoney}
          formatWeight={formatWeight}
          formatDate={formatDate}
        />
      </div>

      <AdminSheepModal
        selectedSheep={selectedSheep}
        setSelectedSheep={setSelectedSheep}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatPrice={formatMoney}
        formatWeight={formatWeight}
        formatDateTime={formatDateTime}
        payments={payments}
        paymentsLoading={paymentsLoading}
        paymentsSummary={paymentsSummary}
      />
    </div>
  );
}