/**
 * PASS renewal reminder email
 * Sent before PASS subscription renewal
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface PassRenewalProps {
  userName: string;
  planName: string;
  planPrice: string;
  renewalDate: string;
  daysUntilRenewal: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const PassRenewal = ({
  userName,
  planName,
  planPrice,
  renewalDate,
  daysUntilRenewal,
}: PassRenewalProps) => {
  return (
    <EmailLayout preview={`Renouvellement de votre PASS dans ${daysUntilRenewal} jours`}>
      <Section style={reminderBanner}>
        <Text style={reminderText}>
          ⏰ Renouvellement dans {daysUntilRenewal} jour{daysUntilRenewal > 1 ? 's' : ''}
        </Text>
      </Section>

      <Heading style={h1}>Renouvellement de votre PASS</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Votre abonnement <strong>{planName}</strong> sera automatiquement renouvelé le{' '}
        <strong>{renewalDate}</strong>.
      </Text>

      <Section style={renewalCard}>
        <Section style={cardRow}>
          <Text style={cardLabel}>Formule</Text>
          <Text style={cardValue}>{planName}</Text>
        </Section>
        <Section style={cardRow}>
          <Text style={cardLabel}>Montant</Text>
          <Text style={cardValue}>{planPrice}</Text>
        </Section>
        <Section style={cardRow}>
          <Text style={cardLabel}>Date de renouvellement</Text>
          <Text style={cardValue}>{renewalDate}</Text>
        </Section>
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          💳 Le paiement sera automatiquement prélevé sur votre moyen de paiement
          enregistré. Vous recevrez une confirmation par email après le renouvellement.
        </Text>
      </Section>

      <Text style={text}>
        <strong>Vous souhaitez continuer ?</strong>
        <br />
        Aucune action n'est requise. Votre abonnement sera renouvelé automatiquement et
        vous pourrez continuer à profiter de tous vos avantages PASS.
      </Text>

      <Section style={ctaSection}>
        <Button href={`${baseUrl}/user/pass`}>Gérer mon abonnement</Button>
      </Section>

      <Section style={benefitsBox}>
        <Text style={benefitsTitle}>✨ Vos avantages continuent :</Text>
        <Section style={benefitsList}>
          <Text style={benefitItem}>• Accès illimité aux ressources exclusives</Text>
          <Text style={benefitItem}>• Réductions chez tous nos partenaires</Text>
          <Text style={benefitItem}>• Carnet de coupons renouvelé</Text>
          <Text style={benefitItem}>• Support prioritaire</Text>
          <Text style={benefitItem}>• Nouveaux avantages chaque mois</Text>
        </Section>
      </Section>

      <Section style={warningBox}>
        <Text style={warningTitle}>⚠️ Vous souhaitez annuler ?</Text>
        <Text style={warningText}>
          Si vous ne souhaitez pas renouveler votre abonnement, vous devez l'annuler avant
          le {renewalDate}. Vous pouvez le faire depuis votre tableau de bord.
        </Text>
      </Section>

      <Text style={text}>
        <strong>Besoin d'aide ?</strong>
        <br />
        Contactez-nous à <strong>support@spymeo.fr</strong>
      </Text>

      <Text style={signature}>
        Merci de votre confiance,
        <br />
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const reminderBanner = {
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #f59e0b',
};

const reminderText = {
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

const renewalCard = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const cardRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  margin: '12px 0',
};

const cardLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const cardValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
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
  lineHeight: '20px',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #10b981',
};

const benefitsTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const benefitsList = {
  margin: '0',
};

const benefitItem = {
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

const warningTitle = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px',
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

export default PassRenewal;
