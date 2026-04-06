import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/AuthPages.css";

const getPasswordScore = (password) => {
  let score = 0;
  if (password.length >= 8)          score += 25;
  if (password.length >= 12)         score += 15;
  if (/[A-Z]/.test(password))        score += 20;
  if (/[a-z]/.test(password))        score += 10;
  if (/\d/.test(password))           score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
};

const getMeterClass = (score) =>
  score < 40 ? "auth-meter-fill--weak"
  : score < 70 ? "auth-meter-fill--medium"
  : "auth-meter-fill--strong";

const getMeterLabel = (score) =>
  score < 40 ? "faible" : score < 70 ? "moyenne" : "forte";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [errorMessage,    setErrorMessage]    = useState("");
  const [successMessage,  setSuccessMessage]  = useState("");

  const passwordScore = useMemo(() => getPasswordScore(password), [password]);

  const rules = useMemo(() => ({
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    number:  /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match:   password !== "" && password === confirmPassword,
  }), [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // ✅ Validation alignée backend
    if (password.length < 8) {
      return setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
    }
    if (!/[A-Z]/.test(password)) {
      return setErrorMessage("Le mot de passe doit contenir au moins une majuscule.");
    }
    if (!/\d/.test(password)) {
      return setErrorMessage("Le mot de passe doit contenir au moins un chiffre.");
    }
    if (password !== confirmPassword) {
      return setErrorMessage("Les mots de passe ne correspondent pas.");
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        // ✅ Message neutre si token expiré ou invalide
        if (error.message?.toLowerCase().includes("token")) {
          throw new Error("Le lien de réinitialisation a expiré. Demandez-en un nouveau.");
        }
        throw new Error("Impossible de réinitialiser le mot de passe.");
      }

      setSuccessMessage("Mot de passe réinitialisé avec succès.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      console.error("[ResetPasswordPage]", error);
      setErrorMessage(error?.message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setSaving(false);
    }
  };

  const CHECKS = [
    [rules.length,  "Au moins 8 caractères"],
    [rules.upper,   "Une lettre majuscule"],
    [rules.number,  "Un chiffre"],
    [rules.special, "Un caractère spécial"],
    [rules.match,   "Les deux champs correspondent"],
  ];

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-top-bar">
            <Link to="/login" className="auth-back-link">← Retour à la connexion</Link>
            <span className="auth-badge auth-badge--blue">Réinitialisation</span>
          </div>

          <div className="auth-brand">
            <div className="auth-logo">🔐</div>
            <h1 className="auth-title">Nouveau mot de passe</h1>
            <p className="auth-subtitle">
              Choisissez un mot de passe sécurisé pour finaliser la récupération de votre compte.
            </p>
          </div>

          {errorMessage   && <div className="auth-error">{errorMessage}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Nouveau mot de passe</label>
              <div className="auth-password-wrap">
                <input id="password"
                  type={showPassword ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="auth-input" disabled={saving} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* Indicateur de force */}
            <div className="auth-meter-wrap">
              <div className="auth-meter">
                <div className={`auth-meter-fill ${getMeterClass(passwordScore)}`}
                  style={{ width: `${passwordScore}%` }} />
              </div>
              <p className="auth-meter-label">
                Solidité : <strong>{getMeterLabel(passwordScore)}</strong>
              </p>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">Confirmer le mot de passe</label>
              <div className="auth-password-wrap">
                <input id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="auth-input" disabled={saving} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowConfirm((p) => !p)}>
                  {showConfirm ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="auth-checklist">
              {CHECKS.map(([ok, label]) => (
                <div key={label} className={`auth-check-item${ok ? " auth-check-item--ok" : ""}`}>
                  {ok ? "✓" : "•"} {label}
                </div>
              ))}
            </div>

            <button type="submit" className="auth-btn" disabled={saving}>
              {saving ? "Mise à jour..." : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-switch-link">Revenir à la connexion</Link>
          </div>

        </div>
      </div>
    </div>
  );
}