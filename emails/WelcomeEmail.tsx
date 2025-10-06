/**
 * Welcome email template
 * Sent when a new user signs up
 */

import { Heading, Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  role: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const WelcomeEmail = ({ userName, userEmail, role }: WelcomeEmailProps) => {
  const getDashboardUrl = () => {
    switch (role) {
      case 'PRACTITIONER':
        return `${baseUrl}/pro/dashboard`;
      case 'CENTER':
        return `${baseUrl}/pro/dashboard`;
      case 'ARTISAN':
        return `${baseUrl}/pro/dashboard`;
      case 'COMMERCANT':
        return `${baseUrl}/pro/dashboard`;
      case 'PASS_USER':
        return `${baseUrl}/user/tableau-de-bord`;
      default:
        return `${baseUrl}/user/tableau-de-bord`;
    }
  };

  return (
    <EmailLayout preview={`Bienvenue sur SPYMEO, ${userName} !`}>
      <Heading style={h1}>Bienvenue sur SPYMEO ! 👋</Heading>

      <Text style={text}>Bonjour {userName},</Text>

      <Text style={text}>
        Nous sommes ravis de vous accueillir dans la communauté SPYMEO, la plateforme qui
        connecte praticiens et utilisateurs pour un bien-être holistique.
      </Text>

      <Section style={highlight}>
        <Text style={highlightText}>
          Votre compte est maintenant actif et prêt à être utilisé !
        </Text>
      </Section>

      <Text style={text}>
        <strong>Votre compte :</strong>
        <br />
        Email : {userEmail}
        <br />
        Type : {getRoleLabel(role)}
      </Text>

      <Section style={ctaSection}>
        <Button href={getDashboardUrl()}>
          Accéder à mon tableau de bord
        </Button>
      </Section>

      <Text style={text}>
        Voici quelques premiers pas pour commencer :
      </Text>

      <Section style={list}>
        {role === 'PRACTITIONER' && (
          <>
            <Text style={listItem}>✓ Complétez votre profil professionnel</Text>
            <Text style={listItem}>✓ Configurez votre agenda</Text>
            <Text style={listItem}>✓ Explorez l'académie SPYMEO</Text>
            <Text style={listItem}>✓ Découvrez les outils praticiens</Text>
          </>
        )}
        {role === 'CENTER' && (
          <>
            <Text style={listItem}>✓ Créez votre première formation</Text>
            <Text style={listItem}>✓ Configurez vos sessions</Text>
            <Text style={listItem}>✓ Ajoutez vos apprenants</Text>
            <Text style={listItem}>✓ Explorez les outils de gestion</Text>
          </>
        )}
        {(role === 'ARTISAN' || role === 'COMMERCANT') && (
          <>
            <Text style={listItem}>✓ Créez votre catalogue</Text>
            <Text style={listItem}>✓ Configurez vos produits/services</Text>
            <Text style={listItem}>✓ Gérez votre stock</Text>
            <Text style={listItem}>✓ Suivez vos ventes</Text>
          </>
        )}
        {(role === 'FREE_USER' || role === 'PASS_USER') && (
          <>
            <Text style={listItem}>✓ Trouvez votre praticien</Text>
            <Text style={listItem}>✓ Prenez votre premier rendez-vous</Text>
            <Text style={listItem}>✓ Explorez les ressources</Text>
            {role === 'PASS_USER' && (
              <Text style={listItem}>✓ Profitez de vos avantages PASS</Text>
            )}
          </>
        )}
      </Section>

      <Text style={text}>
        Si vous avez des questions, n'hésitez pas à nous contacter. Notre équipe est là
        pour vous accompagner.
      </Text>

      <Text style={signature}>
        À très bientôt,
        <br />
        L'équipe SPYMEO
      </Text>
    </EmailLayout>
  );
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    FREE_USER: 'Utilisateur gratuit',
    PASS_USER: 'Utilisateur PASS',
    PRACTITIONER: 'Praticien',
    CENTER: 'Centre de formation',
    ARTISAN: 'Artisan',
    COMMERCANT: 'Commerçant',
  };
  return labels[role] || role;
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

const highlight = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #8b5cf6',
};

const highlightText = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const list = {
  margin: '16px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const signature = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
  fontStyle: 'italic' as const,
};

export default WelcomeEmail;
