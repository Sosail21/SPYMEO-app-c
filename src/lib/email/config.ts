/**
 * Email configuration for SPYMEO
 * Centralized email settings for Resend
 */

export const EMAIL_CONFIG = {
  // Sender information
  from: {
    default: 'SPYMEO <noreply@spymeo.fr>',
    support: 'Support SPYMEO <support@spymeo.fr>',
    notifications: 'Notifications SPYMEO <notifications@spymeo.fr>',
    billing: 'Facturation SPYMEO <facturation@spymeo.fr>',
  },

  // Reply-to addresses
  replyTo: {
    support: 'support@spymeo.fr',
    billing: 'facturation@spymeo.fr',
  },

  // Domains (for production)
  domains: {
    production: 'spymeo.fr',
    staging: 'staging.spymeo.fr',
  },

  // Rate limiting (Resend allows 100 emails/second on paid plans)
  rateLimit: {
    maxPerSecond: 100,
    maxPerMinute: 1000,
    maxPerHour: 10000,
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMs: 1000, // 1 second base
    maxBackoffMs: 10000, // 10 seconds max
  },

  // Email categories for tracking
  categories: {
    TRANSACTIONAL: 'transactional',
    NOTIFICATION: 'notification',
    MARKETING: 'marketing',
    SYSTEM: 'system',
  },

  // Template IDs (if using Resend templates in the future)
  templates: {
    welcome: 'welcome',
    passwordReset: 'password-reset',
    appointmentConfirmation: 'appointment-confirmation',
    appointmentReminder: 'appointment-reminder',
    passActivated: 'pass-activated',
    passRenewal: 'pass-renewal',
    carnetShipped: 'carnet-shipped',
    invoice: 'invoice',
    messageNotification: 'message-notification',
    blogSubmissionStatus: 'blog-submission-status',
    articlePublished: 'article-published',
  },

  // Unsubscribe URL (required for some email types)
  unsubscribeUrl: (userId: string) =>
    `${process.env.NEXT_PUBLIC_APP_URL}/user/email-preferences?unsubscribe=${userId}`,

  // Brand colors for email styling
  brandColors: {
    primary: '#8B5CF6', // Violet SPYMEO
    secondary: '#EC4899', // Rose
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      accent: '#F3F4F6',
    },
  },

  // Footer content
  footer: {
    companyName: 'SPYMEO',
    address: 'Paris, France',
    socialLinks: {
      facebook: 'https://facebook.com/spymeo',
      instagram: 'https://instagram.com/spymeo',
      linkedin: 'https://linkedin.com/company/spymeo',
    },
  },
} as const;

/**
 * Get the appropriate "from" email based on email type
 */
export function getFromEmail(type: 'default' | 'support' | 'notifications' | 'billing' = 'default'): string {
  return EMAIL_CONFIG.from[type];
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Email preference types that users can control
 */
export const EMAIL_PREFERENCE_TYPES = {
  MARKETING: 'marketing',
  NOTIFICATIONS: 'notifications',
  APPOINTMENTS: 'appointments',
  MESSAGES: 'messages',
  PASS_UPDATES: 'pass_updates',
  BLOG_UPDATES: 'blog_updates',
  SYSTEM: 'system', // Cannot be disabled
} as const;

export type EmailPreferenceType = typeof EMAIL_PREFERENCE_TYPES[keyof typeof EMAIL_PREFERENCE_TYPES];
