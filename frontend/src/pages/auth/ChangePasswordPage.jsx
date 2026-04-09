import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/client";
import "../../styles/AuthPages.css";

export default function ChangePasswordPage() {
  const navigate  = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8)        return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (!/[A-Z]/.test(newPassword))    return setError("Le mot de passe doit contenir au moins une majuscule.");
    if (!/\d/.test(newPassword))       return setError("Le mot de passe doit contenir au moins un chiffre.");
    if (newPassword !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess("Mot de passe changé avec succès.");
      await refreshProfile();

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err?.message || "Impossible de changer le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-brand">
            <div className="auth-logo">🔑</div>
            <h1 className="auth-title">
              {profile?.must_change_password
                ? "Changement de mot de passe requis"
                : "Changer mon mot de passe"}
            </h1>
            <p className="auth-subtitle">
              {profile?.must_change_password
                ? "Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer."
                : "Mettez à jour votre mot de passe pour sécuriser votre compte."}
            </p>
          </div>

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Mot de passe actuel</label>
              <div className="auth-password-wrap">
                <input type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="auth-input" disabled={loading} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowCurrent((p) => !p)}>
                  {showCurrent ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Nouveau mot de passe</label>
              <div className="auth-password-wrap">
                <input type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8 caractères min., 1 majuscule, 1 chiffre"
                  className="auth-input" disabled={loading} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowNew((p) => !p)}>
                  {showNew ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirmer le nouveau mot de passe</label>
              <div className="auth-password-wrap">
                <input type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="auth-input" disabled={loading} required />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}