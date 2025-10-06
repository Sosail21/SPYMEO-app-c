/**
 * Appointment confirmation email
 * Sent when a user books an appointment
 */

import { Heading, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface AppointmentConfirmationProps {
  userName: string;
  practitionerName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  location?: string;
  appointmentType: string;
  notes?: string;
  appointmentId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const AppointmentConfirmation = ({
  userName,
  practitionerName,
  appointmentDate,
  appointmentTime,
  duration,
  location,
  appointmentType,
  notes,
  appointmentId,
}: AppointmentConfirmationProps) => {
  return (
    <EmailLayout preview={`Rendez-vous confirmé avec ${practitionerName}`}>
      <Heading style={h1}>Rendez-vous confirmé ✅</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Votre rendez-vous avec <strong>{practitionerName}</strong> a été confirmé avec
        succès !
      </Text>

      <Section style={appointmentCard}>
        <Text style={cardTitle}>Détails du rendez-vous</Text>
        <Hr style={hr} />

        <Section style={detail}>
          <Text style={detailLabel}>📅 Date</Text>
          <Text style={detailValue}>{appointmentDate}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>🕐 Heure</Text>
          <Text style={detailValue}>{appointmentTime}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>⏱️ Durée</Text>
          <Text style={detailValue}>{duration}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>👤 Praticien</Text>
          <Text style={detailValue}>{practitionerName}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>📋 Type</Text>
          <Text style={detailValue}>{appointmentType}</Text>
        </Section>

        {location && (
          <Section style={detail}>
            <Text style={detailLabel}>📍 Lieu</Text>
            <Text style={detailValue}>{location}</Text>
          </Section>
        )}

        {notes && (
          <Section style={detail}>
            <Text style={detailLabel}>📝 Notes</Text>
            <Text style={detailValue}>{notes}</Text>
          </Section>
        )}
      </Section>

      <Section style={ctaSection}>
        <Button href={`${baseUrl}/user/rendez-vous/${appointmentId}`}>
          Voir les détails
        </Button>
      </Section>

      <Section style={reminderBox}>
        <Text style={reminderText}>
          💡 Un rappel vous sera envoyé 24h avant votre rendez-vous
        </Text>
      </Section>

      <Text style={text}>
        <strong>Besoin de modifier ou annuler ?</strong>
        <br />
        Vous pouvez gérer vos rendez-vous depuis votre tableau de bord.
      </Text>

      <Text style={text}>
        <strong>Préparez votre rendez-vous :</strong>
      </Text>

      <Section style={list}>
        <Text style={listItem}>• Notez vos questions et préoccupations</Text>
        <Text style={listItem}>• Préparez vos documents si nécessaire</Text>
        <Text style={listItem}>• Arrivez 5 minutes en avance</Text>
      </Section>

      <Text style={signature}>
        À bientôt,
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

const appointmentCard = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const cardTitle = {
  color: '#8b5cf6',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const detail = {
  display: 'flex' as const,
  margin: '12px 0',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  width: '120px',
  margin: '0',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const reminderBox = {
  backgroundColor: '#dbeafe',
  padding: '12px 16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const reminderText = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '0',
};

const list = {
  margin: '16px 0',
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

export default AppointmentConfirmation;
