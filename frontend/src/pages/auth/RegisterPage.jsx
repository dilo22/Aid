import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client"; // ✅ axios au lieu de fetch
import { supabase } from "../../lib/supabase";
import "../../styles/AuthPages.css";

const INITIAL_FORM = {
  first_name:      "",
  last_name:       "",
  phone:           "",
  email:           "",
  password:        "",
  organization_id: "",
};

const RegisterPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [form,          setForm]          = useState(INITIAL_FORM);
  const [message,       setMessage]       = useState("");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);

  // ✅ Supabase direct pour les organisations — pas besoin du token ici
  useEffect(() => {
    supabase
      .from("organizations")
      .select("id, name, type")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("[RegisterPage] fetchOrgs:", error);
        setOrganizations(data ?? []);
      });
  }, []);

  const groupedOrgs = useMemo(() => ({
    associations: organizations.filter((o) => o.type === "association"),
    mosquees:     organizations.filter((o) => o.type === "mosque"),
    autres:       organizations.filter((o) => o.type !== "association" && o.type !== "mosque"),
  }), [organizations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.first_name.trim()) return "Le prénom est obligatoire.";
    if (!form.last_name.trim())  return "Le nom est obligatoire.";
    if (!form.email.trim())      return "L'email est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Format d'email invalide.";

    // ✅ Aligné avec le backend (8 chars + majuscule + chiffre)
    if (form.password.length < 8)        return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(form.password))    return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/\d/.test(form.password))       return "Le mot de passe doit contenir au moins un chiffre.";
    if (form.phone && form.phone.trim().length < 8) return "Le numéro de téléphone semble invalide.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      // ✅ axios via client.js — cohérent avec le reste
      const { data } = await api.post("/auth/register", {
        first_name:      form.first_name.trim(),
        last_name:       form.last_name.trim(),
        phone:           form.phone.trim() || null,
        email:           form.email.trim().toLowerCase(),
        password:        form.password,
        organization_id: form.organization_id || null,
      });

      setMessage(data?.message || "Inscription envoyée. Votre compte sera validé.");
      setForm(INITIAL_FORM);
      setShowPassword(false);
    } catch (err) {
      console.error("[RegisterPage]", err);
      setError(err?.message || "Erreur pendant l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper auth-wrapper--wide">
        <div className="auth-card">

          <div className="auth-top-bar">
            <Link to="/" className="auth-back-link">← Retour à l'accueil</Link>
            <span className="auth-badge auth-badge--green">Validation requise</span>
          </div>

          <div className="auth-brand">
            <div className="auth-logo">📝</div>
            <h1 className="auth-title">Créer un compte</h1>
            <p className="auth-subtitle">
              Fais une demande d'inscription pour rejoindre la plateforme.
            </p>
          </div>

          <div className="auth-helper-box">
            Ton compte sera examiné avant activation. Certains comptes peuvent
            être validés directement par l'administration.
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="first_name" className="auth-label">Prénom *</label>
                <input id="first_name" name="first_name" placeholder="Prénom"
                  value={form.first_name} onChange={handleChange}
                  className="auth-input" disabled={loading} required />
              </div>
              <div className="auth-field">
                <label htmlFor="last_name" className="auth-label">Nom *</label>
                <input id="last_name" name="last_name" placeholder="Nom"
                  value={form.last_name} onChange={handleChange}
                  className="auth-input" disabled={loading} required />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="phone" className="auth-label">Téléphone</label>
              <input id="phone" name="phone" placeholder="Téléphone"
                value={form.phone} onChange={handleChange}
                className="auth-input" disabled={loading} />
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Adresse email *</label>
              <input id="email" name="email" type="email"
                placeholder="exemple@email.com"
                value={form.email} onChange={handleChange}
                className="auth-input" disabled={loading} required />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Mot de passe *</label>
              <div className="auth-password-wrap">
                <input id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8 caractères min., 1 majuscule, 1 chiffre"
                  value={form.password} onChange={handleChange}
                  className="auth-input" disabled={loading} required />
                <button type="button" className="auth-toggle-btn"
                  onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="organization_id" className="auth-label">Organisation</label>
              <select id="organization_id" name="organization_id"
                value={form.organization_id} onChange={handleChange}
                className="auth-select" disabled={loading}>
                <option value="">Aucune organisation</option>
                {groupedOrgs.associations.length > 0 && (
                  <optgroup label="Associations">
                    {groupedOrgs.associations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </optgroup>
                )}
                {groupedOrgs.mosquees.length > 0 && (
                  <optgroup label="Mosquées">
                    {groupedOrgs.mosquees.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </optgroup>
                )}
                {groupedOrgs.autres.length > 0 && (
                  <optgroup label="Autres">
                    {groupedOrgs.autres.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {message && <div className="auth-success">{message}</div>}
            {error   && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-switch">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="auth-switch-link">Se connecter</Link>
          </div>

          <div className="auth-footer">
            Aid Platform — inscription réservée aux fidèles
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;