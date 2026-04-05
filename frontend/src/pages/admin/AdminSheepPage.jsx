import { useEffect, useMemo, useState } from "react";
import { useSheepManagement } from "../../hooks/useSheepManagement";
import { getProfiles } from "../../api/profilesApi";
import { getPaymentsBySheepId } from "../../api/paymentsApi";
import AdminSheepManagementCard from "./AdminSheepManagementCard";
import AdminSheepModal from "./AdminSheepModal";

const emptyForm = {
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 24,
  },
  container: {
    maxWidth: 1450,
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
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
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
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 14px",
    border: "1px solid #dbe3f0",
    borderRadius: 12,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    resize: "vertical",
    fontFamily: "inherit",
  },
  form: {
    padding: 20,
    display: "grid",
    gap: 16,
    borderTop: "1px solid #e2e8f0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    minWidth: 1150,
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
  sheepCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sheepAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    fontSize: 18,
    flexShrink: 0,
  },
  sheepNameBlock: {
    display: "grid",
    gap: 3,
  },
  sheepNumber: {
    fontWeight: 800,
    color: "#0f172a",
  },
  sheepMeta: {
    fontSize: 12,
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
    maxWidth: 900,
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
  photoPreview: {
    width: "100%",
    maxHeight: 300,
    objectFit: "cover",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
  },
  paymentsSection: {
    display: "grid",
    gap: 12,
  },
  paymentItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
    display: "grid",
    gap: 6,
  },
  paymentItemTitle: {
    fontWeight: 800,
    color: "#0f172a",
  },
  paymentItemText: {
    color: "#475569",
    fontSize: 14,
  },
  modalFooter: {
    padding: "18px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
};

const getRealSheepStatus = (item) => {
  const hasFidel =
    item?.fidel_id !== null &&
    item?.fidel_id !== undefined &&
    String(item?.fidel_id).trim() !== "";

  const normalizedStatus = String(item?.status || "").toLowerCase();

  if (normalizedStatus === "sacrificed" || normalizedStatus === "missing") {
    return normalizedStatus;
  }

  if (hasFidel) {
    return "assigned";
  }

  return normalizedStatus || "available";
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return `${numeric.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

const formatPrice = formatMoney;

const formatWeight = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value} kg`;
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
};

const getStatusTheme = (status) => {
  switch (status) {
    case "available":
      return {
        background: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
        label: "Disponible",
      };
    case "assigned":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Attribué",
      };
    case "sacrificed":
      return {
        background: "#fef3c7",
        color: "#b45309",
        border: "1px solid #fde68a",
        label: "Sacrifié",
      };
    case "missing":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Manquant",
      };
    default:
      return {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #cbd5e1",
        label: status || "Inconnu",
      };
  }
};

const getPaymentStatusTheme = (status) => {
  switch (status) {
    case "paid":
      return {
        background: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
        label: "Payé",
      };
    case "partial":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "Partiel",
      };
    case "overpaid":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Surpayé",
      };
    case "cancelled":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Annulé",
      };
    case "unpaid":
    default:
      return {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #cbd5e1",
        label: "Impayé",
      };
  }
};

const getProfileDisplayName = (profile) => {
  if (!profile) return "-";

  const firstName = String(profile.first_name || "").trim();
  const lastName = String(profile.last_name || "").trim();
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (profile.email) return profile.email;

  return "-";
};

const normalizeMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getExpectedAmount = (item) => {
  if (
    item?.final_price !== null &&
    item?.final_price !== undefined &&
    item?.final_price !== ""
  ) {
    return Math.max(normalizeMoney(item.final_price), 0);
  }

  return Math.max(
    normalizeMoney(item.price) - normalizeMoney(item.discount_amount),
    0
  );
};

