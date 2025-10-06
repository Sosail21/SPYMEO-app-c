/**
 * PASS activation email
 * Sent when user activates PASS subscription
 */

import { Heading, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface PassActivatedProps {
  userName: string;
  planName: string;
  planPrice: string;
  startDate: string;
  renewalDate: string;
  benefits: string[];
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const PassActivated = ({
  userName,
  planName,
  planPrice,
  startDate,
  renewalDate,
  benefits,
}: PassActivatedProps) => {
  return (
    <EmailLayout preview={`Votre PASS ${planName} est activé !`}>
      <Section style={successBanner}>
        <Text style={successText}>🎉 PASS Activé !</Text>
      </Section>

      <Heading style={h1}>Bienvenue dans le PASS SPYMEO !</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Félicitations ! Votre abonnement <strong>{planName}</strong> est maintenant actif.
        Vous pouvez dès à présent profiter de tous vos avantages exclusifs.
      </Text>

      <Section style={passCard}>
        <Text style={cardTitle}>Votre abonnement</Text>
        <Hr style={hr} />

        <Section style={detail}>
          <Text style={detailLabel}>Formule</Text>
          <Text style={detailValue}>{planName}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>Prix</Text>
          <Text style={detailValue}>{planPrice}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>Date d'activation</Text>
          <Text style={detailValue}>{startDate}</Text>
        </Section>

        <Section style={detail}>
          <Text style={detailLabel}>Prochain renouvellement</Text>
          <Text style={detailValue}>{renewalDate}</Text>
        </Section>
      </Section>

      <Text style={text}>
        <strong>Vos avantages PASS :</strong>
      </Text>

      <Section style={benefitsList}>
        {benefits.map((benefit, index) => (
          <Section key={index} style={benefitItem}>
            <Text style={checkIcon}>✓</Text>
            <Text style={benefitText}>{benefit}</Text>
          </Section>
        ))}
      </Section>

      <Section style={ctaSection}>
        <Button href={`${baseUrl}/user/pass`}>Découvrir mes avantages</Button>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>📦 Votre carnet PASS</Text>
        <Text style={infoText}>
          Votre carnet physique avec vos coupons de réduction sera expédié sous 48h à
          l'adresse indiquée lors de votre inscription. Vous recevrez un email de
          confirmation d'expédition avec le numéro de suivi.
        </Text>
      </Section>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>💡 Pour bien démarrer :</Text>
        <Section style={stepsList}>
          <Text style={stepItem}>1. Explorez le répertoire des professionnels partenaires</Text>
          <Text style={stepItem}>2. Consultez vos ressources exclusives</Text>
          <Text style={stepItem}>3. Planifiez vos rendez-vous et profitez des réductions</Text>
          <Text style={stepItem}>4. Restez informé des nouveaux avantages</Text>
        </Section>
      </Section>

      <Text style={text}>
        Besoin d'aide ? Notre équipe support est disponible à{' '}
        <strong>support@spymeo.fr</strong>
      </Text>

      <Text style={signature}>
        Profitez bien de votre PASS !
        <br />
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const successBanner = {
  backgroundColor: '#d1fae5',
  padding: '16px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #10b981',
};

const successText = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
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

const passCard = {
  backgroundColor: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const cardTitle = {
  color: '#8b5cf6',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const detail = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  margin: '12px 0',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const benefitsList = {
  margin: '16px 0 24px',
};

const benefitItem = {
  display: 'flex' as const,
  alignItems: 'flex-start' as const,
  margin: '12px 0',
};

const checkIcon = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: '700',
  marginRight: '12px',
  margin: '0',
};

const benefitText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const infoBox = {
  backgroundColor: '#ede9fe',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #8b5cf6',
};

const infoTitle = {
  color: '#5b21b6',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const infoText = {
  color: '#6b21a8',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const highlightBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const highlightTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const stepsList = {
  margin: '0',
};

const stepItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default PassActivated;
