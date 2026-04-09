import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL || "AID Platform <noreply@aid-adha.space>";

const checkApiKey = (fnName) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[EMAIL] RESEND_API_KEY manquante — ${fnName} non envoyé`);
    return false;
  }
  return true;
};

// ===== BIENVENUE (création fidèle par admin) =====
export const sendWelcomeEmail = async ({ email, firstName, temporaryPassword }) => {
  if (!checkApiKey("sendWelcomeEmail")) return;

  const { data, error } = await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: "Bienvenue sur AID Platform — vos identifiants",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="color:#0f172a;margin-bottom:8px">Bienvenue sur AID Platform 🐑</h2>
        <p style="color:#475569">Bonjour <strong>${firstName}</strong>,</p>
        <p style="color:#475569">
          Votre compte a été créé par l'administrateur.
          Voici vos identifiants de connexion :
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;color:#64748b;font-size:13px">Adresse email</p>
          <p style="margin:0 0 16px;font-weight:700;color:#0f172a">${email}</p>
          <p style="margin:0 0 8px;color:#64748b;font-size:13px">Mot de passe temporaire</p>
          <p style="margin:0;font-weight:700;color:#0f172a;font-size:18px;letter-spacing:0.05em">
            ${temporaryPassword}
          </p>
        </div>
        <p style="color:#ef4444;font-size:14px">
          ⚠️ Vous devrez changer ce mot de passe lors de votre première connexion.
        </p>
        <a href="${process.env.FRONTEND_URL}/login"
          style="display:inline-block;margin-top:16px;padding:12px 24px;
                 background:#0f172a;color:#fff;border-radius:10px;
                 text-decoration:none;font-weight:700">
          Se connecter
        </a>
        <p style="margin-top:32px;color:#94a3b8;font-size:12px">
          AID Platform — Aid Al Edha
        </p>
      </div>
    `,
  });

  if (error) console.error("[EMAIL] sendWelcomeEmail:", error);
  else console.info("[EMAIL] Welcome envoyé à", email, "— ID:", data?.id);
};

// ===== RESET MOT DE PASSE =====
export const sendPasswordResetEmail = async ({ email, firstName, resetLink }) => {
  if (!checkApiKey("sendPasswordResetEmail")) return;

  const { data, error } = await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: "Réinitialisation de votre mot de passe — AID Platform",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="color:#0f172a;margin-bottom:8px">Réinitialisation du mot de passe</h2>
        <p style="color:#475569">Bonjour <strong>${firstName}</strong>,</p>
        <p style="color:#475569">
          Vous avez demandé à réinitialiser votre mot de passe.
          Cliquez sur le bouton ci-dessous pour continuer.
        </p>
        <a href="${resetLink}"
          style="display:inline-block;margin-top:16px;padding:12px 24px;
                 background:#0f172a;color:#fff;border-radius:10px;
                 text-decoration:none;font-weight:700">
          Réinitialiser mon mot de passe
        </a>
        <p style="margin-top:24px;color:#64748b;font-size:13px">
          Ce lien expire dans 24h. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
        <p style="margin-top:32px;color:#94a3b8;font-size:12px">
          AID Platform — Aid Al Edha
        </p>
      </div>
    `,
  });

  if (error) console.error("[EMAIL] sendPasswordResetEmail:", error);
  else console.info("[EMAIL] Reset envoyé à", email, "— ID:", data?.id);
};

// ===== RENDEZ-VOUS =====
export const sendAppointmentEmail = async ({ to, firstName, type, appointmentAt, address }) => {
  if (!checkApiKey("sendAppointmentEmail")) return;

  const typeLabel = type === "selection" ? "Sélection du mouton" : "Sacrifice & récupération";
  const opts      = { timeZone: "Europe/Paris" };
  const date  = new Date(appointmentAt).toLocaleDateString("fr-FR",  { ...opts, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const heure = new Date(appointmentAt).toLocaleTimeString("fr-FR",  { ...opts, hour: "2-digit", minute: "2-digit" });

  const { data, error } = await resend.emails.send({
    from:    FROM,
    to,
    subject: `Votre rendez-vous ${typeLabel} — AID Platform`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#0f172a;border-radius:16px;padding:24px;color:#fff;margin-bottom:24px">
          <h1 style="margin:0;font-size:24px">AID Platform</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7)">Aid Al Edha 2025</p>
        </div>
        <h2 style="color:#0f172a">Bonjour ${firstName},</h2>
        <p style="color:#475569;line-height:1.7">
          Votre rendez-vous <strong>${typeLabel}</strong> a été programmé.
          Voici les détails :
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px">Type</td>
              <td style="padding:8px 0;font-weight:700;color:#0f172a">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px">Date</td>
              <td style="padding:8px 0;font-weight:700;color:#0f172a">${date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px">Heure</td>
              <td style="padding:8px 0;font-weight:700;color:#0f172a">${heure}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px">Adresse</td>
              <td style="padding:8px 0;font-weight:700;color:#0f172a">${address}</td>
            </tr>
          </table>
        </div>
        <p style="color:#475569;line-height:1.7">
          Merci de vous présenter à l'heure indiquée. En cas d'empêchement,
          contactez l'administration dès que possible.
        </p>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:13px">
          AID Platform — Aid Al Edha 2025
        </div>
      </div>
    `,
  });

  if (error) console.error("[EMAIL] sendAppointmentEmail:", error);
  else console.info("[EMAIL] Appointment envoyé à", to, "— ID:", data?.id);
};