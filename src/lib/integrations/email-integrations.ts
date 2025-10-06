/**
 * Email integration examples for SPYMEO
 * Shows how to integrate email sending into existing flows
 */

import * as EmailService from '../services/email-service';

/**
 * Integration: User signup
 * Send welcome email when user creates account
 */
export async function onUserSignup(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  try {
    await EmailService.sendWelcomeEmail(user);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't block signup
  }
}

/**
 * Integration: Password reset request
 * Send reset email with token
 */
export async function onPasswordResetRequest(user: {
  id: string;
  name: string;
  email: string;
}) {
  try {
    // Generate reset token (example)
    const resetToken = generateResetToken(user.id);

    await EmailService.sendPasswordReset(user, resetToken, '1 heure');
    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error; // Password reset should fail if email can't be sent
  }
}

/**
 * Integration: Appointment booking
 * Send confirmation and schedule reminder
 */
export async function onAppointmentBooked(
  user: {
    id: string;
    name: string;
    email: string;
  },
  appointment: {
    id: string;
    practitionerName: string;
    date: string;
    time: string;
    duration: string;
    location?: string;
    type: string;
    notes?: string;
  }
) {
  try {
    // Send confirmation immediately
    await EmailService.sendAppointmentConfirmation(user, appointment);
    console.log(`✅ Appointment confirmation sent to ${user.email}`);

    // Schedule reminder for 24h before
    await EmailService.sendAppointmentReminder(user, appointment);
    console.log(`✅ Appointment reminder scheduled for ${user.email}`);
  } catch (error) {
    console.error('Failed to send appointment emails:', error);
  }
}

/**
 * Integration: PASS subscription (Stripe webhook)
 * Send activation email when payment succeeds
 */
export async function onPassSubscriptionCreated(
  user: {
    id: string;
    name: string;
    email: string;
  },
  subscription: {
    planName: string;
    planPrice: string;
    startDate: string;
    renewalDate: string;
  }
) {
  try {
    const plan = {
      name: subscription.planName,
      price: subscription.planPrice,
      startDate: subscription.startDate,
      renewalDate: subscription.renewalDate,
      benefits: [
        'Accès illimité aux ressources exclusives',
        'Réductions jusqu\'à 30% chez nos partenaires',
        'Carnet de coupons mensuel',
        'Support prioritaire 7j/7',
        'Événements membres exclusifs',
      ],
    };

    await EmailService.sendPassActivation(user, plan);
    console.log(`✅ PASS activation email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send PASS activation email:', error);
  }
}

/**
 * Integration: PASS renewal reminder (cron job)
 * Send reminder 7 days before renewal
 */
export async function onPassRenewalReminder(
  user: {
    id: string;
    name: string;
    email: string;
  },
  subscription: {
    planName: string;
    planPrice: string;
    renewalDate: string;
    daysUntilRenewal: number;
  }
) {
  try {
    const plan = {
      name: subscription.planName,
      price: subscription.planPrice,
      startDate: '', // Not needed for renewal
      renewalDate: subscription.renewalDate,
      benefits: [],
    };

    await EmailService.sendPassRenewal(user, plan, subscription.daysUntilRenewal);
    console.log(`✅ PASS renewal reminder sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send PASS renewal reminder:', error);
  }
}

/**
 * Integration: Carnet shipment
 * Send tracking info when carnet is shipped
 */
export async function onCarnetShipped(
  user: {
    id: string;
    name: string;
    email: string;
  },
  shipment: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    shippingAddress: string;
  }
) {
  try {
    await EmailService.sendCarnetShipped(user, shipment);
    console.log(`✅ Carnet shipment email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send carnet shipment email:', error);
  }
}

/**
 * Integration: Invoice generation
 * Send invoice when created
 */
export async function onInvoiceCreated(
  user: {
    id: string;
    name: string;
    email: string;
  },
  invoice: {
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
) {
  try {
    await EmailService.sendInvoice(user, invoice);
    console.log(`✅ Invoice email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send invoice email:', error);
  }
}

/**
 * Integration: New message received
 * Send notification when user receives a message
 */
export async function onMessageReceived(
  recipient: {
    id: string;
    name: string;
    email: string;
    emailPreferences?: Record<string, boolean>;
  },
  message: {
    id: string;
    senderName: string;
    senderAvatar?: string;
    preview: string;
    conversationId: string;
    sentAt: string;
  }
) {
  try {
    // Check if user wants message notifications
    if (!EmailService.canSendEmail(recipient, 'messages')) {
      console.log(`User ${recipient.email} has disabled message notifications`);
      return;
    }

    await EmailService.sendMessageNotification(recipient, message);
    console.log(`✅ Message notification sent to ${recipient.email}`);
  } catch (error) {
    console.error('Failed to send message notification:', error);
  }
}

/**
 * Integration: Blog article moderation
 * Send status update when article is approved/rejected
 */
export async function onBlogArticleModerated(
  practitioner: {
    id: string;
    name: string;
    email: string;
  },
  article: {
    title: string;
    slug?: string;
    status: 'approved' | 'rejected';
    feedback?: string;
    submittedAt: string;
  }
) {
  try {
    await EmailService.sendBlogStatusUpdate(practitioner, article);
    console.log(`✅ Blog status email sent to ${practitioner.email}`);
  } catch (error) {
    console.error('Failed to send blog status email:', error);
  }
}

/**
 * Integration: Blog article publication
 * Send notification when article goes live
 */
export async function onBlogArticlePublished(
  practitioner: {
    id: string;
    name: string;
    email: string;
  },
  article: {
    title: string;
    slug: string;
    publishedAt: string;
    coverImage?: string;
  }
) {
  try {
    await EmailService.sendArticlePublished(practitioner, {
      ...article,
      status: 'published',
      submittedAt: '',
    });
    console.log(`✅ Article published email sent to ${practitioner.email}`);
  } catch (error) {
    console.error('Failed to send article published email:', error);
  }
}

/**
 * Helper: Generate reset token (example implementation)
 */
function generateResetToken(userId: string): string {
  // In production, use a secure token generator
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${userId}_${timestamp}_${random}`;
}

/**
 * Cron job example: Check for upcoming renewals
 */
export async function checkUpcomingRenewals() {
  // This would be called by a cron job daily
  console.log('Checking for upcoming PASS renewals...');

  // Example: Get subscriptions expiring in 7 days
  // const subscriptions = await db.subscriptions.findUpcomingRenewals(7);

  // for (const sub of subscriptions) {
  //   await onPassRenewalReminder(sub.user, sub);
  // }
}

/**
 * Cron job example: Send appointment reminders
 */
export async function sendDailyAppointmentReminders() {
  // This would be called by a cron job daily
  console.log('Sending appointment reminders for tomorrow...');

  // Example: Get appointments for tomorrow
  // const appointments = await db.appointments.findTomorrow();

  // for (const apt of appointments) {
  //   await onAppointmentBooked(apt.user, apt);
  // }
}
