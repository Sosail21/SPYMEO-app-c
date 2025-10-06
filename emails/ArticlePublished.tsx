/**
 * Article published notification email
 * Sent to practitioner when their article is published
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface ArticlePublishedProps {
  practitionerName: string;
  articleTitle: string;
  articleSlug: string;
  publishedAt: string;
  coverImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const ArticlePublished = ({
  practitionerName,
  articleTitle,
  articleSlug,
  publishedAt,
  coverImage,
}: ArticlePublishedProps) => {
  const articleUrl = `${baseUrl}/blog/${articleSlug}`;

  return (
    <EmailLayout preview={`Votre article "${articleTitle}" est publié !`}>
      <Section style={publishedBanner}>
        <Text style={bannerText}>🎉 Article publié !</Text>
      </Section>

      <Heading style={h1}>Votre article est en ligne !</Heading>

      <Text style={text}>Bonjour {practitionerName},</Text>

      <Text style={text}>
        Excellente nouvelle ! Votre article <strong>"{articleTitle}"</strong> vient d'être
        publié sur le blog SPYMEO et est maintenant visible par toute notre communauté.
      </Text>

      {coverImage && (
        <Section style={articlePreview}>
          <img src={coverImage} alt={articleTitle} style={coverImg} />
        </Section>
      )}

      <Section style={articleCard}>
        <Text style={cardTitle}>{articleTitle}</Text>
        <Text style={cardMeta}>
          Publié le {publishedAt} par {practitionerName}
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={articleUrl}>Voir l'article publié</Button>
      </Section>

      <Section style={statsBox}>
        <Text style={statsTitle}>📊 Suivez les performances de votre article</Text>
        <Text style={statsText}>
          Vous pouvez suivre les statistiques de votre article (vues, likes, partages)
          depuis votre tableau de bord praticien.
        </Text>
      </Section>

      <Section style={promotionBox}>
        <Text style={promotionTitle}>📣 Faites la promotion de votre article :</Text>
        <Section style={promotionList}>
          <Text style={promotionItem}>
            • Partagez-le sur vos réseaux sociaux (LinkedIn, Facebook, Instagram)
          </Text>
          <Text style={promotionItem}>
            • Envoyez le lien à vos clients et contacts
          </Text>
          <Text style={promotionItem}>
            • Ajoutez-le à votre signature email
          </Text>
          <Text style={promotionItem}>
            • Mentionnez-le lors de vos consultations
          </Text>
        </Section>
      </Section>

      <Section style={shareButtons}>
        <Text style={shareTitle}>Partager sur :</Text>
        <Section style={buttonRow}>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
            style={socialButton}
          >
            LinkedIn
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
            style={socialButton}
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`}
            style={socialButton}
          >
            Twitter
          </a>
        </Section>
      </Section>

      <Section style={nextStepsBox}>
        <Text style={nextStepsTitle}>✨ Et maintenant ?</Text>
        <Section style={nextStepsList}>
          <Text style={nextStepItem}>
            1. <strong>Répondez aux commentaires</strong> : Engagez la conversation avec
            vos lecteurs
          </Text>
          <Text style={nextStepItem}>
            2. <strong>Proposez un nouvel article</strong> : Continuez à partager votre
            expertise
          </Text>
          <Text style={nextStepItem}>
            3. <strong>Consultez vos statistiques</strong> : Analysez l'impact de votre
            contenu
          </Text>
        </Section>
      </Section>

      <Section style={benefitsBox}>
        <Text style={benefitsText}>
          💡 <strong>Le saviez-vous ?</strong> Les praticiens qui publient régulièrement
          des articles reçoivent en moyenne 40% de demandes de rendez-vous en plus !
        </Text>
      </Section>

      <Text style={text}>
        Merci de contribuer à la richesse du contenu SPYMEO et de partager votre
        expertise avec notre communauté.
      </Text>

      <Text style={signature}>
        Bravo et continuez comme ça !
        <br />
        L'équipe éditoriale SPYMEO
      </Text>
    </EmailLayout>
  );
};

// Styles
const publishedBanner = {
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

const articlePreview = {
  margin: '24px 0',
  borderRadius: '12px',
  overflow: 'hidden' as const,
};

const coverImg = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const articleCard = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
  textAlign: 'center' as const,
};

const cardTitle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const cardMeta = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const statsBox = {
  backgroundColor: '#ede9fe',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #8b5cf6',
};

const statsTitle = {
  color: '#5b21b6',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const statsText = {
  color: '#6b21a8',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const promotionBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #f59e0b',
};

const promotionTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const promotionList = {
  margin: '0',
};

const promotionItem = {
  color: '#b45309',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '6px 0',
};

const shareButtons = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const shareTitle = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const buttonRow = {
  display: 'flex' as const,
  gap: '12px',
  justifyContent: 'center' as const,
};

const socialButton = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
};

const nextStepsBox = {
  backgroundColor: '#dbeafe',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #3b82f6',
};

const nextStepsTitle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const nextStepsList = {
  margin: '0',
};

const nextStepItem = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '12px 0',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #10b981',
};

const benefitsText = {
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

export default ArticlePublished;
