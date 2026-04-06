import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import { getDisplayName, getOrganizationLabel } from "../../utils/fidelHelpers";
import "../../styles/FidelPages.css";

export default function FidelProfilePage() {
  const { profile } = useAuth();

  const FIELDS = [
    ["Prénom",            profile?.first_name],
    ["Nom",               profile?.last_name],
    ["Email",             profile?.email],
    ["Téléphone",         profile?.phone],
    ["Rôle",              profile?.role],
    ["Organisation",      getOrganizationLabel(profile)],
    ["Type org.",         profile?.organization?.type],
    ["Mot de passe",      profile?.must_change_password ? "À changer" : "OK"],
  ];

  return (
    <div className="fidel-page">
      <div className="fidel-container" style={{ maxWidth: 1200 }}>

        <div className="fidel-hero-card">
          <h1 className="fidel-hero-title">Mon profil</h1>
          <p className="fidel-hero-subtitle">
            Consultez vos informations personnelles et votre rattachement.
          </p>
          <StatusBadge status={profile?.status} />
        </div>

        <div className="fidel-card">
          <div className="fidel-card-header">
            <h2 className="fidel-card-title">{getDisplayName(profile)}</h2>
            <p className="fidel-card-subtitle">Informations de votre compte.</p>
          </div>
          <div className="fidel-card-body">
            <div className="fidel-info-grid">
              {FIELDS.map(([label, value]) => (
                <div key={label} className="fidel-info-box">
                  <div className="fidel-info-label">{label}</div>
                  <div className="fidel-info-value">{value || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}