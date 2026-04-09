import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import { getMyProfile, updateProfile } from "../../api/profilesApi";
import { getDisplayName, getOrganizationLabel } from "../../utils/fidelHelpers";
import "../../styles/FidelPages.css";

const ROLE_LABELS = {
  fidel:        "Fidèle",
  organization: "Organisation",
  admin:        "Administrateur",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function FidelProfilePage() {
  const { profile } = useAuth();

  const [form,           setForm]           = useState({ first_name: "", last_name: "", phone: "" });
  const [profileData,    setProfileData]    = useState(profile || null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage,   setErrorMessage]   = useState("");

  const isPending = profileData?.status === "pending" || profile?.status === "pending";

  useEffect(() => {
    const bootstrapProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getMyProfile();
        const current = data || profile || null;
        if (!current) throw new Error("Profil introuvable.");

        setProfileData(current);
        setForm({
          first_name: current.first_name || "",
          last_name:  current.last_name  || "",
          phone:      current.phone      || "",
        });
      } catch (error) {
        const fallback = profile || null;
        if (fallback) {
          setProfileData(fallback);
          setForm({
            first_name: fallback.first_name || "",
            last_name:  fallback.last_name  || "",
            phone:      fallback.phone      || "",
          });
        } else {
          setErrorMessage(getErrorMessage(error, "Impossible de charger le profil."));
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapProfile();
  }, [profile]);

  const displayedProfile = useMemo(
    () => profileData || profile || null,
    [profileData, profile]
  );

  const fields = useMemo(() => [
    ["Email",        displayedProfile?.email],
    ["Rôle",         ROLE_LABELS[displayedProfile?.role] || displayedProfile?.role],
    ["Organisation", getOrganizationLabel(displayedProfile)],
    ["Type org.",    displayedProfile?.organization?.type],
    ["Mot de passe", displayedProfile?.must_change_password ? "À changer" : "OK"],
  ], [displayedProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const result = await updateProfile({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        phone:      form.phone.trim(),
      });
      const updated = result?.profile || null;
      if (updated) {
        setProfileData(updated);
        setForm({
          first_name: updated.first_name || "",
          last_name:  updated.last_name  || "",
          phone:      updated.phone      || "",
        });
      }
      setSuccessMessage(result?.message || "Profil mis à jour avec succès.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible de mettre à jour le profil."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fidel-page">
        <div className="fidel-container" style={{ maxWidth: 1200 }}>
          <div className="fidel-card">
            <div className="fidel-card-body">
              <p>Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fidel-page">
      <div className="fidel-container" style={{ maxWidth: 1200 }}>

        <div className="fidel-hero-card">
          <h1 className="fidel-hero-title">Mon profil</h1>
          <p className="fidel-hero-subtitle">
            {isPending
              ? "Votre profil sera modifiable après validation de votre compte."
              : "Consultez et modifiez vos informations personnelles."}
          </p>
          <StatusBadge status={displayedProfile?.status} />
        </div>

        <div className="fidel-card">
          <div className="fidel-card-header">
            <h2 className="fidel-card-title">{getDisplayName(displayedProfile)}</h2>
            <p className="fidel-card-subtitle">Informations de votre compte.</p>
          </div>

          <div className="fidel-card-body">
            {successMessage && <div className="auth-success" style={{ marginBottom: 16 }}>{successMessage}</div>}
            {errorMessage   && <div className="auth-error"   style={{ marginBottom: 16 }}>{errorMessage}</div>}

            <form className="fidel-profile-form" onSubmit={handleSubmit}>
              <div className="fidel-info-grid">

                {/* ✅ Champs éditables — désactivés si pending */}
                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="first_name">Prénom</label>
                  {isPending ? (
                    <div className="fidel-info-value">{form.first_name || "-"}</div>
                  ) : (
                    <input id="first_name" name="first_name" type="text"
                      className="fidel-input" value={form.first_name}
                      onChange={handleChange} disabled={saving} />
                  )}
                </div>

                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="last_name">Nom</label>
                  {isPending ? (
                    <div className="fidel-info-value">{form.last_name || "-"}</div>
                  ) : (
                    <input id="last_name" name="last_name" type="text"
                      className="fidel-input" value={form.last_name}
                      onChange={handleChange} disabled={saving} />
                  )}
                </div>

                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="phone">Téléphone</label>
                  {isPending ? (
                    <div className="fidel-info-value">{form.phone || "-"}</div>
                  ) : (
                    <input id="phone" name="phone" type="text"
                      className="fidel-input" value={form.phone}
                      onChange={handleChange} disabled={saving} />
                  )}
                </div>

                {/* ✅ Champs en lecture seule */}
                {fields.map(([label, value]) => (
                  <div key={label} className="fidel-info-box">
                    <div className="fidel-info-label">{label}</div>
                    <div className="fidel-info-value" style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>{value || "-"}</div>
                  </div>
                ))}
              </div>

              {/* ✅ Bouton masqué si pending */}
              {!isPending && (
                <div style={{ marginTop: 20 }}>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}