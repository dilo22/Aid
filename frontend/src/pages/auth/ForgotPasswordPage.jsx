import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ✅ Validation email côté client
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Format d'email invalide.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage("Un email de réinitialisation a été envoyé si ce compte existe.");
    } catch (err) {
      // ✅ Message neutre — ne révèle pas si l'email existe
      setMessage("Un email de réinitialisation a été envoyé si ce compte existe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <h1 className="fp-title">Mot de passe oublié</h1>
        <p className="fp-subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {error   && <div className="fp-error">{error}</div>}
        {message && <div className="fp-success">{message}</div>}

        <form onSubmit={handleSubmit} className="fp-form">
          <input type="email" placeholder="email@exemple.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="fp-input" required />
          <button type="submit" className="fp-btn" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        <div className="fp-footer">
          <Link to="/login" className="fp-link">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}