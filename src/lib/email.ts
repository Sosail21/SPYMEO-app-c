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
        <a href="${process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/admin/pros"
           style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">
          📋 Voir dans le panneau admin
        </a>
      </div>
    </body>
    </html>
  `,

  adminNotificationPro: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="background: #17a2b8; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🧩 Nouvelle candidature Praticien</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Demande d'inscription reçue le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📋 Informations personnelles</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Nom complet:</strong></td>
            <td style="padding: 8px 0;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Téléphone:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Ville:</strong></td>
            <td style="padding: 8px 0;">${data.city}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">💼 Activité professionnelle</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Discipline:</strong></td>
            <td style="padding: 8px 0;">${data.discipline}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Expérience:</strong></td>
            <td style="padding: 8px 0;">${data.experience} ans</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>SIRET:</strong></td>
            <td style="padding: 8px 0;">${data.siret}</td>
          </tr>
        </table>
      </div>

      ${data.presentation ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📝 Présentation</h3>
        <p style="margin: 0; white-space: pre-wrap;">${data.presentation}</p>
      </div>
      ` : ''}

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #856404;">📎 Documents justificatifs</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.documents.diploma ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #ffc107;">
            <strong>Diplôme:</strong>
            <a href="${data.documents.diploma}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Diplôme non fourni</li>'}

          ${data.documents.insurance ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #ffc107;">
            <strong>Assurance RC Pro:</strong>
            <a href="${data.documents.insurance}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Assurance RC Pro non fournie</li>'}

          ${data.documents.kbis ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #ffc107;">
            <strong>Kbis:</strong>
            <a href="${data.documents.kbis}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Kbis non fourni</li>'}

          ${data.documents.criminalRecord ? `
          <li style="padding: 8px 0;">
            <strong>Casier judiciaire:</strong>
            <a href="${data.documents.criminalRecord}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Casier judiciaire non fourni</li>'}
        </ul>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/admin/pros"
           style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          📋 Gérer dans le panneau admin
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
        <p>Cet email a été envoyé automatiquement depuis SPYMEO.</p>
      </div>
    </body>
    </html>
  `,

  adminNotificationArtisan: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="background: #fd7e14; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🎨 Nouvelle candidature Artisan</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Demande d'inscription reçue le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📋 Informations personnelles</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Nom complet:</strong></td>
            <td style="padding: 8px 0;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Téléphone:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
        </table>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">💼 Activité artisanale</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Catégorie:</strong></td>
            <td style="padding: 8px 0;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Nature des produits:</strong></td>
            <td style="padding: 8px 0;">${data.productNature}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Adresse:</strong></td>
            <td style="padding: 8px 0;">${data.address}, ${data.postalCode} ${data.city}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>SIRET:</strong></td>
            <td style="padding: 8px 0;">${data.siret}</td>
          </tr>
        </table>
      </div>

      ${data.presentation ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📝 Présentation</h3>
        <p style="margin: 0; white-space: pre-wrap;">${data.presentation}</p>
      </div>
      ` : ''}

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #856404;">📎 Documents justificatifs</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.documents.kbis ? `
          <li style="padding: 8px 0;">
            <strong>Kbis:</strong>
            <a href="${data.documents.kbis}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Kbis non fourni</li>'}
        </ul>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/admin/pros"
           style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          📋 Gérer dans le panneau admin
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
        <p>Cet email a été envoyé automatiquement depuis SPYMEO.</p>
      </div>
    </body>
    </html>
  `,

  adminNotificationCommercant: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="background: #6f42c1; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🏪 Nouvelle candidature Commerçant</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Demande d'inscription reçue le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📋 Informations personnelles</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Nom complet:</strong></td>
            <td style="padding: 8px 0;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Téléphone:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
        </table>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">💼 Activité commerciale</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Catégorie:</strong></td>
            <td style="padding: 8px 0;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Nature des produits:</strong></td>
            <td style="padding: 8px 0;">${data.productNature}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Adresse:</strong></td>
            <td style="padding: 8px 0;">${data.address}, ${data.postalCode} ${data.city}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>SIRET:</strong></td>
            <td style="padding: 8px 0;">${data.siret}</td>
          </tr>
        </table>
      </div>

      ${data.presentation ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📝 Présentation</h3>
        <p style="margin: 0; white-space: pre-wrap;">${data.presentation}</p>
      </div>
      ` : ''}

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #856404;">📎 Documents justificatifs</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.documents.kbis ? `
          <li style="padding: 8px 0;">
            <strong>Kbis:</strong>
            <a href="${data.documents.kbis}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Kbis non fourni</li>'}
        </ul>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/admin/pros"
           style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          📋 Gérer dans le panneau admin
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
        <p>Cet email a été envoyé automatiquement depuis SPYMEO.</p>
      </div>
    </body>
    </html>
  `,

  adminNotificationCenter: (data: any) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="background: #20c997; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🎓 Nouvelle candidature Centre de Formation</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Demande d'inscription reçue le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📋 Informations du responsable</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Nom complet:</strong></td>
            <td style="padding: 8px 0;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Téléphone:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
        </table>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">💼 Informations sur le centre</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; vertical-align: top;"><strong>Types de formations:</strong></td>
            <td style="padding: 8px 0;">${data.formationTypes}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Adresse du centre:</strong></td>
            <td style="padding: 8px 0;">${data.address}, ${data.postalCode} ${data.city}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>SIRET:</strong></td>
            <td style="padding: 8px 0;">${data.siret}</td>
          </tr>
        </table>
      </div>

      ${data.presentation ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">📝 Présentation</h3>
        <p style="margin: 0; white-space: pre-wrap;">${data.presentation}</p>
      </div>
      ` : ''}

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #856404;">📎 Documents justificatifs</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.documents.kbis ? `
          <li style="padding: 8px 0; border-bottom: 1px solid #ffc107;">
            <strong>Kbis:</strong>
            <a href="${data.documents.kbis}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Kbis non fourni</li>'}

          ${data.documents.certifications ? `
          <li style="padding: 8px 0;">
            <strong>Certifications / Agréments:</strong>
            <a href="${data.documents.certifications}" target="_blank" style="color: #007bff; text-decoration: none; margin-left: 10px;">
              📄 Télécharger
            </a>
          </li>
          ` : '<li style="padding: 8px 0; color: #dc3545;">❌ Certifications non fournies</li>'}
        </ul>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/admin/pros"
           style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          📋 Gérer dans le panneau admin
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
        <p>Cet email a été envoyé automatiquement depuis SPYMEO.</p>
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
