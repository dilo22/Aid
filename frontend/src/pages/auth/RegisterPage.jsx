import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  wrapper: {
    width: "100%",
    maxWidth: 620,
  },
  card: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #e2e8f0",
    borderRadius: 28,
    padding: 32,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(12px)",
    display: "grid",
    gap: 24,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  backLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 999,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontSize: 12,
    fontWeight: 800,
  },
  brand: {
    display: "grid",
    gap: 12,
    textAlign: "center",
  },
  logo: {
    width: 68,
    height: 68,
    margin: "0 auto",
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    background: "linear-gradient(135deg, #eff6ff 0%, #dcfce7 100%)",
    border: "1px solid #bfdbfe",
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.10)",
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.7,
  },
  form: {
    display: "grid",
    gap: 16,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 15,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
  },
  passwordWrap: {
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 800,
    cursor: "pointer",
    padding: "6px 8px",
    fontSize: 13,
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 15,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%2364758b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    backgroundSize: "18px",
    paddingRight: 44,
    transition: "border-color 180ms ease, box-shadow 180ms ease",
  },
  helperBox: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.6,
  },
  button: {
    marginTop: 4,
    border: "none",
    borderRadius: 16,
    padding: "14px 18px",
    background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    opacity: 1,
  },
  success: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontSize: 14,
    fontWeight: 600,
  },
  error: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontSize: 14,
    fontWeight: 600,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
  },
  switchBox: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
  },
  switchLink: {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },
};

const initialForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  password: "",
  organization_id: "",
};

const RegisterPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, type, is_active, deleted_at")
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        setOrganizations(data || []);
      } catch (err) {
        console.error("FETCH ORGANIZATIONS ERROR:", err);
        setOrganizations([]);
      }
    };

    fetchOrganizations();
  }, []);

  const groupedOrganizations = useMemo(() => {
    return {
      associations: organizations.filter((org) => org.type === "association"),
      mosquees: organizations.filter((org) => org.type === "mosque"),
      autres: organizations.filter(
        (org) => org.type !== "association" && org.type !== "mosque"
      ),
    };
  }, [organizations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!firstName) {
      return "Le prénom est obligatoire.";
    }

    if (!lastName) {
      return "Le nom est obligatoire.";
    }

    if (!email) {
      return "L'adresse email est obligatoire.";
    }

    if (!form.password) {
      return "Le mot de passe est obligatoire.";
    }

    if (form.password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (phone && phone.length < 8) {
      return "Le numéro de téléphone semble invalide.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        organization_id: form.organization_id || null,
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Erreur pendant l’inscription.");
      }

      setMessage(
        result?.message || "Inscription envoyée. Votre compte sera validé."
      );
      setForm(initialForm);
      setShowPassword(false);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.message || "Erreur pendant l’inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .register-input-focus:focus {
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .register-btn-hover:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22);
          }

          .register-link-hover:hover {
            opacity: 0.85;
          }

          @media (max-width: 640px) {
            .register-row-responsive {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.topBar}>
              <Link
                to="/"
                style={styles.backLink}
                className="register-link-hover"
              >
                ← Retour à l’accueil
              </Link>

              <div style={styles.badge}>Validation requise</div>
            </div>

            <div style={styles.brand}>
              <div style={styles.logo}>📝</div>
              <h1 style={styles.title}>Créer un compte</h1>
              <p style={styles.subtitle}>
                Fais une demande d’inscription pour rejoindre la plateforme.
              </p>
            </div>

            <div style={styles.helperBox}>
              Ton compte sera examiné avant activation. Certains comptes peuvent
              être validés directement par l’administration selon le contexte.
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div
                style={styles.row}
                className="register-row-responsive"
              >
                <div style={styles.field}>
                  <label htmlFor="first_name" style={styles.label}>
                    Prénom
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    placeholder="Prénom"
                    value={form.first_name}
                    onChange={handleChange}
                    style={styles.input}
                    className="register-input-focus"
                    disabled={loading}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label htmlFor="last_name" style={styles.label}>
                    Nom
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    placeholder="Nom"
                    value={form.last_name}
                    onChange={handleChange}
                    style={styles.input}
                    className="register-input-focus"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label htmlFor="phone" style={styles.label}>
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  style={styles.input}
                  className="register-input-focus"
                  disabled={loading}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  className="register-input-focus"
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="password" style={styles.label}>
                  Mot de passe
                </label>

                <div style={styles.passwordWrap}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                    className="register-input-focus"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.toggleButton}
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label htmlFor="organization_id" style={styles.label}>
                  Organisation
                </label>
                <select
                  id="organization_id"
                  name="organization_id"
                  value={form.organization_id}
                  onChange={handleChange}
                  style={styles.select}
                  className="register-input-focus"
                  disabled={loading}
                >
                  <option value="">Aucune organisation</option>

                  {groupedOrganizations.associations.length > 0 && (
                    <optgroup label="Associations">
                      {groupedOrganizations.associations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {groupedOrganizations.mosquees.length > 0 && (
                    <optgroup label="Mosquées">
                      {groupedOrganizations.mosquees.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {groupedOrganizations.autres.length > 0 && (
                    <optgroup label="Autres">
                      {groupedOrganizations.autres.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {message ? <div style={styles.success}>{message}</div> : null}
              {error ? <div style={styles.error}>{error}</div> : null}

              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                className={loading ? "" : "register-btn-hover"}
                disabled={loading}
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div style={styles.divider} />

            <div style={styles.switchBox}>
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                style={styles.switchLink}
                className="register-link-hover"
              >
                Se connecter
              </Link>
            </div>

            <div style={styles.footer}>
              Aid Platform — inscription réservée aux fidèles
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;