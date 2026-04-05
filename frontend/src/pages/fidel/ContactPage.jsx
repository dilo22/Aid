export default function ContactPage() {
  const styles = {
    page: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    card: {
      width: "100%",
      maxWidth: 700,
      background: "#ffffff",
      borderRadius: 20,
      padding: 32,
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e5e7eb",
      display: "grid",
      gap: 24,
    },
    header: {
      display: "grid",
      gap: 8,
    },
    title: {
      margin: 0,
      fontSize: 28,
      fontWeight: 800,
      color: "#0f172a",
    },
    subtitle: {
      margin: 0,
      color: "#64748b",
      fontSize: 15,
      lineHeight: 1.6,
    },
    contactGrid: {
      display: "grid",
      gap: 16,
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: 16,
      borderRadius: 16,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      display: "grid",
      placeItems: "center",
      fontSize: 20,
      background: "#eff6ff",
    },
    label: {
      fontSize: 13,
      color: "#64748b",
    },
    value: {
      fontSize: 16,
      fontWeight: 700,
      color: "#0f172a",
    },
    footer: {
      marginTop: 10,
      paddingTop: 16,
      borderTop: "1px solid #e5e7eb",
      fontSize: 13,
      color: "#64748b",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Contact</h1>
          <p style={styles.subtitle}>
            Une question, un problème ou besoin d’assistance ?  
            Tu peux contacter directement l’administration via les informations ci-dessous.
          </p>
        </div>

        <div style={styles.contactGrid}>
          <div style={styles.contactItem}>
            <div style={styles.icon}>📞</div>
            <div>
              <div style={styles.label}>Téléphone</div>
              <div style={styles.value}>07 67 83 61 87</div>
            </div>
          </div>

          <div style={styles.contactItem}>
            <div style={styles.icon}>✉️</div>
            <div>
              <div style={styles.label}>Email</div>
              <div style={styles.value}>hibahedil8@gmail.com</div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          Temps de réponse moyen : 24h
        </div>
      </div>
    </div>
  );
}