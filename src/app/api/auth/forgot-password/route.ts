// Cdw-Spm: Forgot Password API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Pour des raisons de sécurité, on renvoie toujours un succès même si l'email n'existe pas
    if (!user) {
      console.log(`[FORGOT_PASSWORD] Tentative pour email inexistant: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileData: {
          ...(user.profileData as any || {}),
          resetToken: resetTokenHash,
          resetTokenExpiry: resetTokenExpiry.toISOString()
        }
      }
    });

    // Construire le lien de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://spymeo.fr';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Envoyer l'email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe SPYMEO',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: #17a2b8; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0;">🔒 Réinitialisation de mot de passe</h2>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>Bonjour${user.firstName ? ` ${user.firstName}` : ''},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe sur SPYMEO.</p>
              <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}"
                   style="display: inline-block; padding: 15px 30px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                  Réinitialiser mon mot de passe
                </a>
              </div>

              <p style="color: #6c757d; font-size: 14px;">
                Ce lien est valable pendant <strong>1 heure</strong>.
              </p>

              <p style="color: #6c757d; font-size: 14px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong><br>
                Ignorez simplement cet email. Votre mot de passe ne sera pas modifié.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #6c757d; font-size: 12px;">
              <p>Cet email a été envoyé automatiquement depuis SPYMEO.</p>
              <p><a href="https://spymeo.fr" style="color: #007bff;">spymeo.fr</a></p>
            </div>
          </body>
          </html>
        `
      });

      console.log(`[FORGOT_PASSWORD] Email envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('[FORGOT_PASSWORD] Erreur envoi email:', emailError);
      // On ne révèle pas l'erreur d'email pour des raisons de sécurité
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    });
  } catch (error: any) {
    console.error('[FORGOT_PASSWORD] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    );
  }
}
