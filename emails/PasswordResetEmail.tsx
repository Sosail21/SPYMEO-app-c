/**
 * Password reset email template
 * Sent when user requests password reset
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface PasswordResetEmailProps {
  userName: string;
  resetToken: string;
  expiresIn?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const PasswordResetEmail = ({
  userName,
  resetToken,
  expiresIn = '1 heure',
}: PasswordResetEmailProps) => {
  const resetUrl = `${baseUrl}/auth/reset?token=${resetToken}`;

  return (
    <EmailLayout preview="Réinitialisation de votre mot de passe SPYMEO">
      <Heading style={h1}>Réinitialisation de mot de passe 🔐</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte
        SPYMEO.
      </Text>

      <Section style={warning}>
        <Text style={warningText}>
          ⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre
          mot de passe restera inchangé.
        </Text>
      </Section>

      <Text style={text}>
        Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :
      </Text>

      <Section style={ctaSection}>
        <Button href={resetUrl}>Réinitialiser mon mot de passe</Button>
      </Section>

      <Text style={text}>
        Ou copiez et collez ce lien dans votre navigateur :
      </Text>

      <Section style={linkBox}>
        <Text style={linkText}>{resetUrl}</Text>
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          ⏱️ Ce lien est valable pendant {expiresIn}. Passé ce délai, vous devrez faire
          une nouvelle demande.
        </Text>
      </Section>

      <Text style={text}>
        Quelques conseils pour un mot de passe sécurisé :
      </Text>

      <Section style={list}>
        <Text style={listItem}>• Au moins 8 caractères</Text>
        <Text style={listItem}>• Mélange de majuscules et minuscules</Text>
        <Text style={listItem}>• Chiffres et caractères spéciaux</Text>
        <Text style={listItem}>• Unique pour chaque service</Text>
      </Section>

      <Text style={text}>
        Si vous rencontrez des difficultés, contactez notre support à{' '}
        <strong>support@spymeo.fr</strong>
      </Text>

      <Text style={signature}>
        Cordialement,
        <br />
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const warning = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #f59e0b',
};

const warningText = {
  color: '#92400e',
  fontSize: '15px',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const linkBox = {
  backgroundColor: '#f9fafb',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '16px 0',
  border: '1px solid #e5e7eb',
};

const linkText = {
  color: '#8b5cf6',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  margin: '0',
};

const infoBox = {
  backgroundColor: '#dbeafe',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #3b82f6',
};

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '0',
};

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default PasswordResetEmail;
