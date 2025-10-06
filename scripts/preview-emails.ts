/**
 * Email preview script
 * Run with: npm run preview-emails
 * Opens a local server to preview all email templates
 */

import { createServer } from 'http';
import { render } from '@react-email/components';

// Import templates
import WelcomeEmail from '../emails/WelcomeEmail';
import PasswordResetEmail from '../emails/PasswordResetEmail';
import AppointmentConfirmation from '../emails/AppointmentConfirmation';
import AppointmentReminder from '../emails/AppointmentReminder';
import PassActivated from '../emails/PassActivated';
import PassRenewal from '../emails/PassRenewal';
import CarnetShipped from '../emails/CarnetShipped';
import InvoiceEmail from '../emails/InvoiceEmail';
import MessageNotification from '../emails/MessageNotification';
import BlogSubmissionStatus from '../emails/BlogSubmissionStatus';
import ArticlePublished from '../emails/ArticlePublished';

const PORT = 3001;

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
    feedback: 'Excellent article, très bien structuré.',
    submittedAt: '10 janvier 2025',
    publishedAt: '12 janvier 2025',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  },
};

// Email templates
const templates = {
  'welcome': () => render(WelcomeEmail({
    userName: mockData.user.name,
    userEmail: mockData.user.email,
    role: mockData.user.role,
  })),
  'password-reset': () => render(PasswordResetEmail({
    userName: mockData.user.name,
    resetToken: 'abc123xyz789',
    expiresIn: '1 heure',
  })),
  'appointment-confirmation': () => render(AppointmentConfirmation({
    userName: mockData.user.name,
    practitionerName: mockData.appointment.practitionerName,
    appointmentDate: mockData.appointment.date,
    appointmentTime: mockData.appointment.time,
    duration: mockData.appointment.duration,
    location: mockData.appointment.location,
    appointmentType: mockData.appointment.type,
    notes: mockData.appointment.notes,
    appointmentId: mockData.appointment.id,
  })),
  'appointment-reminder': () => render(AppointmentReminder({
    userName: mockData.user.name,
    practitionerName: mockData.appointment.practitionerName,
    appointmentDate: mockData.appointment.date,
    appointmentTime: mockData.appointment.time,
    location: mockData.appointment.location,
    appointmentType: mockData.appointment.type,
    appointmentId: mockData.appointment.id,
  })),
  'pass-activated': () => render(PassActivated({
    userName: mockData.user.name,
    planName: mockData.plan.name,
    planPrice: mockData.plan.price,
    startDate: mockData.plan.startDate,
    renewalDate: mockData.plan.renewalDate,
    benefits: mockData.plan.benefits,
  })),
  'pass-renewal': () => render(PassRenewal({
    userName: mockData.user.name,
    planName: mockData.plan.name,
    planPrice: mockData.plan.price,
    renewalDate: mockData.plan.renewalDate,
    daysUntilRenewal: 7,
  })),
  'carnet-shipped': () => render(CarnetShipped({
    userName: mockData.user.name,
    trackingNumber: mockData.tracking.trackingNumber,
    carrier: mockData.tracking.carrier,
    estimatedDelivery: mockData.tracking.estimatedDelivery,
    shippingAddress: mockData.tracking.shippingAddress,
  })),
  'invoice': () => render(InvoiceEmail({
    userName: mockData.user.name,
    invoiceNumber: mockData.invoice.number,
    invoiceDate: mockData.invoice.date,
    dueDate: mockData.invoice.dueDate,
    amount: mockData.invoice.amount,
    items: mockData.invoice.items,
    downloadUrl: mockData.invoice.downloadUrl,
  })),
  'message-notification': () => render(MessageNotification({
    recipientName: mockData.user.name,
    senderName: mockData.message.senderName,
    senderAvatar: mockData.message.senderAvatar,
    messagePreview: mockData.message.preview,
    conversationId: mockData.message.conversationId,
    sentAt: mockData.message.sentAt,
  })),
  'blog-approved': () => render(BlogSubmissionStatus({
    practitionerName: mockData.user.name,
    articleTitle: mockData.article.title,
    status: 'approved',
    feedback: mockData.article.feedback,
    articleSlug: mockData.article.slug,
    submittedAt: mockData.article.submittedAt,
  })),
  'blog-rejected': () => render(BlogSubmissionStatus({
    practitionerName: mockData.user.name,
    articleTitle: mockData.article.title,
    status: 'rejected',
    feedback: 'L\'article nécessite des corrections...',
    submittedAt: mockData.article.submittedAt,
  })),
  'article-published': () => render(ArticlePublished({
    practitionerName: mockData.user.name,
    articleTitle: mockData.article.title,
    articleSlug: mockData.article.slug!,
    publishedAt: mockData.article.publishedAt!,
    coverImage: mockData.article.coverImage,
  })),
};

// Create index page
function getIndexPage(): string {
  const links = Object.keys(templates)
    .map(
      (name) =>
        `<li><a href="/${name}" style="color: #8b5cf6; text-decoration: none;">${name}</a></li>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SPYMEO Email Previews</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
          }
          h1 { color: #8b5cf6; }
          ul { list-style: none; padding: 0; }
          li { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          li:hover { background: #f9fafb; }
        </style>
      </head>
      <body>
        <h1>📧 SPYMEO Email Templates</h1>
        <p>Click on a template to preview it:</p>
        <ul>${links}</ul>
      </body>
    </html>
  `;
}

// Create server
const server = createServer((req, res) => {
  const path = req.url?.slice(1) || '';

  if (path === '' || path === 'index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getIndexPage());
    return;
  }

  if (templates[path as keyof typeof templates]) {
    const html = templates[path as keyof typeof templates]();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>Template not found</h1>');
});

server.listen(PORT, () => {
  console.log(`\n📧 Email preview server running at:`);
  console.log(`\n   http://localhost:${PORT}\n`);
  console.log(`Available templates:`);
  Object.keys(templates).forEach((name) => {
    console.log(`   - ${name}`);
  });
  console.log('\n');
});
