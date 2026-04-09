import { useEffect } from "react";

export default function ConfirmModal({
  isOpen,
  title       = "Confirmer",
  message     = "Êtes-vous sûr ?",
  confirmLabel = "Confirmer",
  cancelLabel  = "Annuler",
  danger      = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
          display: "grid",
          gap: 20,
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 18px", borderRadius: 12,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 18px", borderRadius: 12, border: "none",
              background: danger ? "#dc2626" : "#111827",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}