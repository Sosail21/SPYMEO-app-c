/**
 * Base email layout for SPYMEO emails
 * Provides consistent branding and structure
 */

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  showFooter?: boolean;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const EmailLayout = ({ preview, children, showFooter = true }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-email.png`}
              width="120"
              height="40"
              alt="SPYMEO"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          {showFooter && (
            <Section style={footer}>
              <Text style={footerText}>
                © {new Date().getFullYear()} SPYMEO. Tous droits réservés.
              </Text>
              <Text style={footerText}>Paris, France</Text>
              <Section style={footerLinks}>
                <Link href={`${baseUrl}/`} style={footerLink}>
                  Accueil
                </Link>
                {' • '}
                <Link href={`${baseUrl}/user/email-preferences`} style={footerLink}>
                  Préférences email
                </Link>
                {' • '}
                <Link href={`${baseUrl}/contact`} style={footerLink}>
                  Contact
                </Link>
              </Section>
              <Section style={socialLinks}>
                <Link href="https://facebook.com/spymeo" style={socialLink}>
                  Facebook
                </Link>
                {' • '}
                <Link href="https://instagram.com/spymeo" style={socialLink}>
                  Instagram
                </Link>
                {' • '}
                <Link href="https://linkedin.com/company/spymeo" style={socialLink}>
                  LinkedIn
                </Link>
              </Section>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  borderBottom: '1px solid #f3f4f6',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '40px',
};

const footer = {
  padding: '32px 40px',
  borderTop: '1px solid #f3f4f6',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLinks = {
  marginTop: '16px',
};

const footerLink = {
  color: '#8b5cf6',
  fontSize: '12px',
  textDecoration: 'none',
};

const socialLinks = {
  marginTop: '12px',
};

const socialLink = {
  color: '#8b5cf6',
  fontSize: '12px',
  textDecoration: 'none',
};

export default EmailLayout;
