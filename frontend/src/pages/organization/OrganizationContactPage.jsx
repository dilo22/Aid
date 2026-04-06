import "../../styles/OrganizationPages.css";

const CONTACT_ITEMS = [
  { icon: "📞", label: "Téléphone",     value: "07 67 83 61 87" },
  { icon: "✉️", label: "Email support", value: "support@aidplatform.com" },
];

export default function OrganizationContactPage() {
  return (
    <div className="org-contact-page">
      <section className="org-contact-hero">
        <h1 className="org-contact-hero-title">Support technique</h1>
        <p className="org-contact-hero-subtitle">
          Une question ou un problème avec la plateforme ? Contactez directement l'équipe support.
        </p>
      </section>

      <section className="org-contact-card">
        <h2 className="org-contact-section-title">Nous contacter</h2>
        <p className="org-contact-section-text">
          Notre équipe est disponible pour vous accompagner.
        </p>

        <div className="org-contact-list">
          {CONTACT_ITEMS.map(({ icon, label, value }) => (
            <div key={label} className="org-contact-item">
              <div className="org-contact-icon">{icon}</div>
              <div>
                <div className="org-contact-label">{label}</div>
                <div className="org-contact-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="org-contact-footer">Temps de réponse moyen : 24h</p>
      </section>
    </div>
  );
}