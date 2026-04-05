import { useAuth } from "../../contexts/AuthContext";

const styles = {
  page: {
    display: "grid",
    gap: 24,
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    background: "linear-gradient(135deg, #1e293b, #2563eb)",
    color: "#fff",
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.9,
    maxWidth: 700,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionText: {
    marginTop: 6,
    color: "#64748b",
  },
  contactList: {
    display: "grid",
    gap: 14,
    marginTop: 20,
  },
  contactItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    gap: 14,
    alignItems: "center",
    background: "#f8fafc",
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    fontSize: 20,
  },
  contactText: {
    display: "grid",
    gap: 2,
  },
  label: {
    fontSize: 13,
    color: "#64748b",
  },
  value: {
    fontWeight: 700,
    color: "#0f172a",
  },
  footer: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
  },
};

export default function OrganizationContactPage() {
  const { profile } = useAuth();

  return (
    <div style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Support technique</h1>
        <p style={styles.subtitle}>
          Une question technique, un problème avec la gestion des fidèles ou une
          difficulté sur la plateforme ? Contacte directement l’équipe support.
        </p>
      </section>

      {/* CONTACT CARD */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Nous contacter</h2>
        <p style={styles.sectionText}>
          Notre équipe technique est disponible pour t’accompagner dans
          l’utilisation de la plateforme.
        </p>

        <div style={styles.contactList}>
          <div style={styles.contactItem}>
            <div style={styles.icon}>📞</div>
            <div style={styles.contactText}>
              <span style={styles.label}>Téléphone</span>
              <span style={styles.value}>07 67 83 61 87</span>
            </div>
          </div>

          <div style={styles.contactItem}>
            <div style={styles.icon}>✉️</div>
            <div style={styles.contactText}>
              <span style={styles.label}>Email support</span>
              <span style={styles.value}>support@aidplatform.com</span>
            </div>
          </div>
        </div>

        <p style={styles.footer}>
          Temps de réponse moyen : 24h
        </p>
      </section>
    </div>
  );
}