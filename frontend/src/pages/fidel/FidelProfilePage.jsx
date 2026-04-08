import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/ui/StatusBadge";
import { getMyProfile, updateProfile } from "../../api/profilesApi";
import {
  getDisplayName,
  getOrganizationLabel,
} from "../../utils/fidelHelpers";
import "../../styles/FidelPages.css";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function FidelProfilePage() {
  const { profile } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [profileData, setProfileData] = useState(profile || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const bootstrapProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getMyProfile();
        const currentProfile = data || profile || null;

        if (!currentProfile) {
          throw new Error("Profil introuvable.");
        }

        setProfileData(currentProfile);
        setForm({
          first_name: currentProfile.first_name || "",
          last_name: currentProfile.last_name || "",
          phone: currentProfile.phone || "",
        });
      } catch (error) {
        const fallbackProfile = profile || null;

        if (fallbackProfile) {
          setProfileData(fallbackProfile);
          setForm({
            first_name: fallbackProfile.first_name || "",
            last_name: fallbackProfile.last_name || "",
            phone: fallbackProfile.phone || "",
          });
        } else {
          setErrorMessage(
            getErrorMessage(error, "Impossible de charger le profil.")
          );
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

  const fields = useMemo(
    () => [
      ["Email", displayedProfile?.email],
      ["Rôle", displayedProfile?.role],
      ["Organisation", getOrganizationLabel(displayedProfile)],
      ["Type org.", displayedProfile?.organization?.type],
      [
        "Mot de passe",
        displayedProfile?.must_change_password ? "À changer" : "OK",
      ],
    ],
    [displayedProfile]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
      };

      const result = await updateProfile(payload);
      const updatedProfile = result?.profile || null;

      if (updatedProfile) {
        setProfileData(updatedProfile);
        setForm({
          first_name: updatedProfile.first_name || "",
          last_name: updatedProfile.last_name || "",
          phone: updatedProfile.phone || "",
        });
      }

      setSuccessMessage(result?.message || "Profil mis à jour avec succès.");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Impossible de mettre à jour le profil.")
      );
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
            Consultez et modifiez vos informations personnelles.
          </p>
          <StatusBadge status={displayedProfile?.status} />
        </div>

        <div className="fidel-card">
          <div className="fidel-card-header">
            <h2 className="fidel-card-title">
              {getDisplayName(displayedProfile)}
            </h2>
            <p className="fidel-card-subtitle">
              Informations de votre compte.
            </p>
          </div>

          <div className="fidel-card-body">
            {successMessage ? (
              <div className="success-message">{successMessage}</div>
            ) : null}

            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : null}

            <form className="fidel-profile-form" onSubmit={handleSubmit}>
              <div className="fidel-info-grid">
                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="first_name">
                    Prénom
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="fidel-input"
                    value={form.first_name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="last_name">
                    Nom
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="fidel-input"
                    value={form.last_name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="fidel-info-box">
                  <label className="fidel-info-label" htmlFor="phone">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    className="fidel-input"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                {fields.map(([label, value]) => (
                  <div key={label} className="fidel-info-box">
                    <div className="fidel-info-label">{label}</div>
                    <div className="fidel-info-value">{value || "-"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  type="submit"
                  className="fidel-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}