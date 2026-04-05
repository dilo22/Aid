import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardPath } from "../../utils/roleRedirect";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  wrapper: {
    width: "100%",
    maxWidth: 470,
  },
  card: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #e2e8f0",
    borderRadius: 28,
    padding: 32,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(12px)",
    display: "grid",
    gap: 24,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  backLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 999,
    background: "#eef2ff",
    border: "1px solid #dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
  },
  brand: {
    display: "grid",
    gap: 12,
    textAlign: "center",
  },
  logo: {
    width: 68,
    height: 68,
    margin: "0 auto",
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.10)",
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.7,
  },
  form: {
    display: "grid",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  forgotLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 15,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
  },
  passwordWrap: {
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 800,
    cursor: "pointer",
    padding: "6px 8px",
    fontSize: 13,
  },
  helper: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  button: {
    marginTop: 4,
    border: "none",
    borderRadius: 16,
    padding: "14px 18px",
    background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  error: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontSize: 14,
    fontWeight: 600,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
  },
  switchBox: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
  },
  switchLink: {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setError(error.message || "Connexion impossible.");
        return;
      }
    } catch (err) {
      console.error("LOGIN CATCH:", err);
      setError("Erreur pendant la connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && session && profile) {
      navigate(getDashboardPath(profile), { replace: true });
    }
  }, [authLoading, session, profile, navigate]);

  return (
    <>
      <style>
        {`
          .login-input-focus:focus {
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .login-btn-hover:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22);
          }

          .login-link-hover:hover {
            opacity: 0.85;
          }
        `}
      </style>

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.topBar}>
              <Link
                to="/"
                style={styles.backLink}
                className="login-link-hover"
              >
                ← Retour à l’accueil
              </Link>

              <div style={styles.badge}>Accès sécurisé</div>
            </div>

            <div style={styles.brand}>
              <div style={styles.logo}>🐑</div>
              <h1 style={styles.title}>Connexion</h1>
              <p style={styles.subtitle}>
                Connecte-toi pour accéder à ton espace personnel.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={styles.input}
                  className="login-input-focus"
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label htmlFor="password" style={styles.label}>
                    Mot de passe
                  </label>

                  <Link
                    to="/forgot-password"
                    style={styles.forgotLink}
                    className="login-link-hover"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <div style={styles.passwordWrap}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    style={styles.input}
                    className="login-input-focus"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.toggleButton}
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              {error ? <div style={styles.error}>{error}</div> : null}

              <p style={styles.helper}>
                Seuls les utilisateurs autorisés peuvent accéder à la plateforme.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                className={loading ? "" : "login-btn-hover"}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div style={styles.divider} />

            <div style={styles.switchBox}>
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                style={styles.switchLink}
                className="login-link-hover"
              >
                S’inscrire
              </Link>
            </div>

            <div style={styles.footer}>
              Aid Platform — accès réservé aux utilisateurs autorisés
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;