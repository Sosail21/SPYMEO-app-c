/**
 * Invoice email template
 * Sent when an invoice is generated
 */

import { Heading, Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface InvoiceEmailProps {
  userName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  downloadUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const InvoiceEmail = ({
  userName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
  items,
  downloadUrl,
}: InvoiceEmailProps) => {
  return (
    <EmailLayout preview={`Facture ${invoiceNumber} - ${amount}`}>
      <Heading style={h1}>Nouvelle facture disponible</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Votre facture <strong>{invoiceNumber}</strong> est maintenant disponible.
      </Text>

      <Section style={invoiceCard}>
        <Section style={invoiceHeader}>
          <Text style={invoiceTitle}>Facture {invoiceNumber}</Text>
          <Text style={invoiceAmount}>{amount}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={invoiceDetails}>
          <Section style={detailRow}>
            <Text style={detailLabel}>Date d'émission</Text>
            <Text style={detailValue}>{invoiceDate}</Text>
          </Section>

          <Section style={detailRow}>
            <Text style={detailLabel}>Date d'échéance</Text>
            <Text style={detailValue}>{dueDate}</Text>
          </Section>
        </Section>

        <Hr style={hr} />

        <Section style={itemsSection}>
          <Text style={itemsTitle}>Détails de la facture :</Text>
          {items.map((item, index) => (
            <Section key={index} style={itemRow}>
              <Section style={itemInfo}>
                <Text style={itemDescription}>{item.description}</Text>
                <Text style={itemQuantity}>
                  Qté: {item.quantity} × {item.unitPrice}
                </Text>
              </Section>
              <Text style={itemTotal}>{item.total}</Text>
            </Section>
          ))}
        </Section>

        <Hr style={hr} />

        <Section style={totalSection}>
          <Text style={totalLabel}>Total TTC</Text>
          <Text style={totalAmount}>{amount}</Text>
        </Section>
      </Section>

      <Section style={ctaSection}>
        <Button href={downloadUrl}>Télécharger la facture (PDF)</Button>
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          💡 Vous pouvez également consulter toutes vos factures depuis votre espace
          personnel dans la section "Facturation".
        </Text>
      </Section>

      <Section style={paymentInfo}>
        <Text style={paymentTitle}>Informations de paiement :</Text>
        <Text style={paymentText}>
          Cette facture a été réglée par prélèvement automatique sur votre moyen de
          paiement enregistré. Aucune action n'est requise de votre part.
        </Text>
      </Section>

      <Text style={text}>
        Des questions concernant cette facture ? Contactez notre service facturation à{' '}
        <strong>facturation@spymeo.fr</strong>
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

const invoiceCard = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #e5e7eb',
};

const invoiceHeader = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: '16px',
};

const invoiceTitle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
};

const invoiceAmount = {
  color: '#8b5cf6',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const invoiceDetails = {
  margin: '16px 0',
};

const detailRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  margin: '8px 0',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const itemsSection = {
  margin: '16px 0',
};

const itemsTitle = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const itemRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'flex-start' as const,
  margin: '12px 0',
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
};

const itemInfo = {
  flex: '1',
};

const itemDescription = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const itemTotal = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  marginLeft: '16px',
};

const totalSection = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  margin: '16px 0 0',
};

const totalLabel = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const totalAmount = {
  color: '#8b5cf6',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
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

const paymentInfo = {
  backgroundColor: '#f0fdf4',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #10b981',
};

const paymentTitle = {
  color: '#065f46',
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const paymentText = {
  color: '#047857',
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

export default InvoiceEmail;
