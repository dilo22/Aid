import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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
    fontSize: 30,
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
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
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
  meterWrap: {
    display: "grid",
    gap: 8,
  },
  meter: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  meterFill: (score) => ({
    height: "100%",
    width: `${score}%`,
    transition: "width 180ms ease",
    borderRadius: 999,
    background:
      score < 40
        ? "#ef4444"
        : score < 70
        ? "#f59e0b"
        : "#10b981",
  }),
  helper: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  checklist: {
    display: "grid",
    gap: 8,
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  checkItem: (ok) => ({
    fontSize: 13,
    color: ok ? "#047857" : "#64748b",
    fontWeight: ok ? 700 : 500,
  }),
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
  success: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontSize: 14,
    fontWeight: 600,
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
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
  },
};

const getPasswordScore = (password) => {
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordScore = useMemo(() => getPasswordScore(password), [password]);

  const rules = useMemo(
    () => ({
      length: password.length >= 6,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      match: password !== "" && password === confirmPassword,
    }),
    [password, confirmPassword]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!password || password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
      }

      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Votre mot de passe a été réinitialisé avec succès.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      setErrorMessage(
        error?.message || "Impossible de réinitialiser le mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>
        {`
          .reset-input-focus:focus {
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .reset-btn-hover:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22);
          }

          .reset-link-hover:hover {
            opacity: 0.85;
          }
        `}
      </style>

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.topBar}>
              <Link
                to="/login"
                style={styles.backLink}
                className="reset-link-hover"
              >
                ← Retour à la connexion
              </Link>

              <div style={styles.badge}>Réinitialisation</div>
            </div>

            <div style={styles.brand}>
              <div style={styles.logo}>🔐</div>
              <h1 style={styles.title}>Nouveau mot de passe</h1>
              <p style={styles.subtitle}>
                Choisissez un mot de passe sécurisé pour finaliser la récupération
                de votre compte.
              </p>
            </div>

            {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
            {successMessage ? (
              <div style={styles.success}>{successMessage}</div>
            ) : null}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="password" style={styles.label}>
                  Nouveau mot de passe
                </label>

                <div style={styles.passwordWrap}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre nouveau mot de passe"
                    style={styles.input}
                    className="reset-input-focus"
                    disabled={saving}
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

              <div style={styles.meterWrap}>
                <div style={styles.meter}>
                  <div style={styles.meterFill(passwordScore)} />
                </div>
                <p style={styles.helper}>
                  Solidité du mot de passe :{" "}
                  <strong>
                    {passwordScore < 40
                      ? "faible"
                      : passwordScore < 70
                      ? "moyenne"
                      : "forte"}
                  </strong>
                </p>
              </div>

              <div style={styles.field}>
                <label htmlFor="confirmPassword" style={styles.label}>
                  Confirmer le mot de passe
                </label>

                <div style={styles.passwordWrap}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    style={styles.input}
                    className="reset-input-focus"
                    disabled={saving}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    style={styles.toggleButton}
                  >
                    {showConfirmPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div style={styles.checklist}>
                <div style={styles.checkItem(rules.length)}>
                  {rules.length ? "✓" : "•"} Au moins 6 caractères
                </div>
                <div style={styles.checkItem(rules.upper)}>
                  {rules.upper ? "✓" : "•"} Une lettre majuscule
                </div>
                <div style={styles.checkItem(rules.number)}>
                  {rules.number ? "✓" : "•"} Un chiffre
                </div>
                <div style={styles.checkItem(rules.special)}>
                  {rules.special ? "✓" : "•"} Un caractère spécial
                </div>
                <div style={styles.checkItem(rules.match)}>
                  {rules.match ? "✓" : "•"} Les deux champs correspondent
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.button,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                className={saving ? "" : "reset-btn-hover"}
              >
                {saving ? "Mise à jour..." : "Enregistrer le nouveau mot de passe"}
              </button>
            </form>

            <div style={styles.footer}>
              <Link
                to="/login"
                style={styles.footerLink}
                className="reset-link-hover"
              >
                Revenir à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}