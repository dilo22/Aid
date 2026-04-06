import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/PendingApprovalPage.css";

const STEPS = [
  "Votre demande est transmise à votre organisation",
  "Un administrateur examine et valide votre profil",
  "Vous accédez à votre espace dès la validation",
];

const SheepSVG = () => (
  <svg width="220" height="120" viewBox="0 0 220 120" style={{ overflow: "visible" }}>
    <line x1="10" y1="100" x2="210" y2="100"
      stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />
    <g className="pa-sheep-walk">
      {/* Laine */}
      <ellipse cx="110" cy="72" rx="30" ry="22" fill="#E8E4DC"/>
      <circle cx="92"  cy="62" r="14" fill="#F2EFE8"/>
      <circle cx="104" cy="57" r="16" fill="#EDE9E2"/>
      <circle cx="118" cy="55" r="17" fill="#F2EFE8"/>
      <circle cx="131" cy="62" r="14" fill="#EDE9E2"/>
      <circle cx="138" cy="73" r="11" fill="#E8E4DC"/>
      <circle cx="85"  cy="74" r="11" fill="#E5E1DA"/>
      {/* Tête */}
      <ellipse cx="110" cy="50" rx="12" ry="11" fill="#C8C2B6"/>
      {/* Oreilles */}
      <ellipse cx="101" cy="49" rx="5" ry="3.5" fill="#BFB9AD" transform="rotate(-20,101,49)"/>
      <ellipse cx="119" cy="49" rx="5" ry="3.5" fill="#BFB9AD" transform="rotate(20,119,49)"/>
      {/* Yeux */}
      <ellipse className="pa-eye" cx="105" cy="47" rx="2" ry="2.5" fill="#2C2C2A"/>
      <ellipse className="pa-eye" cx="115" cy="47" rx="2" ry="2.5" fill="#2C2C2A"/>
      <circle cx="105.8" cy="46" r="0.8" fill="white" opacity="0.7"/>
      <circle cx="115.8" cy="46" r="0.8" fill="white" opacity="0.7"/>
      {/* Museau */}
      <ellipse cx="110" cy="57" rx="5" ry="3.5" fill="#BFB9AD"/>
      <path d="M107 60 Q110 63 113 60" stroke="#A89F95" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Pattes */}
      <g className="pa-leg-a"><rect x="91"  y="91" width="7" height="14" rx="3.5" fill="#C8C2B6"/></g>
      <g className="pa-leg-b"><rect x="101" y="91" width="7" height="14" rx="3.5" fill="#BFB9AD"/></g>
      <g className="pa-leg-b"><rect x="112" y="91" width="7" height="14" rx="3.5" fill="#BFB9AD"/></g>
      <g className="pa-leg-a"><rect x="122" y="91" width="7" height="14" rx="3.5" fill="#C8C2B6"/></g>
      <rect x="90"  y="103" width="9" height="5" rx="2.5" fill="#8B8178"/>
      <rect x="100" y="103" width="9" height="5" rx="2.5" fill="#8B8178"/>
      <rect x="111" y="103" width="9" height="5" rx="2.5" fill="#8B8178"/>
      <rect x="121" y="103" width="9" height="5" rx="2.5" fill="#8B8178"/>
      {/* Queue */}
      <ellipse cx="142" cy="78" rx="5" ry="4" fill="#F0EDE6"/>
      {/* Badge horloge */}
      <circle cx="82" cy="40" r="12" fill="#EEF2FF" stroke="#BFDBFE" strokeWidth="1"/>
      <text x="82" y="44" textAnchor="middle" fontSize="10">⏳</text>
    </g>
  </svg>
);

const PendingApprovalPage = () => {
  const { signOut } = useAuth();
  const navigate    = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="pa-page">

      <div className="pa-sheep-scene">
        <SheepSVG />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div className="pa-heading">
          <div className="pa-heading-icon">⏳</div>
          <h1 className="pa-title">Compte en attente</h1>
        </div>
        <p className="pa-subtitle">
          Votre inscription a bien été enregistrée. Votre mosquée ou
          l'administrateur doit encore valider votre compte.
        </p>
      </div>

      <div className="pa-card">
        <div className="pa-card-title">Que se passe-t-il maintenant ?</div>
        {STEPS.map((text, i) => (
          <div key={i} className="pa-step">
            <span className="pa-step-num">{i + 1}</span>
            {text}
          </div>
        ))}
      </div>

      <div className="pa-dots">
        <div className="pa-dot" />
        <div className="pa-dot" />
        <div className="pa-dot" />
        <span className="pa-dots-label">Validation en cours</span>
      </div>

      <button className="pa-btn-logout" onClick={handleLogout}>
        Se déconnecter
      </button>

    </div>
  );
};

export default PendingApprovalPage;