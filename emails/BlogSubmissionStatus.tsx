/**
 * Blog submission status email
 * Sent to practitioners when their blog article is approved or rejected
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface BlogSubmissionStatusProps {
  practitionerName: string;
  articleTitle: string;
  status: 'approved' | 'rejected';
  feedback?: string;
  articleSlug?: string;
  submittedAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const BlogSubmissionStatus = ({
  practitionerName,
  articleTitle,
  status,
  feedback,
  articleSlug,
  submittedAt,
}: BlogSubmissionStatusProps) => {
  const isApproved = status === 'approved';

  return (
    <EmailLayout preview={`Votre article "${articleTitle}" a été ${isApproved ? 'approuvé' : 'rejeté'}`}>
      <Section style={isApproved ? approvedBanner : rejectedBanner}>
        <Text style={bannerText}>
          {isApproved ? '✅ Article approuvé' : '❌ Article rejeté'}
        </Text>
      </Section>

      <Heading style={h1}>
        {isApproved
          ? 'Votre article a été approuvé !'
          : 'Votre article nécessite des modifications'}
      </Heading>

      <Text style={text}>Bonjour {practitionerName},</Text>

      <Text style={text}>
        Nous avons examiné votre article{' '}
        <strong>"{articleTitle}"</strong> soumis le {submittedAt}.
      </Text>

      {isApproved ? (
        <>
          <Section style={successBox}>
            <Text style={successTitle}>🎉 Félicitations !</Text>
            <Text style={successText}>
              Votre article a été approuvé et sera publié prochainement sur le blog
              SPYMEO. Il sera visible par tous les utilisateurs de la plateforme.
            </Text>
          </Section>

          <Section style={infoCard}>
            <Text style={infoTitle}>Prochaines étapes :</Text>
            <Section style={stepsList}>
              <Text style={stepItem}>
                1. Votre article sera publié dans les 24h
              </Text>
              <Text style={stepItem}>
                2. Vous recevrez un email de confirmation de publication
              </Text>
              <Text style={stepItem}>
                3. Votre article sera partagé sur nos réseaux sociaux
              </Text>
              <Text style={stepItem}>
                4. Vous pourrez suivre ses statistiques depuis votre dashboard
              </Text>
            </Section>
          </Section>

          {articleSlug && (
            <Section style={ctaSection}>
              <Button href={`${baseUrl}/blog/${articleSlug}`}>
                Prévisualiser l'article
              </Button>
            </Section>
          )}

          <Section style={benefitsBox}>
            <Text style={benefitsTitle}>📈 Avantages pour vous :</Text>
            <Section style={benefitsList}>
              <Text style={benefitItem}>
                • Augmentez votre visibilité auprès de notre communauté
              </Text>
              <Text style={benefitItem}>
                • Démontrez votre expertise dans votre domaine
              </Text>
              <Text style={benefitItem}>
                • Attirez de nouveaux clients potentiels
              </Text>
              <Text style={benefitItem}>
                • Contribuez à la communauté SPYMEO
              </Text>
            </Section>
          </Section>
        </>
      ) : (
        <>
          <Section style={rejectionBox}>
            <Text style={rejectionTitle}>Modifications nécessaires</Text>
            <Text style={rejectionText}>
              Votre article ne peut pas être publié dans son état actuel. Nos modérateurs
              ont identifié des points à améliorer.
            </Text>
          </Section>

          {feedback && (
            <Section style={feedbackCard}>
              <Text style={feedbackTitle}>💬 Retour de nos modérateurs :</Text>
              <Section style={feedbackContent}>
                <Text style={feedbackText}>{feedback}</Text>
              </Section>
            </Section>
          )}

          <Section style={guideBox}>
            <Text style={guideTitle}>📝 Conseils pour améliorer votre article :</Text>
            <Section style={guideList}>
              <Text style={guideItem}>
                • Vérifiez l'orthographe et la grammaire
              </Text>
              <Text style={guideItem}>
                • Assurez-vous que le contenu est pertinent et informatif
              </Text>
              <Text style={guideItem}>
                • Ajoutez des sources si vous citez des études ou statistiques
              </Text>
              <Text style={guideItem}>
                • Respectez notre charte éditoriale
              </Text>
              <Text style={guideItem}>
                • Évitez tout contenu promotionnel excessif
              </Text>
            </Section>
          </Section>

          <Section style={ctaSection}>
            <Button href={`${baseUrl}/pro/praticien/blog-proposer`}>
              Modifier et soumettre à nouveau
            </Button>
          </Section>
        </>
      )}

      <Text style={text}>
        {isApproved
          ? 'Merci pour votre contribution au blog SPYMEO !'
          : "N'hésitez pas à soumettre une nouvelle version de votre article après modifications."}
      </Text>

      <Text style={text}>
        Des questions ? Contactez notre équipe éditoriale à{' '}
        <strong>blog@spymeo.fr</strong>
      </Text>

      <Text style={signature}>
        {isApproved ? 'Bravo et à bientôt,' : 'Cordialement,'}
        <br />
        L'équipe éditoriale SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const approvedBanner = {
  backgroundColor: '#d1fae5',
  padding: '12px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #10b981',
};

const rejectedBanner = {
  backgroundColor: '#fee2e2',
  padding: '12px',
  borderRadius: '8px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  borderLeft: '4px solid #ef4444',
};

const bannerText = {
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

const successBox = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '12px',
  margin: '24px 0',
  borderLeft: '4px solid #10b981',
};

const successTitle = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const successText = {
  color: '#047857',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
};

const rejectionBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '12px',
  margin: '24px 0',
  borderLeft: '4px solid #f59e0b',
};

const rejectionTitle = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const rejectionText = {
  color: '#b45309',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
};

const infoCard = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const infoTitle = {
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

const feedbackCard = {
  backgroundColor: '#ede9fe',
  padding: '20px',
  borderRadius: '12px',
  margin: '24px 0',
  borderLeft: '4px solid #8b5cf6',
};

const feedbackTitle = {
  color: '#5b21b6',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const feedbackContent = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #ddd6fe',
};

const feedbackText = {
  color: '#1f2937',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic' as const,
};

const guideBox = {
  backgroundColor: '#dbeafe',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #3b82f6',
};

const guideTitle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const guideList = {
  margin: '0',
};

const guideItem = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '6px 0',
};

const benefitsBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const benefitsTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const benefitsList = {
  margin: '0',
};

const benefitItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '6px 0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default BlogSubmissionStatus;
