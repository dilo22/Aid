import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: 32,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    display: "grid",
    gap: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: 15,
    color: "#64748b",
    lineHeight: 1.6,
  },
  input: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 15,
  },
  button: {
    border: "none",
    borderRadius: 14,
    padding: "14px",
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  success: {
    padding: 12,
    borderRadius: 12,
    background: "#ecfdf5",
    color: "#047857",
  },
  error: {
    padding: 12,
    borderRadius: 12,
    background: "#fff1f2",
    color: "#be123c",
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage("Un email de réinitialisation a été envoyé.");
    } catch (err) {
      setError(err.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mot de passe oublié</h1>
        <p style={styles.subtitle}>
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}