export default function AdminSheepPage() {
  const {
    sheep = [],
    loading,
    refresh,
    createSheep,
    updateSheep,
    deleteSheep,
  } = useSheepManagement();

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);
        const profilesData = await getProfiles();

        const normalizedProfiles = Array.isArray(profilesData?.items)
          ? profilesData.items
          : Array.isArray(profilesData)
          ? profilesData
          : [];

        setProfiles(normalizedProfiles);
      } catch (error) {
        console.error("Erreur chargement profils :", error);
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, []);

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
      setPaymentsSummary(data?.summary || null);
      await refresh();
    } catch (error) {
      console.error("Erreur rechargement paiements :", error);
      setPayments([]);
      setPaymentsSummary(null);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    reloadSelectedSheepPayments(selectedSheep?.id);
  }, [selectedSheep?.id]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      number: item.number || "",
      photo_url: item.photo_url || "",
      weight: item.weight || "",
      price: item.price || "",
      discount_amount: item.discount_amount || "",
      final_price: item.final_price || "",
      size: item.size || "",
      color: item.color || "",
      status: getRealSheepStatus(item),
      payment_due_date: item.payment_due_date
        ? new Date(item.payment_due_date).toISOString().slice(0, 16)
        : "",
      payment_notes: item.payment_notes || "",
      notes: item.notes || "",
    });
    setSelectedSheep(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
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

      const currentSheep = Array.isArray(sheep)
        ? sheep.find((item) => item.id === editingId)
        : null;

      const wasAssigned =
        currentSheep?.fidel_id !== null &&
        currentSheep?.fidel_id !== undefined &&
        String(currentSheep?.fidel_id).trim() !== "";

      const nextStatus = String(form.status || "").toLowerCase();

      if (editingId && wasAssigned && nextStatus === "available") {
        const confirmed = window.confirm(
          "Êtes-vous sûr de vouloir remettre ce mouton en disponible ? Cela coupera le lien avec le fidèle attribué."
        );

        if (!confirmed) return;
      }

      const payload = {
        ...form,
        photo_url: form.photo_url || null,
        weight:
          form.weight === ""
            ? null
            : Number(String(form.weight).replace(",", ".")),
        price:
          form.price === ""
            ? null
            : Number(String(form.price).replace(",", ".")),
        discount_amount:
          form.discount_amount === ""
            ? 0
            : Number(String(form.discount_amount).replace(",", ".")),
        final_price:
          form.final_price === ""
            ? null
            : Number(String(form.final_price).replace(",", ".")),
        payment_due_date: form.payment_due_date || null,
        payment_notes: form.payment_notes || null,
      };

      if (editingId) {
        if (wasAssigned && nextStatus === "available") {
          payload.fidel_id = null;
        }

        await updateSheep(editingId, payload);
      } else {
        await createSheep(payload);
      }

      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch (error) {
      console.error("Erreur sauvegarde mouton :", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, number) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le mouton #${number || id} ?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteSheep(id);

      if (editingId === id) {
        handleCancel();
      }

      if (selectedSheep?.id === id) {
        setSelectedSheep(null);
      }
    } catch (error) {
      console.error("Erreur suppression mouton :", error);
    } finally {
      setDeletingId(null);
    }
  };

  const sizeOptions = useMemo(() => {
    const values = sheep
      .map((item) => item.size)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return ["all", ...Array.from(new Set(values))];
  }, [sheep]);

  const colorOptions = useMemo(() => {
    const values = sheep
      .map((item) => item.color)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return ["all", ...Array.from(new Set(values))];
  }, [sheep]);

  const getAssignedProfile = (sheepItem) => {
    const fidelId = String(sheepItem?.fidel_id || "").trim();
    if (!fidelId) return null;

    return profiles.find(
      (profile) => String(profile?.id || "").trim() === fidelId
    );
  };

  const getAssignedProfileName = (sheepItem) => {
    const profile = getAssignedProfile(sheepItem);
    return profile ? getProfileDisplayName(profile) : "-";
  };

  const filteredSheep = useMemo(() => {
    const safeList = Array.isArray(sheep) ? sheep : [];
    const term = search.trim().toLowerCase();

    const result = safeList.filter((item) => {
      const hasFidel =
        item.fidel_id !== null &&
        item.fidel_id !== undefined &&
        String(item.fidel_id).trim() !== "";

      const assignedProfileName = getAssignedProfileName(item).toLowerCase();
      const normalizedStatus = String(item.status || "").toLowerCase();

      const matchesSearch =
        !term ||
        [
          item.number,
          item.status,
          item.color,
          item.size,
          item.notes,
          item.weight,
          item.price,
          item.discount_amount,
          item.final_price,
          item.payment_status,
          item.fidel_id,
          assignedProfileName,
        ]
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "assigned"
          ? normalizedStatus === "assigned" || hasFidel
          : statusFilter === "available"
          ? normalizedStatus === "available" && !hasFidel
          : normalizedStatus === statusFilter;

      const matchesSize =
        sizeFilter === "all" || String(item.size || "") === sizeFilter;

      const matchesColor =
        colorFilter === "all" || String(item.color || "") === colorFilter;

      return matchesSearch && matchesStatus && matchesSize && matchesColor;
    });

    if (sortBy === "number_asc") {
      result.sort((a, b) =>
        String(a.number || "").localeCompare(String(b.number || ""))
      );
    }

    if (sortBy === "number_desc") {
      result.sort((a, b) =>
        String(b.number || "").localeCompare(String(a.number || ""))
      );
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  }, [sheep, profiles, search, statusFilter, sizeFilter, colorFilter, sortBy]);

  const selectedSheepAssignedProfile = useMemo(() => {
    if (!selectedSheep) return null;
    return getAssignedProfile(selectedSheep);
  }, [selectedSheep, profiles]);

  const selectedSheepExpectedAmount = useMemo(() => {
    if (!selectedSheep) return 0;
    return getExpectedAmount(selectedSheep);
  }, [selectedSheep]);

  const selectedSheepPaidAmount = useMemo(() => {
    if (paymentsSummary?.paidAmount !== undefined) {
      return paymentsSummary.paidAmount;
    }

    return payments.reduce((sum, item) => sum + normalizeMoney(item.amount), 0);
  }, [payments, paymentsSummary]);

  const selectedSheepRemainingAmount = useMemo(() => {
    if (paymentsSummary?.remainingAmount !== undefined) {
      return paymentsSummary.remainingAmount;
    }

    return Math.max(selectedSheepExpectedAmount - selectedSheepPaidAmount, 0);
  }, [paymentsSummary, selectedSheepExpectedAmount, selectedSheepPaidAmount]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <AdminSheepManagementCard
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
          sizeFilter={sizeFilter}
          colorFilter={colorFilter}
          sortBy={sortBy}
          sizeOptions={sizeOptions}
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
          formatPrice={formatPrice}
          formatWeight={formatWeight}
          formatDate={formatDate}
        />
      </div>

      <AdminSheepModal
        styles={styles}
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
        formatPrice={formatPrice}
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