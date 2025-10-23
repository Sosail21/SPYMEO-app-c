// Cdw-Spm: Email Service with Nodemailer
import nodemailer from 'nodemailer';

// Log configuration at startup (without password)
console.log('[EMAIL] Configuration SMTP:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  hasPassword: !!process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM || 'SPYMEO <noreply@spymeo.fr>';

  try {
    console.log(`[EMAIL] Tentative d'envoi à ${options.to}: ${options.subject}`);
    const result = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`[EMAIL] ✅ Envoyé avec succès à ${options.to}. MessageId: ${result.messageId}`);
    return result;
  } catch (error: any) {
    console.error('[EMAIL] ❌ Erreur envoi:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
}

export const emailTemplates = {
  adminNotification: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h2>Nouvelle candidature ${data.role}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Nom:</strong></td><td>${data.firstName || ''} ${data.lastName || ''}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
        <tr><td><strong>Ville:</strong></td><td>${data.city}</td></tr>
        ${data.discipline ? `<tr><td><strong>Discipline:</strong></td><td>${data.discipline}</td></tr>` : ''}
        ${data.experience ? `<tr><td><strong>Expérience:</strong></td><td>${data.experience} ans</td></tr>` : ''}
        <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleString('fr-FR')}</td></tr>
      </table>

      <div style="margin-top: 30px;">
        <h3>Actions</h3>
        <a href="${process.env.NEXT_PUBLIC_URL}/admin/pros"
           style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">
          📋 Voir dans le panneau admin
        </a>
      </div>
    </body>
    </html>
  `,

  candidatureReceived: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Candidature bien reçue ✅</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Nous avons bien reçu votre candidature pour devenir ${data.role} sur SPYMEO.</p>
      <p>Notre équipe va l'examiner attentivement et vous répondra sous <strong>48 heures</strong>.</p>
      <p>Merci pour votre confiance !</p>
      <p style="margin-top: 30px;">
        L'équipe SPYMEO<br>
        <a href="https://spymeo.fr">spymeo.fr</a>
      </p>
    </body>
    </html>
  `,

  candidatureApproved: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🎉 Candidature approuvée !</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Excellente nouvelle ! Votre candidature a été <strong>approuvée</strong> par notre équipe.</p>
      <p>Vous pouvez dès maintenant vous connecter à votre espace professionnel pour commencer l'aventure avec SPYMEO :</p>

      <div style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/auth/login"
           style="display: inline-block; padding: 15px 30px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
          🚀 Accéder à mon espace
        </a>
      </div>

      <p>Bienvenue dans la communauté SPYMEO !</p>
      <p>À très bientôt,<br>L'équipe SPYMEO</p>
    </body>
    </html>
  `,

  candidatureRejected: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Candidature SPYMEO</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Après examen de votre candidature, nous ne pouvons malheureusement pas donner suite à votre demande pour le moment.</p>
      ${data.reason ? `<p><strong>Raison:</strong> ${data.reason}</p>` : ''}
      <p>Nous vous encourageons à renouveler votre candidature ultérieurement.</p>
      <p>Cordialement,<br>L'équipe SPYMEO</p>
    </body>
    </html>
  `,

  accountActivated: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🚀 Bienvenue sur SPYMEO !</h2>
      <p>Bonjour ${data.firstName},</p>
      <p>Votre compte professionnel est maintenant <strong>actif</strong> !</p>
      <p>Vous pouvez dès maintenant accéder à votre espace professionnel :</p>

      <div style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_URL}/pro/dashboard"
           style="display: inline-block; padding: 15px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
          📊 Accéder à mon espace pro
        </a>
      </div>

      <p>Besoin d'aide ? Consultez notre guide de démarrage ou contactez-nous.</p>
      <p>Excellente journée,<br>L'équipe SPYMEO</p>
    </body>
    </html>
  `,
};
