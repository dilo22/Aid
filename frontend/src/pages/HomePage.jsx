import { useNavigate } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 24%), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },

  shell: {
    width: "100%",
    maxWidth: 1180,
    minHeight: 680,
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(226,232,240,0.95)",
    borderRadius: 32,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(14px)",
  },

  left: {
    padding: 56,
    display: "grid",
    alignContent: "center",
    gap: 28,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#eef2ff",
    border: "1px solid #dbeafe",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 800,
  },

  heading: {
    display: "grid",
    gap: 16,
  },

  title: {
    margin: 0,
    fontSize: "clamp(2.4rem, 5vw, 4rem)",
    lineHeight: 1.02,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.04em",
    maxWidth: 520,
  },

  gradientWord: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #0f172a 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    margin: 0,
    maxWidth: 500,
    color: "#475569",
    fontSize: 17,
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 4,
  },

  primaryButton: {
    border: "none",
    borderRadius: 16,
    padding: "15px 22px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.25)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 16,
    padding: "15px 22px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  },

  points: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },

  point: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
  },

  right: {
    position: "relative",
    padding: 32,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(180deg, rgba(239,246,255,0.75) 0%, rgba(255,255,255,0.92) 100%)",
  },

  visualWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    aspectRatio: "1 / 1",
    display: "grid",
    placeItems: "center",
  },

  glow1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(37,99,235,0.14)",
    filter: "blur(20px)",
    top: 30,
    left: 40,
  },

  glow2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(16,185,129,0.12)",
    filter: "blur(20px)",
    bottom: 40,
    right: 20,
  },

  orbMain: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "32px",
    background:
      "linear-gradient(145deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
    boxShadow: "0 30px 60px rgba(37,99,235,0.20)",
    transform: "rotate(-10deg)",
  },

  orbGlass: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "28px",
    background: "rgba(255,255,255,0.36)",
    border: "1px solid rgba(255,255,255,0.55)",
    backdropFilter: "blur(14px)",
    transform: "translate(70px, 30px) rotate(10deg)",
    boxShadow: "0 24px 40px rgba(15,23,42,0.08)",
  },

  miniCardTop: {
    position: "absolute",
    top: 50,
    left: 10,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 30px rgba(15,23,42,0.08)",
    minWidth: 160,
  },

  miniCardBottom: {
    position: "absolute",
    bottom: 36,
    right: 6,
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 30px rgba(15,23,42,0.08)",
    minWidth: 170,
  },

  miniLabel: {
    margin: 0,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  miniValue: {
    margin: "6px 0 0 0",
    fontSize: 20,
    color: "#0f172a",
    fontWeight: 900,
  },
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          .home-shell-responsive {
            grid-template-columns: 1.05fr 0.95fr;
          }

          .home-btn:hover {
            transform: translateY(-2px);
          }

          .home-btn-primary:hover {
            box-shadow: 0 18px 34px rgba(37, 99, 235, 0.30);
          }

          .home-btn-secondary:hover {
            border-color: #94a3b8;
            box-shadow: 0 12px 22px rgba(15, 23, 42, 0.06);
          }

          @media (max-width: 980px) {
            .home-shell-responsive {
              grid-template-columns: 1fr;
            }

            .home-right-panel {
              min-height: 360px;
            }
          }

          @media (max-width: 768px) {
            .home-left-panel,
            .home-right-panel {
              padding: 28px;
            }
          }
        `}
      </style>

      <div style={styles.page}>
        <div style={styles.shell} className="home-shell-responsive">
          <section style={styles.left} className="home-left-panel">
            <div style={styles.badge}>Plateforme publique</div>

            <div style={styles.heading}>
              <h1 style={styles.title}>
                Une expérience <span style={styles.gradientWord}>simple</span> et
                moderne
              </h1>

              <p style={styles.subtitle}>
                Accédez à votre espace ou créez un compte en quelques secondes.
              </p>
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={styles.primaryButton}
                className="home-btn home-btn-primary"
              >
                Se connecter
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                style={styles.secondaryButton}
                className="home-btn home-btn-secondary"
              >
                S’inscrire
              </button>
            </div>

            <div style={styles.points}>
              <div style={styles.point}>Accès rapide</div>
              <div style={styles.point}>Interface claire</div>
              <div style={styles.point}>Responsive</div>
            </div>
          </section>

          <section style={styles.right} className="home-right-panel">
            <div style={styles.visualWrap}>
              <div style={styles.glow1} />
              <div style={styles.glow2} />
              <div style={styles.orbMain} />
              <div style={styles.orbGlass} />

              <div style={styles.miniCardTop}>
                <p style={styles.miniLabel}>Navigation</p>
                <p style={styles.miniValue}>Fluide</p>
              </div>

              <div style={styles.miniCardBottom}>
                <p style={styles.miniLabel}>Expérience</p>
                <p style={styles.miniValue}>Premium</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}