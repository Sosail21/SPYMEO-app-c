/**
 * API endpoint for previewing email templates
 * GET /api/email/preview/[template]
 */

import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';

// Import email templates
import WelcomeEmail from '@/../emails/WelcomeEmail';
import PasswordResetEmail from '@/../emails/PasswordResetEmail';
import AppointmentConfirmation from '@/../emails/AppointmentConfirmation';
import AppointmentReminder from '@/../emails/AppointmentReminder';
import PassActivated from '@/../emails/PassActivated';
import PassRenewal from '@/../emails/PassRenewal';
import CarnetShipped from '@/../emails/CarnetShipped';
import InvoiceEmail from '@/../emails/InvoiceEmail';
import MessageNotification from '@/../emails/MessageNotification';
import BlogSubmissionStatus from '@/../emails/BlogSubmissionStatus';
import ArticlePublished from '@/../emails/ArticlePublished';

// Mock data for previews
const mockData = {
  user: {
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    role: 'PRACTITIONER',
  },
  appointment: {
    id: 'apt_123',
    practitionerName: 'Dr. Jean Dupont',
    date: '15 janvier 2025',
    time: '14h30',
    duration: '1 heure',
    location: '123 rue de la Santé, 75014 Paris',
    type: 'Consultation naturopathie',
    notes: 'Première consultation',
  },
  plan: {
    name: 'PASS Premium',
    price: '39,90€/mois',
    startDate: '1er janvier 2025',
    renewalDate: '1er février 2025',
    benefits: [
      'Accès illimité aux ressources exclusives',
      'Réductions jusqu\'à 30% chez nos partenaires',
      'Carnet de coupons mensuel',
      'Support prioritaire 7j/7',
      'Événements membres exclusifs',
    ],
  },
  tracking: {
    trackingNumber: 'FR1234567890',
    carrier: 'Colissimo',
    estimatedDelivery: '18 janvier 2025',
    shippingAddress: '123 rue de la Santé, 75014 Paris',
  },
  invoice: {
    number: 'INV-2025-001',
    date: '1er janvier 2025',
    dueDate: '31 janvier 2025',
    amount: '39,90€',
    items: [
      {
        description: 'Abonnement PASS Premium',
        quantity: 1,
        unitPrice: '39,90€',
        total: '39,90€',
      },
    ],
    downloadUrl: 'https://spymeo.fr/invoices/INV-2025-001.pdf',
  },
  message: {
    id: 'msg_123',
    senderName: 'Dr. Jean Dupont',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
    preview: 'Bonjour Sophie, j\'ai bien reçu vos documents. Je les ai consultés et...',
    conversationId: 'conv_123',
    sentAt: 'Il y a 5 minutes',
  },
  article: {
    title: 'Les bienfaits de la méditation matinale pour votre santé',
    slug: 'bienfaits-meditation-matinale-sante',
    status: 'approved' as const,
    feedback:
      'Excellent article, très bien structuré. Quelques suggestions mineures ont été apportées.',
    submittedAt: '10 janvier 2025',
    publishedAt: '12 janvier 2025',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { template: string } }
) {
  try {
    const { template } = params;
    let html: string;

    switch (template) {
      case 'welcome':
        html = render(
          WelcomeEmail({
            userName: mockData.user.name,
            userEmail: mockData.user.email,
            role: mockData.user.role,
          })
        );
        break;

      case 'password-reset':
        html = render(
          PasswordResetEmail({
            userName: mockData.user.name,
            resetToken: 'abc123xyz789',
            expiresIn: '1 heure',
          })
        );
        break;

      case 'appointment-confirmation':
        html = render(
          AppointmentConfirmation({
            userName: mockData.user.name,
            practitionerName: mockData.appointment.practitionerName,
            appointmentDate: mockData.appointment.date,
            appointmentTime: mockData.appointment.time,
            duration: mockData.appointment.duration,
            location: mockData.appointment.location,
            appointmentType: mockData.appointment.type,
            notes: mockData.appointment.notes,
            appointmentId: mockData.appointment.id,
          })
        );
        break;

      case 'appointment-reminder':
        html = render(
          AppointmentReminder({
            userName: mockData.user.name,
            practitionerName: mockData.appointment.practitionerName,
            appointmentDate: mockData.appointment.date,
            appointmentTime: mockData.appointment.time,
            location: mockData.appointment.location,
            appointmentType: mockData.appointment.type,
            appointmentId: mockData.appointment.id,
          })
        );
        break;

      case 'pass-activated':
        html = render(
          PassActivated({
            userName: mockData.user.name,
            planName: mockData.plan.name,
            planPrice: mockData.plan.price,
            startDate: mockData.plan.startDate,
            renewalDate: mockData.plan.renewalDate,
            benefits: mockData.plan.benefits,
          })
        );
        break;

      case 'pass-renewal':
        html = render(
          PassRenewal({
            userName: mockData.user.name,
            planName: mockData.plan.name,
            planPrice: mockData.plan.price,
            renewalDate: mockData.plan.renewalDate,
            daysUntilRenewal: 7,
          })
        );
        break;

      case 'carnet-shipped':
        html = render(
          CarnetShipped({
            userName: mockData.user.name,
            trackingNumber: mockData.tracking.trackingNumber,
            carrier: mockData.tracking.carrier,
            estimatedDelivery: mockData.tracking.estimatedDelivery,
            shippingAddress: mockData.tracking.shippingAddress,
          })
        );
        break;

      case 'invoice':
        html = render(
          InvoiceEmail({
            userName: mockData.user.name,
            invoiceNumber: mockData.invoice.number,
            invoiceDate: mockData.invoice.date,
            dueDate: mockData.invoice.dueDate,
            amount: mockData.invoice.amount,
            items: mockData.invoice.items,
            downloadUrl: mockData.invoice.downloadUrl,
          })
        );
        break;

      case 'message-notification':
        html = render(
          MessageNotification({
            recipientName: mockData.user.name,
            senderName: mockData.message.senderName,
            senderAvatar: mockData.message.senderAvatar,
            messagePreview: mockData.message.preview,
            conversationId: mockData.message.conversationId,
            sentAt: mockData.message.sentAt,
          })
        );
        break;

      case 'blog-status-approved':
        html = render(
          BlogSubmissionStatus({
            practitionerName: mockData.user.name,
            articleTitle: mockData.article.title,
            status: 'approved',
            feedback: mockData.article.feedback,
            articleSlug: mockData.article.slug,
            submittedAt: mockData.article.submittedAt,
          })
        );
        break;

      case 'blog-status-rejected':
        html = render(
          BlogSubmissionStatus({
            practitionerName: mockData.user.name,
            articleTitle: mockData.article.title,
            status: 'rejected',
            feedback:
              'L\'article contient plusieurs erreurs factuelles concernant les propriétés des plantes médicinales. Merci de vérifier vos sources et de corriger ces informations.',
            submittedAt: mockData.article.submittedAt,
          })
        );
        break;

      case 'article-published':
        html = render(
          ArticlePublished({
            practitionerName: mockData.user.name,
            articleTitle: mockData.article.title,
            articleSlug: mockData.article.slug!,
            publishedAt: mockData.article.publishedAt!,
            coverImage: mockData.article.coverImage,
          })
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
    }

    // Return HTML for browser preview
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to render template' },
      { status: 500 }
    );
  }
}
