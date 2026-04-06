import { useNavigate } from "react-router-dom";
import "../styles/NotFoundPage.css";

const SheepSVG = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
    <g className="nf-sheep">
      {/* Laine */}
      <ellipse cx="100" cy="115" rx="46" ry="38" fill="#E8E4DC"/>
      <circle cx="74"  cy="100" r="22" fill="#F2EFE8"/>
      <circle cx="92"  cy="92"  r="24" fill="#EDE9E2"/>
      <circle cx="112" cy="89"  r="26" fill="#F2EFE8"/>
      <circle cx="132" cy="98"  r="22" fill="#EDE9E2"/>
      <circle cx="144" cy="114" r="18" fill="#E8E4DC"/>
      <circle cx="62"  cy="116" r="18" fill="#E5E1DA"/>
      {/* Tête */}
      <ellipse cx="100" cy="82" rx="18" ry="16" fill="#C8C2B6"/>
      {/* Oreilles */}
      <ellipse cx="88"  cy="81" rx="7" ry="5" fill="#BFB9AD" transform="rotate(-20,88,81)"/>
      <ellipse cx="112" cy="81" rx="7" ry="5" fill="#BFB9AD" transform="rotate(20,112,81)"/>
      <ellipse cx="88"  cy="82" rx="4" ry="3" fill="#D4A69A" transform="rotate(-20,88,82)"/>
      <ellipse cx="112" cy="82" rx="4" ry="3" fill="#D4A69A" transform="rotate(20,112,82)"/>
      {/* Yeux */}
      <ellipse className="nf-eye" cx="93"  cy="79" rx="3" ry="3.5" fill="#2C2C2A"/>
      <ellipse className="nf-eye" cx="107" cy="79" rx="3" ry="3.5" fill="#2C2C2A"/>
      <circle cx="94"  cy="77.5" r="1" fill="white" opacity="0.7"/>
      <circle cx="108" cy="77.5" r="1" fill="white" opacity="0.7"/>
      {/* Museau */}
      <ellipse cx="100" cy="91" rx="7" ry="5" fill="#BFB9AD"/>
      <ellipse cx="96"  cy="92" rx="1.8" ry="1.4" fill="#A89F95"/>
      <ellipse cx="104" cy="92" rx="1.8" ry="1.4" fill="#A89F95"/>
      <path d="M95 96 Q100 100 105 96" stroke="#A89F95" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Pattes */}
      <rect x="78"  y="148" width="11" height="24" rx="5.5" fill="#C8C2B6"/>
      <rect x="92"  y="151" width="11" height="21" rx="5.5" fill="#BFB9AD"/>
      <rect x="97"  y="151" width="11" height="21" rx="5.5" fill="#BFB9AD"/>
      <rect x="111" y="148" width="11" height="24" rx="5.5" fill="#C8C2B6"/>
      <rect x="77"  y="167" width="13" height="7"  rx="3.5" fill="#8B8178"/>
      <rect x="91"  y="167" width="13" height="7"  rx="3.5" fill="#8B8178"/>
      <rect x="96"  y="167" width="13" height="7"  rx="3.5" fill="#8B8178"/>
      <rect x="110" y="167" width="13" height="7"  rx="3.5" fill="#8B8178"/>
      {/* Queue */}
      <ellipse cx="148" cy="126" rx="7" ry="5.5" fill="#F0EDE6"/>
      {/* Badge 404 */}
      <rect x="58" y="64" width="22" height="10" rx="5" fill="#E24B4A"/>
      <text x="69" y="72" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="white" fontWeight="bold">404</text>
    </g>
  </svg>
);

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <div style={{ width: 200, height: 200 }}>
        <SheepSVG />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div className="nf-code">404</div>
        <div className="nf-title">Ce mouton s'est perdu</div>
        <p className="nf-subtitle">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Revenez à l'accueil pour retrouver votre troupeau.
        </p>
      </div>

      <div className="nf-actions">
        <button className="nf-btn-back" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <button className="nf-btn-home" onClick={() => navigate("/")}>
          Accueil
        </button>
      </div>

      <div className="nf-footer">
        <span className="nf-footer-dot nf-dot" />
        AID Platform · page introuvable
      </div>
    </div>
  );
};

export default NotFoundPage;