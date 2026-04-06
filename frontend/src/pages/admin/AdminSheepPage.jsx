import { useEffect, useMemo, useState } from "react";
import { useSheepManagement } from "../../hooks/useSheepManagement";
import { getApprovedProfiles } from "../../api/profilesApi"; // ✅ un seul appel
import { getPaymentsBySheepId } from "../../api/paymentsApi";
import AdminSheepManagementCard from "./AdminSheepManagementCard";
import AdminSheepModal from "./AdminSheepModal";
import { SHEEP_SIZES } from "../../constants/sheep"; // ✅ constante
import "../../styles/AdminSheep.css";

// ===== HELPERS =====

const EMPTY_FORM = {
  number:           "",
  photo_url:        "",
  weight:           "",
  price:            "",
  discount_amount:  "",
  final_price:      "",
  size:             "",
  color:            "",
  status:           "available",
  payment_due_date: "",
  payment_notes:    "",
  notes:            "",
};

const normalizeMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
};

const formatWeight   = (v) => (v ?? "") === "" ? "-" : `${v} kg`;
const formatDate     = (v) => v ? new Date(v).toLocaleDateString("fr-FR")  : "-";
const formatDateTime = (v) => v ? new Date(v).toLocaleString("fr-FR")      : "-";

// ✅ Centralisé — utilisé dans toute la page
const getProfileDisplayName = (profile) => {
  if (!profile) return "-";
  const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
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
  return Math.max(normalizeMoney(item?.price) - normalizeMoney(item?.discount_amount), 0);
};

