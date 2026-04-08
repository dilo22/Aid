import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = "AID Platform <noreply@aid-adha.space>";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const sendAppointmentEmail = async ({ to, firstName, type, appointmentAt, address }) => {
  const typeLabel  = type === "selection" ? "Sélection du mouton" : "Sacrifice & récupération";
  const date = new Date(appointmentAt).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Europe/Paris", // ✅ forcer Paris
  });
  const heure = new Date(appointmentAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Paris", // ✅ forcer Paris
  });

  await resend.emails.send({
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
};