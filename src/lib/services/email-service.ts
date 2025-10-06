/**
 * Email service layer for SPYMEO
 * High-level functions for sending transactional emails
 */

import { render } from '@react-email/components';
import { emailQueue } from '../email/queue';
import { getFromEmail, EMAIL_CONFIG } from '../email/config';

// Import email templates
import WelcomeEmail from '../../../emails/WelcomeEmail';
import PasswordResetEmail from '../../../emails/PasswordResetEmail';
import AppointmentConfirmation from '../../../emails/AppointmentConfirmation';
import AppointmentReminder from '../../../emails/AppointmentReminder';
import PassActivated from '../../../emails/PassActivated';
import PassRenewal from '../../../emails/PassRenewal';
import CarnetShipped from '../../../emails/CarnetShipped';
import InvoiceEmail from '../../../emails/InvoiceEmail';
import MessageNotification from '../../../emails/MessageNotification';
import BlogSubmissionStatus from '../../../emails/BlogSubmissionStatus';
import ArticlePublished from '../../../emails/ArticlePublished';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Appointment {
  id: string;
  practitionerName: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  type: string;
  notes?: string;
}

export interface PassPlan {
  name: string;
  price: string;
  startDate: string;
  renewalDate: string;
  benefits: string[];
}

export interface Invoice {
  number: string;
  date: string;
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

export interface Message {
  id: string;
  senderName: string;
  senderAvatar?: string;
  preview: string;
  conversationId: string;
  sentAt: string;
}

export interface BlogArticle {
  title: string;
  slug?: string;
  status: 'approved' | 'rejected' | 'published';
  feedback?: string;
  submittedAt: string;
  publishedAt?: string;
  coverImage?: string;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(user: User): Promise<string> {
  const html = render(
    WelcomeEmail({
      userName: user.name,
      userEmail: user.email,
      role: user.role || 'FREE_USER',
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('default'),
    subject: `Bienvenue sur SPYMEO, ${user.name} !`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.TRANSACTIONAL },
      { name: 'template', value: 'welcome' },
    ],
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  user: User,
  resetToken: string,
  expiresIn = '1 heure'
): Promise<string> {
  const html = render(
    PasswordResetEmail({
      userName: user.name,
      resetToken,
      expiresIn,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('support'),
    replyTo: EMAIL_CONFIG.replyTo.support,
    subject: 'Réinitialisation de votre mot de passe SPYMEO',
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.TRANSACTIONAL },
      { name: 'template', value: 'password-reset' },
    ],
  });
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(
  user: User,
  appointment: Appointment
): Promise<string> {
  const html = render(
    AppointmentConfirmation({
      userName: user.name,
      practitionerName: appointment.practitionerName,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      duration: appointment.duration,
      location: appointment.location,
      appointmentType: appointment.type,
      notes: appointment.notes,
      appointmentId: appointment.id,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('notifications'),
    subject: `Rendez-vous confirmé avec ${appointment.practitionerName}`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'appointment-confirmation' },
      { name: 'appointment_id', value: appointment.id },
    ],
  });
}

/**
 * Send appointment reminder email (24h before)
 */
export async function sendAppointmentReminder(
  user: User,
  appointment: Appointment
): Promise<string> {
  const html = render(
    AppointmentReminder({
      userName: user.name,
      practitionerName: appointment.practitionerName,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      location: appointment.location,
      appointmentType: appointment.type,
      appointmentId: appointment.id,
    })
  );

  // Schedule for 24 hours before appointment
  const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('notifications'),
    subject: `Rappel : Rendez-vous demain avec ${appointment.practitionerName}`,
    html,
    scheduledFor,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'appointment-reminder' },
      { name: 'appointment_id', value: appointment.id },
    ],
  });
}

/**
 * Send PASS activation email
 */
export async function sendPassActivation(user: User, plan: PassPlan): Promise<string> {
  const html = render(
    PassActivated({
      userName: user.name,
      planName: plan.name,
      planPrice: plan.price,
      startDate: plan.startDate,
      renewalDate: plan.renewalDate,
      benefits: plan.benefits,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('notifications'),
    subject: `Votre PASS ${plan.name} est activé !`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.TRANSACTIONAL },
      { name: 'template', value: 'pass-activated' },
      { name: 'plan', value: plan.name },
    ],
  });
}

/**
 * Send PASS renewal reminder
 */
export async function sendPassRenewal(
  user: User,
  plan: PassPlan,
  daysUntilRenewal: number
): Promise<string> {
  const html = render(
    PassRenewal({
      userName: user.name,
      planName: plan.name,
      planPrice: plan.price,
      renewalDate: plan.renewalDate,
      daysUntilRenewal,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('billing'),
    replyTo: EMAIL_CONFIG.replyTo.billing,
    subject: `Renouvellement de votre PASS dans ${daysUntilRenewal} jours`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'pass-renewal' },
      { name: 'plan', value: plan.name },
    ],
  });
}

