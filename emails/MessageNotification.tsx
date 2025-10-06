/**
 * Message notification email
 * Sent when a user receives a new message
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface MessageNotificationProps {
  recipientName: string;
  senderName: string;
  senderAvatar?: string;
  messagePreview: string;
  conversationId: string;
  sentAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const MessageNotification = ({
  recipientName,
  senderName,
  senderAvatar,
  messagePreview,
  conversationId,
  sentAt,
}: MessageNotificationProps) => {
  return (
    <EmailLayout preview={`Nouveau message de ${senderName}`}>
      <Section style={notificationBadge}>
        <Text style={badgeText}>💬 Nouveau message</Text>
      </Section>

      <Heading style={h1}>Vous avez reçu un message</Heading>

      <Text style={text}>Bonjour {recipientName},</Text>

      <Text style={text}>
        <strong>{senderName}</strong> vous a envoyé un message sur SPYMEO.
      </Text>

      <Section style={messageCard}>
        <Section style={senderInfo}>
          {senderAvatar && (
            <img src={senderAvatar} alt={senderName} style={avatar} />
          )}
          <Section style={senderDetails}>
            <Text style={senderName}>{senderName}</Text>
            <Text style={timestamp}>{sentAt}</Text>
          </Section>
        </Section>

        <Section style={messageContent}>
          <Text style={messageText}>{messagePreview}</Text>
        </Section>
      </Section>

      <Section style={ctaSection}>
        <Button href={`${baseUrl}/user/messagerie/${conversationId}`}>
          Lire et répondre
        </Button>
      </Section>

      <Section style={quickTip}>
        <Text style={tipText}>
          💡 Astuce : Activez les notifications push pour ne manquer aucun message
        </Text>
      </Section>

      <Text style={text}>
        Vous pouvez également accéder à vos messages depuis votre tableau de bord.
      </Text>

      <Section style={preferencesBox}>
        <Text style={preferencesText}>
          Vous recevez cet email car vous avez activé les notifications par email pour
          les messages. Vous pouvez modifier vos préférences à tout moment depuis{' '}
          <a href={`${baseUrl}/user/email-preferences`} style={link}>
            vos paramètres
          </a>
          .
        </Text>
      </Section>

      <Text style={signature}>
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const notificationBadge = {
  backgroundColor: '#ede9fe',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0 0 24px',
};

const badgeText = {
  color: '#7c3aed',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

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

const messageCard = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
  borderLeft: '4px solid #8b5cf6',
};

const senderInfo = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  marginBottom: '16px',
};

const avatar = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  marginRight: '12px',
};

const senderDetails = {
  flex: '1',
};

const senderName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const timestamp = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const messageContent = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const messageText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic' as const,
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const quickTip = {
  backgroundColor: '#dbeafe',
  padding: '12px 16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const tipText = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '0',
};

const preferencesBox = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
};

const preferencesText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0',
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default MessageNotification;
