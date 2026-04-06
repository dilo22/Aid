import { useNavigate } from "react-router-dom";
import "../../styles/HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-shell">

        {/* LEFT */}
        <section className="home-left">
          <span className="home-badge">Plateforme publique</span>

          <div className="home-heading">
            <h1 className="home-title">
              Une expérience{" "}
              {/* ✅ aria-hidden sur le span décoratif, texte réel visible pour SR */}
              <span className="home-title-accent" aria-hidden="true">simple</span>
              <span className="sr-only">simple</span>
              {" "}et moderne
            </h1>
            <p className="home-subtitle">
              Accédez à votre espace ou créez un compte en quelques secondes.
            </p>
          </div>

          <div className="home-actions">
            <button type="button" className="home-btn-primary" onClick={() => navigate("/login")}>
              Se connecter
            </button>
            <button type="button" className="home-btn-secondary" onClick={() => navigate("/register")}>
              S'inscrire
            </button>
          </div>

          <div className="home-points">
            {["Accès rapide", "Interface claire", "Responsive"].map((p) => (
              <span key={p} className="home-point">{p}</span>
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <section className="home-right">
          <div className="home-visual-wrap">
            <div className="home-glow home-glow--blue"  />
            <div className="home-glow home-glow--green" />
            <div className="home-orb-main"  />
            <div className="home-orb-glass" />

            <div className="home-mini-card home-mini-card--top">
              <p className="home-mini-label">Navigation</p>
              <p className="home-mini-value">Fluide</p>
            </div>

            <div className="home-mini-card home-mini-card--bottom">
              <p className="home-mini-label">Expérience</p>
              <p className="home-mini-value">Premium</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}