// Cdw-Spm: Feature flags for SPYMEO V1
// Control feature availability based on environment configuration

/**
 * Stripe payment integration
 * Enabled if both public and secret keys are configured
 */
export const STRIPE_ENABLED =
  !!process.env.STRIPE_SECRET_KEY &&
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

/**
 * Email service (Nodemailer SMTP)
 * Enabled if SMTP configuration is present
 */
export const EMAIL_ENABLED =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASSWORD

/**
 * File upload to S3
 * Enabled if AWS credentials are configured
 */
export const S3_ENABLED =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!process.env.S3_BUCKET_NAME

/**
 * PASS subscription feature
 * Can be disabled to hide PASS-related UI
 */
export const PASS_FEATURE_ENABLED =
  process.env.ENABLE_PASS !== 'false'

/**
 * Academy resources feature
 * Can be disabled to hide Academy section
 */
export const ACADEMY_FEATURE_ENABLED =
  process.env.ENABLE_ACADEMY !== 'false'

/**
 * Blog feature
 * Can be disabled to hide Blog section
 */
export const BLOG_FEATURE_ENABLED =
  process.env.ENABLE_BLOG !== 'false'

/**
 * Rate limiting (Upstash Redis)
 * Enabled if Redis URL is configured, otherwise falls back to in-memory
 */
export const RATE_LIMIT_ENABLED = true // Always enabled (fallback to Map)

/**
 * Analytics tracking
 * Enable when analytics provider is configured
 */
export const ANALYTICS_ENABLED =
  !!process.env.NEXT_PUBLIC_ANALYTICS_ID

/**
 * Get feature status summary (for admin dashboard)
 */
export function getFeatureStatus() {
  return {
    stripe: STRIPE_ENABLED,
    email: EMAIL_ENABLED,
    s3: S3_ENABLED,
    pass: PASS_FEATURE_ENABLED,
    academy: ACADEMY_FEATURE_ENABLED,
    blog: BLOG_FEATURE_ENABLED,
    rateLimit: RATE_LIMIT_ENABLED,
    analytics: ANALYTICS_ENABLED,
  }
}

// Feature flags pour migration progressive mocks → Prisma
export const FEATURES = {
  // Activer progressivement les vraies implémentations
  USE_REAL_APPOINTMENTS: false,
  USE_REAL_AGENDA: false,
  USE_REAL_PASS: false,
  USE_REAL_MESSAGES: false,
  USE_REAL_DOCUMENTS: false,
  USE_REAL_STATS: false,
  
  // Paiements
  STRIPE_ENABLED: Boolean(
    process.env.STRIPE_SECRET_KEY && 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ),
  
  // Email
  EMAIL_ENABLED: Boolean(
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASSWORD
  ),
} as const;

export function requireFeature(feature: keyof typeof FEATURES) {
  if (!FEATURES[feature]) {
    throw new Error(`Feature ${feature} not enabled`);
  }
}