/**
 * Send carnet shipment notification
 */
export async function sendCarnetShipped(
  user: User,
  tracking: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    shippingAddress: string;
  }
): Promise<string> {
  const html = render(
    CarnetShipped({
      userName: user.name,
      trackingNumber: tracking.trackingNumber,
      carrier: tracking.carrier,
      estimatedDelivery: tracking.estimatedDelivery,
      shippingAddress: tracking.shippingAddress,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('notifications'),
    subject: 'Votre carnet PASS est en route !',
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'carnet-shipped' },
      { name: 'tracking', value: tracking.trackingNumber },
    ],
  });
}

/**
 * Send invoice email
 */
export async function sendInvoice(user: User, invoice: Invoice): Promise<string> {
  const html = render(
    InvoiceEmail({
      userName: user.name,
      invoiceNumber: invoice.number,
      invoiceDate: invoice.date,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      items: invoice.items,
      downloadUrl: invoice.downloadUrl,
    })
  );

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('billing'),
    replyTo: EMAIL_CONFIG.replyTo.billing,
    subject: `Facture ${invoice.number} - ${invoice.amount}`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.TRANSACTIONAL },
      { name: 'template', value: 'invoice' },
      { name: 'invoice_number', value: invoice.number },
    ],
  });
}

/**
 * Send message notification
 */
export async function sendMessageNotification(
  recipient: User,
  message: Message
): Promise<string> {
  const html = render(
    MessageNotification({
      recipientName: recipient.name,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      messagePreview: message.preview,
      conversationId: message.conversationId,
      sentAt: message.sentAt,
    })
  );

  return emailQueue.enqueue({
    to: recipient.email,
    from: getFromEmail('notifications'),
    subject: `Nouveau message de ${message.senderName}`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'message-notification' },
      { name: 'conversation_id', value: message.conversationId },
    ],
  });
}

/**
 * Send blog submission status update
 */
export async function sendBlogStatusUpdate(
  practitioner: User,
  article: BlogArticle
): Promise<string> {
  const html = render(
    BlogSubmissionStatus({
      practitionerName: practitioner.name,
      articleTitle: article.title,
      status: article.status,
      feedback: article.feedback,
      articleSlug: article.slug,
      submittedAt: article.submittedAt,
    })
  );

  const statusText = article.status === 'approved' ? 'approuvé' : 'rejeté';

  return emailQueue.enqueue({
    to: practitioner.email,
    from: getFromEmail('notifications'),
    subject: `Votre article "${article.title}" a été ${statusText}`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'blog-submission-status' },
      { name: 'status', value: article.status },
    ],
  });
}

/**
 * Send article published notification
 */
export async function sendArticlePublished(
  practitioner: User,
  article: BlogArticle
): Promise<string> {
  const html = render(
    ArticlePublished({
      practitionerName: practitioner.name,
      articleTitle: article.title,
      articleSlug: article.slug!,
      publishedAt: article.publishedAt!,
      coverImage: article.coverImage,
    })
  );

  return emailQueue.enqueue({
    to: practitioner.email,
    from: getFromEmail('notifications'),
    subject: `Votre article "${article.title}" est publié !`,
    html,
    tags: [
      { name: 'category', value: EMAIL_CONFIG.categories.NOTIFICATION },
      { name: 'template', value: 'article-published' },
      { name: 'article_slug', value: article.slug! },
    ],
  });
}

/**
 * Batch send emails (for notifications, newsletters, etc.)
 */
export async function sendBatchEmails(
  recipients: User[],
  subject: string,
  html: string,
  options?: {
    from?: string;
    replyTo?: string;
    tags?: { name: string; value: string }[];
  }
): Promise<string[]> {
  const jobIds: string[] = [];

  for (const recipient of recipients) {
    const jobId = await emailQueue.enqueue({
      to: recipient.email,
      from: options?.from || getFromEmail('default'),
      subject,
      html,
      replyTo: options?.replyTo,
      tags: options?.tags,
    });
    jobIds.push(jobId);
  }

  return jobIds;
}

/**
 * Check if user has email preference enabled
 */
export function canSendEmail(
  user: User & { emailPreferences?: Record<string, boolean> },
  emailType: string
): boolean {
  // System emails always go through
  if (emailType === 'system') return true;

  // Check user preferences
  if (user.emailPreferences) {
    return user.emailPreferences[emailType] !== false;
  }

  // Default to enabled if no preferences set
  return true;
}

/**
 * Get email queue statistics
 */
export function getEmailStats() {
  return emailQueue.getStats();
}

/**
 * Get email job status
 */
export function getEmailJobStatus(jobId: string) {
  return emailQueue.getJobStatus(jobId);
}
