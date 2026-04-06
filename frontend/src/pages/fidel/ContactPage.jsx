import "../../styles/FidelPages.css";

const CONTACT_ITEMS = [
  { icon: "📞", label: "Téléphone", value: "07 67 83 61 87" },
  { icon: "✉️", label: "Email",     value: "hibahedil8@gmail.com" },
];

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <div>
          <h1 className="contact-title">Contact</h1>
          <p className="contact-subtitle">
            Une question ou besoin d'assistance ? Contactez directement l'administration.
          </p>
        </div>

        <div className="contact-grid">
          {CONTACT_ITEMS.map(({ icon, label, value }) => (
            <div key={label} className="contact-item">
              <div className="contact-icon">{icon}</div>
              <div>
                <div className="contact-label">{label}</div>
                <div className="contact-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-footer">Temps de réponse moyen : 24h</div>
      </div>
    </div>
  );
}