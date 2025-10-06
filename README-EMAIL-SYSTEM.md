# SPYMEO Email System - Quick Start Guide

## 📧 Overview

Complete transactional email system using **Resend** and **React Email** for beautiful, responsive HTML emails.

## ✨ Features

- 🎨 11 beautiful, responsive email templates
- 📬 Queue system with rate limiting & retries
- ⚙️ User email preferences
- 🔍 Template previews in browser
- 🧪 Comprehensive test suite
- 📊 Email analytics & tracking
- 🚀 Production-ready

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install resend @react-email/components react-email
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your Resend API key: https://resend.com/api-keys

### 3. Send Your First Email

```typescript
import * as EmailService from '@/lib/services/email-service';

// Send welcome email
await EmailService.sendWelcomeEmail({
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'PRACTITIONER',
});
```

### 4. Preview Templates

```bash
npm run dev
```

Then visit:
- http://localhost:3000/api/email/preview/welcome
- http://localhost:3000/api/email/preview/appointment-confirmation
- ... and more!

## 📚 Available Templates

| Template | Usage | Preview URL |
|----------|-------|-------------|
| Welcome | User signup | `/api/email/preview/welcome` |
| Password Reset | Password reset request | `/api/email/preview/password-reset` |
| Appointment Confirmation | Appointment booked | `/api/email/preview/appointment-confirmation` |
| Appointment Reminder | 24h before appointment | `/api/email/preview/appointment-reminder` |
| PASS Activated | Subscription activated | `/api/email/preview/pass-activated` |
| PASS Renewal | Renewal reminder | `/api/email/preview/pass-renewal` |
| Carnet Shipped | Tracking notification | `/api/email/preview/carnet-shipped` |
| Invoice | Invoice sent | `/api/email/preview/invoice` |
| Message Notification | New message | `/api/email/preview/message-notification` |
| Blog Status | Article approved/rejected | `/api/email/preview/blog-status-approved` |
| Article Published | Article goes live | `/api/email/preview/article-published` |

## 📖 Common Use Cases

### Send Appointment Confirmation

```typescript
await EmailService.sendAppointmentConfirmation(user, {
  id: 'apt1',
  practitionerName: 'Dr. Smith',
  date: '15 janvier 2025',
  time: '14h30',
  duration: '1 heure',
  type: 'Consultation',
});
```

### Send PASS Activation

```typescript
await EmailService.sendPassActivation(user, {
  name: 'PASS Premium',
  price: '39,90€/mois',
  startDate: '1er janvier 2025',
  renewalDate: '1er février 2025',
  benefits: [
    'Accès illimité aux ressources',
    'Réductions chez nos partenaires',
  ],
});
```

### Send Invoice

```typescript
await EmailService.sendInvoice(user, {
  number: 'INV-2025-001',
  date: '1er janvier 2025',
  dueDate: '31 janvier 2025',
  amount: '39,90€',
  items: [
    {
      description: 'Abonnement PASS',
      quantity: 1,
      unitPrice: '39,90€',
      total: '39,90€',
    },
  ],
  downloadUrl: 'https://spymeo.fr/invoices/INV-2025-001.pdf',
});
```

## 🔧 Integration Examples

### User Signup Flow

```typescript
// In your signup API route
import { onUserSignup } from '@/lib/integrations/email-integrations';

export async function POST(request: Request) {
  // ... create user ...

  // Send welcome email
  await onUserSignup({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({ success: true });
}
```

### Stripe Webhook (PASS Activation)

```typescript
import { onPassSubscriptionCreated } from '@/lib/integrations/email-integrations';

// When Stripe payment succeeds
await onPassSubscriptionCreated(user, {
  planName: 'PASS Premium',
  planPrice: '39,90€/mois',
  startDate: '1er janvier 2025',
  renewalDate: '1er février 2025',
});
```

### Message Notification

```typescript
import { onMessageReceived } from '@/lib/integrations/email-integrations';

// When user receives a message
await onMessageReceived(recipient, {
  id: 'msg1',
  senderName: 'Dr. Smith',
  preview: 'Bonjour, j\'ai bien reçu...',
  conversationId: 'conv1',
  sentAt: 'Il y a 5 minutes',
});
```

## 🧪 Testing

### Run Tests

```bash
# All tests
npm run test

# Email tests only
npm run test tests/unit/lib/email
npm run test tests/unit/lib/services

# Watch mode
npm run test:watch
```

### Preview Server

```bash
# Start standalone preview server
ts-node scripts/preview-emails.ts

# Visit http://localhost:3001
```

### Test Email Sending

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "user": {
      "id": "test",
      "name": "Test User",
      "email": "your-email@example.com"
    },
    "data": {}
  }'
```

## ⚙️ Configuration

### Email Preferences

Users can manage preferences at `/user/email-preferences`:

- Marketing emails
- Notifications
- Appointments
- Messages
- PASS updates
- Blog updates

**System emails** (password reset, etc.) cannot be disabled.

### Check Preferences Before Sending

```typescript
import { canSendEmail } from '@/lib/services/email-service';