const getStatusTheme = (status) => ({
  available: { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Disponible" },
  assigned:  { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Attribué"  },
  sacrificed:{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", label: "Sacrifié"  },
  missing:   { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Manquant"  },
}[status] ?? { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", label: status || "Inconnu" });

const getPaymentStatusTheme = (status) => ({
  paid:      { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Payé"    },
  partial:   { background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74", label: "Partiel"  },
  overpaid:  { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Surpayé"  },
  cancelled: { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Annulé"   },
  unpaid:    { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", label: "Impayé"   },
}[status] ?? { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", label: "Impayé" });

// ===== PAGE =====

export default function AdminSheepPage() {
  const { sheep = [], loading, refresh, createSheep, updateSheep, deleteSheep } = useSheepManagement();

  const [profiles,        setProfiles]        = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // ✅ feedback utilisateur
  const [selectedSheep, setSelectedSheep] = useState(null);

  const [payments,        setPayments]        = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sizeFilter,   setSizeFilter]   = useState("all");
  const [colorFilter,  setColorFilter]  = useState("all");
  const [sortBy,       setSortBy]       = useState("recent");

  // ===== CHARGEMENT PROFILS =====

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);
        // ✅ getApprovedProfiles — un seul appel
        const data = await getApprovedProfiles();
        setProfiles(Array.isArray(data) ? data : data?.items ?? []);
      } catch (error) {
        console.error("[AdminSheepPage] loadProfiles:", error);
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, []);

  // ===== PAIEMENTS =====

  const reloadSelectedSheepPayments = async (sheepId) => {
    if (!sheepId) {
      setPayments([]);
      setPaymentsSummary(null);
      return;
    }
    try {
      setPaymentsLoading(true);
      const data = await getPaymentsBySheepId(sheepId);
      setPayments(Array.isArray(data?.items) ? data.items : []);
      setPaymentsSummary(data?.summary ?? null);
      // ✅ On ne recharge PAS tous les moutons ici — inutile
    } catch (error) {
      console.error("[AdminSheepPage] reloadPayments:", error);
      setPayments([]);
      setPaymentsSummary(null);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    reloadSelectedSheepPayments(selectedSheep?.id);
  }, [selectedSheep?.id]);

  // ===== MAP PROFILS — O(n) =====

  const profilesMap = useMemo(() => {
    const map = new Map();
    for (const p of profiles) map.set(String(p.id), p);
    return map;
  }, [profiles]);

  const getAssignedProfile     = (item) => item?.fidel_id ? profilesMap.get(String(item.fidel_id)) ?? null : null;
  const getAssignedProfileName = (item) => getProfileDisplayName(getAssignedProfile(item));

  // ===== FILTRES + TRI =====

  const colorOptions = useMemo(() =>
    [...new Set(sheep.map((s) => s.color).filter(Boolean))],
    [sheep]
  );

  const filteredSheep = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = sheep.filter((item) => {
      const hasFidel = !!item.fidel_id;
      const status   = String(item.status || "").toLowerCase();

      const matchSearch = !term || [
        item.number, item.status, item.color, item.size,
        item.notes, item.fidel_id, getAssignedProfileName(item),
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));

      const matchStatus =
        statusFilter === "all"      ? true
        : statusFilter === "assigned"  ? (status === "assigned" || hasFidel)
        : statusFilter === "available" ? (status === "available" && !hasFidel)
        : status === statusFilter;

      const matchSize  = sizeFilter  === "all" || item.size  === sizeFilter;
      const matchColor = colorFilter === "all" || item.color === colorFilter;

      return matchSearch && matchStatus && matchSize && matchColor;
    });

    // ✅ Tri sur une copie — ne mute pas le tableau original
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "number_asc":  return String(a.number || "").localeCompare(String(b.number || ""));
        case "number_desc": return String(b.number || "").localeCompare(String(a.number || ""));
        case "price_asc":   return Number(a.price || 0) - Number(b.price || 0);
        case "price_desc":  return Number(b.price || 0) - Number(a.price || 0);
        default:            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
  }, [sheep, search, statusFilter, sizeFilter, colorFilter, sortBy, profilesMap]);

  // ===== HANDLERS =====

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      number:           item.number          || "",
      photo_url:        item.photo_url        || "",
      weight:           item.weight           ?? "",
      price:            item.price            ?? "",
      discount_amount:  item.discount_amount  ?? "",
      final_price:      item.final_price      ?? "",
      size:             item.size             || "",
      color:            item.color            || "",
      status:           getRealSheepStatus(item),
      payment_due_date: item.payment_due_date
        ? new Date(item.payment_due_date).toISOString().slice(0, 16) : "",
      payment_notes:    item.payment_notes    || "",
      notes:            item.notes            || "",
    });
    setSelectedSheep(null);
    setShowForm(true);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseNum = (v) => v === "" ? null : Number(String(v).replace(",", "."));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const currentSheep = sheep.find((s) => s.id === editingId);
    const wasAssigned  = !!currentSheep?.fidel_id;
    const nextStatus   = String(form.status || "").toLowerCase();

    if (editingId && wasAssigned && nextStatus === "available") {
      if (!window.confirm("Remettre ce mouton en disponible ? Cela coupera le lien avec le fidèle.")) return;
    }

    const payload = {
      ...form,
      photo_url:        form.photo_url        || null,
      weight:           parseNum(form.weight),
      price:            parseNum(form.price),
      discount_amount:  parseNum(form.discount_amount) ?? 0,
      final_price:      parseNum(form.final_price),
      payment_due_date: form.payment_due_date || null,
      payment_notes:    form.payment_notes    || null,
      notes:            form.notes            || null,
      ...(editingId && wasAssigned && nextStatus === "available" ? { fidel_id: null } : {}),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateSheep(editingId, payload);
      } else {
        await createSheep(payload);
      }
      handleCancel();
      await refresh();
    } catch (error) {
      console.error("[AdminSheepPage] handleSubmit:", error);
      // ✅ Feedback utilisateur
      setErrorMessage(error?.message || "Impossible d'enregistrer le mouton.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Supprimer le mouton #${number || id} ?`)) return;
    setDeletingId(id);
    try {
      await deleteSheep(id);
      if (editingId === id)       handleCancel();
      if (selectedSheep?.id === id) setSelectedSheep(null);
    } catch (error) {
      console.error("[AdminSheepPage] handleDelete:", error);
      // ✅ Feedback utilisateur
      setErrorMessage(error?.message || "Impossible de supprimer le mouton.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== MEMO MOUTON SÉLECTIONNÉ =====

  const selectedSheepAssignedProfile = useMemo(
    () => selectedSheep ? getAssignedProfile(selectedSheep) : null,
    [selectedSheep, profilesMap]
  );

  const selectedSheepExpectedAmount = useMemo(
    () => selectedSheep ? getExpectedAmount(selectedSheep) : 0,
    [selectedSheep]
  );

  const selectedSheepPaidAmount = useMemo(
    () => paymentsSummary?.paidAmount ?? payments.reduce((s, p) => s + normalizeMoney(p.amount), 0),
    [payments, paymentsSummary]
  );

  const selectedSheepRemainingAmount = useMemo(
    () => paymentsSummary?.remainingAmount ?? Math.max(selectedSheepExpectedAmount - selectedSheepPaidAmount, 0),
    [paymentsSummary, selectedSheepExpectedAmount, selectedSheepPaidAmount]
  );

  // ===== RENDER =====

  return (
    <div className="sheep-page">
      <div className="sheep-container">
        {errorMessage && (
          <div className="sheep-error">{errorMessage}</div>
        )}
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
          sortBy={sortBy}
          sizeOptions={SHEEP_SIZES} // ✅ constante au lieu de useMemo sur les données
          colorOptions={colorOptions}
          filteredSheep={filteredSheep}
          onRefresh={refresh}
          onOpenCreate={handleOpenCreate}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={setSelectedSheep}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setSizeFilter={setSizeFilter}
          setColorFilter={setColorFilter}
          setSortBy={setSortBy}
          getRealSheepStatus={getRealSheepStatus}
          getStatusTheme={getStatusTheme}
          getAssignedProfileName={getAssignedProfileName}
          formatPrice={formatMoney}
          formatWeight={formatWeight}
          formatDate={formatDate}
        />
      </div>

      <AdminSheepModal
        selectedSheep={selectedSheep}
        selectedSheepAssignedProfile={selectedSheepAssignedProfile}
        deletingId={deletingId}
        setSelectedSheep={setSelectedSheep}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRealSheepStatus={getRealSheepStatus}
        getStatusTheme={getStatusTheme}
        getPaymentStatusTheme={getPaymentStatusTheme}
        getProfileDisplayName={getProfileDisplayName}
        formatPrice={formatMoney}
        formatMoney={formatMoney}
        formatWeight={formatWeight}
        formatDateTime={formatDateTime}
        payments={payments}
        paymentsLoading={paymentsLoading}
        paymentsSummary={paymentsSummary}
        expectedAmount={selectedSheepExpectedAmount}
        paidAmount={selectedSheepPaidAmount}
        remainingAmount={selectedSheepRemainingAmount}
        onPaymentsChanged={reloadSelectedSheepPayments}
      />
    </div>
  );
}