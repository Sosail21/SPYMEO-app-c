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

  clientCreatedByPractitioner: (data: { firstName: string; lastName: string; practitionerName: string; email: string }) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin: -30px -30px 30px -30px;">
          <h2 style="margin: 0; font-size: 24px;">🎉 Bonne nouvelle !</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">Votre praticien vient de créer votre compte SPYMEO</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${data.firstName} ${data.lastName}</strong>,</p>

        <p style="font-size: 16px; line-height: 1.6;">
          Nous avons une excellente nouvelle à vous annoncer ! Votre praticien <strong>${data.practitionerName}</strong>
          vient de créer votre fiche patient sur SPYMEO.
        </p>

        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 18px;">✨ Pourquoi c'est génial ?</h3>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1b5e20; line-height: 1.8;">
            <li>Prenez rendez-vous en ligne facilement, 24h/24</li>
            <li>Consultez votre historique de consultations</li>
            <li>Accédez à vos documents médicaux en toute sécurité</li>
            <li>Recevez des rappels automatiques pour vos rendez-vous</li>
            <li>Communiquez directement avec votre praticien</li>
          </ul>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 15px;">
            <strong>📧 Première connexion :</strong><br>
            Un email avec vos identifiants de connexion vous sera envoyé séparément.
            Si vous ne le recevez pas d'ici quelques minutes, pensez à vérifier vos spams.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/auth/login"
             style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
            🚀 Découvrir mon espace patient
          </a>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">
            <strong>Besoin d'aide ?</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.6;">
            Notre équipe support est là pour vous accompagner. N'hésitez pas à nous contacter si vous avez des questions.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6c757d;">
            Cet email vous a été envoyé car votre praticien <strong>${data.practitionerName}</strong> a créé votre fiche patient.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">
            © ${new Date().getFullYear()} SPYMEO - Plateforme de santé holistique
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  appointmentCancellation: (data: {
    practitionerName: string;
    clientName: string;
    appointmentTitle: string;
    appointmentDate: Date;
    cancelledBy: 'client' | 'practitioner';
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🚫</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Rendez-vous annulé</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Bonjour <strong>${data.practitionerName}</strong>,
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Un rendez-vous a été annulé par ${data.cancelledBy === 'client' ? 'votre client' : 'vous'}.
          </p>

          <!-- Appointment Details Box -->
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">Détails du rendez-vous annulé</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Client :</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${data.clientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Consultation :</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${data.appointmentTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Date et heure :</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${new Date(data.appointmentDate).toLocaleString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Annulé par :</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${data.cancelledBy === 'client' ? 'Client' : 'Praticien'}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #6c757d; line-height: 1.6; margin: 20px 0;">
            ${data.cancelledBy === 'client'
              ? 'Le créneau horaire est maintenant disponible pour d\'autres réservations. Vous pouvez le libérer définitivement depuis votre agenda en supprimant le rendez-vous annulé.'
              : 'Le client a été informé de l\'annulation.'}
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr'}/pro/praticien/agenda"
               style="display: inline-block; padding: 14px 32px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              📅 Voir mon agenda
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.6;">
              Cet email vous a été envoyé par <strong>SPYMEO</strong> suite à l'annulation d'un rendez-vous.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">
              © ${new Date().getFullYear()} SPYMEO - Plateforme de santé holistique
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};

/**
 * Send appointment cancellation email to practitioner
 */
export async function sendAppointmentCancellationEmail(data: {
  to: string;
  practitionerName: string;
  clientName: string;
  appointmentTitle: string;
  appointmentDate: Date;
  cancelledBy: 'client' | 'practitioner';
}) {
  return sendEmail({
    to: data.to,
    subject: `🚫 Rendez-vous annulé - ${data.clientName}`,
    html: emailTemplates.appointmentCancellation(data),
  });
}
