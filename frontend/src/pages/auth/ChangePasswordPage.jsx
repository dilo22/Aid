import { useMemo, useState } from "react";
import { changePassword } from "../../api/authApi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.12), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: 24,
  },
  shell: {
    width: "100%",
    maxWidth: 1080,
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)",
  },
  hero: {
    position: "relative",
    padding: 42,
    background:
      "linear-gradient(160deg, #0f172a 0%, #1e3a8a 52%, #2563eb 100%)",
    color: "#fff",
    display: "grid",
    alignContent: "space-between",
    minHeight: 640,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.10)",
    filter: "blur(8px)",
    top: -40,
    right: -30,
  },
  glow2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(8px)",
    bottom: 30,
    left: -40,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.2,
    backdropFilter: "blur(4px)",
  },
  heroBlock: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: 18,
  },
  heroTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.1,
    fontWeight: 800,
  },
  heroText: {
    margin: 0,
    color: "rgba(255,255,255,0.84)",
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 460,
  },
  tips: {
    display: "grid",
    gap: 12,
    marginTop: 10,
  },
  tipCard: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(6px)",
  },
  tipIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.16)",
    fontSize: 16,
    flexShrink: 0,
  },
  tipTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
  },
  tipText: {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.5,
  },
  panel: {
    padding: 42,
    display: "grid",
    alignContent: "center",
    background: "#ffffff",
  },
  panelInner: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  heading: {
    display: "grid",
    gap: 10,
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    color: "#0f172a",
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: 15,
  },
  infoCard: {
    padding: 16,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 14,
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: 16,
  },
  label: {
    display: "grid",
    gap: 8,
    fontWeight: 700,
    color: "#0f172a",
    fontSize: 14,
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #dbe3f0",
    background: "#fff",
    fontSize: 15,
    color: "#0f172a",
    outline: "none",
  },
  toggleBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 700,
    color: "#2563eb",
    padding: "6px 8px",
  },
  passwordMeterWrap: {
    display: "grid",
    gap: 8,
  },
  passwordMeter: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  passwordMeterFill: (score) => ({
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
  error: {
    padding: 14,
    borderRadius: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontWeight: 700,
    fontSize: 14,
  },
  success: {
    padding: 14,
    borderRadius: 16,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontWeight: 700,
    fontSize: 14,
  },
  actions: {
    display: "grid",
    gap: 12,
    marginTop: 6,
  },
  primaryButton: {
    border: "none",
    borderRadius: 16,
    padding: "14px 18px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.25)",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 16,
    padding: "13px 18px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
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

export default function ChangePasswordPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
  setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
  return;
}

if (password !== confirmPassword) {
  setErrorMessage("Les mots de passe ne correspondent pas.");
  return;
}

      await changePassword(password);
      await refreshProfile();

      setSuccessMessage("Mot de passe mis à jour avec succès.");

      setTimeout(() => {
        if (profile?.role === "admin") {
          navigate("/admin");
          return;
        }

        if (profile?.role === "organization") {
          navigate("/organization");
          return;
        }

        navigate("/fidel");
      }, 900);
    } catch (error) {
      console.error("Erreur changement mot de passe :", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Impossible de modifier le mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.shell,
          gridTemplateColumns:
            typeof window !== "undefined" && window.innerWidth < 920
              ? "1fr"
              : styles.shell.gridTemplateColumns,
        }}
      >
        <section style={styles.hero}>
          <div style={styles.glow} />
          <div style={styles.glow2} />

          <div style={styles.heroBlock}>
            <div style={styles.badge}>Sécurité du compte</div>

            <div>
              <h1 style={styles.heroTitle}>Définissez un nouveau mot de passe</h1>
              <p style={styles.heroText}>
                Pour protéger votre compte, remplacez le mot de passe provisoire
                par un mot de passe personnel, solide et facile à retenir pour vous
                seul.
              </p>
            </div>

            <div style={styles.tips}>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>🔐</div>
                <div>
                  <p style={styles.tipTitle}>Accès sécurisé</p>
                  <p style={styles.tipText}>
                    Un mot de passe plus robuste réduit fortement les risques
                    d’accès non autorisé à votre espace.
                  </p>
                </div>
              </div>

              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>⚡</div>
                <div>
                  <p style={styles.tipTitle}>Changement rapide</p>
                  <p style={styles.tipText}>
                    Quelques secondes suffisent pour finaliser l’activation de
                    votre compte et continuer normalement.
                  </p>
                </div>
              </div>

              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>🛡️</div>
                <div>
                  <p style={styles.tipTitle}>Bonnes pratiques</p>
                  <p style={styles.tipText}>
                    Mélangez lettres, chiffres et caractères spéciaux, et évitez
                    les informations trop évidentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelInner}>
            <div style={styles.heading}>
              <h2 style={styles.title}>Changer le mot de passe</h2>
              <p style={styles.subtitle}>
                Ce mot de passe sera utilisé lors de vos prochaines connexions.
              </p>
            </div>

            <div style={styles.infoCard}>
              Compte connecté : <strong>{profile?.email || "Utilisateur"}</strong>
            </div>

            {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
            {successMessage ? (
              <div style={styles.success}>{successMessage}</div>
            ) : null}

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>
                Nouveau mot de passe
                <div style={styles.inputWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre nouveau mot de passe"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.toggleBtn}
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </label>

              <div style={styles.passwordMeterWrap}>
                <div style={styles.passwordMeter}>
                  <div style={styles.passwordMeterFill(passwordScore)} />
                </div>
                <div style={styles.helper}>
                  Solidité du mot de passe :{" "}
                  <strong>
                    {passwordScore < 40
                      ? "faible"
                      : passwordScore < 70
                      ? "moyenne"
                      : "forte"}
                  </strong>
                </div>
              </div>

              <label style={styles.label}>
                Confirmer le mot de passe
                <div style={styles.inputWrap}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    style={styles.toggleBtn}
                  >
                    {showConfirmPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </label>

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

              <div style={styles.actions}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.primaryButton,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Mise à jour..." : "Enregistrer le nouveau mot de passe"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={styles.secondaryButton}
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}