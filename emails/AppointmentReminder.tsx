/**
 * Appointment reminder email
 * Sent 24 hours before an appointment
 */

import { Heading, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface AppointmentReminderProps {
  userName: string;
  practitionerName: string;
  appointmentDate: string;
  appointmentTime: string;
  location?: string;
  appointmentType: string;
  appointmentId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const AppointmentReminder = ({
  userName,
  practitionerName,
  appointmentDate,
  appointmentTime,
  location,
  appointmentType,
  appointmentId,
}: AppointmentReminderProps) => {
  return (
    <EmailLayout preview={`Rappel : RDV demain avec ${practitionerName}`}>
      <Section style={urgentBanner}>
        <Text style={urgentText}>⏰ Rappel de rendez-vous</Text>
      </Section>

      <Heading style={h1}>Votre rendez-vous est demain</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Nous vous rappelons que vous avez rendez-vous demain avec{' '}
        <strong>{practitionerName}</strong>.
      </Text>

      <Section style={appointmentCard}>
        <Section style={detail}>
          <Text style={detailLabel}>📅 Date</Text>
          <Text style={detailValue}>{appointmentDate}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={detail}>
          <Text style={detailLabel}>🕐 Heure</Text>
          <Text style={detailValue}>{appointmentTime}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={detail}>
          <Text style={detailLabel}>👤 Praticien</Text>
          <Text style={detailValue}>{practitionerName}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={detail}>
          <Text style={detailLabel}>📋 Type</Text>
          <Text style={detailValue}>{appointmentType}</Text>
        </Section>

        {location && (
          <>
            <Hr style={hr} />
            <Section style={detail}>
              <Text style={detailLabel}>📍 Lieu</Text>
              <Text style={detailValue}>{location}</Text>
            </Section>
          </>
        )}
      </Section>

      <Section style={ctaSection}>
        <Button href={`${baseUrl}/user/rendez-vous/${appointmentId}`}>
          Voir les détails
        </Button>
      </Section>

      <Section style={tipsBox}>
        <Text style={tipsTitle}>💡 Conseils pour votre rendez-vous</Text>
        <Section style={tipsList}>
          <Text style={tipItem}>✓ Préparez vos questions à l'avance</Text>
          <Text style={tipItem}>✓ Apportez vos documents utiles</Text>
          <Text style={tipItem}>✓ Arrivez 5-10 minutes en avance</Text>
          <Text style={tipItem}>✓ Prévoyez le temps de trajet</Text>
        </Section>
      </Section>

      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ <strong>Besoin d'annuler ?</strong>
          <br />
          Merci de prévenir au plus vite depuis votre tableau de bord ou en contactant
          directement le praticien.
        </Text>
      </Section>

      <Text style={text}>À demain !</Text>

      <Text style={signature}>
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const urgentBanner = {
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #f59e0b',
};

const urgentText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '700',
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

const appointmentCard = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const detail = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const tipsBox = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #10b981',
};

const tipsTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const tipsList = {
  margin: '0',
};

const tipItem = {
  color: '#047857',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '6px 0',
};

const warningBox = {
  backgroundColor: '#fee2e2',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #ef4444',
};

const warningText = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default AppointmentReminder;
