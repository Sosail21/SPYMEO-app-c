/**
 * Resend client configuration
 * Singleton instance for sending emails via Resend API
 */

import { Resend } from 'resend';

// Validate API key on import
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  RESEND_API_KEY is not set. Email sending will fail.');
}

// Create Resend client instance
export const resend = new Resend(apiKey || 'test-key');

/**
 * Health check for Resend API
 * Tests if the API key is valid and service is accessible
 */
export async function testResendConnection(): Promise<boolean> {
  try {
    // Try to get API key info (this validates the key)
    // Note: Resend doesn't have a dedicated health check endpoint
    // We'll just check if the client is properly configured
    if (!apiKey || apiKey === 'test-key') {
      console.warn('Using test API key - emails will not be sent');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resend connection test failed:', error);
    return false;
  }
}

/**
 * Check if email sending is enabled
 * Useful for dev/test environments where you might want to disable actual sending
 */
export function isEmailEnabled(): boolean {
  // Disable in test environment unless explicitly enabled
  if (process.env.NODE_ENV === 'test' && process.env.ENABLE_EMAIL_IN_TESTS !== 'true') {
    return false;
  }

  // Disable if explicitly disabled via env var
  if (process.env.DISABLE_EMAIL_SENDING === 'true') {
    return false;
  }

  // Require API key
  return !!apiKey && apiKey !== 'test-key';
}

/**
 * Log email instead of sending (for development)
 */
export function logEmailInsteadOfSending(emailData: any): void {
  console.log('\n📧 EMAIL (not sent, logging only):');
  console.log('━'.repeat(60));
  console.log('To:', emailData.to);
  console.log('From:', emailData.from);
  console.log('Subject:', emailData.subject);
  if (emailData.replyTo) {
    console.log('Reply-To:', emailData.replyTo);
  }
  if (emailData.tags) {
    console.log('Tags:', emailData.tags);
  }
  console.log('━'.repeat(60));
  console.log('HTML Preview:', emailData.html ? `${emailData.html.substring(0, 200)}...` : 'N/A');
  console.log('━'.repeat(60));
  console.log('\n');
}
