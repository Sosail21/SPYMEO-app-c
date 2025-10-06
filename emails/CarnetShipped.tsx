/**
 * Carnet shipped notification email
 * Sent when the PASS carnet is shipped
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface CarnetShippedProps {
  userName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const CarnetShipped = ({
  userName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  shippingAddress,
}: CarnetShippedProps) => {
  const getCarrierTrackingUrl = () => {
    const carriers: Record<string, string> = {
      'Colissimo': `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
      'Chronopost': `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${trackingNumber}`,
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'DHL': `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${trackingNumber}`,
    };
    return carriers[carrier] || '#';
  };

  return (
    <EmailLayout preview="Votre carnet PASS est en route !">
      <Section style={shippingBanner}>
        <Text style={bannerText}>📦 Votre carnet est expédié !</Text>
      </Section>

      <Heading style={h1}>Votre carnet PASS est en route</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Bonne nouvelle ! Votre carnet PASS avec vos coupons de réduction a été expédié et
        est en route vers vous.
      </Text>

      <Section style={trackingCard}>
        <Text style={cardTitle}>📍 Informations de suivi</Text>

        <Section style={trackingInfo}>
          <Section style={infoRow}>
            <Text style={infoLabel}>Numéro de suivi</Text>
            <Text style={infoValue}>{trackingNumber}</Text>
          </Section>

          <Section style={infoRow}>
            <Text style={infoLabel}>Transporteur</Text>
            <Text style={infoValue}>{carrier}</Text>
          </Section>

          <Section style={infoRow}>
            <Text style={infoLabel}>Livraison estimée</Text>
            <Text style={infoValue}>{estimatedDelivery}</Text>
          </Section>

          <Section style={infoRow}>
            <Text style={infoLabel}>Adresse de livraison</Text>
            <Text style={infoValue}>{shippingAddress}</Text>
          </Section>
        </Section>

        <Section style={trackingButton}>
          <Button href={getCarrierTrackingUrl()}>Suivre mon colis</Button>
        </Section>
      </Section>

      <Section style={contentBox}>
        <Text style={contentTitle}>📚 Contenu de votre carnet :</Text>
        <Section style={contentList}>
          <Text style={contentItem}>
            • <strong>Coupons de réduction</strong> valables chez tous nos partenaires
          </Text>
          <Text style={contentItem}>
            • <strong>Guide d'utilisation</strong> complet du PASS SPYMEO
          </Text>
          <Text style={contentItem}>
            • <strong>Carte de membre</strong> personnalisée
          </Text>
          <Text style={contentItem}>
            • <strong>Liste des partenaires</strong> et leurs coordonnées
          </Text>
        </Section>
      </Section>

      <Section style={tipsBox}>
        <Text style={tipsTitle}>💡 Conseils d'utilisation :</Text>
        <Section style={tipsList}>
          <Text style={tipItem}>
            ✓ Conservez précieusement votre carnet, il contient vos coupons uniques
          </Text>
          <Text style={tipItem}>
            ✓ Vérifiez les dates de validité de chaque coupon
          </Text>
          <Text style={tipItem}>
            ✓ Présentez votre carte de membre lors de vos rendez-vous
          </Text>
          <Text style={tipItem}>
            ✓ Consultez régulièrement les nouveaux partenaires en ligne
          </Text>
        </Section>
      </Section>

      <Section style={helpBox}>
        <Text style={helpText}>
          <strong>📞 Questions sur votre livraison ?</strong>
          <br />
          Contactez notre support à <strong>support@spymeo.fr</strong> ou consultez votre
          espace PASS.
        </Text>
      </Section>

      <Text style={signature}>
        Bonne réception !
        <br />
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const shippingBanner = {
  backgroundColor: '#d1fae5',
  padding: '16px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #10b981',
};

const bannerText = {
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

const trackingCard = {
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
  margin: '0 0 20px',
};

const trackingInfo = {
  margin: '0 0 24px',
};

const infoRow = {
  margin: '12px 0',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const trackingButton = {
  textAlign: 'center' as const,
  margin: '16px 0 0',
};

const contentBox = {
  backgroundColor: '#ede9fe',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #8b5cf6',
};

const contentTitle = {
  color: '#5b21b6',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const contentList = {
  margin: '0',
};

const contentItem = {
  color: '#6b21a8',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
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
  lineHeight: '22px',
  margin: '8px 0',
};

const helpBox = {
  backgroundColor: '#dbeafe',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const helpText = {
  color: '#1e40af',
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

export default CarnetShipped;
