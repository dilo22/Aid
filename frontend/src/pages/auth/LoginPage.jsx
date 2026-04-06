import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardPathByRole } from "../../utils/authGuards"; // ✅ bon import
import "../../styles/AuthPages.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();

  const [form,         setForm]         = useState({ email: "", password: "" });
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
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
        email:    form.email.trim(),
        password: form.password,
      });

      if (error) {
        // ✅ Message neutre — ne révèle pas les détails Supabase
        setError("Email ou mot de passe incorrect.");
      }
    } catch (err) {
      console.error("[LoginPage]", err);
      setError("Erreur pendant la connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Redirection après connexion
  useEffect(() => {
    if (!authLoading && session && profile) {
      navigate(getDashboardPathByRole(profile.role), { replace: true });
    }
  }, [authLoading, session, profile, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-card">

          <div className="auth-top-bar">
            <Link to="/" className="auth-back-link">← Retour à l'accueil</Link>
            <span className="auth-badge auth-badge--blue">Accès sécurisé</span>
          </div>

          <div className="auth-brand">
            <div className="auth-logo">🐑</div>
            <h1 className="auth-title">Connexion</h1>
            <p className="auth-subtitle">
              Connecte-toi pour accéder à ton espace personnel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Adresse email</label>
              <input id="email" name="email" type="email"
                placeholder="exemple@email.com"
                value={form.email} onChange={handleChange}
                autoComplete="email" className="auth-input"
                disabled={loading} required />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password" className="auth-label">Mot de passe</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="auth-password-wrap">
                <input id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password" className="auth-input"
                  disabled={loading} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <p className="auth-helper-text">
              Seuls les utilisateurs autorisés peuvent accéder à la plateforme.
            </p>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-switch">
            Pas encore de compte ?{" "}
            <Link to="/register" className="auth-switch-link">S'inscrire</Link>
          </div>

          <div className="auth-footer">
            Aid Platform — accès réservé aux utilisateurs autorisés
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;