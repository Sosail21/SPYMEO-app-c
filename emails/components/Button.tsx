/**
 * Email button component
 */

import { Button as EmailButton } from '@react-email/components';
import * as React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ href, children, variant = 'primary' }: ButtonProps) => {
  const styles = {
    primary: buttonPrimary,
    secondary: buttonSecondary,
    outline: buttonOutline,
  };

  return (
    <EmailButton href={href} style={styles[variant]}>
      {children}
    </EmailButton>
  );
};

const baseButton = {
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  borderRadius: '8px',
  transition: 'all 0.2s',
};

const buttonPrimary = {
  ...baseButton,
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
};

const buttonSecondary = {
  ...baseButton,
  backgroundColor: '#ec4899',
  color: '#ffffff',
};

const buttonOutline = {
  ...baseButton,
  backgroundColor: 'transparent',
  color: '#8b5cf6',
  border: '2px solid #8b5cf6',
};

export default Button;