if (canSendEmail(user, 'messages')) {
  await sendMessageNotification(user, message);
}
```

### Queue Configuration

Edit `src/lib/email/config.ts`:

```typescript
export const EMAIL_CONFIG = {
  rateLimit: {
    maxPerSecond: 100,
    maxPerMinute: 1000,
    maxPerHour: 10000,
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
    maxBackoffMs: 10000,
  },
};
```

## 📊 Monitoring

### Queue Statistics

```typescript
import { emailQueue } from '@/lib/email/queue';

const stats = emailQueue.getStats();
// {
//   pending: 5,
//   processing: 2,
//   completed: 100,
//   failed: 1,
//   totalSent: 100
// }
```

### Job Status

```typescript
const status = emailQueue.getJobStatus('job_123');
// 'pending' | 'processing' | 'completed' | 'failed'
```

### Resend Dashboard

Monitor delivery at: https://resend.com/dashboard

- View sent emails
- Check delivery status
- See bounce rates
- Track analytics

## 🎨 Creating New Templates

1. Create template in `/emails/`:

```tsx
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

export const MyEmail = ({ userName }) => (
  <EmailLayout preview="Preview text">
    <Heading>Hello {userName}!</Heading>
    <Text>Your content here...</Text>
    <Button href="https://spymeo.fr">Click me</Button>
  </EmailLayout>
);
```

2. Add to email service:

```typescript
// src/lib/services/email-service.ts
import MyEmail from '../../../emails/MyEmail';

export async function sendMyEmail(user: User) {
  const html = render(MyEmail({ userName: user.name }));

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('default'),
    subject: 'Your subject',
    html,
  });
}
```

3. Preview at: `/api/email/preview/my-email`

## 🚀 Production Deployment

### 1. Domain Verification

1. Go to Resend dashboard → **Domains**
2. Add your domain (e.g., `spymeo.fr`)
3. Add DNS records provided by Resend
4. Wait for verification

### 2. Update Configuration

```typescript
// src/lib/email/config.ts
export const EMAIL_CONFIG = {
  from: {
    default: 'SPYMEO <noreply@spymeo.fr>',
    support: 'Support SPYMEO <support@spymeo.fr>',
    // ...
  },
};
```

### 3. Environment Variables

```env
RESEND_API_KEY=re_live_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://spymeo.fr
NODE_ENV=production
```

### 4. Setup Cron Jobs

For scheduled emails (reminders, renewals):

```typescript
// cron job - runs daily at 9am
import { sendDailyAppointmentReminders } from '@/lib/integrations/email-integrations';

await sendDailyAppointmentReminders();
```

## 📝 API Reference

### Email Service

```typescript
// Welcome email
sendWelcomeEmail(user: User): Promise<string>

// Password reset
sendPasswordReset(user: User, token: string): Promise<string>

// Appointment
sendAppointmentConfirmation(user: User, apt: Appointment): Promise<string>
sendAppointmentReminder(user: User, apt: Appointment): Promise<string>

// PASS
sendPassActivation(user: User, plan: PassPlan): Promise<string>
sendPassRenewal(user: User, plan: PassPlan, days: number): Promise<string>

// Carnet & Invoice
sendCarnetShipped(user: User, tracking: Tracking): Promise<string>
sendInvoice(user: User, invoice: Invoice): Promise<string>

// Messages & Blog
sendMessageNotification(user: User, message: Message): Promise<string>
sendBlogStatusUpdate(user: User, article: Article): Promise<string>
sendArticlePublished(user: User, article: Article): Promise<string>
```

### API Endpoints

```typescript
// Send email
POST /api/email/send
Body: { type, user, data }

// Get stats
GET /api/email/send?stats=true

// Get job status
GET /api/email/send?jobId=xxx

// Preview template
GET /api/email/preview/[template]

// Email preferences
GET /api/account/email-preferences
PUT /api/account/email-preferences
```

## 🆘 Troubleshooting

### Emails not sending

```bash
# 1. Check API key
echo $RESEND_API_KEY

# 2. Check if disabled
echo $DISABLE_EMAIL_SENDING  # Should be empty or 'false'

# 3. Check Resend logs
# Visit: https://resend.com/dashboard/logs
```

### Template errors

```bash
# Preview template
npm run dev
# Visit: http://localhost:3000/api/email/preview/welcome

# Check logs for rendering errors
```

### Queue issues

```typescript
// Check queue stats
import { emailQueue } from '@/lib/email/queue';
console.log(emailQueue.getStats());

// Restart app
npm run dev
```

## 📚 Full Documentation

See `docs/email-system.md` for comprehensive documentation.

## 🤝 Support

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email/docs
- **Issues:** Contact development team

---

**Ready to send beautiful emails!** 📧✨
